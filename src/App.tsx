import React, { useState, useEffect, useRef } from "react";
import PhoneContainer from "./components/PhoneContainer";
import Dashboard from "./components/Dashboard";
import SoundLibrary from "./components/SoundLibrary";
import SleepGuide from "./components/SleepGuide";
import SleepMode from "./components/SleepMode";
import AnxietyRelief from "./components/AnxietyRelief";
import Alarms from "./components/Alarms";
import FocusMode from "./components/FocusMode";
import Settings from "./components/Settings";
import { PrivacyModal, AgreementModal, PrivacyPolicyContent, UserAgreementContent, DeclineModal } from "./components/PrivacyModal";
import { Sun, VolumeX } from "lucide-react";

import { SoundTrack, SavedMix, AlarmItem, AppSettings } from "./types";
import { audioSynth } from "./utils/audioSynth";

const INITIAL_TRACKS: SoundTrack[] = [
  { id: "rain", name: "细雨敲窗", category: "natural", icon: "rain", volume: 50, isActive: false, descr: "细密的小雨缓缓打落在纱窗上，安静极度催眠" },
  { id: "brook", name: "幽林清溪", category: "natural", icon: "brook", volume: 50, isActive: false, descr: "深山中缓慢划过卵石的松树溪流声" },
  { id: "waves", name: "治愈海浪", category: "natural", icon: "waves", volume: 50, isActive: false, descr: "沙滩上平躺呼吸般潮涨潮落的温柔冲刷声" },
  { id: "wind", name: "旷野寒风", category: "natural", icon: "wind", volume: 45, isActive: false, descr: "漫卷山岗、拂过万家灯火的深远风啸" },
  { id: "snow", name: "冷冬晶雪", category: "natural", icon: "snow", volume: 40, isActive: false, descr: "晶莹雪花自夜空降落的极微沙沙气流感" },
  { id: "campfire", name: "篝火噼啪", category: "natural", icon: "campfire", volume: 50, isActive: false, descr: "深冬篝火炉灶中干木料爆裂、零星噼啪的暖气" },
  { id: "piano", name: "星空夜键", category: "music", icon: "piano", volume: 45, isActive: false, descr: "温柔治愈的超慢节奏古典七和弦钢琴琶音" },
  { id: "guzheng", name: "高山古筝", category: "music", icon: "guzheng", volume: 40, isActive: false, descr: "空灵优雅的五声阶弹拨，泛音古朴回响" },
  { id: "guqin", name: "幽谷寒琴", category: "music", icon: "guqin", volume: 40, isActive: false, descr: "琴师用丝桐木抚弄出的沉静低语，止息内耗" },
  { id: "zenbell", name: "相国空钟", category: "music", icon: "zenbell", volume: 35, isActive: false, descr: "伴随空磬佛音、数十秒清脆回响一次的铜钟" },
  { id: "library", name: "寂静图书馆", category: "atmosphere", icon: "library", volume: 45, isActive: false, descr: "纸页翻落、宁静自习室空气流动低语白音" },
  { id: "cafe", name: "角落咖啡馆", category: "atmosphere", icon: "cafe", volume: 45, isActive: false, descr: "街区小店远处隐约的杯盘碰撞与静夜白音" },
];

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Multi-tracks active configuration state
  const [tracks, setTracks] = useState<SoundTrack[]>(() => {
    const saved = localStorage.getItem("sleep_order_tracks");
    return saved ? JSON.parse(saved) : INITIAL_TRACKS;
  });

  // Saved mix schemas
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>(() => {
    const saved = localStorage.getItem("sleep_order_mixes");
    return saved ? JSON.parse(saved) : [];
  });

  // Alarms storage schemas
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem("sleep_order_alarms");
    return saved ? JSON.parse(saved) : [
      { id: "alarm_v1", time: "07:30", days: ["每日"], isActive: true, label: "晨曦唤醒", snoozeCount: 0 }
    ];
  });

  const [eyeProtectionWarmth, setEyeProtectionWarmth] = useState<number>(0);

  const [defaultStopDuration, setDefaultStopDuration] = useState<number | null>(() => {
    const saved = localStorage.getItem("sleep_order_default_timer");
    return saved ? (saved === "null" ? null : parseInt(saved)) : null;
  });

  // Privacy Policy states
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(() => {
    const accepted = localStorage.getItem("sleep_order_privacy_accepted");
    return accepted !== "true";
  });
  const [showAgreementModal, setShowAgreementModal] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);

  // Playing Count down timers
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null); // in seconds
  const timerLoopRef = useRef<any>(null);

  // Active ringing wake up modal overlay trigger
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);
  const lastTriggeredAlarmTimeRef = useRef<string>("");

  // Persist tracks
  useEffect(() => {
    localStorage.setItem("sleep_order_tracks", JSON.stringify(tracks));
  }, [tracks]);

  // Persist mixes
  useEffect(() => {
    localStorage.setItem("sleep_order_mixes", JSON.stringify(savedMixes));
  }, [savedMixes]);

  // Persist alarms
  useEffect(() => {
    localStorage.setItem("sleep_order_alarms", JSON.stringify(alarms));
  }, [alarms]);

  // Timer loop ticker setup
  useEffect(() => {
    if (timerRemaining !== null) {
      if (timerRemaining <= 0) {
        handleStopAllSounds();
        setTimerRemaining(null);
        return;
      }
      
      timerLoopRef.current = setTimeout(() => {
        setTimerRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else {
      clearTimeout(timerLoopRef.current);
    }

    return () => clearTimeout(timerLoopRef.current);
  }, [timerRemaining]);

  // Alarms trigger watcher check loop (every 5 seconds)
  useEffect(() => {
    const alarmChecker = setInterval(() => {
      const now = new Date();
      const hStr = String(now.getHours()).padStart(2, '0');
      const mStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hStr}:${mStr}`;

      // Check current moment triggers list
      const matched = alarms.find((al) => {
        if (!al.isActive) return false;
        // Match standard HH:MM time
        return al.time === currentTimeStr;
      });

      if (matched && lastTriggeredAlarmTimeRef.current !== currentTimeStr) {
        // Prevent instant multiple ring executions in the exact same minute
        lastTriggeredAlarmTimeRef.current = currentTimeStr;
        setActiveRingingAlarm(matched);
        onOpenAppletWakeUpRinger();
      }

      // Check occasional DEMO triggers for quick previewing testing
      const demoMatched = alarms.find((al) => al.id === "DEMO_TEMP_RING");
      if (demoMatched) {
        setAlarms(prev => prev.filter(al => al.id !== "DEMO_TEMP_RING")); // delete instant
        setActiveRingingAlarm(demoMatched);
        onOpenAppletWakeUpRinger();
      }

    }, 2500);

    return () => clearInterval(alarmChecker);
  }, [alarms]);

  // Trigger waking birds audio and sunrise screen
  const onOpenAppletWakeUpRinger = () => {
    // Force device lights to normal and start bird chimes
    setEyeProtectionWarmth(0);
    audioSynth.startAlarmChimeSequence();
  };

  // Turn Alarm sound sequences off
  const handleStopRingingAlarm = () => {
    audioSynth.stopAlarmChimeSequence();
    setActiveRingingAlarm(null);
  };

  // Snooze Alarm by 5 minutes
  const handleSnoozeRingingAlarm = (alarm: AlarmItem) => {
    audioSynth.stopAlarmChimeSequence();
    setActiveRingingAlarm(null);
    
    // Add temporary snooze alarm 5 mins into the future
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const snoozeTime = `${h}:${m}`;

    const snoozedItem: AlarmItem = {
      id: "alarm_snoozed",
      time: snoozeTime,
      days: ["稍后"],
      isActive: true,
      label: `[稍后再响] ${alarm.label}`,
      snoozeCount: alarm.snoozeCount + 1
    };

    setAlarms(prev => [...prev.filter(al => al.id !== "alarm_snoozed"), snoozedItem]);
  };

  // SOUND TRACK CHANGED MODS
  const handleTrackToggle = (id: string) => {
    const target = tracks.find((t) => t.id === id);
    if (!target) return;

    const currentlyActive = tracks.filter((t) => t.isActive);
    const nextState = !target.isActive;

    // Strict count check: only allow up to 3 tracks simultaneously active
    if (nextState && currentlyActive.length >= 3) {
      return; // prevent setting, child SoundLibrary handles toast
    }

    setTracks(prev => prev.map((t) => {
      if (t.id === id) {
        return { ...t, isActive: nextState };
      }
      return t;
    }));

    // Pass controls down to synthesizer
    audioSynth.toggleTrack(id, nextState, target.volume);

    // If a default stop timer exists and sounds just became active, trigger countdown default
    if (nextState && currentlyActive.length === 0 && defaultStopDuration !== null) {
      setTimerRemaining(defaultStopDuration * 60);
    }
  };

  const handleTrackVolumeChange = (id: string, vol: number) => {
    setTracks(prev => prev.map((t) => {
      if (t.id === id) {
        return { ...t, volume: vol };
      }
      return t;
    }));
    audioSynth.setTrackVolume(id, vol);
  };

  // Sets custom timber limits
  const handleSetTimer = (mins: number | null) => {
    if (mins === null) {
      setTimerRemaining(null);
    } else {
      setTimerRemaining(mins * 60);
    }
  };

  // Save current mixture presets
  const handleSaveMix = (name: string) => {
    const activeTracksList = tracks.filter((t) => t.isActive);
    if (activeTracksList.length === 0) return;

    const newMix: SavedMix = {
      id: Date.now().toString(),
      name,
      tracks: activeTracksList.map((t) => ({
        soundId: t.id,
        volume: t.volume
      })),
      createdAt: Date.now()
    };

    setSavedMixes([newMix, ...savedMixes]);
  };

  // Recall and fire custom Mix combination
  const handlePlayMix = (mix: SavedMix) => {
    // 1. Silent all previous play channels
    handleStopAllSounds();

    // 2. Play newly requested set
    setTimeout(() => {
      setTracks(prev => prev.map((ot) => {
        const found = mix.tracks.find((mt) => mt.soundId === ot.id);
        if (found) {
          audioSynth.toggleTrack(ot.id, true, found.volume);
          return { ...ot, isActive: true, volume: found.volume };
        }
        return { ...ot, isActive: false };
      }));

      // Set sleep timer default if applicable
      if (defaultStopDuration !== null) {
        setTimerRemaining(defaultStopDuration * 60);
      }
    }, 1500);

    setActiveTab("sounds"); // redirect visual focus to mixers dashboard
  };

  const handleDeleteMix = (id: string) => {
    setSavedMixes(prev => prev.filter(m => m.id !== id));
  };

  // Close and stop all sounds
  const handleStopAllSounds = () => {
    setTracks(prev => prev.map((t) => ({ ...t, isActive: false })));
    setTimerRemaining(null);
    audioSynth.stopAll();
  };

  // USER ALARMS MANAGERS
  const handleAddAlarm = (time: string, label: string, days: string[]) => {
    // Check if demo immediate wakeup testing trigger
    if (time === "DEMO") {
      const demoItem: AlarmItem = {
        id: "DEMO_TEMP_RING",
        time: "即刻",
        days: ["即时"],
        isActive: true,
        label,
        snoozeCount: 0
      };
      
      setTimeout(() => {
        setAlarms(prev => [...prev.filter(al => al.id !== "DEMO_TEMP_RING"), demoItem]);
      }, 2000);
      return;
    }

    const item: AlarmItem = {
      id: Date.now().toString(),
      time,
      days,
      isActive: true,
      label,
      snoozeCount: 0
    };
    setAlarms([item, ...alarms]);
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(prev => prev.map((al) => {
      if (al.id === id) {
        return { ...al, isActive: !al.isActive };
      }
      return al;
    }));
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(al => al.id !== id));
  };

  // SYSTEM TOTAL RESET CURING
  const handleResetAllData = () => {
    handleStopAllSounds();
    localStorage.clear();
    setTracks(INITIAL_TRACKS);
    setSavedMixes([]);
    setAlarms([
      { id: "alarm_v1", time: "07:30", days: ["每日"], isActive: true, label: "晨曦唤醒", snoozeCount: 0 }
    ]);
    setEyeProtectionWarmth(0);
    setDefaultStopDuration(null);
    setTimerRemaining(null);
  };

  // Privacy Policy handlers
  const handleAcceptPrivacy = () => {
    localStorage.setItem("sleep_order_privacy_accepted", "true");
    setShowPrivacyModal(false);
  };

  const handleDeclinePrivacy = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineCancel = () => {
    setShowDeclineModal(false);
  };

  const handleDeclineConfirm = () => {
    setShowDeclineModal(false);
    setShowPrivacyModal(false);
    // In a real app, you might want to show a message or exit the app
    alert("由于您拒绝了隐私政策，部分功能可能无法正常使用。");
  };

  const handleOpenAgreement = () => {
    setShowAgreementModal("agreement");
  };

  const handleOpenPrivacy = () => {
    setShowAgreementModal("privacy");
  };

  const handleCloseAgreement = () => {
    setShowAgreementModal(null);
  };

  // Linkage activation logic for DND or focus mode completions
  const handleLinkageRainSoundTrigger = (play: boolean) => {
    if (play) {
      // Auto toggle Rain sound on to form a relaxing cocoon
      setTracks(prev => prev.map(t => {
        if (t.id === "rain") {
          audioSynth.toggleTrack("rain", true, 55);
          return { ...t, isActive: true, volume: 55 };
        }
        return t;
      }));
    } else {
      // Cut sleep sounds
      handleStopAllSounds();
    }
  };

  return (
    <PhoneContainer 
      activeTab={activeTab} 
      onNavigate={setActiveTab}
      eyeProtectionWarmth={eyeProtectionWarmth}
    >
      
      {/* Dynamic Main App Section Page Router switch */}
      {activeTab === "dashboard" && (
        <Dashboard 
          onNavigate={setActiveTab}
          activeTracksCount={tracks.filter((t) => t.isActive).length}
          timerRemaining={timerRemaining}
          onStopAll={handleStopAllSounds}
          savedMixes={savedMixes}
          allTracks={tracks}
          onPlayMix={handlePlayMix}
        />
      )}

      {activeTab === "sounds" && (
        <SoundLibrary 
          tracks={tracks}
          onTrackToggle={handleTrackToggle}
          onTrackVolumeChange={handleTrackVolumeChange}
          activeTimerDuration={timerRemaining !== null ? Math.round(timerRemaining / 60) : null}
          onSetTimer={handleSetTimer}
          onSaveMix={handleSaveMix}
          onStopAll={handleStopAllSounds}
        />
      )}

      {activeTab === "guide" && (
        <SleepGuide />
      )}

      {activeTab === "sleepMode" && (
        <SleepMode 
          eyeProtectionWarmth={eyeProtectionWarmth}
          onWarmthChange={setEyeProtectionWarmth}
          onLinkAudioTrigger={handleLinkageRainSoundTrigger}
        />
      )}

      {activeTab === "anxiety" && (
        <AnxietyRelief />
      )}

      {activeTab === "alarm" && (
        <Alarms 
          alarms={alarms}
          onAddAlarm={handleAddAlarm}
          onToggleAlarm={handleToggleAlarm}
          onDeleteAlarm={handleDeleteAlarm}
          activeRingingAlarm={activeRingingAlarm}
          onSnoozeAlarm={handleSnoozeRingingAlarm}
          onStopAlarm={handleStopRingingAlarm}
        />
      )}

      {activeTab === "focus" && (
        <FocusMode 
          onFocusComplete={() => {
            // Auto swap to sound mixer page and run relax rain noise!
            handleLinkageRainSoundTrigger(true);
            setActiveTab("sounds");
          }}
        />
      )}

      {activeTab === "settings" && (
        <Settings 
          savedMixes={savedMixes}
          allTracks={tracks}
          onPlayMix={handlePlayMix}
          onDeleteMix={handleDeleteMix}
          onResetAllData={handleResetAllData}
          defaultStopDuration={defaultStopDuration}
          onDefaultStopDurationChange={(dur) => {
            setDefaultStopDuration(dur);
            localStorage.setItem("sleep_order_default_timer", String(dur));
          }}
        />
      )}

      {/* Global Sunrise Ringing Overlay */}
      {activeRingingAlarm && (
        <div id="sunrise-ringing-overlay" className="absolute inset-0 bg-gradient-to-b from-amber-200 via-orange-100 to-[#FAF6F0] z-[10000] flex flex-col justify-between p-8 text-center animate-fade-in text-[#2D2D2D] rounded-[44px] overflow-hidden">
          
          {/* Gentle morning glowing sphere */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-yellow-400 filter blur-3xl animate-pulse opacity-50" />

          {/* Slogan details */}
          <div className="pt-12 z-10 space-y-3">
            <div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center mx-auto border border-white/80 shadow-xs">
              <Sun className="w-6 h-6 text-amber-600 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <h2 className="text-xl font-bold font-display text-[#2D2D2D] tracking-wide">
              {activeRingingAlarm.label}
            </h2>
            <p className="text-xs text-[#5E5E5E] font-medium tracking-wide">
              安序温柔唤醒 &bull; 晨曦鸟鸣渐进响起中
            </p>
          </div>

          {/* Wake up actions widget */}
          <div className="space-y-4 pb-12 z-10">
            <div className="text-5xl font-mono text-[#2D2D2D] font-bold select-none">
              {activeRingingAlarm.time === "DEMO" ? "07:30" : activeRingingAlarm.time}
            </div>
            
            <p className="text-xs text-[#6C6C6C] max-w-xs mx-auto italic select-none">
              &ldquo; 阳光洒满松林，新的一天悄然有序地开始啦。 &rdquo;
            </p>

            <div className="flex space-x-3 max-w-sm mx-auto">
              <button
                id="btn-snooze-action"
                onClick={() => handleSnoozeRingingAlarm(activeRingingAlarm)}
                className="flex-1 py-3.5 rounded-2xl bg-white/50 hover:bg-white text-[#2D2D2D] border border-white text-xs font-bold tracking-wider transition-all active:scale-95 shadow-xs"
              >
                稍后再响 (5分)
              </button>
              <button
                id="btn-stop-ringing-action"
                onClick={handleStopRingingAlarm}
                className="flex-1 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1"
              >
                <VolumeX className="w-4 h-4 mr-0.5" />
                <span>关闭闹钟</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyModal
          onAccept={handleAcceptPrivacy}
          onDecline={handleDeclinePrivacy}
          onOpenAgreement={handleOpenAgreement}
          onOpenPrivacy={handleOpenPrivacy}
        />
      )}

      {/* Agreement Detail Modal */}
      {showAgreementModal === "agreement" && (
        <AgreementModal
          onClose={handleCloseAgreement}
          title="用户服务协议"
          content={<UserAgreementContent />}
        />
      )}

      {showAgreementModal === "privacy" && (
        <AgreementModal
          onClose={handleCloseAgreement}
          title="隐私政策"
          content={<PrivacyPolicyContent />}
        />
      )}

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <DeclineModal
          onClose={handleDeclineCancel}
          onConfirm={handleDeclineConfirm}
        />
      )}

    </PhoneContainer>
  );
}
