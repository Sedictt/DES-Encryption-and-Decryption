'use client';

export function Slide4_RoundOverview({ isDecrypt }: any) {
  return (
    <div className="flex flex-col h-full items-center overflow-y-auto pb-12">
      <div className="text-center mb-8 shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">The 16 {isDecrypt ? "Decryption" : "Encryption"} Rounds</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          The core of DES is a Feistel network that repeats the same process 16 times.
          {isDecrypt && " For decryption, the exact same process is used, but the 16 subkeys are applied in reverse order."}
          {!isDecrypt && " Here's a bird's-eye view of what happens in one single round. We'll break down each step next."}
        </p>
      </div>

      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-[10px] border border-white/50 p-6 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-center">
        
        <svg width="400" height="450" viewBox="0 0 400 450" className="max-w-full h-auto drop-shadow-sm bg-white p-6 rounded-2xl border border-slate-200">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* Top Boxes */}
          <g>
            <rect x="50" y="20" width="150" height="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
            <text x="125" y="52" fill="currentColor" fontSize="24" fontFamily="sans-serif" textAnchor="middle" className="text-slate-800 font-bold">L<tspan dy="6" fontSize="16" className="font-medium">i-1</tspan></text>
            
            <rect x="200" y="20" width="150" height="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
            <text x="275" y="52" fill="currentColor" fontSize="24" fontFamily="sans-serif" textAnchor="middle" className="text-slate-800 font-bold">R<tspan dy="6" fontSize="16" className="font-medium">i-1</tspan></text>
          </g>

          {/* Lines and Flow */}
          <g stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-800">
            {/* L_{i-1} down to XOR */}
            <path d="M 125 70 L 125 165" markerEnd="url(#arrow)" />
            
            {/* R_{i-1} down to crossing point */}
            <path d="M 275 70 L 275 190" />
            <path d="M 275 190 L 275 295" markerEnd="url(#arrow)" />
            
            {/* Branch from R_{i-1} to f */}
            <path d="M 275 190 L 238 190" markerEnd="url(#arrow)" />
            
            {/* f to XOR */}
            <path d="M 172 190 L 148 190" markerEnd="url(#arrow)" />

            {/* XOR output down to swap */}
            <path d="M 125 210 L 125 300" />
            
            {/* Swap lines */}
            <path d="M 125 300 L 270 375" markerEnd="url(#arrow)" />
            <path d="M 275 300 L 130 375" markerEnd="url(#arrow)" />
          </g>

          {/* f_i Node */}
          <g>
            <circle cx="205" cy="190" r="30" fill="white" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
            <text x="205" y="198" fill="currentColor" fontSize="24" fontFamily="serif" textAnchor="middle" className="text-slate-800 italic font-bold">f<tspan dy="5" fontSize="14" className="not-italic">i</tspan></text>
          </g>

          {/* XOR Node */}
          <g>
            <circle cx="125" cy="190" r="20" fill="white" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
            <path d="M 113 190 L 137 190 M 125 178 L 125 202" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
          </g>

          {/* Bottom Boxes */}
          <g>
            <rect x="50" y="380" width="150" height="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
            <text x="125" y="412" fill="currentColor" fontSize="24" fontFamily="sans-serif" textAnchor="middle" className="text-slate-800 font-bold">L<tspan dy="6" fontSize="16" className="font-medium">i</tspan></text>
            
            <rect x="200" y="380" width="150" height="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
            <text x="275" y="412" fill="currentColor" fontSize="24" fontFamily="sans-serif" textAnchor="middle" className="text-slate-800 font-bold">R<tspan dy="6" fontSize="16" className="font-medium">i</tspan></text>
          </g>
        </svg>

      </div>
    </div>
  );
}
