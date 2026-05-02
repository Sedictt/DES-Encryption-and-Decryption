'use client';

import { useState } from 'react';
import { hexToBinaryStr } from '../BitTable';
import { IP, applyPermutation } from '../../lib/des-tables';
import { motion, AnimatePresence } from 'motion/react';

export function Slide3_Split({ plaintext, isDecrypt }: any) {
  const binaryPlaintext = hexToBinaryStr(plaintext || "0123456789ABCDEF");
  const permutedPlaintext = applyPermutation(binaryPlaintext, IP);
  
  const [isSplit, setIsSplit] = useState(false);

  const bits = permutedPlaintext.split('');

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Splitting the Block {isDecrypt && "(Decryption)"}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          The 64-bit output of the Initial Permutation is divided evenly into two 32-bit halves: <br/>
          <strong className="text-indigo-600">Left Text (LPT)</strong> and <strong className="text-emerald-600">Right Text (RPT)</strong>.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-8 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-indigo-400 flex flex-col items-center flex-1">
        
        <button 
          onClick={() => setIsSplit(!isSplit)}
          className="mb-8 px-8 py-3 bg-blue-500 text-white font-semibold rounded-[10px] shadow-sm hover:bg-blue-600 transition-colors"
        >
          {isSplit ? "Rejoin Halves" : "Split into LPT & RPT"}
        </button>

        <div className="w-full flex-1 flex flex-col relative justify-center items-center">
          
          <AnimatePresence mode="popLayout">
            {!isSplit ? (
              <motion.div 
                key="joined"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl flex flex-col items-center absolute"
              >
                <h3 className="font-semibold text-center mb-4 text-slate-700">64-bit Block (After IP)</h3>
                <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  {bits.map((bit, i) => (
                    <motion.div 
                      layoutId={`bit-${i}`}
                      key={i} 
                      className={`flex flex-col items-center justify-center w-8 h-10 p-1 rounded-[4px] border ${i < 32 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                    >
                      <span className="opacity-50 text-[8px]">{i < 32 ? i + 1 : i - 31}</span>
                      <span className="font-mono text-xs font-bold leading-none">{bit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="split"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-between gap-12 max-w-5xl absolute"
              >
                <div className="flex-1 flex flex-col items-center">
                  <h3 className="font-bold text-center mb-4 text-indigo-700 bg-indigo-50 py-2 px-4 rounded-xl border border-indigo-200">Left Plain Text (LPT) - 32 bits</h3>
                  <div className="grid gap-[4px] bg-indigo-50/30 p-4 rounded-xl" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
                    {bits.slice(0, 32).map((bit, i) => (
                      <motion.div 
                        layoutId={`bit-${i}`}
                        key={i} 
                        className="flex flex-col items-center justify-center w-10 h-12 p-1 bg-white rounded-[6px] border border-indigo-200 text-indigo-700 shadow-sm"
                      >
                        <span className="opacity-50 text-[9px] mb-0.5">{i + 1}</span>
                        <span className="font-mono text-sm font-bold leading-none">{bit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <h3 className="font-bold text-center mb-4 text-emerald-700 bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200">Right Plain Text (RPT) - 32 bits</h3>
                  <div className="grid gap-[4px] bg-emerald-50/30 p-4 rounded-xl" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
                    {bits.slice(32, 64).map((bit, i) => (
                      <motion.div 
                        layoutId={`bit-${i + 32}`}
                        key={i + 32} 
                        className="flex flex-col items-center justify-center w-10 h-12 p-1 bg-white rounded-[6px] border border-emerald-200 text-emerald-700 shadow-sm"
                      >
                        <span className="opacity-50 text-[9px] mb-0.5">{i + 1}</span>
                        <span className="font-mono text-sm font-bold leading-none">{bit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
