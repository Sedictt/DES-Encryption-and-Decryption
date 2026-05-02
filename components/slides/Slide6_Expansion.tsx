'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Slide6_Expansion({ roundData }: any) {
  const [step, setStep] = useState(0);
  const [showFull, setShowFull] = useState(false);
  const [fullStep, setFullStep] = useState(0);

  const nextStep = () => setStep((s) => (s + 1) % 4);

  // Fallback if not provided
  const RPT = roundData?.R_prev || "01101011001101011001111000111011";
  const EXP_RPT = roundData?.expandedR || "011010110011010110011110001110110110111001001100";
  
  // Choose the first chunk or let them pick? Just the first chunk for illustration
  const displayChunkIndex = 0;
  
  const chunkPrev = displayChunkIndex === 0 ? RPT.slice(-4) : RPT.slice((displayChunkIndex-1)*4, (displayChunkIndex-1)*4+4);
  const chunkTarget = RPT.slice(displayChunkIndex*4, displayChunkIndex*4+4);
  const chunkNext = RPT.slice((displayChunkIndex+1)*4, (displayChunkIndex+1)*4+4);

  const borrowLeft = chunkPrev[3];
  const borrowRight = chunkNext[0];

  useEffect(() => {
    if (showFull) {
      if (fullStep < 8) {
        const timer = setTimeout(() => setFullStep(s => s + 1), 600);
        return () => clearTimeout(timer);
      }
    } else {
      setFullStep(0);
    }
  }, [showFull, fullStep]);

  const toggleFull = () => {
    setShowFull(true);
    setFullStep(0);
  };

  return (
    <div className="flex flex-col h-full items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Expansion Permutation (E-Box)</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We have a 32-bit Right Plain Text (RPT) but a 48-bit Round Key. To XOR them, we must expand the RPT to 48 bits.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 md:p-10 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          
          <div className="flex-1 space-y-4 text-slate-600">
            <p><strong>Step 1:</strong> The 32-bit RPT is split into eight chunks of 4 bits each.</p>
            <p><strong>Step 2:</strong> Each 4-bit chunk is expanded to 6 bits.</p>
            <p><strong>How?</strong> By copying the adjacent bits from neighboring chunks.</p>
            <ul className="list-disc pl-5 font-mono text-sm space-y-2 mt-4 bg-slate-50 p-4 rounded-lg">
              <li className={step >= 2 ? "text-emerald-600 font-bold" : ""}>Bit 1 = Last bit of PREVIOUS chunk</li>
              <li className={step >= 1 ? "text-blue-600 font-bold" : ""}>Bits 2,3,4,5 = Original 4 bits</li>
              <li className={step >= 3 ? "text-emerald-600 font-bold" : ""}>Bit 6 = First bit of NEXT chunk</li>
            </ul>
            <p className="font-bold text-blue-600 mt-4">8 chunks × 6 bits = 48 bits</p>
            
            {roundData && (
              <div className="mt-4 break-words font-mono text-[10px] bg-slate-100 p-2 rounded">
                <strong>Input {RPT.length}-bit RPT:</strong><br/>{RPT}<br/>
                <strong>Output 48-bit Expanded RPT:</strong><br/>{roundData.expandedR}
              </div>
            )}
          </div>

          <div className="flex-[1.5] w-full max-w-md">
            <div className="bg-slate-800 p-6 rounded-xl text-white shadow-xl flex flex-col pt-8">
              <div className="flex justify-between items-center mb-12">
                 <h4 className="text-slate-300 text-sm font-semibold">Visualizing Chunk {displayChunkIndex + 1}</h4>
                    <div className="flex gap-2">
                       <button 
                         onClick={nextStep}
                         className="px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                       >
                         {step === 3 ? "Reset" : "Next Step"}
                       </button>
                       {step === 3 && (
                         <button 
                           onClick={toggleFull}
                           className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600 shadow-sm"
                         >
                           Auto Expand All
                         </button>
                       )}
                    </div>
                 </div>
                 
                 {showFull ? (
                   <div className="flex flex-col items-center w-full min-h-[200px]">
                     <div className="flex flex-wrap gap-[2px] justify-center mb-8 bg-slate-900/50 p-2 rounded w-full">
                       {RPT.split('').map((bit: string, i: number) => {
                         const chunkId = Math.floor(i / 4);
                         return (
                           <div key={`rpt-${i}`} className={`w-3 h-5 flex items-center justify-center rounded-[2px] text-[8px] font-bold ${fullStep > chunkId ? 'opacity-30' : 'bg-blue-600 text-white border border-blue-500'}`}>
                             {bit}
                           </div>
                         );
                       })}
                     </div>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-8">
                       <path d="M12 5v14M19 12l-7 7-7-7"/>
                     </svg>
                     <div className="flex flex-wrap gap-[2px] justify-center w-full min-h-[40px] bg-slate-900/80 p-2 rounded">
                       {Array.from({ length: 48 }).map((_, i) => {
                         const targetChunk = Math.floor(i / 6);
                         if (fullStep <= targetChunk) {
                           return <div key={`empty-${i}`} className="w-3 h-5 rounded-[2px] border border-slate-700 bg-slate-800/50" />;
                         }
                         const bit = EXP_RPT[i];
                         const isBorrow = i % 6 === 0 || i % 6 === 5;
                         return (
                           <motion.div 
                             initial={{ scale: 0, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             key={`exprpt-${i}`} 
                             className={`w-3 h-5 flex items-center justify-center rounded-[2px] text-[8px] font-bold ${isBorrow ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-blue-300'}`}
                           >
                             {bit}
                           </motion.div>
                         );
                       })}
                     </div>
                     {fullStep >= 8 && (
                       <div className="mt-6 text-sm text-amber-400 font-bold bg-amber-900/40 px-4 py-2 rounded-lg text-center leading-relaxed border border-amber-800/50">
                         32 bits → 48 bits.<br/>Now ready to be matched with the 48-bit Round Key!
                       </div>
                     )}
                   </div>
                 ) : (
                   <>
                     {/* Top Row: Context with 3 chunks */}
              <div className="flex justify-center mb-16 relative gap-4">
                {/* Chunk i-1 */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 mb-1">Previous</span>
                  <div className="flex gap-1 opacity-50">
                    <div className="w-6 h-8 flex items-center justify-center border border-slate-600 text-slate-500 rounded">{chunkPrev[0]}</div>
                    <div className="w-6 h-8 flex items-center justify-center border border-slate-600 text-slate-500 rounded">{chunkPrev[1]}</div>
                    <div className="w-6 h-8 flex items-center justify-center border border-slate-600 text-slate-500 rounded">{chunkPrev[2]}</div>
                    {/* The borrowed bit */}
                    <motion.div layoutId={step < 2 ? "bit-prev" : undefined} className="w-6 h-8 flex items-center justify-center bg-emerald-900 border border-emerald-500 text-emerald-400 font-bold rounded">{borrowLeft}</motion.div>
                  </div>
                </div>

                {/* Target Chunk i */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-blue-400 mb-1">Current 4-bit</span>
                  <div className="flex gap-1 z-10 p-1 bg-blue-900/40 rounded-lg outline outline-1 outline-blue-500">
                    <motion.div layoutId={step < 1 ? "bit-1" : undefined} className="w-8 h-10 flex items-center justify-center bg-blue-600 font-bold rounded shadow-sm text-lg">{chunkTarget[0]}</motion.div>
                    <motion.div layoutId={step < 1 ? "bit-2" : undefined} className="w-8 h-10 flex items-center justify-center bg-blue-600 font-bold rounded shadow-sm text-lg">{chunkTarget[1]}</motion.div>
                    <motion.div layoutId={step < 1 ? "bit-3" : undefined} className="w-8 h-10 flex items-center justify-center bg-blue-600 font-bold rounded shadow-sm text-lg">{chunkTarget[2]}</motion.div>
                    <motion.div layoutId={step < 1 ? "bit-4" : undefined} className="w-8 h-10 flex items-center justify-center bg-blue-600 font-bold rounded shadow-sm text-lg">{chunkTarget[3]}</motion.div>
                  </div>
                </div>

                {/* Chunk i+1 */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 mb-1">Next</span>
                  <div className="flex gap-1 opacity-50">
                    {/* The borrowed bit */}
                    <motion.div layoutId={step < 3 ? "bit-next" : undefined} className="w-6 h-8 flex items-center justify-center bg-emerald-900 border border-emerald-500 text-emerald-400 font-bold rounded">{borrowRight}</motion.div>
                    <div className="w-6 h-8 flex items-center justify-center border border-slate-600 text-slate-500 rounded">{chunkNext[1]}</div>
                    <div className="w-6 h-8 flex items-center justify-center border border-slate-600 text-slate-500 rounded">{chunkNext[2]}</div>
                    <div className="w-6 h-8 flex items-center justify-center border border-slate-600 text-slate-500 rounded">{chunkNext[3]}</div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Resulting 6-bit chunk */}
              <div className="flex flex-col items-center min-h-[80px]">
                <span className="text-xs text-emerald-400 font-bold mb-2">Resulting 6-bit Block</span>
                <div className="flex justify-center gap-1 items-center h-12 bg-slate-900/50 p-1 rounded-lg">
                  <AnimatePresence mode="wait">
                    {step >= 2 && (
                      <motion.div key="bit-prev-res" layoutId="bit-prev" className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white font-bold rounded shadow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{borrowLeft}</motion.div>
                    )}
                    {step >= 1 && (
                      <motion.div key="bit-1-res" layoutId="bit-1" className="w-10 h-10 flex items-center justify-center border-2 border-blue-500 bg-slate-800 text-white font-bold rounded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{chunkTarget[0]}</motion.div>
                    )}
                    {step >= 1 && (
                      <motion.div key="bit-2-res" layoutId="bit-2" className="w-10 h-10 flex items-center justify-center border-2 border-blue-500 bg-slate-800 text-white font-bold rounded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{chunkTarget[1]}</motion.div>
                    )}
                    {step >= 1 && (
                      <motion.div key="bit-3-res" layoutId="bit-3" className="w-10 h-10 flex items-center justify-center border-2 border-blue-500 bg-slate-800 text-white font-bold rounded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{chunkTarget[2]}</motion.div>
                    )}
                    {step >= 1 && (
                      <motion.div key="bit-4-res" layoutId="bit-4" className="w-10 h-10 flex items-center justify-center border-2 border-blue-500 bg-slate-800 text-white font-bold rounded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{chunkTarget[3]}</motion.div>
                    )}
                    {step >= 3 && (
                      <motion.div key="bit-next-res" layoutId="bit-next" className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white font-bold rounded shadow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{borrowRight}</motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
