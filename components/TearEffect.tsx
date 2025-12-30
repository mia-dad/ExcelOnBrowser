import React, { useEffect, useState } from 'react';
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

  // Generate a random-ish jagged polygon for the clip-path
  // This creates a much more organic "torn paper" look than a repeating gradient
  const generateJaggedEdge = (side: 'top' | 'bottom') => {
    const steps = 40; // Number of jagged points
    let points = '';
    
    if (side === 'top') {
        // For top flap: Start top-left, go top-right, then zig-zag along bottom back to left
        points = '0% 0%, 100% 0%';
        for (let i = steps; i >= 0; i--) {
            const x = (i / steps) * 100;
            const randomY = 80 + Math.random() * 20; // Varied depth between 80% and 100% of height
            points += `, ${x}% ${randomY}%`;
        }
    } else {
        // For bottom flap: Zig-zag along top, then go bottom-right, bottom-left
        points = '100% 100%, 0% 100%';
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * 100;
            const randomY = 0 + Math.random() * 20; // Varied depth between 0% and 20% of height
            points += `, ${x}% ${randomY}%`;
        }
    }
    return `polygon(${points})`;
  };

  // Memoize these so they don't change on re-renders, simulating a permanent tear shape
  const [topClip] = useState(() => generateJaggedEdge('top'));
  const [bottomClip] = useState(() => generateJaggedEdge('bottom'));

  return (
    <div 
      className="relative w-full group"
      style={{ 
        width: width,
        height: isVisible ? '220px' : '0px',
        transition: 'height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        perspective: '1200px', // Creates the 3D depth "Far large near small"
      }}
    >
       {/* 
          THE VOID / INSIDE CONTENT 
          This sits "inside" the hole.
       */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] overflow-hidden flex items-center justify-center"
        style={{
             opacity: isVisible ? 1 : 0,
             transition: 'opacity 0.4s ease-in',
        }}
      >
        {/* Error Card Floating in the Void */}
        <div className="flex max-w-3xl w-full bg-red-50/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-red-200 transform translate-z-10 relative">
            <div className="mr-6 flex-shrink-0">
                <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                    <AlertTriangle size={32} className="text-red-600" />
                </div>
            </div>
            <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Data Validation Failed</h4>
                <p className="text-red-700 font-medium text-lg leading-relaxed">{message}</p>
                <div className="mt-4 flex gap-3 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-white rounded border border-gray-200">Format Error</span>
                    <span className="px-2 py-1 bg-white rounded border border-gray-200">Row Integrity Check</span>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
            >
                <XCircle size={28} />
            </button>
            
            {/* Artistic scratch/stains on the card */}
            <div className="absolute -bottom-4 -right-4 text-9xl text-red-500/5 rotate-12 pointer-events-none select-none">
                !
            </div>
        </div>
      </div>

      {/* 
         TOP FLAP (The "Paper" above)
         It rotates UP and AWAY (Negative RotateX) to create the "Prying Open" effect.
      */}
      <div 
         className="absolute top-0 left-0 w-full h-12 bg-white z-20 origin-top shadow-xl"
         style={{
            clipPath: topClip,
            transform: isVisible ? 'rotateX(-45deg) translateY(-5px)' : 'rotateX(0deg) translateY(0)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            backfaceVisibility: 'visible', // Let us see the thickness
            background: 'linear-gradient(to bottom, #ffffff 0%, #f3f4f6 100%)' // Subtle paper shading
         }}
      >
         {/* Shadow cast by the flap onto itself to fake thickness/curve */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* 
         BOTTOM FLAP (The "Paper" below)
         It rotates DOWN and AWAY (Positive RotateX).
      */}
      <div 
         className="absolute bottom-0 left-0 w-full h-12 bg-white z-20 origin-bottom shadow-xl"
         style={{
            clipPath: bottomClip,
            transform: isVisible ? 'rotateX(30deg) translateY(5px)' : 'rotateX(0deg) translateY(0)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            background: 'linear-gradient(to top, #ffffff 0%, #f3f4f6 100%)'
         }}
      >
         {/* Shadow for depth */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      </div>
      
    </div>
  );
};