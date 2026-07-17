# Adu Kata ⚡

Adu Cepat Tebak Kata — game tebak kata multiplayer real-time.

Dua pemain berlomba menebak kata baku KBBI berdasarkan huruf depan dan belakang yang ditentukan oleh pemain itu sendiri.

## Teknologi

- **Framework:** Next.js 16 + React 19
- **Database:** Firebase Firestore
- **Auth:** Firebase Anonymous Auth
- **Styling:** Tailwind CSS v4
- **Validasi Kata:** KBBI (71.000+ lema) + Sastrawi stemmer

## Cara Bermain

1. Masukkan nama dan buat room (atau masukkan kode room teman)
2. Rebutan peran: pilih **Huruf Depan** atau **Huruf Belakang**
3. Tentukan huruf untuk peranmu
4. Tebak kata yang diawali dan diakhiri huruf tersebut
5. Pemain pertama yang menebak kata baku KBBI mendapat 1 poin
6. Capai target skor untuk menang!

## Aturan

- Hanya **kata dasar KBBI** yang diterima (bukan bentuk berimbuhan)
- Panjang kata minimal 3 huruf
- 30 detik per ronde untuk menebak

## Development

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).
