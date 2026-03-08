import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Brak adresu email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, emailVerified: true },
    });

    // Nie ujawniamy czy email istnieje - zawsze ten sam komunikat
    if (!user || !user.password) {
      return NextResponse.json({
        message: "Jeśli konto istnieje, wysłaliśmy email weryfikacyjny.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "To konto jest już zweryfikowane." });
    }

    // TODO: rate limiting wyłączone tymczasowo - włączyć po potwierdzeniu działania emaili
    // const recentToken = await prisma.emailVerificationToken.findFirst({
    //   where: {
    //     userId: user.id,
    //     createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    //   },
    // });
    // if (recentToken) {
    //   return NextResponse.json(
    //     { error: "Poczekaj 5 minut przed ponownym wysłaniem." },
    //     { status: 429 }
    //   );
    // }

    // Usuń stare tokeny, wygeneruj nowy
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Email weryfikacyjny został wysłany." });
  } catch {
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}
