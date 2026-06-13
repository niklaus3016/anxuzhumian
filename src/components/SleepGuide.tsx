import React, { useState, useEffect, useRef } from "react";
import { 
  Wind, 
  BookOpen, 
  Clock, 
  VolumeX, 
  Volume2, 
  Volume1, 
  Play, 
  Pause, 
  HelpCircle, 
  Compass, 
  Sparkles,
  RotateCcw,
  Volume,
  ChevronRight
} from "lucide-react";
import { audioSynth } from "../utils/audioSynth";
import { MeditationClass } from "../types";

export default function SleepGuide() {
  const [activeTab, setActiveTab] = useState<"breath" | "meditation">("breath");

  // --- BREATH TRAINER STATE ---
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");
  const [breathCounter, setBreathCounter] = useState(4); // seconds remaining in current phase
  const breathTimerRef = useRef<any>(null);

  useEffect(() => {
    if (breathActive) {
      audioSynth.toggleBreathingDrone(true, 50);
      
      const runCycle = () => {
        setBreathCounter((prev) => {
          if (prev <= 1) {
            audioSynth.playGuideChime(); // Gentle chime sound when transitioning
            if (breathPhase === "inhale") {
              setBreathPhase("exhale");
              return 6; // 6s exhale
            } else {
              setBreathPhase("inhale");
              return 4; // 4s inhale
            }
          }
          return prev - 1;
        });
      };

      breathTimerRef.current = setInterval(runCycle, 1000);
    } else {
      clearInterval(breathTimerRef.current);
      audioSynth.toggleBreathingDrone(false, 0);
    }

    return () => {
      clearInterval(breathTimerRef.current);
    };
  }, [breathActive, breathPhase]);

  const handleToggleBreath = () => {
    if (!breathActive) {
      setBreathActive(true);
      setBreathPhase("inhale");
      setBreathCounter(4);
      audioSynth.playGuideChime();
    } else {
      setBreathActive(false);
    }
  };

  // --- MEDITATION CLASS STATE ---
  const classes: MeditationClass[] = [
    {
      id: "class_1",
      title: "3分钟睡前快速放松",
      duration: 3,
      description: "快速舒缓面部及肩膀肌肉张力，释放白天积攒的躯体紧绷。",
      steps: [
        "闭上双眼，将两肩缓慢向上耸起，然后重重地放落...",
        "放松眉心、咬肌，随呼气排出所有的疲累与委屈...",
        "感受全身犹如春雪初融，安稳地向床褥沉降..."
      ]
    },
    {
      id: "class_2",
      title: "5分钟静心止息正念",
      duration: 5,
      description: "专注于当下的细微呼吸，任由脑海中的想法如云朵般消散。",
      steps: [
        "觉察空气流经鼻翼两侧的清凉与温热感...",
        "杂念升起时无须责备，仅仅是在心中对它标记一声 知道啦...",
        "把飘浮的心神，轻轻落回这平静平稳的一吸一呼中..."
      ]
    },
    {
      id: "class_3",
      title: "10分钟安睡深层解压",
      duration: 10,
      description: "睡前深层意识扫掠，解压大脑神经核，在平缓氛围中沉稳入眠。",
      steps: [
        "从头顶最上方的毛孔开始，进行柔和温暖的脑波扫掠...",
        "缓缓扫过眼皮、颈椎、后背、直至脚尖关节...",
        "脑海中浮现一泊静谧的深海湖水，没有任何风浪，十分安全..."
      ]
    }
  ];

  const [playingClass, setPlayingClass] = useState<MeditationClass | null>(null);
  const [classRemainingSec, setClassRemainingSec] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const classTimerRef = useRef<any>(null);
  const [finishedClassTitle, setFinishedClassTitle] = useState<string | null>(null);

  const startMeditation = (item: MeditationClass) => {
    stopMeditation();
    setPlayingClass(item);
    setClassRemainingSec(item.duration * 60);
    setCurrentStepIdx(0);
    audioSynth.toggleBreathingDrone(true, 40);
    audioSynth.playGuideChime();

    classTimerRef.current = setInterval(() => {
      setClassRemainingSec((prev) => {
        if (prev <= 1) {
          stopMeditation();
          audioSynth.playGuideChime();
          setFinishedClassTitle(item.title);
          return 0;
        }
        
        // Progress step based on remaining duration thresholds
        const progress = 1 - (prev / (item.duration * 60));
        const stepNum = Math.min(
          Math.floor(progress * item.steps.length), 
          item.steps.length - 1
        );
        setCurrentStepIdx(stepNum);

        return prev - 1;
      });
    }, 1000);
  };

  const stopMeditation = () => {
    if (classTimerRef.current) {
      clearInterval(classTimerRef.current);
      classTimerRef.current = null;
    }
    setPlayingClass(null);
    audioSynth.toggleBreathingDrone(false, 0);
  };

  const formatSec = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };



  return (
    <div id="sleep-guide-view" className="flex-1 flex flex-col space-y-4 animate-fade-in text-left">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
          <span>睡前疗愈引导</span>
        </h2>
        <p className="text-xs text-[#8C8C8C] mt-0.5">调匀一息，放空杂念，寻找身体内的安宁法则</p>
      </div>

      {/* Nav Tab Swappers */}
      <div className="flex border-b border-[#F2F2F0] pb-1">
        {[
          { key: "breath", label: "规律呼吸" },
          { key: "meditation", label: "冥想正念" },
        ].map((tab) => (
          <button
            key={tab.key}
            id={`tab-guide-${tab.key}`}
            type="button"
            onClick={() => {
              stopMeditation();
              setActiveTab(tab.key as any);
            }}
            className={`flex-1 text-center py-2 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === tab.key 
                ? "border-emerald-700 text-emerald-850 font-bold" 
                : "border-transparent text-[#8C8C8C] hover:text-[#2D2D2D]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER VIEW ACCORDING TO STATE TAB */}

      {activeTab === "breath" && (
        <div id="subview-breath-trainer" className="flex-1 flex flex-col justify-around py-2.5">
          <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-5 text-center shadow-sm">
            <span className="text-[10px] text-[#4A5D51] font-bold font-mono py-1 px-3 rounded-full bg-[#D9E4DD] border border-white shadow-xs inline-block">
              安序专属 &bull; 慢呼吸黄金法则
            </span>
            <p className="text-xs text-[#6C6C6C] mt-3.5 mx-1 leading-relaxed">
              跟随柔和浮动的极简气泡：吸气 4 秒，呼气 6 秒。这能有效激活您的副交感神经，从而抑制心跳过速和焦虑杂念。
            </p>
          </div>

          {/* Interactive Breathing Area layout */}
          <div className="flex items-center justify-center my-6 py-4 relative min-h-[220px]">
            {/* Ambient pulse glow background ring */}
            <div className={`absolute w-44 h-44 rounded-full bg-emerald-700/5 filter blur-2xl transition-all duration-1000 ${
              breathActive ? (breathPhase === "inhale" ? "scale-125 opacity-100 bg-emerald-700/10" : "scale-75 opacity-40") : "scale-100"
            }`} />

            {/* Simulated breathing physical bubble */}
            <div 
              id="breathing-circle-spirit"
              className={`rounded-full flex flex-col items-center justify-center shadow-sm transition-all duration-1000 border ${
                breathActive
                  ? breathPhase === "inhale"
                    ? "w-44 h-44 bg-[#D9E4DD]/60 border-emerald-700/30 scale-125 shadow-emerald-700/10"
                    : "w-32 h-32 bg-[#F7F7F5] border-emerald-600/20 scale-90"
                  : "w-36 h-36 bg-white border-[#E5E5E5] shadow-xs"
              }`}
              style={{
                transitionTimingFunction: breathPhase === "inhale" ? "cubic-bezier(0.25, 1, 0.5, 1)" : "cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDuration: breathPhase === "inhale" ? "4000ms" : "6000ms"
              }}
            >
              {breathActive ? (
                <>
                  <span className="text-xs text-emerald-800 font-bold tracking-widest uppercase animate-pulse">
                    {breathPhase === "inhale" ? "吸 气" : "呼 气"}
                  </span>
                  <span className="text-3xl font-bold font-display text-[#2D2D2D] mt-2 font-mono">
                    {breathCounter}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#8C8C8C] font-bold tracking-widest">
                  就绪
                </span>
              )}
            </div>
          </div>

          {/* Operational button */}
          <button
            id="btn-breath-toggle"
            type="button"
            onClick={handleToggleBreath}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold font-display tracking-widest transition-all uppercase shadow-sm active:scale-95 ${
              breathActive 
                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200" 
                : "bg-emerald-700 hover:bg-emerald-600 text-white"
            }`}
          >
            {breathActive ? "暂停呼气练习" : "开启 4:6 规律呼吸训练"}
          </button>
        </div>
      )}

      {activeTab === "meditation" && (
        <div id="subview-meditation" className="flex-1 flex flex-col space-y-3.5">
          {playingClass ? (
            /* Active Course Playing Panel */
            <div id="meditation-player-panel" className="bg-white border border-[#E5E5E5] rounded-[32px] p-6 text-center flex flex-col justify-between h-[360px] animate-fade-in shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-[#4A5D51] font-bold bg-[#D9E4DD] border border-white px-3 py-1 rounded-full shadow-xs inline-block">
                  正念静心课程进行中
                </span>
                <h3 className="text-base font-bold text-[#2D2D2D] pt-3">{playingClass.title}</h3>
              </div>

              {/* Step visual prompt */}
              <div className="py-3 px-5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] min-h-[100px] flex items-center justify-center">
                <p className="text-xs text-[#4A4A4A] font-sans leading-relaxed text-center italic">
                  &ldquo; {playingClass.steps[currentStepIdx]} &rdquo;
                </p>
              </div>

              {/* Countdown metrics */}
              <div className="space-y-4">
                <div className="text-3xl font-mono text-emerald-800 font-bold select-none">
                  {formatSec(classRemainingSec)}
                </div>
                
                {/* Visual indicator nodes */}
                <div className="flex justify-center space-x-1.5 pb-1">
                  {playingClass.steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-2 rounded-full transition-all ${idx === currentStepIdx ? "w-6 bg-emerald-700" : "w-1.5 bg-[#E5E5E5]"}`}
                    />
                  ))}
                </div>

                <button
                  id="btn-stop-meditation"
                  type="button"
                  onClick={stopMeditation}
                  className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 text-xs font-bold transition-all"
                >
                  终止静音课程
                </button>
              </div>
            </div>
          ) : (
            /* Course Directory Menu list */
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
              {classes.map((cls) => (
                <div 
                  key={cls.id}
                  id={`med-card-${cls.id}`}
                  className="p-5 rounded-[28px] bg-white border border-[#E5E5E5] hover:border-[#D1D1D1] transition-all flex flex-col justify-between space-y-3.5 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-left space-y-1">
                      <h4 className="text-xs font-bold text-[#2D2D2D]">{cls.title}</h4>
                      <p className="text-[10px] text-[#8C8C8C] leading-normal font-normal">{cls.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#4A5D51] font-bold bg-[#D9E4DD] border border-white px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs whitespace-nowrap">
                      <Clock className="w-3 h-3 text-[#4A5D51] mr-0.5" />
                      <span>{cls.duration}分</span>
                    </span>
                  </div>

                  <button
                    id={`btn-start-med-${cls.id}`}
                    type="button"
                    onClick={() => startMeditation(cls)}
                    className="w-full py-2.5 bg-[#F7F7F5] hover:bg-[#E5E5E5] text-[#2D2D2D] border border-[#E5E5E5] rounded-xl text-xs font-bold tracking-wider flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current mr-0.5 text-emerald-700" />
                    <span>开启静心微课</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Meditation Course Finished Modal (Inside absolute container layout) */}
      {finishedClassTitle && (
        <div id="meditation-finished-overlay" className="absolute inset-0 bg-black/60 z-[20000] flex items-center justify-center p-4 animate-fade-in rounded-[44px]">
          <div className="bg-[#FAF6F0] w-full max-w-[280px] rounded-[32px] border border-[#E5E5E5] p-6 space-y-4 shadow-xl flex flex-col text-center items-center">
            <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#2D2D2D]">正念引导完成</h3>
              <p className="text-[10px] text-[#6C6C6C] leading-normal font-normal">
                课程【{finishedClassTitle}】已圆满结束，愿您安逸放松、好梦相伴。
              </p>
            </div>
            <button
              id="btn-close-finished-modal"
              type="button"
              onClick={() => setFinishedClassTitle(null)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all text-center active:scale-95"
            >
              安枕入梦
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
