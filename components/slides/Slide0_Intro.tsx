'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Lock, Key, Type, RefreshCw, Info } from 'lucide-react';

function asciiToHex(str: string) {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex.toUpperCase();
}

function hexToBin(hex: string) {
  let bin = '';
  for (let i = 0; i < hex.length; i++) {
    bin += parseInt(hex[i], 16).toString(2).padStart(4, '0');
  }
  return bin;
}

function applyPKCS7(hexInput: string) {
  let hex = hexInput;
  if (hex.length % 2 !== 0) hex = '0' + hex;
  const byteLen = hex.length / 2;
  if (byteLen >= 8) return { paddedHex: hex.substring(0, 16), padCount: 0, padByteHex: '' };
  const padCount = 8 - byteLen;
  const padByteHex = padCount.toString(16).padStart(2, '0').toUpperCase();
  const paddedHex = hex + padByteHex.repeat(padCount);
  return { paddedHex, padCount, padByteHex };
}

function generateRandomKey() {
  let keyHex = '';
  for (let i = 0; i < 16; i++) {
    keyHex += Math.floor(Math.random() * 16).toString(16).toUpperCase();
  }
  return keyHex;
}

export function Slide0_Intro({ plaintext, setPlaintext, encKey, setEncKey, nextSlide }: any) {
  const [plainInputType, setPlainInputType] = useState<'hex' | 'ascii'>('ascii');
  const [keyInputType, setKeyInputType] = useState<'hex' | 'ascii'>('hex');
  const [asciiPlain, setAsciiPlain] = useState('DES'); // Shorter default to show padding
  const [hexPlain, setHexPlain] = useState('444553'); // "DES" in hex
  const [asciiKey, setAsciiKey] = useState('');
  const [hexKey, setHexKey] = useState(''); 

  const generateNewKey = () => {
    const randHex = generateRandomKey();
    setKeyInputType('hex');
    setHexKey(randHex);
    // Try to convert to ASCII if possible
    let asciiVer = '';
    const bytes = randHex.match(/.{1,2}/g) || [];
    for (let b of bytes) {
        const code = parseInt(b, 16);
        if (code >= 32 && code <= 126) asciiVer += String.fromCharCode(code);
        else asciiVer += '.';
    }
    setAsciiKey(asciiVer);
  };

  useEffect(() => {
    generateNewKey();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute padded version
  const { paddedHex: finalPlaintext, padCount, padByteHex } = applyPKCS7(plainInputType === 'ascii' ? asciiToHex(asciiPlain) : hexPlain);

  // Sync to parent whenever final keys change
  useEffect(() => {
    setPlaintext(finalPlaintext);
  }, [finalPlaintext, setPlaintext]);

  const finalKey = keyInputType === 'ascii' ? applyPKCS7(asciiToHex(asciiKey)).paddedHex : hexKey.padEnd(16, '0');
  useEffect(() => {
    setEncKey(finalKey);
  }, [finalKey, setEncKey]);

  const handleAsciiPlainChange = (val: string) => {
    const newVal = val.substring(0, 8);
    setAsciiPlain(newVal);
  };

  const handleHexPlainChange = (val: string) => {
    setHexPlain(val.toUpperCase().replace(/[^0-9A-F]/g, '').substring(0, 16));
  };

  const handleAsciiKeyChange = (val: string) => {
    const newVal = val.substring(0, 8);
    setAsciiKey(newVal);
  };

  const handleHexKeyChange = (val: string) => {
    setHexKey(val.toUpperCase().replace(/[^0-9A-F]/g, '').substring(0, 16));
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full justify-center">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Data Encryption Standard (DES)
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          An interactive, step-by-step visual guide to understanding how DES encryption works under the hood.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-[10px] border border-white/50 p-8 rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Lock className="text-blue-500" />
            Define Your Input
          </h2>
        </div>
        
        <p className="text-slate-600 mb-8">
          DES operates on strictly 64-bit blocks. If your input is less than 64 bits (8 bytes), we automatically apply <b>PKCS#7</b> style padding.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                <Type size={16}/> Plaintext
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                <button
                  onClick={() => setPlainInputType('ascii')}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${plainInputType === 'ascii' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  ASCII
                </button>
                <button
                  onClick={() => setPlainInputType('hex')}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${plainInputType === 'hex' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Hex
                </button>
              </div>
            </div>
            {plainInputType === 'ascii' ? (
              <>
                <input
                  type="text"
                  value={asciiPlain}
                  onChange={(e) => handleAsciiPlainChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Up to 8 chars"
                  maxLength={8}
                />
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider flex justify-between">
                    <span>Hex Conversion</span>
                    {padCount > 0 && <span className="text-emerald-500">+{padCount} bytes padded</span>}
                  </div>
                  <div className="font-mono text-slate-700 break-all mb-2">
                    {asciiToHex(asciiPlain)}
                    {padCount > 0 && <span className="text-emerald-500 font-bold">{padByteHex.repeat(padCount)}</span>}
                    {asciiPlain.length === 0 && padCount === 0 && "0000000000000000"}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Binary Conversion</div>
                  <div className="font-mono text-xs text-slate-600 break-all">
                    {hexToBin(asciiToHex(asciiPlain))}
                    {padCount > 0 && <span className="text-emerald-500 font-bold">{hexToBin(padByteHex.repeat(padCount))}</span>}
                    {asciiPlain.length === 0 && padCount === 0 && "0000000000000000000000000000000000000000000000000000000000000000"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={hexPlain}
                  onChange={(e) => handleHexPlainChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                  placeholder="0123456789ABCDEF"
                  maxLength={16}
                />
                <div className="mt-2 text-xs text-slate-500 font-mono flex justify-between">
                  <span>{hexPlain.length}/16 hex chars</span>
                  {padCount > 0 && <span className="text-emerald-500">+{padCount} bytes padded</span>}
                </div>
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Binary Conversion</div>
                  <div className="font-mono text-xs text-slate-600 break-all">
                    {hexToBin(hexPlain)}
                    {padCount > 0 && <span className="text-emerald-500 font-bold">{hexToBin(padByteHex.repeat(padCount))}</span>}
                    {hexPlain.length === 0 && padCount === 0 && "-"}
                  </div>
                </div>
              </>
            )}

            <AnimatePresence>
              {padCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm overflow-hidden"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Info size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <strong>PKCS#7 Padding Applied</strong>
                  </div>
                  <p className="mb-2 pl-6">
                    Because your input is {8 - padCount} bytes long, we must pad it to reach the 8-byte (64-bit) block size.
                  </p>
                  <div className="pl-6 font-mono text-xs bg-white p-2 rounded border border-emerald-100 flex items-center gap-1 flex-wrap">
                    <span className="text-slate-800">{plainInputType === 'ascii' ? asciiToHex(asciiPlain) : hexPlain}</span>
                    <span className="text-emerald-500 font-bold bg-emerald-100 px-1 rounded">{padByteHex.repeat(padCount)}</span>
                  </div>
                  <p className="pl-6 mt-2 text-xs opacity-80">
                    We appended the byte <code>0x{padByteHex}</code> ({padCount} times) so that the total length becomes strictly 8 bytes.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                <Key size={16} />
                Secret Key
              </label>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  <button
                    onClick={() => setKeyInputType('ascii')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${keyInputType === 'ascii' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    ASCII
                  </button>
                  <button
                    onClick={() => setKeyInputType('hex')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${keyInputType === 'hex' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Hex
                  </button>
                </div>
                <button 
                  onClick={generateNewKey}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                >
                  <RefreshCw size={12} />
                  Randomize
                </button>
              </div>
            </div>
            {keyInputType === 'ascii' ? (
              <>
                <input
                  type="text"
                  value={asciiKey}
                  onChange={(e) => handleAsciiKeyChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="8 chars"
                  maxLength={8}
                />
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Hex Conversion</div>
                  <div className="font-mono text-slate-700 break-all mb-2">{applyPKCS7(asciiToHex(asciiKey)).paddedHex}</div>
                  <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Binary Conversion</div>
                  <div className="font-mono text-xs text-slate-600 break-all">
                    {hexToBin(applyPKCS7(asciiToHex(asciiKey)).paddedHex) || "-"}
                  </div>
                </div>
              </>
            ) : (
               <>
                <input
                  type="text"
                  value={hexKey}
                  onChange={(e) => handleHexKeyChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                  placeholder="133457799BBCDFF1"
                  maxLength={16}
                />
                <div className="mt-2 text-xs text-slate-500 font-mono">
                  {hexKey.length}/16 hex chars
                </div>
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Binary Conversion</div>
                  <div className="font-mono text-xs text-slate-600 break-all">
                    {hexToBin(hexKey) || "-"}
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
               <div className="flex items-start gap-2 mb-2">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <strong>Real-World Key Generation</strong>
               </div>
               <p className="text-slate-600 pl-6 text-xs">
                 In practice, a symmetric key shouldn&apos;t be human-readable strings like &quot;Secret!!&quot;. It should be generated by a cryptographically secure pseudo-random number generator (CSPRNG). Use the &quot;Randomize&quot; button above to simulate this.
               </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
          <button
            onClick={nextSlide}
            disabled={finalPlaintext.length !== 16 || finalKey.length !== 16}
            className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-[10px] font-semibold hover:bg-blue-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Encrypting
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

