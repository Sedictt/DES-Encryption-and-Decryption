'use client';

function hexToBin(hex: string) {
  return hex.split('').map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join('');
}

export function BitTable({ bits, title, highlightIndices = [], columns = 8, droppedIndices = [] }: { bits: string, title?: string, highlightIndices?: number[], columns?: number, droppedIndices?: number[] }) {
  if (!bits) return null;
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>}
      <div 
        className="grid gap-[4px] font-mono text-xs text-center w-full"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {bits.split('').map((bit, i) => {
          const isHighlighted = highlightIndices.includes(i);
          const isDropped = droppedIndices.includes(i);
          
          return (
            <div 
              key={i} 
              className={`flex flex-col items-center justify-center p-2 rounded-[6px] border
                ${isDropped ? 'bg-red-50 border-red-400 text-red-500 line-through' : isHighlighted ? 'bg-blue-50 border-blue-400 text-blue-600 font-bold' : 'bg-white border-slate-200 text-slate-500 font-semibold shadow-sm'}`}
              title={`Bit ${i + 1}`}
            >
              <div className="opacity-50 text-[9px] mb-0.5 font-sans leading-none">{i + 1}</div>
              <div className="leading-none text-sm">{bit}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export function hexToBinaryStr(hex: string) {
  return hexToBin(hex);
}
