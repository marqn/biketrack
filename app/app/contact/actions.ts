"use server";

import { Resend } from "resend";

export async function sendContactMessage(formData: { name: string; message: string }) {
  const { name, message } = formData;

  if (!name || !message) {
    return { success: false, error: "Imię i wiadomość są wymagane." };
  }

  if (message.length > 2000) {
    return { success: false, error: "Wiadomość jest za długa (max 2000 znaków)." };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("Błąd wysyłania maila");
    return { success: false, error: "Nie udało się wysłać wiadomości. Spróbuj ponownie później." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Bike App <noreply@mbike.cc>",
      to: ["marqn@icloud.com"],
      subject: `Kontakt od: ${name}`,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię:</strong> ${name}</p>
        <hr />
        <p><strong>Wiadomość:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Błąd wysyłania maila:", error);
    return { success: false, error: "Nie udało się wysłać wiadomości. Spróbuj ponownie później." };
  }
}
