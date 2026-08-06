"use client";

import { useState } from "react";

export default function LobbyView({
  onCreateRoom,
  onJoinRoom,
  error,
  loading,
}: {
  onCreateRoom: (name: string, targetScore: number, maxPlayers: number) => void;
  onJoinRoom: (name: string, code: string) => void;
  error: string;
  loading?: boolean;
}) {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [targetScore, setTargetScore] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(2);

  return (
    <div className="min-h-screen-dynamic flex items-center justify-center p-2 md:p-8">
      <div className="glass-panel w-full max-w-md md:max-w-4xl rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row transition-all duration-500 h-screen-dynamic md:h-auto overflow-y-auto">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 md:p-10 text-center text-white flex flex-col justify-center items-center md:w-1/2 shrink-0">
          <div className="text-5xl md:text-7xl mb-2 md:mb-4 animate-bounce drop-shadow-lg">
            ⚡
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-1 md:mb-2 tracking-tight">
            ADU KATA
          </h1>
          <p className="text-indigo-100 text-sm md:text-base mb-4 md:mb-6 font-medium">
            Adu Cepat Tebak Kata
          </p>
          <div className="bg-white/20 border border-white/30 text-white p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-inner w-full">
            ⚠️ PERHATIAN: Hanya KATA DASAR KBBI yang diterima!
            <br />
            <span className="text-indigo-100/80 font-medium">
              (Bentuk berimbuhan seperti &quot;berlari&quot;, &quot;makanan&quot; ditolak)
            </span>
          </div>
          <div className="mt-5 md:mt-6 text-center w-full">
            <div className="text-xs md:text-sm text-indigo-100/70 font-medium tracking-wider uppercase mb-1">
              Created by
            </div>
            <div className="text-sm md:text-base text-white font-bold">
              Jovanka Wilyam Muzaki
            </div>
            <a
              href="https://www.instagram.com/jovankawilyamm"
              target="_blank"
              rel="noopener noreferrer"
              className="credits-link inline-flex items-center gap-1.5 mt-1.5 md:mt-2 bg-white/15 hover:bg-white/25 border border-white/30 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm text-white font-bold backdrop-blur-md shadow-md"
            >
              @jovankawilyamm
            </a>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-4 md:space-y-6 md:w-1/2 flex flex-col justify-center flex-1">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 rounded text-sm font-bold shadow-sm pop-in">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2 uppercase tracking-wider">
              Nama Kamu
            </label>
            <input
              type="text"
              maxLength={12}
              placeholder="Masukkan nama kamu..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  document.getElementById("btn-create-room")?.click();
              }}
              className="w-full px-4 py-3 md:px-5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-base md:text-lg text-gray-800 bg-white/50 backdrop-blur-sm shadow-inner"
            />
          </div>

          <div>
            <div className="mb-2 md:mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1 md:mb-2 uppercase tracking-wider">
                Jumlah Pemain
              </label>
              <div className="flex items-center justify-between w-full px-2 py-1.5 md:py-2 border-2 border-gray-200 rounded-xl md:rounded-2xl bg-white/50 shadow-inner mb-3">
                <button
                  onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-purple-50 border-2 border-gray-200 text-purple-600 font-black rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 text-lg md:text-xl focus:outline-none focus:border-purple-400"
                >
                  -
                </button>
                <div className="flex flex-col items-center justify-center select-none pointer-events-none px-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-purple-700 leading-none">
                      {maxPlayers}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-gray-700">
                      Orang
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMaxPlayers(Math.min(5, maxPlayers + 1))}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-purple-50 border-2 border-gray-200 text-purple-600 font-black rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 text-lg md:text-xl focus:outline-none focus:border-purple-400"
                >
                  +
                </button>
              </div>
              <label className="block text-xs font-bold text-gray-500 mb-1 md:mb-2 uppercase tracking-wider">
                Target Skor Kemenangan
              </label>
              <div className="flex items-center justify-between w-full px-2 py-1.5 md:py-2 border-2 border-gray-200 rounded-xl md:rounded-2xl bg-white/50 shadow-inner">
                <button
                  onClick={() => setTargetScore(Math.max(1, targetScore - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-indigo-50 border-2 border-gray-200 text-indigo-600 font-black rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 text-lg md:text-xl focus:outline-none focus:border-indigo-400"
                >
                  -
                </button>
                <div className="flex flex-col items-center justify-center select-none pointer-events-none px-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-indigo-700 leading-none">
                      {targetScore}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-gray-700">
                      Poin
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setTargetScore(Math.min(50, targetScore + 1))}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-indigo-50 border-2 border-gray-200 text-indigo-600 font-black rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 text-lg md:text-xl focus:outline-none focus:border-indigo-400"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 md:pt-6 border-t border-gray-200/60">
            <button
              id="btn-create-room"
              onClick={() => onCreateRoom(playerName, targetScore, maxPlayers)}
              disabled={loading}
              className={
                "w-full font-black py-3 md:py-4 px-6 rounded-xl md:rounded-2xl shadow-[0_6px_0_rgb(67,56,202)] hover:shadow-[0_3px_0_rgb(67,56,202)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 mb-6 md:mb-8 text-base md:text-lg " +
                (loading
                  ? "bg-indigo-400 text-indigo-200 cursor-not-allowed shadow-none translate-y-1"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white")
              }
            >
              {loading ? "MEMPROSES..." : "BUAT ROOM BARU"}
            </button>

            <div className="relative flex items-center justify-center mb-4 md:mb-6">
              <span className="bg-white/80 backdrop-blur-sm px-3 md:px-4 text-xs md:text-sm text-gray-700 font-bold uppercase tracking-widest rounded-full">
                ATAU GABUNG
              </span>
              <div className="absolute w-full border-t-2 border-dashed border-gray-300 -z-10" />
            </div>

            <div className="flex gap-2 md:gap-3">
              <input
                type="text"
                maxLength={4}
                placeholder="KODE"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    document.getElementById("btn-join-room")?.click();
                }}
                className="w-3/5 px-4 py-3 md:px-5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-black text-lg md:text-xl text-center uppercase tracking-widest text-gray-800 bg-white/50 shadow-inner"
              />
              <button
                id="btn-join-room"
                onClick={() => onJoinRoom(playerName, joinCode)}
                disabled={loading}
                className={
                  "w-2/5 font-black py-3 md:py-4 rounded-xl md:rounded-2xl shadow-[0_6px_0_rgb(126,34,206)] hover:shadow-[0_3px_0_rgb(126,34,206)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 text-base md:text-lg " +
                  (loading
                    ? "bg-purple-400 text-purple-200 cursor-not-allowed shadow-none translate-y-1"
                    : "bg-purple-600 hover:bg-purple-700 text-white")
                }
              >
                {loading ? "MEMPROSES..." : "MASUK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
