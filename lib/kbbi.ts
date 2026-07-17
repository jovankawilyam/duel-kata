import { Stemmer } from "sastrawijs";

let KBBI_LEMA: Set<string> | null = null;
let stemmer: Stemmer | null = null;

export async function loadKBBI(): Promise<number> {
  const res = await fetch("/kbbi-lema.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arr: string[] = await res.json();
  KBBI_LEMA = new Set(arr);
  stemmer = new Stemmer();
  return KBBI_LEMA.size;
}

export function isKBBIReady(): boolean {
  return KBBI_LEMA !== null;
}

export function checkKBBI(
  word: string
): { valid: boolean; reason: string } {
  const w = word.toLowerCase().trim();
  if (!KBBI_LEMA || !stemmer) {
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
  const stem = stemmer.stem(w);
  if (stem !== w) {
    return {
      valid: false,
      reason: `"${word}" adalah bentuk berimbuhan dari "${stem.toUpperCase()}". Gunakan kata dasarnya!`,
    };
  }
  if (w.length % 2 === 0) {
    const half = w.slice(0, w.length / 2);
    if (w === half + half && KBBI_LEMA.has(half)) {
      return {
        valid: false,
        reason: `"${word}" adalah bentuk reduplikasi dari "${half.toUpperCase()}".`,
      };
    }
  }
  return { valid: true, reason: "OK" };
}
