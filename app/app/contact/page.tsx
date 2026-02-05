"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sendContactMessage } from "./actions";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);

    const result = await sendContactMessage({ name, message });

    setSending(false);

    if (result.success) {
      setSent(true);
      setName("");
      setMessage("");
    } else {
      setError(result.error ?? "Wystąpił nieznany błąd.");
    }
  };

  return (
    <div className="space-y-6 lg:px-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Kontakt</h1>
        <p className="text-muted-foreground">
          Masz pytanie, sugestię lub znalazłeś błąd? Napisz do mnie!
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        {sent ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Wiadomość wysłana!</h2>
              <p className="text-muted-foreground mb-4">
                Dziękuję za kontakt. Postaram się odpowiedzieć jak najszybciej.
              </p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Wyślij kolejną wiadomość
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Formularz kontaktowy</CardTitle>
              <CardDescription>
                Wypełnij poniższy formularz, a wiadomość trafi bezpośrednio do
                mnie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Imię</Label>
                  <Input
                    id="name"
                    placeholder="Twoje imię"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość</Label>
                  <Textarea
                    id="message"
                    placeholder="Napisz swoją wiadomość..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {message.length}/2000
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? (
                    "Wysyłanie..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Wyślij wiadomość
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
