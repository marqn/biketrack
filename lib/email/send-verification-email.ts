import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Bike App <noreply@mbike.cc>",
    to: [email],
    subject: "Potwierdź swój adres e-mail - MBike",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Witaj w MBike!</h2>
        <p style="color: #444;">Kliknij poniższy przycisk, aby potwierdzić swój adres e-mail i aktywować konto:</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#f97316;color:white;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0;">
          Potwierdź adres e-mail
        </a>
        <p style="color:#888;font-size:13px;margin-top:16px;">
          Link wygaśnie po 24 godzinach.<br/>
          Jeśli nie rejestrowałeś się w MBike, zignoruj tę wiadomość.
        </p>
      </div>
    `,
  });
}
