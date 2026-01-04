// app/onboarding/OnboardingClient.tsx
"use client";

import { createBike } from "./actions";

export default function OnboardingClient() {
    
  return (
    <main style={styles.container}>
      <h1>Jaki masz rower?</h1>

      <button onClick={() => createBike("ROAD")} style={styles.button}>
        🚴 Szosa
      </button>

      <button onClick={() => createBike("GRAVEL")} style={styles.button}>
        🚵 Gravel
      </button>

      <button onClick={() => createBike("MTB")} style={styles.button}>
        🚵‍♂️ MTB
      </button>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: 240,
    padding: "14px 20px",
    fontSize: 18,
  },
};