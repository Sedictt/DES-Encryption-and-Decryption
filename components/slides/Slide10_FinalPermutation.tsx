'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Play, Pause, SkipForward, RotateCcw, Info } from 'lucide-react';
import { FP } from '../../lib/des-tables';

export function Slide10_FinalPermutation({ desData, isDecrypt }: any) {
  const [animStep, setAnimStep] = useState(0);

const preFPBits = desData?.preFP || "1100000000101010111100111010100100110110010111110001000100010110";

  // The indices array dictates the physical DOM order of elements
  const indices = animStep === 0 ? Array.from({length: 64}, (_, i) => i) : FP.map(i => i - 1);

  const postFPIndices = FP.map(i => i - 1);
  const finalHex = Array.from({length: 16}, (_, i) => {
    const groupIndices = postFPIndices.slice(i * 4, i * 4 + 4);
    const binGroup = groupIndices.map(idx => preFPBits[idx]).join('');
    return parseInt(binGroup, 2).toString(16).toUpperCase();
  }).join('');

  // PKCS#7 Unpadding check
  let padCount = 0;
  if (isDecrypt && finalHex.length === 16) {
    const lastByte = parseInt(finalHex.slice(-2), 16);
    if (lastByte > 0 && lastByte <= 8) {
      let isPadValid = true;
      const expectedPadHex = lastByte.toString(16).padStart(2, '0').toUpperCase();
      for (let i = 0; i < lastByte; i++) {
        if (finalHex.slice(14 - i*2, 16 - i*2) !== expectedPadHex) {
          isPadValid = false;
          break;
        }
      }
      if (isPadValid) {
        padCount = lastByte;
      }
    }
  }

  const hexBytes = finalHex.match(/.{1,2}/g) || [];
  const finalAscii = hexBytes.map((byte, idx) => {
    const charCode = parseInt(byte, 16);
    const isPad = padCount > 0 && idx >= 8 - padCount;
    return {
      char: charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '·',
      isPad,
      hex: byte,
      val: charCode
    };
  });

  const maxStep = isDecrypt ? (padCount > 0 ? 4 : 3) : 2;

  return (
    <div className="flex flex-col h-full items-center">
      <div className="text-center mb-6 shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Final Permutation (FP) {isDecrypt && "(Decryption)"}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm">
          After 16 rounds of {isDecrypt ? "decryption" : "encryption"}, the final LPT and RPT are rejoined into a 64-bit block. 
          Then, one last permutation (the exact inverse of the Initial Permutation) is applied to generate the final {isDecrypt ? "plaintext" : "ciphertext"} in binary, which is then typically represented in Hexadecimal.
        </p>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 h-full min-h-[400px]">
        
        {/* Left Side: 64-bit Block */}
        <div className="bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col pt-6 relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6 z-10 bg-slate-50 border border-slate-200 p-2 rounded-xl">
             <div className="flex gap-2">
               <button 
                 onClick={() => setAnimStep(s => Math.min(s + 1, maxStep))}
                 disabled={animStep >= maxStep}
                 className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-bold shadow-sm whitespace-nowrap"
               >
                 {animStep === 0 ? "Apply Final Permutation" : animStep === 1 ? "Convert to Hex" : animStep === 2 ? "Convert to ASCII" : "Unpad (PKCS#7)"} <SkipForward size={16} />
               </button>
               <button 
                 onClick={() => setAnimStep(0)}
                 disabled={animStep === 0}
                 className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 text-sm font-semibold flex items-center gap-1 shrink-0"
               >
                 <RotateCcw size={16} /> Reset
               </button>
             </div>
             <div className="flex bg-slate-200 rounded p-1 overflow-x-auto ml-2">
               {Array.from({length: maxStep + 1}, (_, i) => i).map(step => (
                 <button
                   key={`step-${step}`}
                   onClick={() => setAnimStep(step)}
                   className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${animStep === step ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Step {step}
                 </button>
               ))}
             </div>
          </div>

          <AnimatePresence mode="popLayout">
            {animStep < 2 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col z-10"
              >
                <h3 className="font-bold text-center text-slate-800 mb-6">
                   {animStep === 0 ? "Rejoined Block (LPT + RPT)" : `${isDecrypt ? "Plaintext" : "Ciphertext"} Block (Binary)`}
                </h3>
                
                <div className="grid gap-[2px] justify-center mb-12 mx-auto" style={{ gridTemplateColumns: 'repeat(16, max-content)' }}>
                  {indices.map((originalIdx) => {
                    const b = preFPBits[originalIdx];
                    return (
                      <motion.div 
                        layout
                        layoutId={`fp-bit-${originalIdx}`}
                        transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                        key={`fpbit-${originalIdx}`}
                        className={`w-6 h-8 text-[10px] md:text-xs flex items-center justify-center font-bold font-mono border rounded-sm transition-colors duration-500 ${animStep === 1 ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
                      >
                        {b}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {animStep >= 2 && animStep < 3 && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                className="absolute inset-x-0 bottom-12 top-28 z-20 flex flex-col items-center justify-center"
              >
                <h3 className="font-bold text-center text-slate-800 mb-4 bg-white/80 px-4 py-1 rounded-full backdrop-blur shadow-sm">
                   Final {isDecrypt ? "Plaintext" : "Ciphertext"} (Hexadecimal)
                </h3>
                
                <div className="flex flex-wrap gap-2 justify-center max-w-sm w-full font-mono mt-4">
                  {Array.from({length: 16}, (_, i) => {
                    const hexVal = finalHex[i];
                    const groupIndices = postFPIndices.slice(i * 4, i * 4 + 4);
                    return (
                      <motion.div 
                        key={`hex-group-${i}`}
                        initial={{ opacity: 0, scale: 0, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex flex-col items-center gap-1"
                      >
                         <div className="flex gap-[1px]">
                           {/* Small indicators for where it came from */}
                           {groupIndices.map(origIdx => (
                             <motion.div 
                               layoutId={`fp-bit-${origIdx}`}
                               key={`fp-bit-tgt-${origIdx}`}
                               className="w-2 h-4 bg-indigo-600 rounded-sm opacity-20"
                             />
                           ))}
                         </div>
                         <div className="w-10 h-12 bg-slate-900 border-2 border-emerald-500 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                           {hexVal}
                         </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {animStep >= 3 && isDecrypt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="absolute inset-x-0 bottom-12 top-24 z-20 flex flex-col items-center justify-center w-full"
              >
                <h3 className="font-bold text-center text-slate-800 mb-4 bg-white/80 px-4 py-1 rounded-full backdrop-blur shadow-sm">
                   Recovered Original Text (ASCII)
                </h3>
                
                <div className="flex gap-2 justify-center w-full font-mono mt-4 text-2xl md:text-3xl font-bold px-4">
                  {finalAscii.map((item, i) => (
                    <motion.div 
                      key={`ascii-char-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: animStep >= 4 && item.isPad ? 0.3 : 1, 
                        y: animStep >= 4 && item.isPad ? 20 : 0,
                        scale: animStep >= 4 && item.isPad ? 0.8 : 1
                      }}
                      transition={{ duration: 0.4, delay: animStep === 3 ? i * 0.1 : 0 }}
                      className={`w-10 h-14 md:w-12 md:h-16 ${animStep >= 4 && item.isPad ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-white border-emerald-500 text-emerald-600 shadow-xl'} border-2 rounded-xl flex items-center justify-center relative group`}
                    >
                      {item.isPad && animStep < 4 ? `\\x0${item.val}` : item.char}
                      {/* Tooltip for hex val */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        0x{item.hex}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {animStep >= 4 && padCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md w-full text-emerald-800 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2 font-bold">
                      <Info size={16} className="text-emerald-500" /> 
                      PKCS#7 Padding Removed
                    </div>
                    <p className="text-sm">
                      We detected {padCount} bytes of value <code>0x0{padCount}</code> at the end of the block. 
                      This is the PKCS#7 padding added during encryption. We safely discard it to reveal the true original plaintext!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background decoration for step 2 */}
          <div className={`absolute inset-0 bg-emerald-50/50 transition-opacity duration-1000 z-0 pointer-events-none ${animStep >= 2 && animStep < 3 ? 'opacity-100' : 'opacity-0'}`}></div>
          
        </div>

        {/* Right Side: FP Table */}
        <div className="bg-slate-800 text-white p-6 rounded-[24px] shadow-2xl flex flex-col z-10 relative overflow-hidden">
           <h3 className="font-bold text-lg text-slate-200 mb-2">Final Permutation Table</h3>
           <p className="text-slate-400 text-xs mb-6">
             The table below dictates the new position of each bit. 
             e.g., The 40th bit becomes the 1st bit.
           </p>

           <div className="flex-1 flex items-center justify-center z-10">
             <div className="grid grid-cols-8 gap-1.5 w-full max-w-sm">
                {FP.map((val, i) => (
                  <div 
                    key={`fp-${i}`} 
                    className={`w-full aspect-square flex items-center justify-center rounded text-[10px] md:text-[11px] font-bold transition-all duration-500 ${animStep >= 1 ? 'bg-indigo-500/30 border border-indigo-400 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-700 border border-slate-600 text-slate-400'}`}
                  >
                    {val}
                  </div>
                ))}
             </div>
           </div>
           
           {/* Glow Effect */}
           <div className={`absolute inset-0 bg-indigo-500/10 pointer-events-none blur-3xl transition-opacity duration-1000 ${animStep >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
      </div>
    </div>
  );
}
