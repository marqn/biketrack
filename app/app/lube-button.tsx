"use client";

import { lubeChain } from "./actions/lubeChain";

export default function LubeButton() {
  return (
    <form action={lubeChain}>
      <button
        type="submit"
        style={{
          marginTop: 12,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #000",
          cursor: "pointer",
        }}
      >
        🛠️ Smaruj
      </button>
    </form>
  );
}
