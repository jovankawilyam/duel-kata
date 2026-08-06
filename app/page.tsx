"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  initFirebase,
  onAuthChange,
  getRoomRef,
  getDb,
  signInUser,
} from "@/lib/firebase";
import {
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { RoomData, ModalConfig } from "@/lib/types";
import { loadKBBI, checkKBBI } from "@/lib/kbbi";
import LoadingScreen from "@/components/LoadingScreen";
import LobbyView from "@/components/LobbyView";
import RoomView from "@/components/RoomView";
import Modal from "@/components/Modal";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Home() {
  const [kbbiStatus, setKbbiStatus] = useState(
    "Menyiapkan 71.000+ lema baku"
  );
  const [kbbiReady, setKbbiReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isCheckingWord, setIsCheckingWord] = useState(false);
  const [lobbyError, setLobbyError] = useState("");
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLeavingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const roomDataRef = useRef<RoomData | null>(null);
  const currentUserRef = useRef<User | null>(null);
  const phaseKeyRef = useRef<string>("");

  const view = !kbbiReady ? "loading" : (!roomId && authLoading) ? "loading" : !roomId ? "lobby" : "room";
  const loadingStatus = !kbbiReady ? kbbiStatus : authLoading ? "Mengautentikasi..." : kbbiStatus;

  useEffect(() => {
    try {
      initFirebase();
    } catch (error) {
      console.error("Firebase init failed:", error);
      setTimeout(() => setAuthLoading(false), 0);
      return;
    }
    const unsub = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        setTimeout(() => setAuthLoading(false), 0);
        handleGhostRoom();
      }
    });
    signInUser()
      .then(() => setAuthLoading(false))
      .catch((e) => { console.error(e); setAuthLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleRetryKBBI = useCallback(() => {
    setKbbiStatus("Menyiapkan 71.000+ lema baku");
    setKbbiReady(false);
    loadKBBI()
      .then((count) => {
        setKbbiStatus(
          `Siap! ${count.toLocaleString("id-ID")} lema dimuat.`
        );
        setKbbiReady(true);
      })
      .catch((e) => {
        setKbbiStatus(`Gagal memuat kamus: ${e.message}`);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadKBBI()
      .then((count) => {
        if (cancelled) return;
        setKbbiStatus(
          `Siap! ${count.toLocaleString("id-ID")} lema dimuat.`
        );
        setKbbiReady(true);
      })
      .catch((e) => {
        if (cancelled) return;
        setKbbiStatus(`Gagal memuat kamus: ${e.message}`);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else if ((roomData?.players.length ?? 0) > 1) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, roomData?.players.length]);

  const leaveRoom = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    sessionStorage.removeItem("kata_ghost_room");
    sessionStorage.removeItem("kata_ghost_role");
    setRoomId(null);
    setRoomData(null);
    roomDataRef.current = null;
    isLeavingRef.current = false;
    setCountdownValue(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  async function handleGhostRoom() {
    const ghostRoom = sessionStorage.getItem("kata_ghost_room");
    const ghostRole = sessionStorage.getItem("kata_ghost_role");
    if (ghostRoom) {
      sessionStorage.removeItem("kata_ghost_room");
      sessionStorage.removeItem("kata_ghost_role");
      if (ghostRole === "host") {
        await deleteDoc(getRoomRef(ghostRoom)).catch(() => {});
      } else {
        await updateDoc(getRoomRef(ghostRoom), {
          players: [],
          status: "waiting",
        }).catch(() => {});
      }
    }
  }

  async function handleCreateRoom(name: string, targetScore: number, maxPlayers: number) {
    if (!name) {
      setLobbyError("Masukkan nama Kamu dulu!");
      return;
    }
    if (!currentUser) {
      setLobbyError("Autentikasi gagal. Muat ulang halaman.");
      return;
    }

    setLobbyLoading(true);
    setLobbyError("");

    try {
      const newRoomId = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const roomRef = getRoomRef(newRoomId);

      await setDoc(roomRef, {
        roomId: newRoomId,
        targetScore,
        status: "waiting",
        maxPlayers,
        players: [{ id: currentUser.uid, name, score: 0 }],
        roles: { depan: null, belakang: null },
        letters: { depan: "", belakang: "" },
        winner: null,
        winningWord: "",
      });

      sessionStorage.setItem("kata_ghost_room", newRoomId);
      sessionStorage.setItem("kata_ghost_role", "host");
      joinRoom(newRoomId);
    } catch {
      setLobbyError("Gagal membuat room. Coba lagi.");
      setLobbyLoading(false);
    }
  }

  async function handleJoinRoom(name: string, code: string) {
    if (!name) {
      setLobbyError("Masukkan nama Kamu dulu!");
      return;
    }
    if (!currentUser) {
      setLobbyError("Autentikasi gagal. Muat ulang halaman.");
      return;
    }
    if (!code) return;

    setLobbyLoading(true);
    setLobbyError("");

    try {
      const roomRef = getRoomRef(code);
      const snapshot = await getDoc(roomRef);

      if (!snapshot.exists()) {
        setLobbyError("Kode Room salah / tidak ditemukan!");
        setLobbyLoading(false);
        return;
      }

      const data = snapshot.data() as RoomData;
      const players = data.players ?? [];
      const alreadyJoined = players.some((player) => player.id === currentUser.uid);
      if (alreadyJoined) {
        sessionStorage.setItem("kata_ghost_room", code);
        sessionStorage.setItem("kata_ghost_role", "guest");
        joinRoom(code);
        return;
      }
      if (players.length >= (data.maxPlayers || 2)) {
        setLobbyError("Room sudah penuh!");
        setLobbyLoading(false);
        return;
      }

      await updateDoc(roomRef, {
        players: [...players, { id: currentUser.uid, name, score: 0 }],
      });
      sessionStorage.setItem("kata_ghost_room", code);
      sessionStorage.setItem("kata_ghost_role", "guest");
      joinRoom(code);
    } catch {
      setLobbyError("Gagal join room. Coba lagi.");
      setLobbyLoading(false);
    }
  }

  function joinRoom(id: string) {
    setRoomId(id);
    isLeavingRef.current = false;
    setLobbyError("");
    setRoomError("");
    setCountdownValue(null);

    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = onSnapshot(
      getRoomRef(id),
      (snapshot) => {
        if (snapshot.exists()) {
          const prevData = roomDataRef.current;
          const newData = snapshot.data() as RoomData;
          roomDataRef.current = newData;
          setRoomData({ ...newData });

          if (
            prevData?.players?.length &&
            newData.players.length < prevData.players.length &&
            currentUserRef.current?.uid &&
            newData.players.some((player) => player.id === currentUserRef.current?.uid)
          ) {
            const removedPlayer = prevData.players.find(
              (player) => !newData.players.some((nextPlayer) => nextPlayer.id === player.id)
            );
            const guestName = removedPlayer?.name || "Lawan";
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            showModalFn({
              icon: "👋",
              title: "Lawan Keluar dari Room",
              message: `<strong class="text-purple-700">${guestName}</strong> telah meninggalkan room. Sesi permainan telah selesai.<br><br>Kamu bisa menunggu pemain baru bergabung dengan kode <strong class="text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">${newData.roomId}</strong>, atau keluar ke lobby.`,
              borderColor: "border-purple-400",
              buttons: [
                {
                  text: "Tunggu Pemain Baru",
                  className:
                    "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-95",
                  onClick: () => {},
                },
                {
                  text: "Keluar ke Lobby",
                  className:
                    "flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black py-3 rounded-xl transition-all shadow-md active:scale-95",
                  onClick: async () => {
                    isLeavingRef.current = true;
                    await deleteDoc(getRoomRef(id)).catch((e) =>
                      console.error(e)
                    );
                    leaveRoom();
                  },
                },
              ],
            });
          }
        } else {
          if (!isLeavingRef.current) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            showModalFn({
              icon: "🚪",
              title: "Sesi Telah Selesai",
              message:
                "Host telah menutup room. Sesi permainan ini telah berakhir.<br><br>Terima kasih sudah bermain!",
              borderColor: "border-red-400",
              buttons: [
                {
                  text: "Kembali ke Lobby",
                  className:
                    "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-95",
                  onClick: () => leaveRoom(),
                },
              ],
            });
          } else {
            leaveRoom();
          }
        }
      },
      (err) => console.error(err)
    );
  }

  function showModalFn(config: ModalConfig) {
    setModalConfig(config);
    setModalVisible(true);
  }

  function getName(uid: string | null): string {
    if (!uid || !roomData) return "";
    const player = roomData.players.find((item) => item.id === uid);
    return player?.name ?? "";
  }

  const isHost = roomData?.players[0]?.id === currentUser?.uid;

  function startTimer(
    duration: number,
    onTick: (t: number) => void,
    onComplete: () => void
  ) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    let timeLeft = duration;
    setCountdownValue(timeLeft);
    onTick(timeLeft);
    intervalRef.current = setInterval(() => {
      timeLeft--;
      setCountdownValue(timeLeft);
      onTick(timeLeft);
      if (timeLeft <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete();
      }
    }, 1000);
  }

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdownValue(null);
  }

  async function handleRolePick(role: "depan" | "belakang") {
    if (!roomId || !currentUser) return;
    await updateDoc(getRoomRef(roomId), {
      [`roles.${role}`]: currentUser.uid,
    });
  }

  async function handleLetterSubmit(letter: string) {
    if (!roomId || !roomData || !currentUser?.uid) return;
    const myRole =
      roomData.roles.depan === currentUser.uid ? "depan" : "belakang";
    const field = myRole === "depan" ? "letters.depan" : "letters.belakang";
    await updateDoc(getRoomRef(roomId), { [field]: letter });
  }

  async function handleGuessSubmit(word: string) {
    if (!roomId || !roomData || !currentUser || isCheckingWord) return;

    setIsCheckingWord(true);

    const firstLetter = roomData.letters.depan;
    const lastLetter = roomData.letters.belakang;

    if (word.length < 3) {
      setRoomError("Panjang kata minimal 3 huruf!");
      setIsCheckingWord(false);
      return;
    }
    if (word[0] !== firstLetter || word[word.length - 1] !== lastLetter) {
      setRoomError(
        `Kata HARUS diawali '${firstLetter}' dan diakhiri '${lastLetter}'!`
      );
      setIsCheckingWord(false);
      return;
    }

    const check = checkKBBI(word);
    if (!check.valid) {
      setRoomError(check.reason);
      setIsCheckingWord(false);
      return;
    }

    try {
      const db = getDb();
      const roomRef = getRoomRef(roomId);
      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error("Room tidak ada");
        const data = snap.data() as RoomData;
        if (data.status !== "guessing") return { tooLate: true };

        const playerIndex = data.players.findIndex((player) => player.id === currentUser.uid);
        if (playerIndex === -1) throw new Error("Player tidak ditemukan");
        const currentScore = data.players[playerIndex].score;
        const newScore = currentScore + 1;
        const reachTarget = newScore >= (data.targetScore || 10);
        const players = data.players.map((player, index) =>
          index === playerIndex ? { ...player, score: newScore } : player
        );

        tx.update(roomRef, {
          status: reachTarget ? "game_over" : "round_end",
          winner: currentUser.uid,
          winningWord: word,
          players,
        });
        return { tooLate: false };
      });

      if (result.tooLate) {
        setRoomError("Terlalu lambat — lawan sudah menebak!");
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setRoomError("Gangguan koneksi. Coba lagi.");
    }
    setIsCheckingWord(false);
  }

  async function handlePlayAgain() {
    if (!roomId || !roomData || !isHost) return;
    await updateDoc(getRoomRef(roomId), {
      status: "choose_roles",
      roles: { depan: null, belakang: null },
      letters: { depan: "", belakang: "" },
      winner: null,
      winningWord: "",
      players: roomData.players.map((player) => ({ ...player, score: 0 })),
    });
  }

  async function handleLeaveRoom() {
    if (!roomData || !roomId || !currentUser) return;

    const isHostUser = roomData.players[0]?.id === currentUser.uid;

    let title: string, message: string, borderColor: string, confirmText: string;
    if (isHostUser) {
      const others = roomData.players.length - 1;
      title = "Tutup Room?";
      message = others
        ? `Kamu adalah <strong className="text-indigo-700">HOST</strong>. Jika kamu keluar, room akan <strong className="text-red-600">DITUTUP</strong> dan ${others} pemain lain akan otomatis dikeluarkan juga.<br><br>Yakin ingin keluar?`
        : `Kamu adalah <strong className="text-indigo-700">HOST</strong>. Room akan ditutup permanen jika kamu keluar.<br><br>Yakin ingin keluar?`;
      borderColor = "border-red-400";
      confirmText = "Ya, Tutup Room";
    } else if (roomData.players.some((player) => player.id === currentUser.uid)) {
      title = "Keluar dari Room?";
      message = `Kamu akan meninggalkan room ini. Host akan mendapat notifikasi bahwa kamu telah keluar.<br><br>Yakin ingin keluar?`;
      borderColor = "border-yellow-400";
      confirmText = "Ya, Keluar";
    } else {
      return;
    }


    showModalFn({
      icon: isHostUser ? "🚪" : "👋",
      title,
      message,
      borderColor,
      buttons: [
        {
          text: "Batal",
          className:
            "flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black py-3 rounded-xl transition-all shadow-md active:scale-95",
          onClick: () => {},
        },
        {
          text: confirmText,
          className:
            "flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-95",
          onClick: async () => {
            isLeavingRef.current = true;
            try {
              if (isHostUser) {
                await deleteDoc(getRoomRef(roomId));
              } else {
                const remainingPlayers = roomData.players.filter((player) => player.id !== currentUser.uid);
                await updateDoc(getRoomRef(roomId), {
                  players: remainingPlayers,
                  status: remainingPlayers.length > 1 ? roomData.status : "waiting",
                });
              }
            } catch (error) {
              console.error("Gagal update database:", error);
            }
            leaveRoom();
          },
        },
      ],
    });
  }

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!roomData || !roomId) return;
    const data = roomData;
    const status = data.status;
    const isHostUser = data.players[0]?.id === currentUser?.uid;
    const bothLettersDone = data.letters.depan && data.letters.belakang;

    const phaseKey = `${status}:${data.roles.depan ?? ""}:${data.roles.belakang ?? ""}:${data.letters.depan}:${data.letters.belakang}`;
    if (phaseKey === phaseKeyRef.current) return;
    phaseKeyRef.current = phaseKey;

    if (status === "choose_roles") {
      if (isHostUser && data.roles.depan && data.roles.belakang) {
        updateDoc(getRoomRef(roomId), {
          status: "countdown_letters",
        }).catch(console.error);
      }
      return;
    }

    if (status === "countdown_letters") {
      startTimer(3, () => {}, () => {
        if (isHostUser) {
          updateDoc(getRoomRef(roomId), {
            status: "input_letters",
          }).catch(console.error);
        }
      });
      return;
    }
    if (status === "input_letters") {
      if (!bothLettersDone) {
        startTimer(10, () => {}, async () => {
          if (isHostUser) {
            const updates: Record<string, unknown> = {};
            if (!data.letters.depan)
              updates["letters.depan"] =
                ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
            if (!data.letters.belakang)
              updates["letters.belakang"] =
                ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
            updates.status = "guessing";
            await updateDoc(getRoomRef(roomId), updates).catch(console.error);
          }
        });
      }

      if (isHostUser && bothLettersDone) {
        clearTimer();
        updateDoc(getRoomRef(roomId), { status: "guessing" }).catch(
          console.error
        );
      }
      return;
    }
    if (status === "guessing") {
      setRoomError("");
      setIsCheckingWord(false);
      startTimer(30, () => {}, async () => {
        if (isHostUser) {
          try {
            const db = getDb();
            await runTransaction(db, async (tx) => {
              const snap = await tx.get(getRoomRef(roomId));
              if (
                snap.exists() &&
                (snap.data() as RoomData).status === "guessing"
              ) {
                tx.update(getRoomRef(roomId), {
                  status: "round_end",
                  winner: "tie",
                  winningWord: "-",
                });
              }
            });
          } catch (e) {
            console.error("Timeout transaction error:", e);
          }
        }
      });
      return;
    }
    if (status === "round_end") {
      startTimer(5, () => {}, async () => {
        if (isHostUser) {
          await updateDoc(getRoomRef(roomId), {
            status: "input_letters",
            letters: { depan: "", belakang: "" },
            winner: null,
            winningWord: "",
          }).catch(console.error);
        }
      });
      return;
    }

    clearTimer();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [roomData?.status, roomData?.letters?.depan, roomData?.letters?.belakang, roomId, currentUser?.uid, roomData]);

  return (
    <>
      <audio ref={audioRef} id="bgm" loop preload="auto">
        <source
          src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=sneaky-snooper-104488.mp3"
          type="audio/mpeg"
        />
      </audio>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className={
          "fixed bottom-4 right-4 md:top-4 md:bottom-auto md:right-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl border-2 border-indigo-200 text-xl z-[200] hover:bg-indigo-50 active:scale-95 transition-all focus:outline-none " +
          (isMuted ? "opacity-50" : "")
        }
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <Modal
        config={modalConfig}
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
      />

      {view === "loading" && <LoadingScreen status={loadingStatus} onRetry={kbbiStatus.includes("Gagal") ? handleRetryKBBI : undefined} />}

      {view === "lobby" && (
        <LobbyView
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          error={lobbyError}
          loading={lobbyLoading}
        />
      )}

      {view === "room" && roomData && (
        <RoomView
          roomData={roomData}
          currentUserId={currentUser?.uid ?? null}
          isHost={isHost}
          getName={getName}
          onLeaveRoom={handleLeaveRoom}
          onRolePick={handleRolePick}
          onLetterSubmit={handleLetterSubmit}
          onGuessSubmit={handleGuessSubmit}
          onPlayAgain={handlePlayAgain}
          checkingWord={isCheckingWord}
          error={roomError}
          onDismissError={() => setRoomError("")}
          countdownValue={countdownValue}
        />
      )}
    </>
  );
}
