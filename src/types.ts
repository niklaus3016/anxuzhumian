export interface SoundTrack {
  id: string;
  name: string;
  category: "natural" | "music" | "atmosphere" | "special";
  icon: string;
  volume: number; // 0 to 100
  isActive: boolean;
  descr: string;
}

export interface SavedMix {
  id: string;
  name: string;
  tracks: {
    soundId: string;
    volume: number;
  }[];
  createdAt: number;
}

export interface AlarmItem {
  id: string;
  time: string; // "HH:MM"
  days: string[]; // ["Mon", "Tue", etc] or ["Once"]
  isActive: boolean;
  label: string;
  snoozeCount: number;
}

export interface BedtimeQuote {
  id: number;
  content: string;
  author: string;
}

export interface MeditationClass {
  id: string;
  title: string;
  duration: number; // minutes
  description: string;
  steps: string[];
}

export interface AppSettings {
  globalVolume: number; // 0 to 100
  eyeProtectionWarmth: number; // 0 to 100
  defaultStopDuration: number; // 15, 30, 60, 0 (continuous)
}
