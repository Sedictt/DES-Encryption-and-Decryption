'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hexToBinaryStr } from '../BitTable';

export function Slide1_KeyDiscarding({ encKey }: any) {
  const binaryKey = hexToBinaryStr(encKey || "133457799BBCDFF1");
  const bits = binaryKey.split('').map((val, i) => ({ id: i, val }));
  
  const [isDiscarded, setIsDiscarded] = useState(false);

  return (
    <div className="flex flex-col items-center pb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Key Discarding Process</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm">
          The original key is 64 bits long, but DES only uses 56 bits. Every 8th bit is discarded 
          (often used as parity bits).
        </p>
      </div>

      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-8 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-blue-500 flex flex-col items-center min-h-[400px]">
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex flex-col">
             <h3 className="font-semibold text-lg text-slate-800">
               {isDiscarded ? "2. Resulting 56-bit Key" : "1. Original 64-bit Key"}
             </h3>
             <p className="text-sm text-slate-500">
               {isDiscarded 
                 ? "The parity bits are removed, leaving 56 bits." 
                 : "Every 8th bit (highlighted in red) will be discarded."}
             </p>
          </div>
          <button 
            onClick={() => setIsDiscarded(!isDiscarded)}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            {isDiscarded ? "Reset" : "Discard 8th Bits"}
          </button>
        </div>

        <div className="grid gap-[4px] justify-center w-full max-w-3xl place-items-center" style={{ gridTemplateColumns: 'repeat(16, max-content)' }}>
          <AnimatePresence>
            {bits.map((bit, i) => {
              const isDropped = (i + 1) % 8 === 0;
              if (isDiscarded && isDropped) return null;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0, width: 0, margin: 0, padding: 0, border: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  key={bit.id} 
                  className={`flex flex-col items-center justify-center p-2 rounded-[6px] border w-10
                    ${isDropped 
                      ? 'bg-red-50 border-red-300 text-red-500' 
                      : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
                >
                  <motion.div layout="position" className="opacity-50 text-[9px] font-sans leading-none mb-0.5">{i + 1}</motion.div>
                  <motion.div layout="position" className="leading-none text-sm font-mono font-bold">{bit.val}</motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

