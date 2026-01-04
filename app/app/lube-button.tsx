"use client";

import { lubeChain } from "./actions";

export default function LubeButton() {
  return (
    <button onClick={() => lubeChain()} style={styles.button}>
      🛠️ Nasmarowałem
    </button>
  );
}

const styles = {
  button: {
    marginTop: 12,
    padding: "10px 16px",
    fontSize: 16,
  },
};
