"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        marginTop: 16,
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid #999",
        background: "#000",
        cursor: "pointer",
      }}
    >
      🚪 Wyloguj się
    </button>
  );
}
