let KBBI_LEMA: Set<string> | null = null;

export async function loadKBBI(): Promise<number> {
  const res = await fetch("/kbbi-lema.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arr: string[] = await res.json();
  KBBI_LEMA = new Set(arr.map((word) => word.toLowerCase().trim()));
  return KBBI_LEMA.size;
}

export function isKBBIReady(): boolean {
  return KBBI_LEMA !== null;
}

export function checkKBBI(
  word: string
): { valid: boolean; reason: string } {
  const w = word.toLowerCase().trim();
  if (!KBBI_LEMA) {
    return { valid: false, reason: "Kamus belum siap. Muat ulang halaman." };
  }
  if (!/^[a-z]+$/.test(w)) {
    return { valid: false, reason: "Kata hanya boleh berisi huruf A-Z." };
  }
  if (!KBBI_LEMA.has(w)) {
    return {
      valid: false,
      reason: `Kata "${word}" TIDAK terdaftar dalam KBBI.`,
    };
  }

  return { valid: true, reason: "OK" };
}
