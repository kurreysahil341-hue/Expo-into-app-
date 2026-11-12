import React from 'react';
import { Wifi, Battery, Signal, Smartphone } from 'lucide-react';
import { DeviceType } from '../../types';

interface MobileFrameProps {
  deviceType: DeviceType;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  deviceType,
  children,
}) => {
  if (deviceType === 'frameless') {
    return (
      <div className="w-full max-w-[400px] h-[780px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  const isIPhone = deviceType === 'iphone';

  return (
    <div className="relative mx-auto select-none">
      {/* Outer Phone Shell */}
      <div
        className={`relative ${
          isIPhone
            ? 'w-[380px] h-[780px] rounded-[52px] border-[12px] border-slate-900 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)]'
            : 'w-[375px] h-[770px] rounded-[42px] border-[10px] border-zinc-900 bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)]'
        } flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* Hardware details: Side buttons simulation */}
        <div className="absolute -left-[14px] top-28 w-[3px] h-9 bg-slate-700 rounded-l" />
        <div className="absolute -left-[14px] top-42 w-[3px] h-12 bg-slate-700 rounded-l" />
        <div className="absolute -left-[14px] top-58 w-[3px] h-12 bg-slate-700 rounded-l" />
        <div className="absolute -right-[14px] top-36 w-[3px] h-16 bg-slate-700 rounded-r" />

        {/* Notch / Dynamic Island */}
        <div className="relative w-full pt-2 pb-1 px-7 flex items-center justify-between text-xs text-slate-300 z-30 select-none bg-slate-950/80 backdrop-blur-sm">
          <span className="font-semibold text-[13px] tracking-tight">9:41</span>

          {isIPhone ? (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-zinc-800" />
          )}

          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">98%</span>
              <Battery className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Screen Viewport */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950 text-slate-100 relative">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="w-full pb-2 pt-1 flex justify-center bg-slate-950 select-none z-30">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
