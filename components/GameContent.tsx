"use client";

import { useState, useEffect, useRef } from "react";
import { RoomData } from "@/lib/types";

type GameContentProps = {
  roomData: RoomData;
  currentUserId: string | null;
  getName: (uid: string | null) => string;
  onRolePick: (role: "depan" | "belakang") => void;
  onLetterSubmit: (letter: string) => void;
  onGuessSubmit: (word: string) => void;
  onPlayAgain: () => void;
  checkingWord: boolean;
  countdownValue: number | null;
};

export default function GameContent({
  roomData,
  currentUserId,
  getName,
  onRolePick,
  onLetterSubmit,
  onGuessSubmit,
  onPlayAgain,
  checkingWord,
  countdownValue,
}: GameContentProps) {
  const [letterInput, setLetterInput] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const status = roomData.status;
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current !== status) {
      setLetterInput("");
      setGuessInput("");
      prevStatusRef.current = status;
    }
  }, [status]);

  if (status === "waiting") {
    return (
      <div className="text-center pop-in flex flex-col items-center justify-center h-full w-full">
        <div className="w-16 md:w-24 h-16 md:h-24 border-[6px] md:border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4 md:mb-6 shadow-lg" />
        <h2 className="text-xl md:text-3xl font-black text-gray-800 mb-2">
          Menunggu Pemain 2...
        </h2>
        <p className="text-gray-500 text-sm md:text-lg mt-2 font-medium">
          Berikan kode{" "}
          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 md:px-3 md:py-1 rounded-lg font-black border border-indigo-200">
            {roomData.roomId}
          </span>{" "}
          ke temanmu.
        </p>
      </div>
    );
  }

  if (status === "choose_roles") {
    const myRole =
      roomData.roles.depan === currentUserId
        ? "depan"
        : roomData.roles.belakang === currentUserId
          ? "belakang"
          : null;
    if (myRole) {
      return (
        <div className="w-full max-w-xl text-center mx-auto pop-in">
          <h2 className="text-2xl md:text-4xl font-black text-gray-800 mb-4 md:mb-6">
            REBUTAN PERAN!
          </h2>
          <div className="bg-indigo-100 border-4 border-indigo-200 p-5 md:p-10 rounded-3xl md:rounded-[2rem] text-center shadow-inner w-[90%] mx-auto">
            <h3 className="text-lg md:text-3xl font-black text-indigo-800 mb-2 md:mb-4">
              Peran Kamu:{" "}
              <br />
              <span className="text-3xl md:text-5xl text-indigo-600 mt-1 md:mt-2 block">
                HURUF {myRole === "depan" ? "DEPAN" : "BELAKANG"}
              </span>
            </h3>
            <p className="text-indigo-600 font-bold text-sm md:text-lg animate-pulse mt-4 md:mt-6">
              Menunggu lawan memilih perannya...
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full max-w-xl text-center mx-auto pop-in">
        <h2 className="text-2xl md:text-4xl font-black text-gray-800 mb-1 md:mb-2">
          REBUTAN PERAN!
        </h2>
        <p className="text-gray-500 text-sm md:text-lg mb-4 md:mb-6 font-medium">
          Peran hanya dipilih sekali! Tentukan pilihanmu:
        </p>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center w-[90%] md:w-full mx-auto">
          <button
            onClick={() => onRolePick("depan")}
            disabled={!!roomData.roles.depan}
            className={
              "flex-1 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-white text-base md:text-2xl shadow-[0_6px_0_rgba(0,0,0,0.2)] md:shadow-[0_8px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-2 transition-all " +
              (roomData.roles.depan
                ? "bg-gray-400 cursor-not-allowed shadow-none translate-y-2"
                : "bg-blue-600 hover:bg-blue-700")
            }
          >
            PILIH HURUF
            <br />
            DEPAN
            {roomData.roles.depan && (
              <div className="mt-2 text-xs md:text-sm font-medium bg-black/20 py-1.5 md:py-2 rounded-lg md:rounded-xl mx-4">
                Diambil oleh {getName(roomData.roles.depan)}
              </div>
            )}
          </button>
          <button
            onClick={() => onRolePick("belakang")}
            disabled={!!roomData.roles.belakang}
            className={
              "flex-1 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-white text-base md:text-2xl shadow-[0_6px_0_rgba(0,0,0,0.2)] md:shadow-[0_8px_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-2 transition-all " +
              (roomData.roles.belakang
                ? "bg-gray-400 cursor-not-allowed shadow-none translate-y-2"
                : "bg-emerald-600 hover:bg-emerald-700")
            }
          >
            PILIH HURUF
            <br />
            BELAKANG
            {roomData.roles.belakang && (
              <div className="mt-2 text-xs md:text-sm font-medium bg-black/20 py-1.5 md:py-2 rounded-lg md:rounded-xl mx-4">
                Diambil oleh {getName(roomData.roles.belakang)}
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (status === "countdown_letters") {
    return (
      <div className="text-center w-full flex flex-col items-center justify-center">
        <h2 className="text-lg md:text-3xl font-bold text-gray-500 mb-2 md:mb-6 uppercase tracking-widest">
          Bersiap...
        </h2>
        <div className="text-[120px] md:text-[150px] leading-none font-black text-indigo-600 animate-bounce drop-shadow-2xl">
          {countdownValue !== null && countdownValue > 0
            ? countdownValue
            : "GO!"}
        </div>
      </div>
    );
  }

  if (status === "input_letters") {
    const myRole =
      roomData.roles.depan === currentUserId ? "depan" : "belakang";
    const myLetterDone = roomData.letters[myRole];
    const enemyRole = myRole === "depan" ? "belakang" : "depan";
    const enemyLetterDone = roomData.letters[enemyRole];
    const isDepan = myRole === "depan";

    return (
      <div className="w-full max-w-lg md:max-w-2xl text-center mx-auto pop-in">
        <div className="flex flex-row justify-between items-center mb-3 md:mb-4 gap-2 w-[90%] md:w-full mx-auto">
          <h2 className="text-xl md:text-3xl font-black text-gray-800">
            Tentukan Huruf!
          </h2>
          <div className="bg-red-100 text-red-700 font-black px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 text-lg md:text-2xl border-2 border-red-200 shadow-sm md:shadow-md">
            ⏱️ <span id="timer-input">{countdownValue ?? 10}</span>s
          </div>
        </div>
        <div className="bg-blue-50/80 backdrop-blur-sm p-4 md:p-8 rounded-3xl md:rounded-[2rem] border-2 md:border-4 border-blue-200 mb-3 md:mb-4 shadow-lg md:shadow-xl w-[90%] md:w-full mx-auto">
          <div className="mb-4 md:mb-6 text-lg md:text-xl font-bold text-blue-800 flex flex-col items-center justify-center gap-1.5 md:gap-2">
            Tugas Kamu:
            <span className="bg-blue-600 text-white px-4 md:px-5 py-1 md:py-1.5 rounded-lg md:rounded-xl shadow-md uppercase tracking-widest">
              {isDepan ? "Huruf Depan" : "Huruf Belakang"}
            </span>
          </div>
          {!myLetterDone ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (letterInput) onLetterSubmit(letterInput);
              }}
              className="flex flex-row gap-3 md:gap-4 justify-center items-center"
            >
              <input
                type="text"
                maxLength={1}
                value={letterInput}
                onChange={(e) =>
                  setLetterInput(
                    e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase()
                  )
                }
                className="w-24 h-24 md:w-36 md:h-36 text-center text-5xl md:text-7xl font-black border-4 md:border-4 border-indigo-400 rounded-2xl md:rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 outline-none uppercase bg-indigo-50 text-indigo-900 shadow-lg"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                className="w-auto h-20 md:h-32 px-6 md:px-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg md:text-2xl rounded-xl md:rounded-2xl shadow-[0_4px_0_rgb(30,58,138)] hover:shadow-[0_2px_0_rgb(30,58,138)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
              >
                SET
              </button>
            </form>
          ) : (
            <div className="text-6xl md:text-7xl font-black text-blue-600 bg-white w-20 h-20 md:w-32 md:h-32 mx-auto rounded-2xl md:rounded-3xl flex items-center justify-center border-4 md:border-8 border-blue-200 shadow-inner pop-in">
              {myLetterDone}
            </div>
          )}
          <p
            className={
              "mt-3 md:mt-4 font-bold text-sm md:text-lg " +
              (enemyLetterDone
                ? "text-green-600 pop-in"
                : "text-blue-600 animate-pulse")
            }
          >
            {enemyLetterDone
              ? "✅ Lawan sudah mengatur huruf"
              : "⏳ Menunggu lawan..."}
          </p>
        </div>
        <div className="text-xs md:text-sm text-gray-600 font-medium bg-white/50 inline-block px-3 py-1 md:py-1.5 rounded-lg">
          *Waktu habis = huruf acak otomatis
        </div>
      </div>
    );
  }

  if (status === "guessing") {
    return (
      <div className="w-full max-w-2xl text-center mx-auto pop-in flex flex-col justify-center">
        <div className="flex flex-row justify-between items-center mb-3 md:mb-5 gap-2 w-[95%] md:w-full mx-auto">
          <h2 className="text-xl md:text-4xl font-black text-red-600 animate-pulse drop-shadow-sm">
            🔥 ADU CEPAT! 🔥
          </h2>
          <div className="bg-red-600 text-white font-black px-4 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-2xl flex items-center gap-1.5 md:gap-2 shadow-[0_3px_0_rgb(153,27,27)] border md:border-2 border-red-500 text-lg md:text-2xl">
            ⏱️ <span id="timer-guess">{countdownValue ?? 30}</span>s
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 md:gap-8 mb-4 md:mb-6 bg-gray-100/80 backdrop-blur-sm p-4 md:p-8 rounded-3xl md:rounded-[2rem] shadow-inner border md:border-2 border-white relative w-[95%] md:w-full mx-auto">
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-sm text-gray-600 font-black mb-1.5 md:mb-2 tracking-widest">
              DEPAN
            </span>
            <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-900 text-white flex items-center justify-center rounded-xl md:rounded-2xl text-4xl md:text-[60px] font-black shadow-lg md:shadow-xl border-2 md:border-4 border-indigo-500/30">
              {roomData.letters.depan}
            </div>
          </div>
          <div className="text-gray-400 font-black text-2xl md:text-4xl tracking-[0.1em] md:tracking-[0.3em] opacity-50">
            ......
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-sm text-gray-600 font-black mb-1.5 md:mb-2 tracking-widest">
              BELAKANG
            </span>
            <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-900 text-white flex items-center justify-center rounded-xl md:rounded-2xl text-4xl md:text-[60px] font-black shadow-lg md:shadow-xl border-2 md:border-4 border-indigo-500/30">
              {roomData.letters.belakang}
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (guessInput.trim()) onGuessSubmit(guessInput.trim().toUpperCase());
          }}
          className="space-y-3 md:space-y-4 w-[95%] md:w-full mx-auto"
        >
          <input
            type="text"
            value={guessInput}
            placeholder="Ketik tebakan kata..."
            onChange={(e) =>
              setGuessInput(
                e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase()
              )
            }
            className="w-full px-4 py-4 md:px-6 md:py-5 text-center text-xl md:text-3xl font-black tracking-widest border-2 md:border-4 border-indigo-300 rounded-xl md:rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 outline-none uppercase bg-indigo-50 text-indigo-900 shadow-md md:shadow-xl transition-all"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={checkingWord}
            className={
              "w-full py-3 md:py-5 rounded-xl md:rounded-2xl text-white font-black text-lg md:text-2xl shadow-[0_4px_0_rgb(67,56,202)] md:shadow-[0_6px_0_rgb(67,56,202)] hover:translate-y-1 active:translate-y-1 md:active:translate-y-2 active:shadow-none transition-all tracking-widest " +
              (checkingWord
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700")
            }
          >
            {checkingWord ? "MEMERIKSA..." : "JAWAB SEKARANG!"}
          </button>
        </form>
      </div>
    );
  }

  if (status === "round_end") {
    const isTie = roomData.winner === "tie";
    const iWon = roomData.winner === currentUserId;
    const winnerName = isTie
      ? "-"
      : roomData.winner === roomData.players.p1.id
        ? roomData.players.p1.name
        : roomData.players.p2?.name ?? "-";

    return (
      <div className="max-w-xl text-center pop-in mx-auto w-[95%]">
        <div className="text-[60px] md:text-[100px] mb-1 md:mb-2 drop-shadow-xl animate-bounce">
          {isTie ? "⏱️" : "🎉"}
        </div>
        <h2 className="text-xl md:text-4xl font-black text-gray-900 mb-1 md:mb-2">
          {isTie
            ? "WAKTU HABIS!"
            : iWon
              ? "JAWABAN BENAR!"
              : "LAWAN LEBIH CEPAT!"}
        </h2>
        {isTie ? (
          <p className="text-gray-500 mb-4 md:mb-5 text-sm md:text-lg font-medium">
            Tidak ada yang berhasil menebak.
          </p>
        ) : (
          <p className="text-gray-500 mb-4 md:mb-5 text-sm md:text-lg font-medium">
            1 Poin didapatkan oleh{" "}
            <strong className="text-indigo-600 border-b-2 md:border-b-4 border-indigo-200">
              {winnerName}
            </strong>
          </p>
        )}
        {!isTie ? (
          <div className="bg-green-50/90 border-2 md:border-4 border-green-200 rounded-2xl md:rounded-3xl p-4 md:p-5 mb-4 md:mb-5 shadow-lg transform rotate-1">
            <div className="text-xs md:text-sm font-bold text-green-700 mb-0.5 md:mb-1 uppercase tracking-widest">
              Kata baku yang ditebak:
            </div>
            <div className="text-2xl md:text-5xl font-black text-green-600 tracking-widest uppercase drop-shadow-sm">
              {roomData.winningWord}
            </div>
          </div>
        ) : (
          <div className="mb-4 md:mb-5" />
        )}
        <div className="text-sm md:text-xl font-black text-indigo-600 animate-pulse bg-white/80 px-4 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl border md:border-2 border-indigo-200 inline-block shadow-md">
          Ronde selanjutnya dimulai dalam{" "}
          <span id="round-end-timer" className="text-red-500">
            {countdownValue ?? 5}
          </span>
          ...
        </div>
      </div>
    );
  }

  if (status === "game_over") {
    const iWon = roomData.winner === currentUserId;
    const isP1 = roomData.players.p1.id === currentUserId;
    const winnerName =
      roomData.winner === roomData.players.p1.id
        ? roomData.players.p1.name
        : roomData.players.p2?.name ?? "-";
    const target = roomData.targetScore || 10;

    return (
      <div className="max-w-2xl text-center pop-in mx-auto w-[90%]">
        <div className="text-[80px] md:text-[150px] mb-1 md:mb-2 drop-shadow-2xl animate-bounce">
          {iWon ? "🏆" : "💀"}
        </div>
        <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight">
          {iWon ? "KAMU JUARANYA!" : "KAMU KALAH!"}
        </h2>
        <p className="text-gray-600 mb-4 font-medium text-sm md:text-xl">
          <strong className="text-indigo-600 px-2 bg-indigo-100 rounded-md md:rounded-lg">
            {winnerName}
          </strong>{" "}
          mencapai target{" "}
          <strong className="text-yellow-600">{target}</strong> poin!
        </p>
        <div className="flex justify-center gap-4 md:gap-8 mb-6 md:mb-8">
          <div className="bg-indigo-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 text-center border-2 border-indigo-200 min-w-[80px] md:min-w-[120px]">
            <div className="text-xs md:text-sm font-bold text-indigo-700 uppercase tracking-wider truncate max-w-[100px]">
              {roomData.players.p1.name}
            </div>
            <div className="text-xl md:text-3xl font-black text-indigo-900">
              {roomData.players.p1.score}
            </div>
          </div>
          <div className="text-2xl md:text-4xl font-black text-gray-400 flex items-center">:</div>
          <div className="bg-indigo-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 text-center border-2 border-indigo-200 min-w-[80px] md:min-w-[120px]">
            <div className="text-xs md:text-sm font-bold text-indigo-700 uppercase tracking-wider truncate max-w-[100px]">
              {roomData.players.p2?.name ?? "-"}
            </div>
            <div className="text-xl md:text-3xl font-black text-indigo-900">
              {roomData.players.p2?.score ?? 0}
            </div>
          </div>
        </div>
        {isP1 ? (
          <button
            onClick={onPlayAgain}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black py-3 md:py-5 px-6 rounded-xl md:rounded-2xl shadow-[0_4px_0_rgb(202,138,4)] hover:shadow-[0_2px_0_rgb(202,138,4)] hover:translate-y-1 active:translate-y-1 md:active:translate-y-2 active:shadow-none transition-all text-base md:text-2xl uppercase tracking-widest border-2 border-yellow-500"
          >
            MAIN LAGI
          </button>
        ) : (
          <div className="bg-yellow-100 border-2 border-yellow-300 text-yellow-800 font-black py-3 md:py-5 px-6 rounded-xl md:rounded-2xl text-sm md:text-xl text-center animate-pulse">
            ⏳ Menunggu Host memulai ulang...
          </div>
        )}
      </div>
    );
  }

  return null;
}
