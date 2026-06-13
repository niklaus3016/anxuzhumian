import React from "react";
import { 
  Music, 
  Wind, 
  Bell, 
  BellOff, 
  Brain, 
  Timer, 
  Heart, 
  Sparkles,
  VolumeX,
  Play,
  RotateCcw,
  Settings
} from "lucide-react";
import { SavedMix, SoundTrack } from "../types";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  activeTracksCount: number;
  timerRemaining: number | null; // in seconds
  onStopAll: () => void;
  savedMixes: SavedMix[];
  allTracks: SoundTrack[];
  onPlayMix: (mix: SavedMix) => void;
}

export default function Dashboard({ 
  onNavigate, 
  activeTracksCount, 
  timerRemaining, 
  onStopAll,
  savedMixes,
  allTracks,
  onPlayMix
}: DashboardProps) {

  // Convert remaining seconds to minutes/seconds view format
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}分${secs < 10 ? '0' : ''}${secs}秒`;
  };

  return (
    <div id="dashboard-view" className="flex-1 flex flex-col justify-between py-2 space-y-5 animate-fade-in select-none text-[#4A4A4A]">
      
      {/* Slogan and Branding Hero */}
      <div className="text-center py-4 relative flex flex-col items-center">
        {/* Settings Button */}
        <button
          id="btn-goto-settings"
          onClick={() => onNavigate("settings")}
          className="absolute right-0 top-0 p-2.5 rounded-full bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#8C8C8C] hover:text-[#2D2D2D] shadow-xs active:scale-95 transition-all"
          title="系统设置"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Soft elegant glowing full moon backdrop */}
        <div className="absolute w-28 h-28 rounded-full bg-emerald-500/5 blur-xl top-0 pointer-events-none" />
        
        <div className="h-10 w-10 rounded-full bg-emerald-100/50 flex items-center justify-center border border-emerald-200/50 shadow-inner mb-2">
          <MoonLogo />
        </div>
        <h1 className="text-3xl font-light font-display tracking-tight text-[#2D2D2D]">安序助眠</h1>
        <p className="text-xs text-[#8C8C8C] font-sans mt-1 tracking-widest font-normal uppercase">
          安序相伴，一夜好眠 &bull; SLEEPORDER
        </p>
      </div>

      {/* Real-time Sleep Player Status Overlay */}
      {activeTracksCount > 0 && (
        <div id="active-status-bar" className="mx-1 p-3.5 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm flex items-center justify-between transition-all">
          <div className="flex items-center space-x-3 text-left">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <p className="text-xs font-bold text-[#2D2D2D]">
                正在播放 {activeTracksCount} 轨助眠音效
              </p>
              <p className="text-[10px] text-[#8C8C8C] font-mono">
                {timerRemaining !== null ? `自动关闭倒计时: ${formatTime(timerRemaining)}` : "持续播放中"}
              </p>
            </div>
          </div>
          <button 
            id="btn-quick-stop"
            onClick={onStopAll}
            className="flex items-center space-x-1.5 text-[11px] font-bold bg-[#E8D3D1] text-[#8E6D6A] hover:bg-rose-100 hover:text-rose-800 border border-[#8E6D6A]/10 py-1.5 px-3 rounded-xl active:scale-95 transition-all"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>全部静音</span>
          </button>
        </div>
      )}

      {/* Main 2x3 Elegant Grid Categories */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Card 1: Sound Mixer */}
        <button 
          id="card-sound-library"
          onClick={() => onNavigate("sounds")}
          className="group relative h-32 rounded-[32px] bg-[#D9E4DD] border border-white hover:shadow-md p-5 text-left flex flex-col justify-between overflow-hidden transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-9 w-9 rounded-xl bg-white/45 flex items-center justify-center border border-white/40 text-[#4A5D51]">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#4A5D51] tracking-wide">音效助眠</h3>
            <p className="text-[10px] text-[#5E7A69] mt-0.5 font-medium">多音轨立体混音</p>
          </div>
        </button>

        {/* Card 2: Meditation / Guide */}
        <button 
          id="card-sleep-guide"
          onClick={() => onNavigate("guide")}
          className="group relative h-32 rounded-[32px] bg-[#F1E7E4] border border-white hover:shadow-md p-5 text-left flex flex-col justify-between overflow-hidden transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-9 w-9 rounded-xl bg-white/45 flex items-center justify-center border border-white/40 text-[#7D6B66]">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#7D6B66] tracking-wide">睡眠引导</h3>
            <p className="text-[10px] text-[#9A8781] mt-0.5 font-medium">正念冥想与呼吸</p>
          </div>
        </button>

        {/* Card 3: Anti-disturb Mode */}
        <button 
          id="card-sleep-mode"
          onClick={() => onNavigate("sleepMode")}
          className="group relative h-32 rounded-[32px] bg-[#3A3D42] border border-white/10 hover:shadow-md p-5 text-left flex flex-col justify-between overflow-hidden transition-all duration-300 active:scale-[0.98] text-white"
        >
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 text-[#FFFFFF]">
            <BellOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] tracking-wide">防扰休眠</h3>
            <p className="text-[10px] text-white/50 mt-0.5 font-medium">屏幕柔和勿扰模式</p>
          </div>
        </button>

        {/* Card 4: Anxiety Relief */}
        <button 
          id="card-anxiety-relief"
          onClick={() => onNavigate("anxiety")}
          className="group relative h-32 rounded-[32px] bg-[#E8D3D1] border border-white hover:shadow-md p-5 text-left flex flex-col justify-between overflow-hidden transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-9 w-9 rounded-xl bg-white/45 flex items-center justify-center border border-white/40 text-[#8E6D6A]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#8E6D6A] tracking-wide">焦虑舒缓</h3>
            <p className="text-[10px] text-[#8E6D6A]/75 mt-0.5 font-medium">清空胡思乱想杂物</p>
          </div>
        </button>

        {/* Card 5: Wake Up Alarm */}
        <button 
          id="card-wake-alarm"
          onClick={() => onNavigate("alarm")}
          className="group relative h-32 rounded-[32px] bg-[#DCE2EB] border border-white hover:shadow-md p-5 text-left flex flex-col justify-between overflow-hidden transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-9 w-9 rounded-xl bg-white/45 flex items-center justify-center border border-white/40 text-[#5E6D82]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#5E6D82] tracking-wide">晨起唤醒</h3>
            <p className="text-[10px] text-[#5E6D82]/75 mt-0.5 font-medium">轻柔渐亮无痛起床</p>
          </div>
        </button>

        {/* Card 6: Pomodoro Focus */}
        <button 
          id="card-focus-mode"
          onClick={() => onNavigate("focus")}
          className="group relative h-32 rounded-[32px] bg-[#CDD0CB] border border-white hover:shadow-md p-5 text-left flex flex-col justify-between overflow-hidden transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-9 w-9 rounded-xl bg-white/45 flex items-center justify-center border border-white/40 text-[#5A6158]">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#5A6158] tracking-wide">睡前番茄</h3>
            <p className="text-[10px] text-[#5A6158]/75 mt-0.5 font-medium">拒绝电子屏幕依赖</p>
          </div>
        </button>

      </div>

      {/* Saved Mixes Quick Access Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-5 text-left shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-1.5">
            <Heart className="w-4 h-4 text-[#8E6D6A] fill-[#8E6D6A]" />
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
              我的收藏混音
            </h4>
          </div>
          <button 
            id="view-all-favorites"
            onClick={() => onNavigate("settings")} 
            className="text-[10px] text-emerald-700 hover:text-[#2D2D2D] transition-all font-bold"
          >
            管理组合
          </button>
        </div>

        {savedMixes.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8C8C8C] bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] border-dashed">
            暂无收藏混音组合
            <br />
            <span className="text-[10px] text-[#A1A1A1] block mt-1">进入“音效助眠”页面可配置并收藏</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 max-h-[135px] overflow-y-auto no-scrollbar pr-1">
            {savedMixes.map((mix) => {
              // Summarize tracks under this preset
              const textSummary = mix.tracks
                .map((t) => allTracks.find((ot) => ot.id === t.soundId)?.name || "")
                .filter(Boolean)
                .join(" + ");

              return (
                <div 
                  key={mix.id}
                  id={`saved-mix-btn-${mix.id}`}
                  className="flex items-center justify-between p-2.5 bg-[#F7F7F5] hover:bg-[#F1F1EF] py-2.5 px-3.5 rounded-2xl border border-[#E5E5E5] group active:scale-[0.99] transition-all"
                >
                  <div className="text-left flex-1 min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#2D2D2D] truncate group-hover:text-emerald-700 transition-colors">
                      {mix.name}
                    </p>
                    <p className="text-[10px] text-[#8C8C8C] truncate mt-0.5 font-light">
                      {textSummary}
                    </p>
                  </div>
                  <button
                    onClick={() => onPlayMix(mix)}
                    className="h-8 w-8 rounded-full bg-white hover:bg-emerald-50 flex items-center justify-center border border-[#E5E5E5] text-emerald-700 group-hover:scale-105 transition-all text-xs shadow-sm"
                    title="播放此组合"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Simple Vector Minimalist Moon Logo SVG
function MoonLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-700" fill="currentColor">
      <path d="M12 3a9 9 0 1 0 9 9 9.005 9.005 0 0 0-9-9zm4.27 10.42c-.2.07-.4.1-.61.1A4.5 4.5 0 0 1 11.16 8.9c0-.21.03-.41.1-.61a6.009 6.009 0 0 0 5.01 5.13z" />
    </svg>
  );
}
