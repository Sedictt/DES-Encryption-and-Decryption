'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Unlock, Repeat, Copy, CheckCircle2, Play, Pause, SkipForward, RotateCcw, PlusCircle, ArrowDown } from 'lucide-react';
import { computeDESData, binaryStrToHex } from '../../lib/des-utils';

export function Slide11_Decryption({ desData, animStep = 0, setAnimStep }: any) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const speed = 1;

  // Use the original key and the original ciphertext to decrypt
  const decryptedData = useMemo(() => {
    return computeDESData(desData.cipherHex, desData.keyHex, true);
  }, [desData.cipherHex, desData.keyHex]);

  const originalPlaintextHex = useMemo(() => {
    return binaryStrToHex(desData.ptBin);
  }, [desData.ptBin]);

  useEffect(() => {
    if (isPlaying && animStep < 2) {
      const dur = 2000 / speed;
      const t = setTimeout(() => {
        setAnimStep((s: number) => {
          if (s + 1 >= 2) {
            setIsPlaying(false);
          }
          return s + 1;
        });
      }, dur);
      return () => clearTimeout(t);
    } else if (isPlaying && animStep >= 2) {
      setIsPlaying(false);
    }
  }, [animStep, isPlaying, setAnimStep]);

  const handleCopy = () => {
    navigator.clipboard.writeText(decryptedData.cipherHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full items-center overflow-y-auto pb-12">
      <div className="text-center mb-6 shrink-0">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Decryption Process</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Same logic, backwards keys. First, we convert the hexadecimal ciphertext back into binary bits.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 md:p-8 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-8 bg-slate-50 border border-slate-200 p-2 rounded-xl">
           <div className="flex gap-2">
             <button 
               onClick={() => { setIsPlaying(!isPlaying); if(animStep >= 2) setAnimStep(0); }}
               className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm"
             >
               {isPlaying ? <><Pause size={16}/> Pause</> : animStep >= 2 ? <><RotateCcw size={16}/> Replay</> : <><Play size={16}/> Start Decryption</>}
             </button>
             <button 
               onClick={() => { setIsPlaying(false); setAnimStep((s: number) => Math.min(s + 1, 2)); }}
               disabled={animStep >= 2}
               className="flex items-center gap-1 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
             >
               <SkipForward size={16}/> Next
             </button>
           </div>
           
           <div className="flex bg-slate-200 rounded p-1">
             {[0, 1, 2].map(step => (
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

        <div className="flex flex-col gap-6 w-full">
          {/* Step 0: Input */}
          <motion.div 
            className="flex items-stretch gap-4 p-4 rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2 text-center">Ciphertext to Decrypt</div>
              <div className="bg-slate-900 border-2 border-emerald-500 text-emerald-400 font-mono text-xl py-3 px-4 rounded-lg text-center tracking-[0.2em] shadow-inner">
                {desData.cipherHex}
              </div>
            </div>
            <div className="flex flex-col justify-center px-4">
              <PlusCircle size={24} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2 text-center">Original Key</div>
              <div className="bg-slate-100 border border-amber-300 text-amber-800 font-mono text-xl py-3 px-4 rounded-lg text-center tracking-[0.2em] shadow-inner">
                {desData.keyHex}
              </div>
            </div>
          </motion.div>

          {/* Step 1: Hex to Binary Conversion */}
          <AnimatePresence>
            {animStep >= 1 && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                className="flex flex-col items-center bg-slate-800 p-6 rounded-xl border-t-4 border-emerald-500 shadow-xl overflow-hidden"
              >
                <h3 className="text-emerald-400 font-bold mb-6 flex items-center gap-2">
                  <ArrowDown size={20} /> Hexadecimal to Binary Conversion
                </h3>
                
                <div className="grid grid-cols-8 gap-2 md:gap-4 w-full max-w-4xl">
                  {desData.cipherHex.split('').map((hexChar: string, i: number) => {
                    const binVal = parseInt(hexChar, 16).toString(2).padStart(4, '0');
                    return (
                      <motion.div 
                        key={`hex-bin-${i}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-white font-bold text-lg mb-2">{hexChar}</div>
                        <div className="w-px h-4 bg-emerald-500/50 mb-2"></div>
                        <div className="bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] sm:text-xs tracking-widest px-1 py-1 rounded w-full text-center">
                          {binVal}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Reversed Keys */}
          {animStep >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Repeat size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900">Same Feistel Algorithm</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  The ciphertext runs back through the exact same 16 rounds of the Feistel Network. The structure naturally reverses itself as long as the subkeys are fed in reverse order.
                </p>
              </div>

              <div className="flex-1 border-l border-blue-200 pl-6 relative z-10">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Unlock size={16} className="text-emerald-500" /> Reversed Subkey Order
                </h3>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400 shadow-inner">
                   <div className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                     <span>Decryption R1</span> <span>Use Subkey 16</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                     <span>Decryption R2</span> <span>Use Subkey 15</span>
                   </div>
                   <div className="flex justify-between pb-1 mb-1 text-slate-500 px-2">
                     <span>...</span> <span>...</span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span>Decryption R16</span> <span>Use Subkey 1</span>
                   </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none -mr-10 -mb-10">
                 <Repeat size={150} />
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
