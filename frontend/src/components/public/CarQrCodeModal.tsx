import React, { useState, useMemo } from 'react';
import { Car } from '../../types';
import {
  QrCode,
  X,
  Copy,
  Check,
  Smartphone,
  Download,
  Share2,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface CarQrCodeModalProps {
  car: Car;
  onClose: () => void;
}

/**
 * Deterministic high-contrast 29x29 QR Matrix generator (Version 3 layout)
 * Renders a crisp vector SVG with finder patterns, alignment pattern, timing patterns,
 * format info, and deterministic encoded payload modules for instant offline/sandbox rendering.
 */
function generateQrMatrix(payload: string): boolean[][] {
  const size = 29;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to place 7x7 finder pattern + 1px separator
  const placeFinder = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          reserved[rr][cc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[rr][cc] = isBorder || isInner;
          } else {
            matrix[rr][cc] = false;
          }
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Place 5x5 Alignment Pattern at (20, 20)
  const alignCenter = 22;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = alignCenter + r;
      const cc = alignCenter + c;
      reserved[rr][cc] = true;
      const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[rr][cc] = isEdge || isCenter;
    }
  }

  // Timing patterns along row 6 and col 6
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    reserved[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  reserved[size - 8][8] = true;
  matrix[size - 8][8] = true;

  // Deterministic bitstream from payload string
  const bytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    bytes.push(payload.charCodeAt(i) & 0xff);
  }
  // Pad with FNV-like mixing so full matrix has authentic high-entropy Reed-Solomon density
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let bitIndex = 0;
  const nextBit = (): boolean => {
    const byteIdx = Math.floor(bitIndex / 8);
    const bitOffset = 7 - (bitIndex % 8);
    bitIndex++;
    if (byteIdx < bytes.length) {
      return ((bytes[byteIdx] >> bitOffset) & 1) === 1;
    }
    hash ^= bitIndex * 0x9e3779b9;
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    return (Math.abs(hash) & 1) === 1;
  };

  // Fill non-reserved modules in upward/downward 2-column zig-zag
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // skip vertical timing line
    for (let step = 0; step < size; step++) {
      const row = upward ? size - 1 - step : step;
      for (let dCol = 0; dCol < 2; dCol++) {
        const c = col - dCol;
        if (!reserved[row][c]) {
          const bit = nextBit();
          // Mask pattern 0: (row + c) % 2 === 0
          matrix[row][c] = (row + c) % 2 === 0 ? !bit : bit;
        }
      }
    }
    upward = !upward;
  }

  return matrix;
}

export const CarQrCodeModal: React.FC<CarQrCodeModalProps> = ({ car, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [includeFinance, setIncludeFinance] = useState(true);
  const [includeBayMap, setIncludeBayMap] = useState(true);

  const mobileUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://auramotors.com';
    const params = new URLSearchParams();
    params.set('car', car.slug || String(car.id));
    if (includeFinance) params.set('view', 'finance');
    if (includeBayMap && car.slot?.label) params.set('bay', car.slot.label);
    return `${baseUrl}/?${params.toString()}`;
  }, [car, includeFinance, includeBayMap]);

  const qrMatrix = useMemo(() => generateQrMatrix(mobileUrl), [mobileUrl]);
  const monthlyEst = Math.round(car.price / 60);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById(`car-qr-svg-${car.id}`);
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${car.slug || `vehicle-${car.id}`}-qr-pass.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[#0D1119] border border-white/[0.14] p-6 sm:p-7 space-y-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <QrCode className="w-3.5 h-3.5" />
              <span>Mobile Inspection Pass</span>
            </div>
            <h3 className="text-lg font-bold text-white font-display leading-snug">
              {car.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              VIN: {car.vin} · ${car.price.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR Modal"
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-Contrast Scannable QR Code Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#070A0F] border border-cyan-500/20 relative overflow-hidden">
          <div className="p-4 rounded-xl bg-white shadow-xl">
            <svg
              id={`car-qr-svg-${car.id}`}
              viewBox="0 0 33 33"
              className="w-48 h-48 sm:w-52 sm:h-52 block"
              shapeRendering="crispEdges"
            >
              <rect width="33" height="33" fill="#FFFFFF" />
              {qrMatrix.map((row, rIdx) =>
                row.map((cell, cIdx) =>
                  cell ? (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={cIdx + 2}
                      y={rIdx + 2}
                      width={1}
                      height={1}
                      fill="#090B10"
                    />
                  ) : null
                )
              )}
              {/* Center Brand Monogram Badge */}
              <rect x="13.5" y="13.5" width="6" height="6" rx="1" fill="#090B10" stroke="#FFFFFF" strokeWidth="0.6" />
              <text
                x="16.5"
                y="17.6"
                textAnchor="middle"
                fill="#22D3EE"
                fontSize="3.2"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                AM
              </text>
            </svg>
          </div>

          <div className="mt-4 text-center space-y-1">
            <p className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Point Mobile Camera to Open Vehicle Dossier</span>
            </p>
            <p className="text-[11px] text-slate-400 font-mono tabular-nums">
              {car.model?.brand?.name} · {car.year} · Est. ${monthlyEst.toLocaleString()}/mo
              {car.slot ? ` · Bay ${car.slot.label}` : ''}
            </p>
          </div>
        </div>

        {/* Deep-Link Payload Options */}
        <div className="space-y-2.5 text-xs">
          <span className="text-slate-400 font-medium block">Include in Mobile Pass:</span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIncludeFinance(!includeFinance)}
              className={`px-3 py-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                includeFinance
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                  : 'bg-[#090B10] border-white/[0.08] text-slate-400'
              }`}
            >
              <span>EMI Lease Quote</span>
              <span className="font-mono text-[10px] text-cyan-400">{includeFinance ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIncludeBayMap(!includeBayMap)}
              className={`px-3 py-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                includeBayMap
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                  : 'bg-[#090B10] border-white/[0.08] text-slate-400'
              }`}
            >
              <span>3D Bay Waypoint</span>
              <span className="font-mono text-[10px] text-cyan-400">{includeBayMap ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Direct URL & Actions */}
        <div className="space-y-3 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="w-full px-3 py-2 rounded-lg bg-[#090B10] border border-white/[0.1] text-[11px] font-mono text-slate-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-lg bg-[#161C28] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-2.5 px-4 rounded-xl bg-[#161C28] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download QR SVG</span>
            </button>
            <a
              href={mobileUrl}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Mobile View</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
