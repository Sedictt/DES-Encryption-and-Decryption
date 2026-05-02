'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { SBOXES } from '../../lib/des-tables';

export function Slide8_SBox({ roundData }: any) {
  const fallback = "001101100101111100010001000101100101001101110110";
  const xorIn = roundData?.xorOut || fallback;
  const result48: string[] = xorIn.match(/.{1,6}/g) || Array(8).fill("000000");

  const [activeSBox, setActiveSBox] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completed, setCompleted] = useState<boolean[]>(Array(8).fill(false));

  const lookupSBox = (sboxIndex: number, bits6: string) => {
    if (!bits6 || bits6.length !== 6) return { row: 0, col: 0, val: 0, valBin: "0000" };
    const row = parseInt(bits6[0] + bits6[5], 2);
    const col = parseInt(bits6.substring(1, 5), 2);
    const val = SBOXES[sboxIndex][row][col];
    return { row, col, val, valBin: val.toString(2).padStart(4, '0') };
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating) {
      timer = setTimeout(() => {
        setCompleted(prev => {
          const next = [...prev];
          next[activeSBox] = true;
          return next;
        });
        if (activeSBox < 7) {
          setActiveSBox(curr => curr + 1);
        } else {
          setIsAnimating(false);
        }
      }, 2000); // 2 seconds per block
    }
    return () => clearTimeout(timer);
  }, [isAnimating, activeSBox]);

  const reset = () => {
    setIsAnimating(false);
    setActiveSBox(0);
    setCompleted(Array(8).fill(false));
  };

  const startAnim = () => {
    setIsAnimating(false);
    setActiveSBox(0);
    setCompleted(Array(8).fill(false));
    setTimeout(() => setIsAnimating(true), 100);
  };

  const selectedSboxData = lookupSBox(activeSBox, result48[activeSBox]);

  return (
    <div className="flex flex-col h-full items-center relative overflow-y-auto w-full content-between gap-4">
      <div className="text-center shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">S-Box Substitution</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm mb-4">
          The 48-bit result from the XOR operation is divided into eight 6-bit blocks. Each block is fed into a specific Substitution Box (S-Box) which mathematically compresses it into a 4-bit output using the outer bits for the row and middle bits for the column.
        </p>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setIsAnimating(false);
              if (completed[activeSBox]) {
                setCompleted(prev => { const next = [...prev]; next[activeSBox] = false; return next; });
              } else if (activeSBox > 0) {
                setActiveSBox(c => c - 1);
                setCompleted(prev => { const next = [...prev]; next[activeSBox - 1] = false; return next; });
              }
            }}
            disabled={activeSBox === 0 && !completed[0]}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 shadow-sm"
          >
            <SkipBack size={18} />
          </button>

          <button 
            onClick={() => {
              if (activeSBox === 7 && completed[7]) {
                 startAnim();
              } else {
                 setIsAnimating(!isAnimating);
              }
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 shadow-sm disabled:opacity-50"
          >
            {(activeSBox === 7 && completed[7]) ? <><Play size={18} /> Replay</> : isAnimating ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play animation</>}
          </button>

          <button 
            onClick={() => {
              setIsAnimating(false);
              if (!completed[activeSBox]) {
                setCompleted(prev => { const next = [...prev]; next[activeSBox] = true; return next; });
              } else if (activeSBox < 7) {
                setActiveSBox(c => c + 1);
              }
            }}
            disabled={activeSBox === 7 && completed[7]}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 shadow-sm"
          >
            <SkipForward size={18} />
          </button>

          <div className="h-6 w-px bg-slate-300 mx-2"></div>
          
          <button onClick={reset} disabled={activeSBox === 0 && !completed[0]} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 shadow-sm disabled:opacity-50">
            Reset
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-4 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col items-center border-t-4 border-t-red-500 shrink-0">
        <div className="w-full flex justify-between gap-2 relative px-2 flex-nowrap overflow-x-auto pb-6">
          {result48.map((bits: string, i: number) => {
            const { valBin } = lookupSBox(i, bits);
            const isCompleted = completed[i];
            const isActive = activeSBox === i;

            return (
              <div key={i} className={`flex flex-col items-center flex-1 min-w-[70px] ${isActive ? 'scale-110 mx-2 transition-transform' : 'scale-100 opacity-80'}`}>
                {/* 6-bit input */}
                <div className={`flex gap-[1px] mb-2 ${isCompleted ? 'opacity-50' : ''}`}>
                   {bits.split('').map((b, j) => (
                     <div key={`in-${j}`} className={`w-3.5 h-4 text-[10px] font-bold flex items-center justify-center rounded-[2px] ${isActive && (j===0||j===5) ? 'bg-amber-200 text-amber-800 border-amber-300 border-[1px]' : isActive ? 'bg-blue-200 text-blue-800 border-blue-300 border-[1px]' : 'bg-slate-200 text-slate-700'}`}>{b}</div>
                   ))}
                </div>

                {/* S-Box Node */}
                <div className={`w-16 h-12 flex flex-col items-center justify-center rounded-lg border-2 font-bold z-10 transition-colors ${isActive ? 'bg-red-500 text-white border-red-600 shadow-lg' : isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                  <span className="text-[10px] leading-none mb-1 opacity-80">S-BOX</span>
                  {isActive ? `Table ${i + 1}` : i + 1}
                </div>

                {/* 4-bit output */}
                <div className="h-6 relative w-full flex justify-center mt-2">
                  <AnimatePresence>
                    {(isCompleted || (isActive && isAnimating === false && completed[i])) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-[1px] absolute top-0"
                      >
                         {valBin.split('').map((b, j) => (
                           <div key={`out-${j}`} className="w-4 h-6 bg-emerald-500 text-white text-[12px] font-bold flex items-center justify-center rounded-[2px]">{b}</div>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden shrink-0">
        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">S-Box {activeSBox + 1} Lookup Table</h3>
          <div className="flex gap-4 text-xs font-mono bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
            <div><span className="text-amber-400">Outer Bits (Row):</span> {result48[activeSBox][0]}{result48[activeSBox][5]} = {selectedSboxData.row}</div>
            <div><span className="text-blue-400">Middle Bits (Col):</span> {result48[activeSBox].slice(1,5)} = {selectedSboxData.col}</div>
            <div><span className="text-emerald-400">Output:</span> {selectedSboxData.val} = {selectedSboxData.valBin}</div>
          </div>
        </div>
        
        <div className="p-4 overflow-x-auto">
           <table className="w-full text-center text-[11px] font-mono border-collapse">
             <thead className="bg-slate-100 text-slate-600">
               <tr>
                 <th className="py-2 border-r border-b px-2 shrink-0">Outer bits \ Middle 4 bits of input</th>
                 {Array.from({length: 16}).map((_, i) => (
                   <th key={i} className={`py-2 px-1 border-b font-semibold ${selectedSboxData.col === i ? 'bg-blue-200 text-blue-900 border-x border-blue-300' : ''}`}>{i.toString(2).padStart(4, '0')}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {SBOXES[activeSBox].map((rowArr, rowIndex) => (
                 <tr key={rowIndex} className="border-b last:border-0 hover:bg-slate-50">
                   <td className={`py-2 px-2 font-bold border-r ${selectedSboxData.row === rowIndex ? 'bg-amber-100 text-amber-900 border-y border-amber-300' : 'bg-slate-50 text-slate-500'}`}>{rowIndex.toString(2).padStart(2, '0')}</td>
                   {rowArr.map((val, colIndex) => {
                     const isMatch = selectedSboxData.row === rowIndex && selectedSboxData.col === colIndex;
                     return (
                       <td key={colIndex} className={`py-2 px-1 ${isMatch ? 'bg-emerald-500 text-white font-bold shadow rounded transform scale-110 z-10 relative' : ''}`}>
                         {val.toString(2).padStart(4, '0')}
                       </td>
                     )
                   })}
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
