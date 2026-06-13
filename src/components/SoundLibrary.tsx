import React, { useState } from "react";
import { 
  Volume2, 
  Trash2, 
  Save, 
  HelpCircle, 
  Music, 
  Play, 
  Pause, 
  Volume1, 
  Flame, 
  Droplet, 
  Waves, 
  Wind, 
  CloudSnow, 
  Sparkles, 
  Timer,
  Clock,
  Check
} from "lucide-react";
import { SoundTrack, SavedMix } from "../types";

interface SoundLibraryProps {
  tracks: SoundTrack[];
  onTrackToggle: (id: string) => void;
  onTrackVolumeChange: (id: string, vol: number) => void;
  activeTimerDuration: number | null; // minutes
  onSetTimer: (mins: number | null) => void;
  onSaveMix: (name: string) => void;
  onStopAll: () => void;
}

export default function SoundLibrary({
  tracks,
  onTrackToggle,
  onTrackVolumeChange,
  activeTimerDuration,
  onSetTimer,
  onSaveMix,
  onStopAll
}: SoundLibraryProps) {
  const [mixNameInput, setMixNameInput] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeTracks = tracks.filter((t) => t.isActive);

  // Quick categories filtering
  const [activeCategory, setActiveCategory] = useState<"all" | "natural" | "music" | "atmosphere">("all");

  const filteredTracks = tracks.filter((t) => {
    if (activeCategory === "all") return true;
    return t.category === activeCategory;
  });

  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mixNameInput.trim()) return;
    if (activeTracks.length === 0) {
      triggerNotification("无法保存：请先开启至少1个你要配对的音效");
      return;
    }
    onSaveMix(mixNameInput.trim());
    setMixNameInput("");
    setSaveOpen(false);
    triggerNotification("混音组合已成功保存！");
  };

  const triggerNotification = (txt: string) => {
    setMessage(txt);
    setTimeout(() => setMessage(null), 3500);
  };

  // Timer options
  const timerOptions = [
    { label: "持续播放", val: null },
    { label: "15分钟", val: 15 },
    { label: "30分钟", val: 30 },
    { label: "60分钟", val: 60 },
    { label: "90分钟", val: 90 },
  ];

  return (
    <div id="sound-library-view" className="flex-1 flex flex-col space-y-4 animate-fade-in text-left select-none pb-6 text-[#4A4A4A]">
      
      {/* Alert Messaging Toast */}
      {message && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-[#D9E4DD] border border-white text-[#4A5D51] px-4 py-2.5 rounded-full text-xs font-bold shadow-lg z-[9999] flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#4A5D51]" />
          <span>{message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
            <span>沉浸式音效工坊</span>
          </h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5">叠加您偏爱的大自然声，打造有序安境</p>
        </div>
        
        {activeTracks.length > 0 && (
          <button 
            id="clear-all-playing"
            onClick={onStopAll}
            className="text-[11px] text-[#8E6D6A] hover:bg-rose-50 py-1.5 px-3 rounded-xl border border-[#E8D3D1] bg-white active:scale-95 transition-all font-bold"
          >
            静音当前
          </button>
        )}
      </div>

      {/* Preset Custom Mixer Save Popup */}
      <div className="px-1">
        {saveOpen ? (
          <form onSubmit={handleSaveCombo} className="p-3 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#2D2D2D]">保存当前的 {activeTracks.length} 条混音组合</span>
              <button 
                type="button" 
                onClick={() => setSaveOpen(false)}
                className="text-[10px] text-[#8C8C8C] hover:text-[#2D2D2D]"
              >
                取消
              </button>
            </div>
            <div className="flex space-x-2">
              <input 
                type="text"
                placeholder="例如: 林间细雨、冥想古琴"
                value={mixNameInput}
                onChange={(e) => setMixNameInput(e.target.value)}
                maxLength={12}
                className="flex-1 bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3 py-1.5 text-xs text-[#2D2D2D] focus:outline-none focus:border-emerald-600"
              />
              <button 
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 rounded-xl flex items-center space-x-1 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>
          </form>
        ) : (
          activeTracks.length > 0 && (
            <button 
              id="btn-open-save-dialog"
              onClick={() => setSaveOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-white border border-[#E5E5E5] hover:bg-[#F7F7F5] text-emerald-800 flex items-center justify-center space-x-2 text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm"
            >
              <Save className="w-4 h-4 text-emerald-700" />
              <span>保存当前搭配为专属助眠方案 ({activeTracks.length}/3)</span>
            </button>
          )
        )}
      </div>

      {/* Category selector pills */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { key: "all", label: "全部" },
          { key: "natural", label: "大自然" },
          { key: "music", label: "治愈纯音" },
          { key: "atmosphere", label: "低频环境" },
        ].map((cat) => (
          <button
            key={cat.key}
            id={`tab-sound-cat-${cat.key}`}
            onClick={() => setActiveCategory(cat.key as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat.key 
                ? "bg-[#D9E4DD] text-[#4A5D51] border border-white shadow-xs" 
                : "bg-white text-[#8C8C8C] border border-[#E5E5E5] hover:text-[#2D2D2D]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active Sound Slider Track Cards Grid */}
      <div className="grid grid-cols-1 gap-2.5 max-h-[365px] overflow-y-auto no-scrollbar pr-1">
        {filteredTracks.map((track) => {
          const isPlayable = track.isActive;
          const trackLimitReached = activeTracks.length >= 3 && !track.isActive;

          return (
            <div 
              key={track.id}
              id={`sound-card-${track.id}`}
              className={`p-3.5 rounded-[28px] border transition-all duration-300 ${
                isPlayable 
                  ? "bg-[#D9E4DD] border-white shadow-sm scale-[1.01]" 
                  : "bg-white border-[#E5E5E5] hover:border-[#D1D1D1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold ${
                    isPlayable ? "bg-white/60 text-[#4A5D51] border border-white" : "bg-[#F7F7F5] text-[#8C8C8C]"
                  }`}>
                    {renderSoundIcon(track.icon, isPlayable)}
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold flex items-center space-x-1.5 ${isPlayable ? "text-[#4A5D51]" : "text-[#2D2D2D]"}`}>
                      <span>{track.name}</span>
                      {track.isActive && <span className="bg-white/70 text-[#4A5D51] font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">LIVE</span>}
                    </p>
                    <p className={`text-[10px] font-light truncate max-w-[170px] ${isPlayable ? "text-[#5E7A69]" : "text-[#8C8C8C]"}`}>{track.descr}</p>
                  </div>
                </div>

                <button
                  id={`btn-toggle-sound-${track.id}`}
                  onClick={() => {
                    if (trackLimitReached) {
                      triggerNotification("为了更好的深度睡眠体验，建议混搭最多不超过3种声音哦");
                      return;
                    }
                    onTrackToggle(track.id);
                  }}
                  className={`h-8 px-3.5 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center transition-all ${
                    isPlayable 
                      ? "bg-white hover:bg-[#F7F7F5] text-[#4A5D51] border border-[#E5E5E5] shadow-xs" 
                      : trackLimitReached 
                        ? "bg-[#F7F7F5] text-slate-300 cursor-not-allowed opacity-50 border border-[#E5E5E5]"
                        : "bg-[#D9E4DD]/40 hover:bg-[#D9E4DD] text-[#4A5D51] border border-white active:scale-95"
                  }`}
                >
                  {isPlayable ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1 fill-current" />}
                  <span>{isPlayable ? "暂停" : "播放"}</span>
                </button>
              </div>

              {/* Slider Controller - only reveals if sound is playing */}
              {isPlayable && (
                <div className="mt-3 bg-white/40 p-2.5 rounded-2xl border border-white flex items-center space-x-3.5 transition-all">
                  <Volume1 className="w-4 h-4 text-[#5E7A69]" />
                  <input 
                    id={`volume-slider-${track.id}`}
                    type="range"
                    min="0"
                    max="100"
                    value={track.volume}
                    onChange={(e) => onTrackVolumeChange(track.id, parseInt(e.target.value))}
                    className="flex-1 accent-[#4A5D51] h-1 bg-white/40 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-[#4A5D51] font-mono w-7 text-right font-bold">{track.volume}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto Shutoff Sleeper Timer Section */}
      <div className="bg-white border border-[#E5E5E5] p-5 rounded-[32px] shadow-sm">
        <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider flex items-center space-x-1.5 mb-3">
          <Clock className="w-4 h-4 text-[#4A5D51] animate-pulse" />
          <span>随眠定时关机 (Fade Timer)</span>
        </h4>
        
        <p className="text-[11px] text-[#8C8C8C] mb-3.5 leading-normal">
          计时结束后，音量会自动开始长达10秒的极致淡出，杜绝声音突兀中断惊醒梦乡。
        </p>

        <div className="grid grid-cols-5 gap-1.5">
          {timerOptions.map((opt) => {
            const isMatch = activeTimerDuration === opt.val;
            return (
              <button
                key={opt.label}
                id={`btn-timer-opt-${opt.val}`}
                onClick={() => {
                  onSetTimer(opt.val);
                  triggerNotification(opt.val === null ? "已关闭定时，音乐将无限制持续播放" : `助眠定时器已成功设为: ${opt.label}`);
                }}
                className={`py-2 px-1.5 rounded-xl text-[10px] font-bold tracking-tight text-center transition-all ${
                  isMatch 
                    ? "bg-[#D9E4DD] text-[#4A5D51] border border-white shadow-xs font-bold" 
                    : "bg-[#F7F7F5] text-[#8C8C8C] border border-transparent hover:text-[#2D2D2D]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// Map textual code descriptions to corresponding React Icons
function renderSoundIcon(name: string, active: boolean) {
  const color = active ? "text-[#4A5D51]" : "text-[#8C8C8C]";
  switch (name) {
    case "rain": return <Droplet className={`w-4 h-4 ${color}`} />;
    case "brook": return <Droplet className={`w-4 h-4 ${color}`} />;
    case "waves": return <Waves className={`w-4 h-4 ${color}`} />;
    case "wind": return <Wind className={`w-4 h-4 ${color}`} />;
    case "snow": return <CloudSnow className={`w-4 h-4 ${color}`} />;
    case "campfire": return <Flame className={`w-4 h-4 ${color}`} />;
    default: return <Music className={`w-4 h-4 ${color}`} />;
  }
}
