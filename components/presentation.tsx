'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Minimize, ChevronLeft, ChevronRight, EyeOff, Eye, PenTool, Trash2, ZoomIn, ZoomOut, Hand, RefreshCcw, Settings2 } from 'lucide-react';
import { Slide0_Intro } from './slides/Slide0_Intro';
import { Slide1_KeyDiscarding } from './slides/Slide1_KeyDiscarding';
import { Slide2_InitialPermutation } from './slides/Slide2_InitialPermutation';
import { Slide3_Split } from './slides/Slide3_Split';
import { Slide4_RoundOverview } from './slides/Slide4_RoundOverview';
import { Slide5_KeyTransformation } from './slides/Slide5_KeyTransformation';
import { Slide6_Expansion } from './slides/Slide6_Expansion';
import { Slide7_XOR } from './slides/Slide7_XOR';
import { Slide8_SBox } from './slides/Slide8_SBox';
import { Slide9_PBox } from './slides/Slide9_PBox';
import { Slide10_FinalPermutation } from './slides/Slide10_FinalPermutation';
import { Slide11_Decryption } from './slides/Slide11_Decryption';
import { computeDESData, binaryStrToHex } from '../lib/des-utils';

export function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [strokes, setStrokes] = useState<{x: number, y: number}[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanMode, setIsPanMode] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPanMode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }
    if (!isDrawingMode) return;
    const rect = zoomContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentStroke([{ x: (e.clientX - rect.left) / zoomLevel, y: (e.clientY - rect.top) / zoomLevel }]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanMode && isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (!isDrawingMode || !currentStroke) return;
    const rect = zoomContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentStroke([...currentStroke, { x: (e.clientX - rect.left) / zoomLevel, y: (e.clientY - rect.top) / zoomLevel }]);
  };

  const handlePointerUp = () => {
    if (isPanMode) {
      setIsPanning(false);
    }
    if (currentStroke) {
      setStrokes([...strokes, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const getSvgPathFromStroke = (stroke: {x: number, y: number}[]) => {
    if (!stroke || stroke.length === 0) return '';
    if (stroke.length === 1) return `M ${stroke[0].x} ${stroke[0].y} L ${stroke[0].x} ${stroke[0].y}`;
    let path = `M ${stroke[0].x} ${stroke[0].y}`;
    for (let i = 1; i < stroke.length - 1; i++) {
       const xc = (stroke[i].x + stroke[i + 1].x) / 2;
       const yc = (stroke[i].y + stroke[i + 1].y) / 2;
       path += ` Q ${stroke[i].x} ${stroke[i].y}, ${xc} ${yc}`;
    }
    path += ` L ${stroke[stroke.length - 1].x} ${stroke[stroke.length - 1].y}`;
    return path;
  };

  const [plaintext, setPlaintext] = useState('44455372756C6573'); // "DESrules"
  const [key, setKey] = useState('5365637265742121'); // "Secret!!"

  const desData = useMemo(() => computeDESData(plaintext, key), [plaintext, key]);
  const decryptData = useMemo(() => computeDESData(desData.cipherHex, key, true), [desData.cipherHex, key]);

  const slidesRaw: any[] = [
    { component: Slide0_Intro, label: "Intro" },
    { component: Slide2_InitialPermutation, label: "Initial Perm" },
    { component: Slide3_Split, label: "Split" },
    { component: Slide1_KeyDiscarding, label: "Initial Key" },
    { component: Slide4_RoundOverview, label: "Round Overview" },
  ];

  for (let r = 1; r <= 16; r++) {
    slidesRaw.push({ component: Slide5_KeyTransformation, round: r, label: `Round ${r} Key Gen` });
    slidesRaw.push({ component: Slide6_Expansion, round: r, label: `Round ${r} Expansion` });
    slidesRaw.push({ component: Slide7_XOR, round: r, label: `Round ${r} Key Mixing` });
    slidesRaw.push({ component: Slide8_SBox, round: r, label: `Round ${r} S-Box Sub` });
    slidesRaw.push({ component: Slide9_PBox, round: r, label: `Round ${r} P-Box Perm` });
  }

  slidesRaw.push({ component: Slide10_FinalPermutation, label: "Final Perm" });

  // Decryption Slides
  slidesRaw.push({ component: Slide11_Decryption, label: "Decryption Intro" });
  slidesRaw.push({ component: Slide2_InitialPermutation, isDecrypt: true, label: "Dec: Initial Perm" });
  slidesRaw.push({ component: Slide3_Split, isDecrypt: true, label: "Dec: Split" });
  slidesRaw.push({ component: Slide4_RoundOverview, isDecrypt: true, label: "Dec: Round Overview" });

  for (let r = 1; r <= 16; r++) {
    slidesRaw.push({ component: Slide5_KeyTransformation, round: r, isDecrypt: true, label: `Dec: R${r} Key Gen` });
    slidesRaw.push({ component: Slide6_Expansion, round: r, isDecrypt: true, label: `Dec: R${r} Expansion` });
    slidesRaw.push({ component: Slide7_XOR, round: r, isDecrypt: true, label: `Dec: R${r} Key Mixing` });
    slidesRaw.push({ component: Slide8_SBox, round: r, isDecrypt: true, label: `Dec: R${r} S-Box Sub` });
    slidesRaw.push({ component: Slide9_PBox, round: r, isDecrypt: true, label: `Dec: R${r} P-Box Perm` });
  }

  slidesRaw.push({ component: Slide10_FinalPermutation, isDecrypt: true, label: "Dec: Final Perm" });

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slidesRaw.length - 1));
  }, [slidesRaw.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slidesRaw.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDrawingMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        setStrokes([]);
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsPanMode(prev => !prev);
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoomAndPan();
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setZoomLevel(prev => Math.min(prev + 0.1, 3));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoomLevel(prev => Math.min(prev + 0.1, 3));
        } else {
          setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesRaw.length]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [slideAnimStep, setSlideAnimStep] = useState(0);

  // Reset slideAnimStep when changing slides
  useEffect(() => {
    setSlideAnimStep(0);
  }, [currentSlide]);

  const CurrentSlideConfig = slidesRaw[currentSlide];
  const CurrentSlideComponent = CurrentSlideConfig.component;

  const activeData = CurrentSlideConfig.isDecrypt ? decryptData : desData;
  const currentRoundProps = useMemo(() => CurrentSlideConfig.round 
    ? { round: CurrentSlideConfig.round, roundData: activeData.roundsData[CurrentSlideConfig.round - 1], desData: activeData, isDecrypt: CurrentSlideConfig.isDecrypt, animStep: slideAnimStep, setAnimStep: setSlideAnimStep } 
    : { desData: activeData, isDecrypt: CurrentSlideConfig.isDecrypt, animStep: slideAnimStep, setAnimStep: setSlideAnimStep },
  [CurrentSlideConfig.round, activeData, CurrentSlideConfig.isDecrypt, slideAnimStep]);

  let currentLPT = "";
  let currentRPT = "";
  
  if (CurrentSlideConfig.round) {
    if (CurrentSlideConfig.component === Slide9_PBox && slideAnimStep >= 4) {
      currentLPT = activeData.roundsData[CurrentSlideConfig.round - 1].L_next;
      currentRPT = activeData.roundsData[CurrentSlideConfig.round - 1].R_next;
    } else {
      currentLPT = activeData.roundsData[CurrentSlideConfig.round - 1].L_prev;
      currentRPT = activeData.roundsData[CurrentSlideConfig.round - 1].R_prev;
    }
  } else if ((!CurrentSlideConfig.isDecrypt && currentSlide >= 2) || (CurrentSlideConfig.isDecrypt && CurrentSlideConfig.component !== Slide11_Decryption && CurrentSlideConfig.component !== Slide2_InitialPermutation && CurrentSlideConfig.component !== Slide0_Intro)) {
    if (CurrentSlideConfig.component === Slide10_FinalPermutation) {
      currentLPT = activeData.roundsData[15].L_next;
      currentRPT = activeData.roundsData[15].R_next;
    } else {
      currentLPT = activeData.roundsData[0].L_prev;
      currentRPT = activeData.roundsData[0].R_prev;
    }
  }

  const formatBits = (bits: string) => bits.match(/.{1,4}/g)?.join(' ') || '';

  const activePlaintext = CurrentSlideConfig.isDecrypt ? desData.cipherHex : plaintext;

  const memoizedSlideContent = useMemo(() => {
    return (
      <CurrentSlideComponent 
        plaintext={activePlaintext} 
        setPlaintext={setPlaintext}
        encKey={key}
        setEncKey={setKey}
        nextSlide={nextSlide}
        {...currentRoundProps}
      />
    );
  }, [CurrentSlideComponent, activePlaintext, setPlaintext, key, setKey, nextSlide, currentRoundProps]);

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col h-screen w-full bg-[#F0F2F5] text-[#1E293B] font-sans overflow-hidden p-4 md:p-6 gap-4 ${(isDrawingMode || isPanMode) ? 'select-none' : ''}`}
    >
      {/* Header / Controls */}
      <div className="flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-[10px] border border-white/50 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl tracking-tight text-blue-500">DES Explorer</h1>
            {currentLPT && currentRPT && (
              <div className="hidden lg:flex items-center gap-3 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LPT:</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">{formatBits(currentLPT)}</span>
                </div>
                <div className="w-px h-3 bg-slate-300 shrink-0"></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RPT:</span>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">{formatBits(currentRPT)}</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium hidden md:block">{CurrentSlideConfig.label}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={currentSlide}
            onChange={(e) => setCurrentSlide(parseInt(e.target.value))}
            className="text-sm font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-[10px] shadow-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            {slidesRaw.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
          <div className="text-sm font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-[10px] shadow-sm text-slate-600 hidden sm:block">
            {currentSlide + 1} / {slidesRaw.length}
          </div>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button 
            onClick={() => setShowToolbar(prev => !prev)}
            className={`p-1.5 md:p-2 rounded-[10px] border transition-colors shadow-sm ${showToolbar ? 'bg-slate-200 border-slate-300 text-slate-800' : 'hover:bg-white border-transparent hover:border-slate-200 text-slate-600 hover:shadow'}`}
            title="Toggle Tools"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[80px] md:top-[88px] right-4 md:right-6 z-20 flex flex-wrap bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-lg p-1.5 gap-1 shrink-0 origin-top-right max-w-[calc(100vw-32px)]"
          >
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-mono font-medium text-slate-500 w-10 text-center flex items-center justify-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 3))}
              className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button 
              onClick={resetZoomAndPan}
              className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
              title="Reset Zoom & Pan (0)"
            >
              <RefreshCcw size={16} />
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
            
            <button 
              onClick={() => setIsPanMode(prev => !prev)}
              className={`p-2 rounded-[8px] transition-colors shadow-sm ${isPanMode ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
              title={isPanMode ? "Disable Pan (H)" : "Enable Pan (H)"}
            >
              <Hand size={18} />
            </button>
            <button 
              onClick={() => setIsDrawingMode(prev => !prev)}
              className={`p-2 rounded-[8px] transition-colors shadow-sm ${isDrawingMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
              title={isDrawingMode ? "Disable Drawing (A/D)" : "Enable Drawing (A/D)"}
            >
              <PenTool size={18} />
            </button>
            {strokes.length > 0 && (
              <button 
                onClick={() => setStrokes([])}
                className="p-2 rounded-[8px] hover:bg-red-50 transition-colors text-red-500 shadow-sm"
                title="Clear Drawing"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>

            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors text-slate-600 shadow-sm hidden md:block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button 
              onClick={() => setShowFooter(prev => !prev)}
              className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
              title={showFooter ? "Hide Controls" : "Show Controls"}
            >
              {showFooter ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Slide Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <div 
          ref={zoomContainerRef} 
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, 
            transition: isPanning ? 'none' : 'transform 0.2s ease-out', 
            transformOrigin: 'center center',
            willChange: 'transform'
          }} 
          className="w-full h-full relative"
        >
          {/* Drawing Overlay */}
          <div 
            className={`absolute inset-0 z-[5] ${(isDrawingMode || isPanMode) ? 'pointer-events-auto touch-none' : 'pointer-events-none'} ${isPanMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <svg className="w-full h-full pointer-events-none absolute inset-0">
              {strokes.map((stroke, i) => (
                <path key={i} d={getSvgPathFromStroke(stroke)} stroke="#ef4444" strokeWidth={4 / zoomLevel} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {currentStroke && (
                <path d={getSvgPathFromStroke(currentStroke)} stroke="#ef4444" strokeWidth={4 / zoomLevel} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'circOut' }}
              className="absolute inset-0 flex flex-col pt-2 pb-0 px-2 md:px-8 overflow-y-auto"
            >
              {memoizedSlideContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer */}
      <AnimatePresence>
        {showFooter && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-[10px] border border-white/50 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0"
          >
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-xs text-slate-500 font-mono hidden md:block font-medium">
              Press Space or <ChevronRight className="inline w-3 h-3" /> to advance
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide === slidesRaw.length - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-[10px] font-semibold bg-blue-500 text-white hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:hover:bg-blue-500 transition-all"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
