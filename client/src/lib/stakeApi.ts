// client/src/lib/stakeApi.ts

export interface PlayResponse {
  board: string[][];
  totalWin: number;
  wins: { line: number; symbol: string; payout: number }[];
  events?: any[];
  balance: number;
}

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api/stake";

// --- Get Balance ---
export async function getBalance(): Promise<number> {
  const res = await fetch(`${API_BASE}/balance`);
  if (!res.ok) {
    throw new Error("Failed to fetch balance");
  }
  const data = await res.json();
  return data.balance;
}

// --- Play a Spin ---
export async function play(bet: number): Promise<PlayResponse> {
  const res = await fetch(`${API_BASE}/play`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bet }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Play request failed");
  }

  const data = (await res.json()) as PlayResponse;
  return data;
}
