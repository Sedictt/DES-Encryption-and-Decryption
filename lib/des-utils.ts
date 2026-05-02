import { PC1, PC2, IP, FP, SHIFTS, SBOXES, P } from './des-tables';

export const E = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1
];

export function hexToBinaryStr(hex?: string): string {
  if (!hex) return "";
  let out = "";
  for (let i = 0; i < hex.length; i++) {
    out += parseInt(hex[i], 16).toString(2).padStart(4, '0');
  }
  return out;
}

export function binaryStrToHex(bin: string): string {
  let out = "";
  for (let i = 0; i < bin.length; i += 4) {
    out += parseInt(bin.slice(i, i + 4), 2).toString(16).toUpperCase();
  }
  return out;
}

export function applyPermutation(bits: string, table: number[]): string {
  return table.map(pos => bits[pos - 1]).join('');
}

export function computeDESData(plaintextHex: string, keyHex: string, isDecrypt: boolean = false) {
  const ptBin = hexToBinaryStr(plaintextHex).padEnd(64, '0');
  const keyBin = hexToBinaryStr(keyHex).padEnd(64, '0');

  // Initial States
  const ipOut = applyPermutation(ptBin, IP);
  let L = ipOut.slice(0, 32);
  let R = ipOut.slice(32, 64);

  // Key Schedule
  const pc1Out = applyPermutation(keyBin, PC1);
  let C = pc1Out.slice(0, 28);
  let D = pc1Out.slice(28, 56);

  const subKeys = [];
  for (let i = 0; i < 16; i++) {
    const shift = SHIFTS[i];
    C = C.slice(shift) + C.slice(0, shift);
    D = D.slice(shift) + D.slice(0, shift);
    
    const combinedCD = C + D;
    const roundKey = applyPermutation(combinedCD, PC2);
    subKeys.push({ roundKey, C, D, shift });
  }

  const roundsData = [];

  for (let i = 0; i < 16; i++) {
    const keyData = isDecrypt ? subKeys[15 - i] : subKeys[i];
    const roundKey = keyData.roundKey;

    // Feistel
    const expandedR = applyPermutation(R, E);
    
    // XOR
    let xorOut = "";
    for (let j = 0; j < 48; j++) {
      xorOut += (parseInt(expandedR[j]) ^ parseInt(roundKey[j])).toString();
    }

    // SBox
    let sboxOut = "";
    for (let s = 0; s < 8; s++) {
      const block = xorOut.slice(s * 6, s * 6 + 6);
      const row = parseInt(block[0] + block[5], 2);
      const col = parseInt(block.slice(1, 5), 2);
      const val = SBOXES[s][row][col];
      sboxOut += val.toString(2).padStart(4, '0');
    }

    // PBox
    const fOut = applyPermutation(sboxOut, P);

    // Feistel XOR matching the "Swap"
    let newR = "";
    for (let j = 0; j < 32; j++) {
      newR += (parseInt(L[j]) ^ parseInt(fOut[j])).toString();
    }

    roundsData.push({
      round: i + 1,
      L_prev: L,
      R_prev: R,
      C: keyData.C,
      D: keyData.D,
      shift: keyData.shift,
      roundKey,
      expandedR,
      xorOut,
      sboxOut,
      fOut,
      L_next: R,  // Next L is prev R
      R_next: newR
    });

    L = R;
    R = newR;
  }

  // Final permutation (Note: DES does a final swap before IP-1, meaning R16 L16)
  const preFP = R + L;
  const cipherBin = applyPermutation(preFP, FP);

  return {
    ptHex: plaintextHex,
    keyHex: keyHex,
    ptBin,
    keyBin,
    ipOut,
    pc1Out,
    roundsData,
    preFP,
    cipherBin,
    cipherHex: binaryStrToHex(cipherBin)
  };
}
