export function calculateDominance(supports) {
  const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
  const now = Date.now();

  const recent = supports.filter(
    s => now - s.timestamp.toMillis() <= THIRTY_DAYS
  );

  if (recent.length === 0) return { type: "neutral", confidence: 0 };

  const counts = { anxiety: 0, depression: 0, deep_sleep: 0 };

  recent.forEach(s => {
    if (counts[s.type] !== undefined) counts[s.type]++;
  });

  const total = recent.length;
  const percentages = Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, v / total])
  );

  // dominance threshold (stability guard)
  const dominant = Object.entries(percentages)
    .find(([, pct]) => pct >= 0.5);

  if (!dominant) return { type: "neutral", confidence: Math.max(...Object.values(percentages)) };

  return { type: dominant[0], confidence: dominant[1] };
}