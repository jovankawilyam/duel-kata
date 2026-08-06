export interface Player {
  id: string | null;
  name: string;
  score: number;
}

export interface RoomData {
  roomId: string;
  targetScore: number;
  maxPlayers: number;
  status: RoomStatus;
  players: Player[];
  roles: {
    depan: string | null;
    belakang: string | null;
  };
  letters: {
    depan: string;
    belakang: string;
  };
  winner: string | null;
  winningWord: string;
}

export type RoomStatus =
  | "waiting"
  | "choose_roles"
  | "countdown_letters"
  | "input_letters"
  | "guessing"
  | "round_end"
  | "game_over";

export interface ModalConfig {
  icon: string;
  title: string;
  message: string;
  borderColor: string;
  buttons: {
    text: string;
    className: string;
    onClick: () => void;
  }[];
}
