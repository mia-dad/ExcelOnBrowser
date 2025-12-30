import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

interface TearEffectProps {
  message: string;
  onClose: () => void;
  width: string | number;
}

export const TearEffect: React.FC<TearEffectProps> = ({ message, onClose, width }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation frame after mount
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // 1. Generate a SINGLE consistent "noise" array for the tear line.
  // This ensures the top and bottom pieces interlock perfectly.
  const tearPoints = useMemo(() => {
    const pointsCount = 80;
    const points: number[] = [];
    
    // Generate organic noise using a mix of sine waves and random jitters
    // We want the tear to wander between 0% (edge) and ~25% (deep tear)
    for (let i = 0; i <= pointsCount; i++) {
        const x = i / pointsCount;
        // Large wave + Medium wave + Fine jitter
        const noise = 
            (Math.sin(x * Math.PI * 4) * 8) + 
            (Math.cos(x * Math.PI * 12) * 4) + 
            (Math.random() * 6);
            
        // Normalize to positive offset roughly between 2% and 20%
        // This represents "how far the tear deviates from the straight edge"
        points.push(Math.max(2, Math.min(25, 12 + noise)));
    }
    return points;
  }, []);

  // 2. Derive the Top Flap Clip Path
  // Logic: The bottom edge of the top flap is `100% - noise`
  const topClipPath = useMemo(() => {
    let path = '0% 0%, 100% 0%'; // Top-Left -> Top-Right
    tearPoints.forEach((offset, i) => {
        const x = (i / (tearPoints.length - 1)) * 100;
        // We subtract offset from 100% to create the jagged bottom edge
        path += `, ${x.toFixed(2)}% ${(100 - offset).toFixed(2)}%`;
    });
    path += ', 0% 100%'; // Close the loop (redundant but safe)
    return `polygon(${path})`;
  }, [tearPoints]);

  // 3. Derive the Bottom Flap Clip Path
  // Logic: The top edge of the bottom flap is exactly `noise`
  // This creates the "puzzle piece" fit. If Top is at 80% (100-20), Bottom is at 20%.
  const bottomClipPath = useMemo(() => {
    let path = '100% 100%, 0% 100%'; // Bottom-Right -> Bottom-Left
    // Iterate backwards to draw the top edge from Left to Right (or naturally)
    // Actually polygon order matters. Let's trace Top-Left to Top-Right along the jagged line
    let topEdge = '';
    tearPoints.forEach((offset, i) => {
        const x = (i / (tearPoints.length - 1)) * 100;
        // The top edge corresponds directly to the offset
        if (i === 0) topEdge += `${x.toFixed(2)}% ${offset.toFixed(2)}%`;
        else topEdge += `, ${x.toFixed(2)}% ${offset.toFixed(2)}%`;
    });
    
    return `polygon(${topEdge}, 100% 100%, 0% 100%)`;
  }, [tearPoints]);

  return (
    <div 
      className="relative w-full group select-none"
      style={{ 
        width: width,
        height: isVisible ? '240px' : '0px',
        transition: 'height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        perspective: '1500px',
      }}
    >
       {/* 
          BACKGROUND SURFACE (The "Desk" or "Mat" underneath)
       */}
      <div 
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{
             backgroundColor: '#1e293b', 
             backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
             `,
             backgroundSize: '20px 20px',
             opacity: isVisible ? 1 : 0,
             transition: 'opacity 0.4s ease-in',
             boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9)'
        }}
      >
        {/* Error Card */}
        <div 
            className="flex max-w-3xl w-full bg-red-50 rounded-lg p-6 shadow-2xl border-l-4 border-red-500 relative transform"
            style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
        >
            <div className="mr-6 flex-shrink-0">
                <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
                    <AlertTriangle size={32} className="text-red-600" />
                </div>
            </div>
            <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Validation Error</h4>
                <p className="text-red-800 font-medium text-lg leading-relaxed">{message}</p>
                <div className="mt-4 flex gap-3 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-white rounded border border-gray-300 shadow-sm">Row Integrity</span>
                    <span className="px-2 py-1 bg-white rounded border border-gray-300 shadow-sm">Data Type Mismatch</span>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                title="Dismiss Error"
            >
                <XCircle size={28} />
            </button>
        </div>
      </div>

      {/* 
         TOP FLAP
      */}
      <div 
         className="absolute top-0 left-0 w-full h-16 bg-white z-20 origin-top shadow-lg"
         style={{
            clipPath: topClipPath,
            // Use the SVG filter for micro-roughness (fuzzy fibers)
            filter: 'url(#torn-paper-edge) drop-shadow(0px 2px 4px rgba(0,0,0,0.15))', 
            transform: isVisible ? 'rotateX(-60deg) translateY(-15px) scale(1.01)' : 'rotateX(0deg) translateY(0) scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            background: 'linear-gradient(to bottom, #ffffff 0%, #f1f5f9 100%)'
         }}
      >
         {/* White fiber highlight along the torn edge */}
         <div className="absolute inset-x-0 bottom-0 h-3 bg-white opacity-90 blur-[1px]" style={{ mixBlendMode: 'overlay' }} />
      </div>

      {/* 
         BOTTOM FLAP
      */}
      <div 
         className="absolute bottom-0 left-0 w-full h-16 bg-white z-20 origin-bottom shadow-lg"
         style={{
            clipPath: bottomClipPath,
            filter: 'url(#torn-paper-edge) drop-shadow(0px -2px 4px rgba(0,0,0,0.15))',
            // Rotate opposite way to pry open
            transform: isVisible ? 'rotateX(50deg) translateY(20px) scale(1.01)' : 'rotateX(0deg) translateY(0) scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            background: 'linear-gradient(to top, #ffffff 0%, #f1f5f9 100%)'
         }}
      >
          {/* White fiber highlight along the torn edge */}
          <div className="absolute inset-x-0 top-0 h-3 bg-white opacity-90 blur-[1px]" style={{ mixBlendMode: 'overlay' }} />
      </div>
      
    </div>
  );
};