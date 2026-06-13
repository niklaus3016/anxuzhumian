import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Battery, 
  Signal, 
  Moon, 
  Sun, 
  Info,
  ChevronLeft,
  Settings as SettingsIcon,
  User,
  Heart
} from "lucide-react";

interface PhoneContainerProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  eyeProtectionWarmth: number;
}

export default function PhoneContainer({ 
  children, 
  activeTab, 
  onNavigate,
  eyeProtectionWarmth
}: PhoneContainerProps) {
  const [timeStr, setTimeStr] = useState("22:15");
  const [batteryLevel, setBatteryLevel] = useState(88);

  useEffect(() => {
    // Update local simulated clock
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Soft slow battery drain simulation just for ambient fidelity
  useEffect(() => {
    const bInterval = setInterval(() => {
      setBatteryLevel(prev => (prev > 15 ? prev - 1 : 100));
    }, 180000);
    return () => clearInterval(bInterval);
  }, []);

  // Compute amber warmth filter style
  const filterOverlayStyle = eyeProtectionWarmth > 0 ? {
    backgroundColor: `rgba(245, 158, 11, ${Math.min(eyeProtectionWarmth * 0.002, 0.18)})`,
    mixBlendMode: "multiply" as const,
  } : undefined;

  return (
    <div id="app-viewport-wrapper" className="h-screen w-screen overflow-hidden bg-[#F7F7F5] flex justify-center text-[#4A4A4A] font-sans transition-all duration-300">
      
      {/* Main Container - responsive with max-w-md for optimal visual balance on desktop, fluid on mobile */}
      <div 
        id="phone-device-bezel" 
        className="relative w-full max-w-md h-full bg-white flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* Mock Screen Overlay Warmth Filter (Eye Protection) */}
        {eyeProtectionWarmth > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none z-[999]" 
            style={filterOverlayStyle} 
          />
        )}

        {/* Interactive App Screen Space */}
        <div id="app-view-body" className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative min-h-0 bg-[#F7F7F5]">
          
          {/* Back header button for sub-pages */}
          {activeTab !== "dashboard" && (
            <div className="px-4 pt-4 pb-1 flex items-center justify-between z-50">
              <button 
                id="btn-nav-back"
                onClick={() => onNavigate("dashboard")}
                className="flex items-center text-xs text-[#4A4A4A] hover:text-[#2D2D2D] bg-white hover:bg-[#F0F0EE] py-1.5 px-3.5 rounded-full transition-all border border-[#E5E5E5] shadow-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5 text-[#4A4A4A]" />
                返回主页
              </button>
              <div className="text-[10px] font-bold font-display tracking-widest text-[#8C8C8C] select-none">
                安序助眠 &bull; SLEEPORDER
              </div>
            </div>
          )}

          {/* Render Active View State */}
          <div className="flex-1 flex flex-col min-h-0 p-4">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
