"use client";

import { deleteAccount } from "./actions/delete-account";

export default function DeleteAccountButton() {
  return (
    <form
      action={deleteAccount}
    >
      <button
        type="submit"
        style={{
          marginTop: 24,
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #c00",
          background: "#000",
          color: "#c00",
          cursor: "pointer",
        }}
      >
        🗑️ Usuń konto
      </button>
    </form>
  );
}
