"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          fontFamily: "monospace",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              lineHeight: 1,
            }}
          >
            ⚠
          </div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            Coś poszło nie tak
          </h1>
          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.6 }}>
            Wystąpił krytyczny błąd aplikacji. Spróbuj odświeżyć stronę.
          </p>
          {error?.digest && (
            <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.4 }}>
              Kod błędu: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.25rem",
              border: "1px solid rgba(250,250,250,0.2)",
              borderRadius: "0.375rem",
              background: "transparent",
              color: "#fafafa",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.875rem",
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
