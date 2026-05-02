'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { hexToBinaryStr } from '../BitTable';
import { IP } from '../../lib/des-tables';

export function Slide2_InitialPermutation({ plaintext, isDecrypt }: any) {
  const binaryPlaintext = hexToBinaryStr(plaintext || "0123456789ABCDEF");
  const bits = binaryPlaintext.split('');
  
  const [step, setStep] = useState<'start' | 'animating' | 'done'>('start');

  const startAnimation = () => {
    setStep('animating');
    setTimeout(() => setStep('done'), 1500);
  };

  const resetAnimation = () => {
    setStep('start');
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Initial Permutation (IP) {isDecrypt && "(Decryption)"}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm">
          The 64-bit {isDecrypt ? "ciphertext" : "plaintext"} undergoes a fixed bit-shuffling. 
          The bit sequences are scrambled according to the IP table.
        </p>
      </div>

      <div className="w-full max-w-6xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-blue-500 flex flex-col xl:flex-row gap-8 min-h-[500px]">
        
        {/* Left Side: Bits */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex gap-4 mb-6">
             <button 
               onClick={startAnimation} 
               disabled={step !== 'start'}
               className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm"
             >
               Apply Permutation
             </button>
             <button 
               onClick={resetAnimation} 
               disabled={step === 'start'}
               className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors"
             >
               Reset
             </button>
          </div>

          <div className="w-full flex justify-center mb-4">
            <div className="grid gap-[2px] w-full max-w-xl" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
              {(step === 'start' ? Array.from({length: 64}, (_, i) => i) : IP.map(i => i - 1)).map((originalIdx, currentIdx) => {
                const bit = bits[originalIdx];
                const isHighlight1 = originalIdx === 0;
                const isHighlight58 = originalIdx === 57;

                return (
                  <motion.div
                    layout
                    key={originalIdx}
                    transition={{ type: "spring", stiffness: 40, damping: 12 }}
                    className={`flex flex-col items-center justify-center p-2 rounded-[6px] border
                      ${isHighlight1 ? 'bg-amber-100 border-amber-400 text-amber-700 z-10' : 
                        isHighlight58 ? 'bg-emerald-100 border-emerald-400 text-emerald-700 z-10' : 
                        'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
                  >
                    <div className="opacity-50 text-[9px] font-sans leading-none mb-0.5">{originalIdx + 1}</div>
                    <div className="leading-none text-sm font-mono font-bold">{bit}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: IP Table */}
        <div className="w-full xl:w-[400px] flex flex-col">
          <div className="flex-1 bg-slate-50/50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center">
            <h3 className="font-semibold text-slate-700 mb-2 text-center text-sm">The IP Table</h3>
            <p className="text-xs text-slate-500 mb-6 text-center">
              Defines the new position of each bit. E.g., the first entry is 58, meaning the original bit 58 moves to the 1st position.
            </p>
            <div className="grid grid-cols-8 gap-1 font-mono text-[10px] text-center mx-auto">
              {IP.map((val, i) => (
                <div key={i} className={`p-1.5 rounded border 
                  ${val === 58 ? 'bg-emerald-100 border-emerald-300 font-bold text-emerald-800' : 
                    val === 1 ? 'bg-amber-100 border-amber-300 font-bold text-amber-800' : 
                    'bg-white border-slate-200 text-slate-500'}`}>
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
