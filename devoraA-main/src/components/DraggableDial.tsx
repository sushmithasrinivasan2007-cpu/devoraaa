import React, { useRef, useState, useCallback } from 'react';

interface DraggableDialProps {
  label: string;
  leftAnchor: string;
  rightAnchor: string;
  value: number; // 0 to 100
  onChange: (val: number) => void;
  id?: string;
}

export const DraggableDial: React.FC<DraggableDialProps> = ({
  label,
  leftAnchor,
  rightAnchor,
  value,
  onChange,
  id
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValueFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const width = rect.width;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, width));
    const percentage = Math.round((offsetX / width) * 100);
    onChange(percentage);
  }, [onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      calculateValueFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture release is not needed
      }
    }
  };

  // Get qualitative status label based on value
  const getDescriptor = () => {
    if (value <= 25) return leftAnchor;
    if (value >= 75) return rightAnchor;
    return `Balanced (${value}%)`;
  };

  return (
    <div id={id || `dial-${label.toLowerCase()}`} className="flex flex-col gap-2 p-3.5 bg-[#FFF8EC]/90 rounded-2xl border border-[#6B1E2B]/15 hover:border-[#6B1E2B]/35 shadow-xs transition-all backdrop-blur-md">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono tracking-wider text-[#2B2020] uppercase font-bold">
          {label}
        </span>
        <span className="font-mono text-[#6B1E2B] font-semibold text-[11px] px-2.5 py-0.5 rounded-full bg-[#6B1E2B]/10 border border-[#6B1E2B]/20">
          {getDescriptor()}
        </span>
      </div>

      {/* Draggable Track Container */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative py-3 cursor-grab active:cursor-grabbing select-none touch-none group"
      >
        {/* Background Rail */}
        <div className="h-2.5 w-full bg-[#E8DDCA] rounded-full overflow-hidden relative border border-[#6B1E2B]/15">
          {/* Active Colored Fill */}
          <div
            className="h-full bg-gradient-to-r from-[#A85C68] via-[#852737] to-[#6B1E2B] transition-all duration-75"
            style={{ width: `${value}%` }}
          />
        </div>

        {/* Center line indicators / tick marks */}
        <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none opacity-40">
          {[0, 25, 50, 75, 100].map(tick => (
            <div
              key={tick}
              className={`w-0.5 ${tick === 50 ? 'bg-[#6B1E2B] h-4' : 'bg-[#9A8989] h-2.5'}`}
            />
          ))}
        </div>

        {/* Oversized Knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform active:scale-115 group-hover:drop-shadow-[0_2px_8px_rgba(107,30,43,0.35)]"
          style={{ left: `${value}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-[#6B1E2B] border-2 border-[#FFF8EC] flex items-center justify-center shadow-md shadow-[#6B1E2B]/30">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFF8EC]" />
          </div>
        </div>
      </div>

      {/* Anchor Text */}
      <div className="flex justify-between items-center text-[11px] text-[#756565] font-mono">
        <span className={value < 35 ? 'text-[#6B1E2B] font-bold' : ''}>[ {leftAnchor}</span>
        <span className="text-[#9A8989]/60">━━━━━●━━━━━</span>
        <span className={value > 65 ? 'text-[#6B1E2B] font-bold' : ''}>{rightAnchor} ]</span>
      </div>
    </div>
  );
};
