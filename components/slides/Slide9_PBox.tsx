'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { P } from '../../lib/des-tables';

export function Slide9_PBox({ roundData, animStep = 0, setAnimStep }: any) {
  // animStep:
  // 0: Initial
  // 1: P-Box Shuffle (S-box output -> f-function)
  // 2: Prep XOR (LPT slides in from top, f-function slides to XOR pos)
  // 3: XOR Animating
  // 4: Swap Complete (Result -> RPT, Old RPT -> LPT)
  const [isPlaying, setIsPlaying] = useState(false);
  const speed = 1;

  useEffect(() => {
    if (isPlaying) {
      if (animStep >= 4) {
        setIsPlaying(false);
        return;
      }
      
      const dur = 1500 / speed;
      // Step 3 (XORing) takes a bit longer
      const stepDur = animStep === 2 ? dur * 1.5 : dur;
      
      const t = setTimeout(() => {
        setAnimStep((s: number) => s + 1);
      }, stepDur);
      
      return () => clearTimeout(t);
    }
  }, [isPlaying, animStep, speed]);

  const fallbackSBoxOutput = "10010101110010110010100010100111"; // 32 chars
  const fallbackLPT = "11110000101010101100110000001111"; // 32 chars
  const fallbackRPT = "01010101010101010101010101010101"; // 32 chars

  const sBoxOutput = roundData?.sboxOut || fallbackSBoxOutput;
  const oldLPT = roundData?.L_prev || fallbackLPT;
  const oldRPT = roundData?.R_prev || fallbackRPT;

  const permutedOutput = P.map(pos => sBoxOutput[pos - 1]).join('');
  let xorResult = "";
  for(let i=0; i<32; i++){
    xorResult += (parseInt(permutedOutput[i]) ^ parseInt(oldLPT[i])).toString();
  }

  const getBlockColorClass = (idx: number) => {
    const blockIdx = Math.floor(idx / 4);
    const colors = [
      'bg-red-200 border-red-300 text-red-900',
      'bg-orange-200 border-orange-300 text-orange-900',
      'bg-amber-200 border-amber-300 text-amber-900',
      'bg-emerald-200 border-emerald-300 text-emerald-900',
      'bg-teal-200 border-teal-300 text-teal-900',
      'bg-blue-200 border-blue-300 text-blue-900',
      'bg-indigo-200 border-indigo-300 text-indigo-900',
      'bg-purple-200 border-purple-300 text-purple-900',
    ];
    return colors[blockIdx] || 'bg-slate-200 border-slate-300 text-slate-800';
  };

  const formatBits = (bits: string) => bits.match(/.{1,4}/g)?.join(' ') || '';

  return (
    <div className="flex flex-col h-full items-center overflow-y-auto overflow-x-hidden pb-12">
      <div className="text-center mb-4 shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">P-Box Permutation & The Swap</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm">
          The 32-bit output from the S-Boxes is shuffled one more time, XORed with the old Left Plain Text (LPT), and then the halves are swapped!
        </p>
      </div>

      <div className="w-full max-w-[1200px] bg-white/70 backdrop-blur-[10px] border border-white/50 p-4 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-indigo-500 flex flex-col relative z-0">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-6 bg-slate-50 border border-slate-200 p-2 rounded-xl">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (animStep >= 4) {
                  setAnimStep(0);
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : animStep >= 4 ? 'Replay' : 'Auto Play'}
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setAnimStep((s: number) => Math.min(s + 1, 4)); }} 
              disabled={animStep >= 4}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold"
            >
              <SkipForward size={16} /> Next
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setAnimStep(0); }} 
              disabled={animStep === 0}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          
          <div className="flex bg-slate-200 rounded p-1">
            {[0, 1, 2, 3, 4].map(step => (
              <button
                key={`step-${step}`}
                onClick={() => { setIsPlaying(false); setAnimStep(step); }}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${animStep === step ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Step {step}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 relative items-start">
          
          {/* LEFT: P-BOX */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center lg:min-h-[500px]">
            <h3 className="font-bold text-base mb-2 text-emerald-700 flex items-center gap-2">
              <span className="bg-emerald-200 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
              P-Box Permutation
            </h3>
            <p className="text-slate-500 text-[10px] text-center mb-4">
              The 32 bits from S-Boxes are scrambled according to the P-Box lookup table. The result is the <strong>f-function output</strong>.
            </p>

            <div className="w-full max-w-sm bg-white border border-slate-200 shadow-sm rounded-lg overflow-x-auto mb-6 shrink-0">
               <div className="bg-slate-100 px-2 py-1 flex justify-center font-bold text-[10px] text-slate-700 border-b border-slate-200 min-w-max">P-Box Table</div>
               <div className="grid min-w-max" style={{ gridTemplateColumns: 'repeat(8, minmax(20px, 1fr))' }}>
                 {P.map((val, i) => {
                   const originalIdx = val - 1;
                   const colorClass = getBlockColorClass(originalIdx);
                   return (
                     <div key={i} className={`p-1 flex flex-col items-center justify-center font-mono text-[9px] border-r border-b border-slate-100/50 ${colorClass} ${i >= 24 ? 'border-b-0' : ''} ${(i + 1) % 8 === 0 ? 'border-r-0' : ''}`}>
                       <span className="opacity-50 text-[7px] leading-tight">Pos {i+1}</span>
                       <span className="font-bold">{val}</span>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="flex flex-col items-center w-full max-w-md relative pb-6 flex-1 justify-center">
              <div className="flex flex-col items-center gap-2 w-full mt-8">
                <span className={`text-[10px] px-2 py-1 rounded shadow-sm z-20 whitespace-nowrap transition-colors duration-500 ${animStep >= 1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-800 text-white'}`}>
                  {animStep >= 1 ? 'f-function output (32-bit)' : '32-bit Output from S-Boxes'}
                </span>
                
                <div className="grid gap-[1px] justify-center w-full relative z-10" style={{ gridTemplateColumns: 'repeat(16, max-content)' }}>
                  {Array.from({length: 32}, (_, displayIdx) => {
                    const originalIdx = animStep >= 1 ? (P[displayIdx] - 1) : displayIdx;
                    const b = sBoxOutput[originalIdx];
                    const colorClass = getBlockColorClass(originalIdx);
                    
                    return (
                      <div key={`pbox-container-${displayIdx}`} className="w-4 h-5 md:w-5 md:h-6 relative">
                        {animStep < 2 && (
                          <motion.div 
                            layout
                            layoutId={`pbox-${originalIdx}`}
                            transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
                            className={`absolute inset-0 border flex items-center justify-center font-bold font-mono text-[9px] z-10 shadow-sm ${colorClass}`}
                          >
                            {b}
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: XOR & SWAP */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center lg:min-h-[500px] relative">
            <h3 className="font-bold text-base mb-2 text-indigo-700 z-10 flex items-center gap-2">
              <span className="bg-indigo-200 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
              XOR & Swap
            </h3>

            {/* The Stack */}
            <div className="flex flex-col items-center w-full max-w-sm mt-8 relative z-10">
               
               {/* LPT Row */}
               <motion.div 
                 initial={{ y: -60, opacity: 0 }} 
                 animate={{ y: animStep >= 2 ? 0 : -60, opacity: animStep >= 2 ? 1 : 0 }} 
                 transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
                 className="flex flex-col items-center w-full gap-1 mb-2"
               >
                 <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded shadow-sm">Old LPT</span>
                 <div className="grid grid-cols-[repeat(16,max-content)] gap-[1px]">
                   {oldLPT.split('').map((b: string, i: number) => (
                      <motion.div 
                        key={`lpt-${i}`} 
                        layoutId={`lpt-${i}`}
                        className="w-4 h-5 md:w-5 md:h-6 bg-white border border-indigo-200 text-indigo-900 font-mono text-[9px] font-bold flex items-center justify-center shadow-sm"
                      >
                        {b}
                      </motion.div>
                   ))}
                 </div>
               </motion.div>

               {/* XOR Icon */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }} 
                 animate={{ opacity: animStep >= 2 ? 1 : 0, scale: animStep >= 2 ? 1 : 0 }} 
                 className="my-1 z-20 bg-slate-100 rounded-full p-0.5 border border-slate-300 shadow-sm"
               >
                 <PlusCircle size={20} className="text-slate-600" />
               </motion.div>

               {/* F-Function Row */}
               <div className="flex flex-col items-center w-full gap-1 mt-2 mb-4 relative min-h-[45px]">
                 <div className="grid grid-cols-[repeat(16,max-content)] gap-[1px]">
                   {permutedOutput.split('').map((b: string, i: number) => {
                     const originalIdx = P[i] - 1;
                     const colorClass = getBlockColorClass(originalIdx);

                     return (
                      <div key={`f-tgt-${i}`} className="w-4 h-5 md:w-5 md:h-6 relative">
                        {animStep >= 2 && (
                          <motion.div 
                            layout
                            layoutId={`pbox-${originalIdx}`}
                            animate={animStep === 3 ? {
                              scale: [1, 1.2, 1],
                              backgroundColor: ["#fff", "#fef08a", "#fff"],
                              transition: { delay: i * 0.03, duration: 0.3 }
                            } : undefined}
                            className={`absolute inset-0 border font-mono text-[9px] font-bold flex items-center justify-center shadow-sm ${colorClass}`}
                          >
                            {b}
                          </motion.div>
                        )}
                      </div>
                     );
                   })}
                 </div>
                 {animStep >= 2 && (
                   <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shadow-sm"
                   >
                     f-function output
                   </motion.span>
                 )}
               </div>

               {/* Equals Line */}
               {animStep >= 3 && (
                 <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="w-full h-px bg-slate-300 my-2" />
               )}

               {/* XOR Result (New RPT) */}
               <motion.div 
                 initial={{ opacity: 0, y: -20 }} 
                 animate={{ opacity: animStep >= 3 ? 1 : 0, y: animStep >= 3 ? 0 : -20 }} 
                 className="flex flex-col items-center w-full gap-1 mt-4"
               >
                 <div className="grid grid-cols-[repeat(16,max-content)] gap-[1px]">
                   {xorResult.split('').map((b: string, i: number) => {
                     const animateProps = animStep === 3 ? {
                       opacity: [0, 1],
                       y: [-10, 0],
                       transition: { delay: 0.5 + i * 0.03, duration: 0.2 }
                     } : { opacity: 1, y: 0 };

                     return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0 }}
                        animate={animateProps}
                        className="w-4 h-5 md:w-5 md:h-6 bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[9px] font-bold flex items-center justify-center shadow-sm"
                      >
                        {b}
                      </motion.div>
                     );
                   })}
                 </div>
                 <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded shadow-sm mt-1">XOR Result</span>
               </motion.div>

            </div>

            {/* Step 4: The Swap Final Visualization */}
            <AnimatePresence>
              {animStep >= 4 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute inset-0 bg-slate-50/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center px-6 rounded-xl border border-slate-200"
                >
                  <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔄</span> The Swap Complete!
                  </h4>
                  
                  <div className="flex flex-col gap-6 w-full max-w-md">
                    <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none"></div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                        <span>New LPT</span>
                        <span className="text-indigo-500 bg-indigo-50 px-2 rounded">Was Old RPT</span>
                      </div>
                      <div className="font-mono text-sm tracking-wider text-indigo-700 break-all leading-relaxed">
                        {formatBits(oldRPT)}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-amber-50/50 to-transparent pointer-events-none"></div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                        <span>New RPT</span>
                        <span className="text-amber-600 bg-amber-50 px-2 rounded">XOR Result</span>
                      </div>
                      <div className="font-mono text-sm tracking-wider text-amber-700 break-all leading-relaxed">
                        {formatBits(xorResult)}
                      </div>
                    </div>
                  </div>

                  <p className="mt-8 text-sm text-slate-600 font-medium">Ready for the next round!</p>
                </motion.div>
              )}
            </AnimatePresence>
             
          </div>

        </div>
      </div>
    </div>
  );
}

