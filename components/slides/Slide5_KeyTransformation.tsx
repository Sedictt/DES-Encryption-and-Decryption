'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, FastForward, Info } from 'lucide-react';
import { PC1, PC2, SHIFTS, applyPermutation } from '../../lib/des-tables';
import { hexToBinaryStr } from '../BitTable';

const COLOR_CLASSES = [
  'bg-red-100 border-red-300 text-red-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-violet-100 border-violet-300 text-violet-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-rose-100 border-rose-300 text-rose-800',
];

// Helper component for animated bits
function AnimatedBitArray({ bits, defaultBg, shiftAmount = 0 }: { bits: any[], defaultBg?: string, shiftAmount?: number }) {
  return (
    <div className="flex flex-wrap gap-[2px] justify-center max-w-sm">
      {bits.map((bit, index) => {
        const isShifted = shiftAmount > 0 && index >= bits.length - shiftAmount;
        return (
          <motion.div
            layout
            key={bit.id}
            transition={{ type: "spring", stiffness: 40, damping: 10 }}
            className={`flex flex-col items-center justify-center w-6 h-8 rounded-[4px] border border-slate-200 shadow-sm ${defaultBg || bit.colorClass} ${isShifted ? 'ring-2 ring-amber-400 ring-offset-1 scale-110 z-10' : ''}`}
          >
            <span className="font-mono text-xs font-bold">{bit.val}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function AnimatedPC2Array({ bits }: { bits: any[] }) {
  return (
    <div className="flex flex-wrap gap-[2px] justify-center max-w-xl">
      {bits.map((bit) => (
        <motion.div
          layout
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={"k" + bit.id}
          transition={{ type: "spring", stiffness: 40, damping: 10 }}
          className={`flex flex-col items-center justify-center w-6 h-8 rounded-[4px] border shadow-sm ${bit.colorClass || 'bg-slate-100 text-slate-800'}`}
        >
          <span className="font-mono text-xs font-bold">{bit.val}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function Slide5_KeyTransformation({ encKey, round = 1, isDecrypt }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hasShifted, setHasShifted] = useState(false);
  const [pc2AnimStep, setPc2AnimStep] = useState(3);

  useEffect(() => {
    // reset animation state on round change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasShifted(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPc2AnimStep(0);
    setIsPlaying(false);
  }, [round]);

  useEffect(() => {
    if (isPlaying) {
      if (round === 0) {
        setIsPlaying(false);
        return;
      }
      const dur = (3000 / speed);
      const shiftDur = dur / 4;
      const stepDur = dur / 4;
      
      const t0 = setTimeout(() => setHasShifted(true), shiftDur);
      const t1 = setTimeout(() => setPc2AnimStep(1), shiftDur + stepDur);
      const t2 = setTimeout(() => setPc2AnimStep(2), shiftDur + stepDur * 2);
      const t3 = setTimeout(() => setPc2AnimStep(3), shiftDur + stepDur * 3);
      return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
    }
  }, [round, isPlaying, speed]);

  const roundsData = useMemo(() => {
    const rawKey = hexToBinaryStr(encKey || "133457799BBCDFF1");
    const rawBits = rawKey.split('').map((val, i) => ({ id: i, val }));
    
    // PC1 drops parity bits and permutes
    const key56Bits = PC1.map(pos => rawBits[pos - 1]);
    
    // Assign color classes to blocks of 4 to visualize shifting
    let c = key56Bits.slice(0, 28).map((b, i) => ({ ...b, colorClass: COLOR_CLASSES[Math.floor(i / 4) % COLOR_CLASSES.length] }));
    let d = key56Bits.slice(28, 56).map((b, i) => ({ ...b, colorClass: COLOR_CLASSES[(Math.floor(i / 4) + 7) % COLOR_CLASSES.length] }));
    
    const data: any[] = [];
    data[-1] = { round: -1, rawBits };
    data[0] = { round: 0, c, d, shift: 0, roundKey: [] };

    for (let i = 0; i < 16; i++) {
      const shift = SHIFTS[i];
      // Circular shift left
      c = [...c.slice(shift), ...c.slice(0, shift)];
      d = [...d.slice(shift), ...d.slice(0, shift)];
      
      const cd = [...c, ...d];
      const roundKey = PC2.map(pos => cd[pos - 1]);
      
      data[i+1] = {
        round: i + 1,
        c, d,
        shift,
        roundKey
      };
    }
    return data;
  }, [encKey]);

  const prevData = roundsData[Math.max(-1, round - 1)];
  const currentData = roundsData[round];

  const displayedC = round <= 0 || hasShifted ? currentData.c : prevData.c;
  const displayedD = round <= 0 || hasShifted ? currentData.d : prevData.d;

  return (
    <div className="flex flex-col h-full items-center overflow-y-auto overflow-x-hidden pb-12">
      <div className="text-center mb-6 shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Key Schedule Generation</h2>
        <div className="flex flex-col gap-3 items-center">
          <p className="text-slate-600 max-w-2xl mx-auto text-sm">
            Watch the full process: 64-bit key discarding parity bits, division into halves, circular round shifts, and PC-2 compression. <strong className="text-slate-800">The shifted 56-bit halves (C and D) are passed to the next round</strong>, while the 48-bit compressed key is output as the Round Key.
          </p>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl flex items-start gap-3 text-left shadow-sm max-w-3xl">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed font-medium">
              <strong>Note:</strong> In a real DES implementation, this process is repeated 16 times in succession, computing all 16 subkeys <em>before</em> the main {isDecrypt ? "decryption" : "encryption"} rounds begin. For better visualization, we simulate it here round-by-round.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-amber-400">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50/50 p-4 rounded-xl border border-slate-200 mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 bg-white px-3 py-1 rounded shadow-sm">
              {round === -1 ? "Initialization" : `Round ${round} / 16`}
            </span>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {round === -1 ? "64-bit Key Discarding" : round === 0 ? "Initial 56-bit Key / Split" : `Shift by ${currentData.shift} position(s) left`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsPlaying(false);
                if (pc2AnimStep === 3) setPc2AnimStep(2);
                else if (pc2AnimStep === 2) setPc2AnimStep(1);
                else if (pc2AnimStep === 1) setPc2AnimStep(0);
                else if (pc2AnimStep === 0 && hasShifted) setHasShifted(false);
              }}
              disabled={round <= 0 || (!hasShifted && pc2AnimStep === 0)}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              <SkipBack size={18} />
            </button>

            <button 
              onClick={() => {
                if (hasShifted && pc2AnimStep === 3) {
                  setHasShifted(false);
                  setPc2AnimStep(0);
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              disabled={round <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-sm disabled:opacity-50"
            >
              {(hasShifted && pc2AnimStep === 3) ? <><Play size={18} /> Replay</> : isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play anim</>}
            </button>

            <button 
              onClick={() => {
                setIsPlaying(false);
                if (!hasShifted) setHasShifted(true);
                else if (pc2AnimStep === 0) setPc2AnimStep(1);
                else if (pc2AnimStep === 1) setPc2AnimStep(2);
                else if (pc2AnimStep === 2) setPc2AnimStep(3);
              }}
              disabled={round <= 0 || (hasShifted && pc2AnimStep === 3)}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              <SkipForward size={18} />
            </button>

            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            
            <button 
              onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)}
              className="flex items-center gap-1 p-2 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-100"
              title="Speed"
            >
              <FastForward size={16} /> {speed}x
            </button>
          </div>
        </div>

        {/* Visualizer */}
        <div className="flex flex-col items-center relative min-h-[340px]">
          
          <AnimatePresence mode="wait">
            {round === -1 ? (
              <motion.div
                key="round-minus1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                <div className="font-bold text-red-600 mb-4 border-b pb-2">Original 64-bit Key (Every 8th bit discarded)</div>
                <div className="flex flex-wrap gap-[2px] justify-center max-w-3xl">
                  {currentData.rawBits.map((bit: any, i: number) => {
                    const isDropped = (i + 1) % 8 === 0;
                    return (
                      <div key={bit.id} className={`flex flex-col items-center justify-center p-2 rounded-[4px] border ${isDropped ? 'bg-red-50 border-red-300 text-red-500 line-through' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <span className="opacity-50 text-[9px] mb-1">{i + 1}</span>
                        <span className="font-mono text-sm font-bold">{bit.val}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="round-halves"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                <div className="flex flex-col md:flex-row justify-between w-full gap-8 mb-8">
                  <div className="flex-1 flex flex-col items-center bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative">
                    <div className="font-bold text-emerald-700 mb-4">Left Half (C) - 28 bits</div>
                    <AnimatedBitArray bits={displayedC} defaultBg="bg-emerald-50 border-emerald-300 text-emerald-800" shiftAmount={hasShifted ? currentData.shift : 0} />
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <div className="font-bold text-indigo-700 mb-4">Right Half (D) - 28 bits</div>
                    <AnimatedBitArray bits={displayedD} defaultBg="bg-indigo-50 border-indigo-300 text-indigo-800" shiftAmount={hasShifted ? currentData.shift : 0} />
                  </div>
                </div>

                {round > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key="pc2-section"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="flex items-center gap-4 text-amber-500 mb-4 text-sm font-bold">
                        <div className="h-px w-16 bg-amber-200"></div>
                        PC-2 Compression (Drops 8 bits)
                        <div className="h-px w-16 bg-amber-200"></div>
                      </div>

                      <div className="w-full max-w-6xl bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-center items-center shadow-inner relative">
                        
                        <div className="flex justify-between w-full max-w-4xl mb-4 items-center">
                          <div className="text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span>1. Combined 56 bits (C + D)</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">C [Bits 1-28]</span>
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px]">D [Bits 29-56]</span>
                          </div>
                          {!isPlaying && (
                            <div className="flex bg-slate-200 rounded p-1">
                              {[0, 1, 2, 3].map(step => (
                                <button
                                  key={`pc2-step-${step}`}
                                  onClick={() => setPc2AnimStep(step)}
                                  className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${pc2AnimStep === step ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                  Step {step + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-between">
                          <div className="flex-1 flex flex-col items-center w-full relative min-h-[160px]">
                            <span className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded mb-6 text-center shadow-sm w-40 pb-1.5">56-bit Input (C+D)</span>
                            <div className="grid gap-1 justify-center relative w-full z-0" style={{ gridTemplateColumns: pc2AnimStep >= 2 ? 'repeat(6, max-content)' : 'repeat(14, max-content)' }}>
                              {(() => {
                                const cd = [...displayedC, ...displayedD];
                                // In step 0-1 we show 56 bits. In step 2-3 we show 48 bits scrambled by PC2.
                                const displayIndices = pc2AnimStep >= 2 ? PC2.map(p => p - 1) : Array.from({length: 56}, (_, i) => i);
                                
                                return displayIndices.map((originalIdx: number, mapIdx: number) => {
                                  const bit = cd[originalIdx];
                                  const isC = originalIdx < 28;
                                  const isDropped = [8, 17, 21, 24, 34, 37, 42, 53].includes(originalIdx);
                                  const isHighlighted = originalIdx === 0 || originalIdx === 54;
                                  
                                  return (
                                    <motion.div
                                      layout
                                      layoutId={`pc2-bit-${bit.id}`}
                                      key={`pc2-bit-${bit.id}`}
                                      className={`relative w-6 h-8 md:w-8 md:h-10 sm:text-xs border flex items-center justify-center font-bold font-mono text-[10px] shadow-sm z-10 ${isDropped && pc2AnimStep === 1 ? 'bg-red-100 border-red-300 text-red-500 scale-75 opacity-50' : isHighlighted ? 'bg-amber-300 border-amber-500 text-amber-900 border-2 outline outline-2 outline-amber-300 z-20' : isC ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-indigo-50 border-indigo-300 text-indigo-800'}`}
                                    >
                                      {bit.val}
                                      {pc2AnimStep < 2 && (
                                        <span className={`absolute -bottom-4 text-[8px] md:text-[9px] ${isHighlighted ? 'text-amber-600 font-bold' : 'text-slate-400 font-normal'} leading-none`}>{originalIdx + 1}</span>
                                      )}
                                      {pc2AnimStep >= 2 && isHighlighted && (
                                        <span className="absolute -bottom-4 text-[8px] md:text-[9px] text-amber-600 font-bold leading-none">{originalIdx + 1}</span>
                                      )}
                                    </motion.div>
                                  );
                                });
                              })()}
                            </div>
                            {pc2AnimStep >= 2 && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-xs bg-amber-200 text-amber-800 px-4 py-2 rounded font-bold shadow-sm z-10">48-bit Round Key Output</motion.div>
                            )}
                          </div>
                          
                          <div className="w-full lg:w-[340px] bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden shrink-0 flex flex-col">
                             <div className="bg-slate-100 px-3 py-2 flex justify-center w-full font-bold text-xs text-slate-700 border-b border-slate-200">PC-2 Table</div>
                             <div className="grid w-full" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                               {PC2.map((val, i) => {
                                 const isC = val <= 28;
                                 const isHighlighted = val === 1 || val === 55;
                                 return (
                                   <div key={i} className={`p-2 flex items-center justify-center font-mono text-xs border-r border-b border-white ${isHighlighted ? 'bg-amber-300 text-amber-900 border-amber-400 border-2 font-bold shadow-sm z-10 relative' : isC ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'} ${i >= 42 ? 'border-b-0' : ''} ${(i + 1) % 6 === 0 ? 'border-r-0' : ''}`}>
                                     {val}
                                   </div>
                                 );
                               })}
                             </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 w-full max-w-5xl mt-6">
        <div className="bg-white/70 backdrop-blur-[10px] border border-white/50 p-4 rounded-xl shadow-sm text-sm border-t-4 border-t-slate-300">
          <h3 className="font-bold text-slate-700 mb-2">Shift Amounts per Round</h3>
          <div className="flex flex-wrap gap-2">
            {SHIFTS.map((shift, i) => (
              <div key={i} className={`flex flex-col items-center border rounded p-1 min-w-[32px] transition-colors ${round === i + 1 ? 'bg-amber-100 border-amber-400 shadow-md transform scale-110' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] text-slate-400 font-bold">R{i + 1}</div>
                <div className="font-mono font-semibold text-slate-700">{shift}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-[10px] border border-white/50 p-4 rounded-xl shadow-sm text-sm border-t-4 border-t-slate-300">
          <h3 className="font-bold text-slate-700 mb-2">PC-2 (Compression Permutation)</h3>
          <div className="text-xs text-slate-500 mb-2">Selects 48 bits from the 56-bit input (C+D). Bits 9, 18, 22, 25, 35, 38, 43, 54 are discarded.</div>
          <div className="grid grid-cols-6 gap-[2px] font-mono text-[9px] text-center">
            {PC2.map((pos, i) => (
              <div key={i} className="bg-slate-100 p-1 rounded text-slate-600 border border-slate-200 shadow-sm leading-none flex items-center justify-center">{pos}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
