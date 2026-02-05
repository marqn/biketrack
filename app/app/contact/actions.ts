"use server";

import nodemailer from "nodemailer";

export async function sendContactMessage(formData: { name: string; message: string }) {
  const { name, message } = formData;

  if (!name || !message) {
    return { success: false, error: "Imię i wiadomość są wymagane." };
  }

  if (message.length > 2000) {
    return { success: false, error: "Wiadomość jest za długa (max 2000 znaków)." };
  }

  try {
    const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "marqnpl@gmail.com",
      subject: `Kontakt od: ${name}`,
      text: `Imię: ${name}\n\nWiadomość:\n${message}`,
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
