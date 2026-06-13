import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Trash2, 
  Sparkles, 
  Wind, 
  Fingerprint, 
  VolumeX, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { audioSynth } from "../utils/audioSynth";

interface WorryItem {
  id: string;
  text: string;
  isDissolving: boolean;
}

export default function AnxietyRelief() {
  const [worryText, setWorryText] = useState("");
  const [worries, setWorries] = useState<WorryItem[]>([
    { id: "1", text: "明天早上 9 点的重要部门汇报会，PPT 还没确认", isDissolving: false },
    { id: "2", text: "信用卡账单还款，生活各项开支有些超负荷", isDissolving: false }
  ]);
  const [bubblesPopped, setBubblesPopped] = useState(0);

  // Simulated haptic ripple effects array for tapping
  const [poppers, setPoppers] = useState<{ id: number; x: number; y: number }[]>([]);

  // Ensure tinnitus state is completely cleared/stopped when opening/leaving page
  useEffect(() => {
    audioSynth.toggleTrack("tinnitus", false, 0);
    return () => {
      audioSynth.toggleTrack("tinnitus", false, 0);
    };
  }, []);

  const handleAddWorry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryText.trim()) return;
    const newItem: WorryItem = {
      id: Date.now().toString(),
      text: worryText.trim(),
      isDissolving: false
    };
    setWorries([newItem, ...worries]);
    setWorryText("");
  };

  const handleDissolveWorry = (id: string) => {
    // Stage 1: Trigger dissolve CSS transition
    setWorries(prev => 
      prev.map(w => w.id === id ? { ...w, isDissolving: true } : w)
    );

    // Audio chime to signify peaceful closure
    audioSynth.playGuideChime();

    // Stage 2: Remove after animation completes
    setTimeout(() => {
      setWorries(prev => prev.filter(w => w.id !== id));
    }, 1200);
  };

  // Interactive Bubble click feedback tracker
  const handlePopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    audioSynth.playGuideChime(); // Gentle pitch click
    setBubblesPopped(prev => prev + 1);

    // Temporary element visual ripple burst
    const popId = Date.now();
    const newPoppers = [...poppers, { id: popId, x, y }];
    setPoppers(newPoppers);

    setTimeout(() => {
      setPoppers(prev => prev.filter(p => p.id !== popId));
    }, 800);
  };

  return (
    <div id="anxiety-relief-view" className="flex-1 flex flex-col space-y-5 animate-fade-in text-left pb-6 text-[#4A4A4A]">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
          <span>情绪焦虑安抚板</span>
        </h2>
        <p className="text-xs text-[#8C8C8C] mt-0.5">先抚平起伏不安的心绪，再安然遁入香甜黑夜</p>
      </div>

      {/* Part 1: Overthinking Junk Box */}
      <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5">
          <BrainCircuit className="w-4 h-4 text-rose-500" />
          <span>胡思乱想杂物箱 (Empty Your Mind)</span>
        </h3>
        
        <p className="text-xs text-[#6C6C6C] leading-relaxed">
          把脑子里挥之不去的明天规划、债务账单、焦虑情绪通通写在这里。装进箱子后，看着它们在夜色里安然解体消散，暗示大脑：现在不是思考这些的最佳时机啦。
        </p>

        {/* Input box */}
        <form onSubmit={handleAddWorry} className="flex space-x-2">
          <input 
            id="input-worry"
            type="text"
            placeholder="写下脑子中缠绕你的乱麻思想..."
            value={worryText}
            onChange={(e) => setWorryText(e.target.value)}
            className="flex-1 bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:border-[#4A5D51] focus:bg-white placeholder-[#A1A1A1] transition-all"
          />
          <button 
            type="submit"
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-4 rounded-xl transition-all flex items-center space-x-1 active:scale-95 shadow-xs"
          >
            <span>封存入箱</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Worries list */}
        <div className="space-y-2 max-h-[145px] overflow-y-auto no-scrollbar pr-1 pt-1">
          {worries.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C8C8C] bg-[#F7F7F5] rounded-2xl border border-dashed border-[#E5E5E5]">
              这里目前空空如也，大脑非常干净 ✨
            </div>
          ) : (
            worries.map((worry) => (
              <div 
                key={worry.id}
                id={`worry-item-${worry.id}`}
                className={`p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] flex items-center justify-between space-x-3 transition-all duration-1000 ${
                  worry.isDissolving 
                    ? "opacity-0 translate-y-[-24px] blur-md border-rose-300 scale-90 rotate-2 pointer-events-none" 
                    : ""
                }`}
              >
                <div className="text-xs text-[#4A4A4A] leading-relaxed text-left flex-1 break-words py-0.5">
                  &bull; &nbsp;{worry.text}
                </div>
                <button
                  id={`btn-dissolve-worry-${worry.id}`}
                  type="button"
                  onClick={() => handleDissolveWorry(worry.id)}
                  className="py-1.5 px-3 rounded-xl bg-white border border-[#E5E5E5] hover:border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-[10px] font-bold active:scale-95 flex items-center space-x-1 shadow-xs whitespace-nowrap"
                  title="让此焦虑在夜空中化为虚无"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>安然消散</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Part 2: Interactive Stress Popping Bubble pad */}
      <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5">
            <Fingerprint className="w-4 h-4 text-emerald-700" />
            <span>指尖情绪解压泡沫垫</span>
          </h3>
          <span className="text-[10px] text-emerald-800 font-mono font-bold">已戳破 {bubblesPopped} 次</span>
        </div>
        <p className="text-xs text-[#6C6C6C] leading-normal">
          轻叩发光的极简露珠气泡，伴随平和的高空空磬残响，释放身体细微的多巴胺。
        </p>

        {/* Bubble tap arena */}
        <button
          id="btn-bubble-pop-pad"
          type="button"
          onClick={handlePopClick}
          className="w-full h-24 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] hover:border-[#D1D1D1] relative overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.99] group shadow-xs"
        >
          {/* Gentle center target glow */}
          <div className="absolute w-12 h-12 rounded-full bg-[#D9E4DD]/40 blur-xl group-hover:scale-150 transition-all pointer-events-none" />
          
          <div className="text-xs text-[#4A4A4A] font-medium tracking-wider flex flex-col items-center space-y-1 z-10 pointer-events-none select-none">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest animate-pulse">BUBBLE CLICK AREA</span>
            <span className="text-[#8C8C8C] text-[10px]">在这块区域任意点击 / 敲击均可解压释放</span>
          </div>

          {/* Interactive clicking particle animations */}
          {poppers.map((pop) => (
            <div 
              key={pop.id}
              className="absolute w-5 h-5 rounded-full border-2 border-emerald-600/60 bg-emerald-500/20 pointer-events-none animate-ping"
              style={{
                left: pop.x - 10,
                top: pop.y - 10
              }}
            />
          ))}
        </button>
      </div>

    </div>
  );
}
