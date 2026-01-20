import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@/lib/generated/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Sprawdź czy użytkownik jest zalogowany
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Pobierz bikeId z query params (opcjonalnie)
    const { searchParams } = new URL(request.url);
    const bikeId = searchParams.get('bikeId');

    let bike;
    let replacements;

    if (bikeId) {
      // Pobierz konkretny rower
      bike = await prisma.bike.findFirst({
        where: {
          id: bikeId,
          userId: session.user.id,
        },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          totalKm: true,
        },
      });

      if (!bike) {
        return NextResponse.json(
          { error: 'Bike not found' },
          { status: 404 }
        );
      }

      // Pobierz wymiany dla tego roweru
      replacements = await prisma.partReplacement.findMany({
        where: {
          bikeId: bikeId,
        },
        orderBy: {
          createdAt: 'desc', // Najnowsze na górze
        },
        select: {
          id: true,
          partType: true,
          brand: true,
          model: true,
          notes: true,
          kmAtReplacement: true,
          kmUsed: true,
          createdAt: true,
        },
      });
    } else {
      // Pobierz pierwszy rower użytkownika (domyślny)
      bike = await prisma.bike.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'asc', // Pierwszy dodany rower
        },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          totalKm: true,
        },
      });

      if (!bike) {
        return NextResponse.json(
          { 
            bike: null,
            replacements: [],
            message: 'No bikes found'
          },
          { status: 200 }
        );
      }

      // Pobierz wymiany dla pierwszego roweru
      replacements = await prisma.partReplacement.findMany({
        where: {
          bikeId: bike.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          partType: true,
          brand: true,
          model: true,
          notes: true,
          kmAtReplacement: true,
          kmUsed: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      bike,
      replacements,
    });

  } catch (error) {
    console.error('Error fetching part replacements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}