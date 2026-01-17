// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    // Nie ujawniaj, czy email istnieje
    return NextResponse.json({ message: "Jeśli email istnieje, wysłaliśmy link" });
  }

  // Generuj token resetujący
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1h

  // Tutaj zapisz token w bazie i wyślij email
  // await sendPasswordResetEmail(email, resetToken);

  return NextResponse.json({ message: "Email wysłany" });
}