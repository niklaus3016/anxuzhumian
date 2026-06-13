import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Trash2, 
  Plus, 
  Sun, 
  HelpCircle, 
  Check, 
  AlarmClock, 
  Volume2, 
  Coffee,
  X,
  VolumeX,
  Repeat
} from "lucide-react";
import { AlarmItem } from "../types";
import { audioSynth } from "../utils/audioSynth";

interface AlarmsProps {
  alarms: AlarmItem[];
  onAddAlarm: (time: string, label: string, days: string[]) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  activeRingingAlarm: AlarmItem | null;
  onSnoozeAlarm: (alarm: AlarmItem) => void;
  onStopAlarm: () => void;
}

export default function Alarms({
  alarms,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  activeRingingAlarm,
  onSnoozeAlarm,
  onStopAlarm
}: AlarmsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [hourInput, setHourInput] = useState("07");
  const [minuteInput, setMinuteInput] = useState("30");
  const [labelInput, setLabelInput] = useState("晨起唤醒");
  const [isDaily, setIsDaily] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const time = `${hourInput.padStart(2, '0')}:${minuteInput.padStart(2, '0')}`;
    const repeatDays = isDaily ? ["每日"] : ["单次"];
    onAddAlarm(time, labelInput.trim() || "唤醒闹钟", repeatDays);
    setShowAddForm(false);
    setLabelInput("晨起唤醒");
  };

  // Quick preset trigger for debugging the Sunrise Alarm sequence in preview!
  const triggerDemoRinging = () => {
    onAddAlarm("DEMO", "测试晨光唤醒", ["即时"]);
    alert("模拟闹钟将在2秒后响铃！请静候，亲身体验一下渐进柔和的晨曦暖光吧。");
  };

  return (
    <div id="alarms-view" className="flex-1 flex flex-col space-y-4 animate-fade-in text-left pb-6 text-[#4A4A4A]">
      
      {/* Header titles */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-[#2D2D2D] flex items-center space-x-1.5">
            <span>晨光温柔唤醒</span>
          </h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5">屏幕拟态日光渐亮，配合微风鸟鸣，无痛自然醒</p>
        </div>
        
        <button 
          id="btn-demo-trigger"
          onClick={triggerDemoRinging}
          className="text-[10px] text-emerald-800 hover:bg-emerald-50 py-1.5 px-3 rounded-xl border border-[#D9E4DD] bg-white transition-all font-bold active:scale-95 shadow-xs"
        >
          体验唤醒效果
        </button>
      </div>

      {/* Alarms list wrapper */}
      <div className="space-y-2.5">
        
        {showAddForm ? (
          /* Create alarm form */
          <form onSubmit={handleCreate} className="p-5 bg-white border border-[#E5E5E5] rounded-[32px] space-y-4 animate-fade-in shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F2F2F0] pb-2">
              <span className="text-xs font-bold text-[#2D2D2D]">配置新唤醒时间</span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C8C8C] hover:text-[#2D2D2D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Time Rollers */}
            <div className="flex items-center justify-center space-x-3 py-1 font-mono">
              <div className="text-center">
                <p className="text-[10px] text-[#8C8C8C] mb-1">小时</p>
                <select 
                  id="select-hour"
                  value={hourInput} 
                  onChange={(e) => setHourInput(e.target.value)}
                  className="bg-[#F7F7F5] text-xl font-bold text-[#2D2D2D] px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] focus:outline-none focus:border-emerald-600"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const val = String(i).padStart(2, '0');
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>
              <span className="text-xl font-bold text-[#8C8C8C] mt-4">:</span>
              <div className="text-center">
                <p className="text-[10px] text-[#8C8C8C] mb-1">分钟</p>
                <select 
                  id="select-minute"
                  value={minuteInput} 
                  onChange={(e) => setMinuteInput(e.target.value)}
                  className="bg-[#F7F7F5] text-xl font-bold text-[#2D2D2D] px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] focus:outline-none focus:border-emerald-600"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const val = String(i * 5).padStart(2, '0');
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Label inputs */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-[#8C8C8C] font-semibold uppercase">唤醒祝福语</label>
              <input 
                id="input-title-alarm"
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                maxLength={12}
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3 py-1.8 text-xs text-[#2D2D2D] focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Trigger options */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#6C6C6C] flex items-center space-x-1 font-medium">
                <Repeat className="w-3.5 h-3.5 text-emerald-700" />
                <span>每天重复</span>
              </span>
              <button
                type="button"
                id="btn-repeat-toggle"
                onClick={() => setIsDaily(!isDaily)}
                className={`w-11 h-6 rounded-full transition-all flex items-center p-0.5 ${
                  isDaily ? "bg-emerald-700 justify-end" : "bg-[#F7F7F5] border border-[#E5E5E5] justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl tracking-widest uppercase transition-all shadow-sm flex items-center justify-center space-x-1"
            >
              <Check className="w-4 h-4 mr-0.5" />
              <span>保存随梦闹钟</span>
            </button>
          </form>
        ) : (
          <button 
            id="btn-add-alarm"
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-2xl bg-white border border-[#E5E5E5] hover:bg-[#F7F7F5] text-emerald-800 flex items-center justify-center space-x-2 text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>添加温柔唤醒闹钟</span>
          </button>
        )}

        {/* Existing Alarms */}
        <div className="grid grid-cols-1 gap-2.5 max-h-[290px] overflow-y-auto no-scrollbar pr-1">
          {alarms.map((alarm) => (
            <div 
              key={alarm.id}
              id={`alarm-card-${alarm.id}`}
              className={`p-4 rounded-[28px] border flex items-center justify-between transition-all ${
                alarm.isActive 
                  ? "bg-white border-[#E5E5E5] shadow-xs" 
                  : "bg-[#F7F7F5]/80 border-transparent opacity-60"
              }`}
            >
              <div className="text-left space-y-1 flex-1 min-w-0 pr-2">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold font-mono tracking-tight ${alarm.isActive ? "text-[#2D2D2D]" : "text-[#8C8C8C]"}`}>
                    {alarm.time}
                  </span>
                  <span className="text-[10px] text-[#4A5D51] font-bold bg-[#D9E4DD] border border-white px-2 py-0.5 rounded-full shadow-xs">
                    {alarm.days.join(", ")}
                  </span>
                </div>
                <p className={`text-[10px] truncate font-light ${alarm.isActive ? "text-[#5E7A69]" : "text-[#8C8C8C]"}`}>
                  {alarm.label} &bull; 屏幕微渐亮 + 拟态森林鸟鸣
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Active switch */}
                <button
                  id={`btn-toggle-alarm-active-${alarm.id}`}
                  onClick={() => onToggleAlarm(alarm.id)}
                  className={`w-11 h-6 rounded-full transition-all flex items-center p-0.5 ${
                    alarm.isActive ? "bg-emerald-700 justify-end" : "bg-[#F7F7F5] border border-[#E5E5E5] justify-start"
                  }`}
                  title="开关闹钟"
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md animate-fade-in" />
                </button>

                {/* Delete button */}
                <button
                  id={`btn-delete-alarm-${alarm.id}`}
                  onClick={() => onDeleteAlarm(alarm.id)}
                  className="p-2 bg-[#F7F7F5] hover:bg-rose-50 text-[#8C8C8C] hover:text-rose-600 rounded-xl border border-[#E5E5E5] transition-all active:scale-95"
                  title="删除此闹钟"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
