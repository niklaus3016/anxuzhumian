import React, { useState, useEffect, useRef } from "react";
import { 
  Timer, 
  Moon, 
  HelpCircle, 
  VolumeX, 
  Star, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  Volume2,
  X,
  Lock,
  Compass
} from "lucide-react";
import { audioSynth } from "../utils/audioSynth";

interface FocusModeProps {
  onFocusComplete: () => void;
}

export default function FocusMode({ onFocusComplete }: FocusModeProps) {
  const [duration, setDuration] = useState<10 | 15 | 20>(15); // minutes
  const [remainingTime, setRemainingTime] = useState(15 * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    audioSynth.playGuideChime();
  };

  const handleReset = () => {
    setIsActive(false);
    setRemainingTime(duration * 60);
  };

  const handleDurationSelect = (min: 10 | 15 | 20) => {
    if (isActive) return; // lock selection when running
    setDuration(min);
    setRemainingTime(min * 60);
  };

  const handleComplete = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    audioSynth.playGuideChime();
    alert("恭喜您，达成了今晚的睡前静音专注！现在，身体已逐渐冷却并做好了入梦准备，让我们滑入音效伴眠吧。");
    onFocusComplete(); // callbacks upstream to trigger auto sleep rain linkage!
  };

  const formatSec = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id="focus-mode-view" className="flex-1 flex flex-col justify-between py-2 space-y-4 animate-fade-in text-left text-[#4A4A4A]">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
          <span>睡前番茄学时</span>
        </h2>
        <p className="text-xs text-[#8C8C8C] mt-0.5">阻断手机依赖与睡前刷视频，给思考降温，重塑睡眠秩序</p>
      </div>

      {isActive ? (
        /* LOCKSCREEN COUNTER STAGE */
        <div id="focus-lockstage-panel" className="flex-1 flex flex-col justify-around py-4 bg-white border border-[#E5E5E5] rounded-[32px] p-6 text-center shadow-sm relative overflow-hidden h-[380px] animate-fade-in">
          
          {/* Subtle starry background layout */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <Star className="absolute top-10 left-12 w-3.5 h-3.5 text-[#D9E4DD] animate-pulse" />
            <Star className="absolute top-24 right-14 w-2 h-2 text-[#8C8C8C]" />
            <Star className="absolute bottom-20 left-20 w-2.5 h-2.5 text-[#D9E4DD] animate-pulse" />
            <Star className="absolute top-1/2 left-1/3 w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          </div>

          <div className="space-y-1.5 z-10">
            <span className="text-[9px] text-[#8C8C8C] font-bold uppercase tracking-widest font-mono">
              Bedtime Phone Lock Simulator
            </span>
            <p className="text-xs text-emerald-800 font-bold flex items-center justify-center space-x-1.5 leading-normal">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>智能屏蔽运行：克制玩手机欲望</span>
            </p>
          </div>

          {/* Large timer display */}
          <div className="text-6xl font-mono text-[#2D2D2D] font-bold select-none tracking-tighter my-2 z-10">
            {formatSec(remainingTime)}
          </div>

          <div className="space-y-4 z-10">
            <p className="text-xs text-[#8C8C8C] leading-relaxed italic max-w-xs mx-auto text-center px-4 font-medium">
              &ldquo; 森林已经熄灯了，星星也在低唱。合上眼帘，不要再去触碰无尽的网络消息啦。 &rdquo;
            </p>

            <button
              id="btn-cancel-focus"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-2xl bg-rose-50 hover:bg-[#E8D3D1]/20 text-[#8E6D6A] border border-[#E8D3D1] text-[10px] font-bold tracking-widest uppercase transition-all active:scale-95"
            >
              放弃并退出专注
            </button>
          </div>

        </div>
      ) : (
        /* SELECTION MENU STAGE */
        <div id="subview-focus-setup" className="flex-1 flex flex-col justify-around py-4">
          
          {/* Description banner */}
          <div className="bg-white border border-[#E5E5E5] rounded-[28px] p-5 text-center space-y-3.5 shadow-sm">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold font-mono py-1 px-3 rounded-full bg-[#D9E4DD] border border-white">
                睡前戒断器机制
              </span>
            </div>
            <p className="text-xs text-[#6C6C6C] leading-relaxed font-normal">
              深夜不停刷短视频、刷社交软件，会让大脑皮层反复受到蓝光和高强度视觉刺激，导致无法顺利进入深度REM睡眠。
            </p>
            <p className="text-xs text-[#6C6C6C] leading-relaxed font-normal">
              开启番茄机制，锁定界面并专注于有规律的平缓休息。计时结束后，应用将自动激发静音雨夜音频，引导您无缝过渡至睡梦。
            </p>
          </div>

          {/* Time Picker Controls */}
          <div className="space-y-3 mt-4 text-center">
            <span className="text-[11px] font-bold text-[#2D2D2D] tracking-wide block uppercase">
              选择专注放空的时长
            </span>
            
            <div className="flex space-x-2.5 max-w-xs mx-auto justify-center">
              {([10, 15, 20] as const).map((mins) => {
                const isMatch = duration === mins;
                return (
                  <button
                    key={mins}
                    id={`btn-focus-time-${mins}`}
                    onClick={() => handleDurationSelect(mins)}
                    className={`h-11 w-20 rounded-2xl border text-xs font-bold transition-all ${
                      isMatch 
                        ? "bg-[#D9E4DD] text-[#4A5D51] border-white shadow-xs font-sans font-bold" 
                        : "bg-white text-[#8C8C8C] border-[#E5E5E5] hover:text-[#2D2D2D] hover:border-[#D1D1D1]"
                    }`}
                  >
                    {mins} 分钟
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            id="btn-start-focus"
            onClick={handleStart}
            className="w-full mt-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold font-display tracking-widest transition-all shadow-sm active:scale-95 uppercase flex items-center justify-center space-x-1.5"
          >
            <Lock className="w-4 h-4" />
            <span>进入静心睡眠专注模式</span>
          </button>

        </div>
      )}

    </div>
  );
}
