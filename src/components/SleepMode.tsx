import React, { useState } from "react";
import { 
  BellOff, 
  Moon, 
  Sun, 
  Sliders, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Image as ImageIcon,
  Check
} from "lucide-react";

interface SleepModeProps {
  eyeProtectionWarmth: number;
  onWarmthChange: (value: number) => void;
  onLinkAudioTrigger: (play: boolean) => void;
}

export default function SleepMode({ 
  eyeProtectionWarmth, 
  onWarmthChange,
  onLinkAudioTrigger
}: SleepModeProps) {
  const [dndActive, setDndActive] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<"forest" | "lake" | "stars">("forest");
  const [whitelistEmergency, setWhitelistEmergency] = useState(true);

  const wallpapers = {
    forest: {
      name: "星愿松林",
      bgClass: "from-[#F0F4F1] via-[#D9E4DD]/60 to-[#F0F4F1]",
      accent: "text-[#4A5D51]",
      description: "低明度的松绿调，模拟深山密林的深夜静谧。"
    },
    lake: {
      name: "无痕秋湖",
      bgClass: "from-[#F0F4F8] via-[#D4E2F0] to-[#F0F4F8]",
      accent: "text-slate-600",
      description: "柔和的湖蓝调，抚平情绪微澜。"
    },
    stars: {
      name: "莫兰迪沙丘",
      bgClass: "from-[#FDFBF7] via-[#EFE5D9] to-[#FDFBF7]",
      accent: "text-amber-800",
      description: "温馨的橘瓦调，宛如黄昏下的金色旷野。"
    }
  };

  const currentWp = wallpapers[selectedWallpaper];

  const handleToggleDND = () => {
    const nextState = !dndActive;
    setDndActive(nextState);
    if (nextState) {
      // Engage smart amber eye filters (warmth 40%)
      onWarmthChange(55);
      // Linkage triggers gentle rain track for sleep environment cocoon!
      onLinkAudioTrigger(true);
    } else {
      onWarmthChange(0);
      onLinkAudioTrigger(false);
    }
  };

  return (
    <div id="sleep-mode-view" className="flex-1 flex flex-col space-y-4 animate-fade-in text-left text-[#4A4A4A]">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
          <span>防扰休眠守护</span>
        </h2>
        <p className="text-xs text-[#8C8C8C] mt-0.5">一键拦截手机亮屏与嘈杂通知，沉浸入纯粹安眠</p>
      </div>

      {/* Main Wallpaper Preview Stage */}
      <div className={`p-5 rounded-[32px] bg-gradient-to-b ${currentWp.bgClass} border border-white shadow-sm text-center relative overflow-hidden transition-all duration-700 min-h-[220px] flex flex-col justify-between`}>
        {/* Soft glowing vectors representing celestial stars/scaffold */}
        <div className="absolute top-4 right-1/4 w-12 h-12 rounded-full bg-white/40 filter blur-md" />
        <div className="absolute bottom-12 left-10 w-20 h-20 rounded-full bg-white/50 border border-white/60 flex items-center justify-center shadow-xs">
          <Moon className={`w-8 h-8 ${currentWp.accent} animate-pulse`} />
        </div>

        <div className="space-y-1.5 z-10 pt-2">
          <p className="text-[10px] text-[#2D2D2D]/30 font-bold uppercase tracking-widest font-mono">
            {currentWp.name} Wallpaper
          </p>
          <h3 className="text-xs text-[#5E5E5E] font-medium px-4 leading-normal">
            {dndActive ? "安卓勿扰权限已托管：大自然音频正在安抚您，外界推送杂音已被静音过滤。" : currentWp.description}
          </h3>
        </div>

        {/* Dynamic Mock Notification Block Toast */}
        {dndActive && (
          <div className="mx-auto max-w-[280px] p-2.5 rounded-2xl bg-white border border-rose-100 flex items-center space-x-2.5 animate-pulse z-10 shadow-sm">
            <BellOff className="w-4 h-4 text-rose-500" />
            <div className="text-left">
              <span className="text-[10px] text-rose-800 font-bold block">通知防火墙运行中</span>
              <span className="text-[9px] text-rose-400 font-medium block">已拦截 4 条外界通知，守护您的梦境秩序</span>
            </div>
          </div>
        )}

        <div className="text-[10px] text-[#2D2D2D]/20 font-mono z-10">
          安序相伴 &bull; SLEEPORDER
        </div>
      </div>

      {/* Button Trigger DND */}
      <button
        id="btn-dnd-toggle"
        onClick={handleToggleDND}
        className={`w-full py-4 rounded-[24px] text-xs font-bold font-display tracking-widest transition-all flex items-center justify-center space-x-2 active:scale-95 ${
          dndActive 
            ? "bg-rose-50 hover:bg-[#E8D3D1]/20 text-[#8E6D6A] border border-[#E8D3D1]" 
            : "bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm"
        }`}
      >
        <BellOff className="w-4 h-4" />
        <span>{dndActive ? "解除一键休眠模式" : "开启一键防打扰休眠模式"}</span>
      </button>

      {/* Interactive Controls & Slate Deck */}
      <div className="grid grid-cols-1 gap-4 bg-white border border-[#E5E5E5] rounded-[32px] p-5 shadow-sm">
        
        {/* Toggle 1: Amber warming eye shield */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>智能护眼暖光滤镜</span>
            </span>
            <span className="text-xs text-amber-700 font-mono font-bold">{eyeProtectionWarmth}%</span>
          </div>
          <p className="text-[10px] text-[#8C8C8C] leading-normal font-normal">
            通过覆盖柔和的莫兰迪橙瓦色垫，降低高频亮屏蓝光刺激，让褪黑素更顺畅分泌。
          </p>
          <div className="flex items-center space-x-3">
            <Sun className="w-4 h-4 text-[#8C8C8C]" />
            <input 
              id="warmth-slider"
              type="range"
              min="0"
              max="90"
              value={eyeProtectionWarmth}
              onChange={(e) => onWarmthChange(parseInt(e.target.value))}
              className="flex-1 accent-[#4A5D51] h-1.5 bg-[#F7F7F5] rounded-lg appearance-none cursor-pointer border border-[#E5E5E5]"
            />
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Toggle 2: Emergency Contact Whitelist */}
        <div className="border-t border-[#F2F2F0] pt-4 flex items-center justify-between">
          <div className="text-left space-y-0.5 pr-2">
            <span className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4A5D51]" />
              <span>保留紧急来电 (白名单)</span>
            </span>
            <span className="text-[10px] text-[#8C8C8C] block font-normal leading-normal">
              静音通知的同时，容许同一号码重复拔入时发出低音振鸣，杜绝错失紧急要事。
            </span>
          </div>
          <button
            id="toggle-whitelist"
            onClick={() => setWhitelistEmergency(!whitelistEmergency)}
            className={`w-11 h-6 rounded-full transition-all flex items-center p-0.5 ${
              whitelistEmergency ? "bg-emerald-700 justify-end" : "bg-[#F7F7F5] border border-[#E5E5E5] justify-start"
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Toggle 3: Wallpaper Select Deck */}
        <div className="border-t border-[#F2F2F0] pt-4">
          <span className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5 mb-2.5">
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            <span>极简治愈休眠壁纸</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(wallpapers) as Array<"forest" | "lake" | "stars">).map((key) => {
              const item = wallpapers[key];
              const isMatch = selectedWallpaper === key;
              return (
                <button
                  key={key}
                  id={`btn-wallpaper-${key}`}
                  onClick={() => setSelectedWallpaper(key)}
                  className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                    isMatch 
                      ? "bg-[#D9E4DD] text-[#4A5D51] border-white shadow-xs font-bold" 
                      : "bg-[#F7F7F5] text-[#8C8C8C] border-transparent hover:text-[#2D2D2D]"
                  }`}
                >
                  <p className="truncate">{item.name}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
