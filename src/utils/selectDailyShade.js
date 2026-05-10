export function selectDailyShade(paletteArray, confidence) {
  if (!paletteArray || paletteArray.length === 1) return paletteArray[0];
  const dayIndex = Math.floor(Date.now() / 86400000);
  if (confidence < 0.55) return paletteArray[0];
  return paletteArray[dayIndex % paletteArray.length];
}
