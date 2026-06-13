import React, { useState } from "react";
import { 
  Trash2, 
  Heart, 
  SlidersHorizontal,
  RotateCcw,
  Play,
  Volume2,
  Shield,
  X
} from "lucide-react";
import { SavedMix, SoundTrack } from "../types";
import { PrivacyPolicyContent, AgreementModal } from "./PrivacyModal";

interface SettingsProps {
  savedMixes: SavedMix[];
  allTracks: SoundTrack[];
  onPlayMix: (mix: SavedMix) => void;
  onDeleteMix: (id: string) => void;
  onResetAllData: () => void;
  defaultStopDuration: number | null;
  onDefaultStopDurationChange: (duration: number | null) => void;
}

export default function Settings({
  savedMixes,
  allTracks,
  onPlayMix,
  onDeleteMix,
  onResetAllData,
  defaultStopDuration,
  onDefaultStopDurationChange
}: SettingsProps) {

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showFullPrivacy, setShowFullPrivacy] = useState(false);

  const handleReset = () => {
    const confirm = window.confirm("您确定要清空所有自定义闹钟、保存的收藏混音组合以及个性化配置吗？此操作无法撤销。");
    if (confirm) {
      onResetAllData();
      alert("所有本地配置已全部清空恢复为新机状态。");
    }
  };

  return (
    <div id="settings-view" className="flex-1 flex flex-col space-y-5 animate-fade-in text-left pb-6 text-[#4A4A4A]">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
          <span>个性化参数设置</span>
        </h2>
      </div>

      {/* Part 1: Persistent Custom Preset combinations list manager */}
      <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>管理我的专属声音配方案 ({savedMixes.length})</span>
        </h3>

        {savedMixes.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8C8C8C] bg-[#F7F7F5] rounded-2xl border border-dashed border-[#E5E5E5]">
            暂无保存的声音搭配组合。
            <br />
            <span className="text-[10px] text-[#A1A1A1] block mt-1">进入“音效助眠”搭配后可点击保存</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
            {savedMixes.map((mix) => {
              const textSummary = mix.tracks
                .map((t) => allTracks.find((ot) => ot.id === t.soundId)?.name || "")
                .filter(Boolean)
                .join(" + ");

              return (
                <div 
                  key={mix.id}
                  id={`favorites-mix-row-${mix.id}`}
                  className="p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] flex items-center justify-between space-x-2 hover:border-[#D1D1D1] transition-all group"
                >
                  <div className="text-left min-w-0 flex-1 pr-1">
                    <p className="text-xs font-bold text-[#2D2D2D] truncate group-hover:text-emerald-800 transition-colors">
                      {mix.name}
                    </p>
                    <p className="text-[10px] text-[#8C8C8C] truncate mt-0.5 font-normal">
                      {textSummary}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 font-sans">
                    <button
                      id={`btn-play-saved-mix-${mix.id}`}
                      type="button"
                      onClick={() => onPlayMix(mix)}
                      className="px-3 py-1.5 rounded-xl bg-[#D9E4DD] text-[#4A5D51] hover:bg-[#C9D6CE] text-[10px] font-bold active:scale-95 transition-all flex items-center space-x-1"
                      title="呼叫混音"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>调用</span>
                    </button>
                    <button
                      id={`btn-delete-saved-mix-${mix.id}`}
                      type="button"
                      onClick={() => onDeleteMix(mix.id)}
                      className="p-2 text-[#8C8C8C] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#E5E5E5] rounded-xl transition-all active:scale-95"
                      title="删除搭配"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part 2: Personalization controls */}
      <div className="grid grid-cols-1 gap-4 bg-white border border-[#E5E5E5] rounded-[32px] p-5 shadow-sm">
        <h3 className="text-xs font-bold text-[#2D2D2D] flex items-center space-x-1.5 border-b border-[#F2F2F0] pb-3 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
          <span>定时偏好</span>
        </h3>

        {/* 2. Default Timer Duration Select */}
        <div className="pt-2 space-y-3">
          <span className="text-xs font-bold text-[#2D2D2D] block">默认倒计时关机预设</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "持续播放", val: null },
              { label: "15分钟", val: 15 },
              { label: "30分钟", val: 30 },
              { label: "60分钟", val: 60 }
            ].map((opt) => {
              const isMatch = defaultStopDuration === opt.val;
              return (
                <button
                  key={opt.label}
                  id={`btn-default-timer-${opt.val}`}
                  type="button"
                  onClick={() => onDefaultStopDurationChange(opt.val)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                    isMatch 
                      ? "bg-[#D9E4DD] text-[#4A5D51] border-[#B4C9BE] shadow-xs" 
                      : "bg-[#F7F7F5] text-[#8C8C8C] border-transparent hover:text-[#2D2D2D] hover:border-[#D1D1D1]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Part 2.5: Privacy Policy Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-5 flex flex-col gap-4 text-left shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 bg-[#D9E4DD]/40 rounded-full border border-emerald-600/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2D2D2D]">个人隐私保全承诺</h4>
              <p className="text-[10px] text-[#8C8C8C] mt-0.5 leading-normal max-w-xs font-normal">
                安序承诺绝对不收集、上传任何本地睡眠和闹钟记录。
              </p>
            </div>
          </div>
          <button
            id="btn-view-privacy"
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#E5E5E5] text-[#2D2D2D] border border-[#E5E5E5] font-bold text-xs rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-xs whitespace-nowrap shrink-0"
          >
            <span>隐私说明</span>
          </button>
        </div>
        <button
          id="btn-view-full-privacy"
          type="button"
          onClick={() => setShowFullPrivacy(true)}
          className="w-full py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-xs"
        >
          <span>查看完整隐私政策</span>
        </button>
      </div>

      {/* Part 3: Soft Data Reset block */}
      <div className="bg-rose-50/40 border border-[#E8D3D1]/40 rounded-[32px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
        <div>
          <h4 className="text-xs font-bold text-[#8E6D6A]">重置本地全部数据</h4>
          <p className="text-[10px] text-[#8E6D6A]/80 mt-0.5 leading-normal max-w-xs font-normal">
            一键抹除所有本地缓存存储，完全清空自定义混音、习惯闹钟，并重置个性化语速和参数。
          </p>
        </div>
        <button
          id="btn-factory-reset"
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-[#E8D3D1]/20 text-[#8E6D6A] border border-[#E8D3D1] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>清除全部配置</span>
        </button>
      </div>

      {/* Privacy Policy Modal overlay popup (within absolute UI boundary) */}
      {showPrivacy && (
        <div id="privacy-modal-overlay" className="absolute inset-0 bg-[#000000]/60 z-[20000] flex items-center justify-center p-4 animate-fade-in rounded-[44px]">
          <div className="bg-[#FAF6F0] w-full max-w-[280px] rounded-[32px] border border-[#E5E5E5] p-5 space-y-4 shadow-xl flex flex-col max-h-[85%] text-left">
            
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-[#F2F2F0] pb-3 shrink-0">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-[#2D2D2D]">安序睡眠隐私政策</span>
              </div>
              <button 
                id="btn-close-privacy-modal"
                type="button" 
                onClick={() => setShowPrivacy(false)}
                className="p-1 rounded-full text-[#8C8C8C] hover:text-[#2D2D2D] hover:bg-[#E5E5E5] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content main body */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 text-[10px] text-[#4A4A4A] leading-relaxed pr-1 select-text">
              <div>
                <h5 className="font-bold text-[#2D2D2D] mb-0.5">一、无远程收集</h5>
                <p className="text-[#6C6C6C] font-normal">
                  本应用是一个百分之百纯本地运行的静心睡眠引导工具。它不设立任何外部云端服务器，没有任何后台数据采集服务。
                </p>
              </div>
              
              <div>
                <h5 className="font-bold text-[#2D2D2D] mb-0.5">二、本地离线存储</h5>
                <p className="text-[#6C6C6C] font-normal">
                  您的日程设置、保存的专属声音混音组合、习惯闹钟、偏好参数均仅安全保存在您当前浏览器的本地缓存（LocalStorage）中，绝无外泄风险。
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#2D2D2D] mb-0.5">三、纯粹底层技术</h5>
                <p className="text-[#6C6C6C] font-normal">
                  音频合成与极简露珠气泡声波完全基于您本机的 Web Audio 引擎即时生成，没有后台任何偷偷读取，保障您的起居私密。
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#2D2D2D] mb-0.5">四、安心安全权限</h5>
                <p className="text-[#6C6C6C] font-normal">
                  我们不会要求、更不会私自获取例如定位、通讯录或麦克风等后台敏感权限。您可以安心静心，安享平稳一呼一吸。
                </p>
              </div>
            </div>

            {/* OK Action button */}
            <button
              id="btn-confirm-privacy"
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all text-center shrink-0 active:scale-95"
            >
              我知道了
            </button>

          </div>
        </div>
      )}

      {/* Full Privacy Policy Modal */}
      {showFullPrivacy && (
        <AgreementModal
          onClose={() => setShowFullPrivacy(false)}
          title="隐私政策"
          content={<PrivacyPolicyContent />}
        />
      )}

    </div>
  );
}
