"use client";

import { deleteAccount } from "./actions/delete-account";

export default function DeleteAccountButton() {
  return (
    <form
      action={deleteAccount}
      onSubmit={(e) => {
        if (!confirm("Na pewno chcesz usunąć konto? Tej operacji nie można cofnąć.")) {
          e.preventDefault();
        }
      }}
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
