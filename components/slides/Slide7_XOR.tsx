'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';

export function Slide7_XOR({ roundData }: any) {
  const [showResult, setShowResult] = useState(false);

  // default to hardcoded if no roundData provided
  const expandedRPT = roundData?.expandedR || "011010110011010110011110001110110110111001001100";
  const roundKey =    roundData?.roundKey ||  "011001110010010100111111110101110011011010001010";

  const chunksRPT: string[] = [];
  const chunksKey: string[] = [];
  const chunksRes: string[] = [];

  for (let i = 0; i < 8; i++) {
    chunksRPT.push(expandedRPT.slice(i * 6, i * 6 + 6));
    chunksKey.push(roundKey.slice(i * 6, i * 6 + 6));
    
    let res = "";
    for (let j = 0; j < 6; j++) {
       res += (parseInt(expandedRPT[i * 6 + j]) ^ parseInt(roundKey[i * 6 + j])).toString();
    }
    chunksRes.push(res);
  }

  return (
    <div className="flex flex-col h-full items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">The Secret Mix: XOR Operation</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm">
          Now we have two 48-bit structures: the <strong>Expanded RPT</strong> (from the previous Expansion step) and the <strong>Round Key</strong> (from the Key Generation step). 
          We combine them using an Exclusive-OR (XOR) operation.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-t-4 border-t-amber-500">
        
        <div className="flex justify-between items-center mb-8">
           <div className="flex flex-col flex-1 items-start">
             <div className="flex items-center gap-2 mb-2 font-bold text-emerald-800"><div className="w-4 h-4 bg-emerald-200 border-emerald-400 border rounded"></div> Expanded RPT (48-bit)</div>
             <div className="flex items-center gap-2 mb-2 font-bold text-amber-800"><div className="w-4 h-4 bg-amber-200 border-amber-400 border rounded"></div> Round Key (48-bit)</div>
           </div>

           <button 
             onClick={() => setShowResult(!showResult)} 
             className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
           >
             {showResult ? "Hide XOR Result" : "Perform XOR"}
           </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {chunksRPT.map((rpt, i) => (
             <div key={i} className="flex flex-col items-center bg-slate-50 border border-slate-200 p-2 rounded-xl relative">
                
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 text-rose-500 shadow-sm border border-slate-200 z-10 hidden md:block">
                  <PlusCircle size={16} />
                </div>

                <div className="font-mono text-xs flex gap-[1px] mb-1">
                  {rpt.split('').map((bit, j) => (
                    <div key={`rpt-${j}`} className="w-4 h-5 flex items-center justify-center bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-sm">{bit}</div>
                  ))}
                </div>
                
                <div className="font-mono text-xs flex gap-[1px] mb-2">
                  {chunksKey[i].split('').map((bit, j) => (
                    <div key={`key-${j}`} className="w-4 h-5 flex items-center justify-center bg-amber-100 border border-amber-300 text-amber-800 rounded-sm">{bit}</div>
                  ))}
                </div>

                <div className="w-full h-px bg-slate-300 mb-2 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-slate-100 text-slate-400 px-1 hover:text-slate-600 transition">XOR</div>
                </div>
                
                <div className="font-mono text-sm font-bold flex gap-[1px] h-6">
                  {showResult ? chunksRes[i].split('').map((bit, j) => (
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.5 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      transition={{ delay: i * 0.1 + j * 0.05, type: 'spring' }}
                      key={`res-${j}`} 
                      className={`w-4 h-5 flex items-center justify-center rounded-sm text-white ${bit === "1" ? "bg-indigo-500" : "bg-slate-400"}`}
                    >
                      {bit}
                    </motion.div>
                  )) : (
                    <div className="w-full flex items-center justify-center text-slate-300 text-xs italic">?</div>
                  )}
                </div>
             </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 bg-slate-100 p-4 rounded-lg">
          <strong>XOR Reminder:</strong> If the two bits are the same (0,0 or 1,1), the result is 0. If they are different (1,0 or 0,1), the result is 1.
        </div>
      </div>
    </div>
  );
}
