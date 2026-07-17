"use client";

import { RoomData } from "@/lib/types";
import GameContent from "./GameContent";

type RoomViewProps = {
  roomData: RoomData;
  currentUserId: string | null;
  isP1: boolean;
  isP2: boolean;
  getName: (uid: string | null) => string;
  onLeaveRoom: () => void;
  onRolePick: (role: "depan" | "belakang") => void;
  onLetterSubmit: (letter: string) => void;
  onGuessSubmit: (word: string) => void;
  onPlayAgain: () => void;
  checkingWord: boolean;
  error: string;
  onDismissError: () => void;
  countdownValue: number | null;
};

export default function RoomView({
  roomData,
  currentUserId,
  isP1,
  isP2,
  getName,
  onLeaveRoom,
  onRolePick,
  onLetterSubmit,
  onGuessSubmit,
  onPlayAgain,
  checkingWord,
  error,
  onDismissError,
  countdownValue,
}: RoomViewProps) {
  const target = roomData.targetScore || 10;

  return (
    <div className="min-h-screen-dynamic p-1 md:p-4 lg:p-6 flex items-center justify-center">
      <div className="glass-panel w-full md:max-w-4xl lg:max-w-5xl h-screen-dynamic md:h-[90vh] rounded-xl md:rounded-[2rem] shadow-none md:shadow-2xl overflow-hidden flex flex-col relative">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-2 md:p-4 text-white flex flex-wrap justify-between items-center shadow-md z-10 shrink-0 gap-1 md:gap-2">
          <div className="flex items-center ml-1 md:ml-0">
            <div className="bg-white/20 px-2 py-1 md:px-3 md:py-2 rounded-lg md:rounded-xl backdrop-blur-md border border-white/30 text-center">
              <div className="text-[10px] md:text-xs text-indigo-200 font-bold uppercase tracking-widest">
                Kode Room
              </div>
              <div
                id="display-room-code"
                className="text-sm md:text-xl font-black tracking-[0.2em] leading-tight"
              >
                {roomData.roomId}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center flex-1 md:flex-none">
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black shadow-inner border border-yellow-300 text-xs md:text-sm animate-pulse">
              🎯 TARGET: {target} POIN
            </div>
          </div>

          <button
            onClick={onLeaveRoom}
            className="bg-white/10 hover:bg-red-500 border border-white/20 hover:border-red-400 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-bold transition-all text-xs md:text-sm mr-1 md:mr-0"
          >
            Keluar
          </button>
        </div>

        <div className="flex bg-white/60 backdrop-blur-sm border-b-2 border-gray-200/50 shrink-0">
          <div
            className={
              "flex-1 p-2 md:p-4 text-center border-r-2 border-gray-200/50 transition-colors duration-300 " +
              (isP1 ? "bg-indigo-50/80 shadow-inner" : "")
            }
          >
            <div className="text-[10px] md:text-sm text-gray-600 font-black tracking-widest uppercase mb-0.5 md:mb-1">
              PEMAIN 1
            </div>
            <div className="font-bold text-sm md:text-lg text-gray-800 truncate mb-1 md:mb-2">
              {roomData.players.p1.name}
            </div>
            <div className="bg-indigo-100 inline-block px-4 md:px-5 py-0.5 md:py-1 rounded-full border border-indigo-200">
              <span className="text-lg md:text-3xl font-black text-indigo-700 leading-none">
                {roomData.players.p1.score}
              </span>
            </div>
          </div>
          <div
            className={
              "flex-1 p-2 md:p-4 text-center transition-colors duration-300 " +
              (isP2 ? "bg-indigo-50/80 shadow-inner" : "")
            }
          >
            <div className="text-[10px] md:text-sm text-gray-600 font-black tracking-widest uppercase mb-0.5 md:mb-1">
              PEMAIN 2
            </div>
            <div className="font-bold text-sm md:text-lg text-gray-800 truncate mb-1 md:mb-2">
              {roomData.players.p2?.name ?? "..."}
            </div>
            <div className="bg-indigo-100 inline-block px-4 md:px-5 py-0.5 md:py-1 rounded-full border border-indigo-200">
              <span className="text-lg md:text-3xl font-black text-indigo-700 leading-none">
                {roomData.players.p2?.score ?? "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3 md:p-6 flex flex-col items-center justify-center relative overflow-hidden w-full bg-white/40">
          {error && (
            <div
              className="absolute inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px] bg-white/10 pointer-events-auto"
              onClick={onDismissError}
            >
              <div className="w-full max-w-sm md:max-w-md bg-red-100 border-4 border-red-500 text-red-700 px-5 py-4 md:px-6 md:py-5 rounded-2xl text-sm md:text-lg font-black text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] pop-in">
                <div className="flex justify-end -mt-2 -mr-2 md:-mt-3 md:-mr-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDismissError(); }}
                    className="text-red-400 hover:text-red-600 text-xl leading-none font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
                ⚠️ {error}
              </div>
            </div>
          )}
          <div
            id="game-content"
            className="w-full max-w-3xl h-full flex flex-col items-center justify-center fade-in-up"
          >
            <GameContent
              roomData={roomData}
              currentUserId={currentUserId}
              getName={getName}
              onRolePick={onRolePick}
              onLetterSubmit={onLetterSubmit}
              onGuessSubmit={onGuessSubmit}
              onPlayAgain={onPlayAgain}
              checkingWord={checkingWord}
              countdownValue={countdownValue}
            />
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-sm border-t border-gray-200/50 px-3 py-1.5 md:py-2 text-center shrink-0">
          <span className="text-[10px] md:text-sm text-gray-600 font-medium">
            Created by{" "}
            <span className="font-bold text-gray-800">
                Jovanka Wilyam Muzaki
              </span>{" "}
            <span className="text-gray-400 mx-1">·</span>{" "}
            <a
              href="https://www.instagram.com/jovankawilyamm/"
              target="_blank"
              rel="noopener noreferrer"
              className="credits-link inline-flex items-center gap-0.5 text-pink-600 hover:text-pink-700 font-bold"
            >
              @jovankawilyamm
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
