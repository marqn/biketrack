import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const baseUrl = process.env.NEXTAUTH_URL ?? "";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/verify-email?error=missing_token`);
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, emailVerified: true } } },
  });

  if (!verificationToken) {
    return NextResponse.redirect(`${baseUrl}/auth/verify-email?error=invalid_token`);
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
    const email = encodeURIComponent(verificationToken.user.email ?? "");
    return NextResponse.redirect(`${baseUrl}/auth/verify-email?error=expired_token&email=${email}`);
  }

  if (verificationToken.user.emailVerified) {
    return NextResponse.redirect(`${baseUrl}/auth/verify-email?status=already_verified`);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    }),
  ]);

  return NextResponse.redirect(`${baseUrl}/auth/verify-email?status=verified`);
}
