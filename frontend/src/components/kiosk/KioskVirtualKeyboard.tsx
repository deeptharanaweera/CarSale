import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface KioskVirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  className?: string;
}

export const KioskVirtualKeyboard: React.FC<KioskVirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  className = '',
}) => {
  const row1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row2 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row3 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row4 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '@', '.'];

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Numbers row */}
      <div className="flex justify-center gap-2 mb-2">
        {row1.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => onKeyPress(ch)}
            className="w-14 h-14 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 transition-colors shadow-sm flex items-center justify-center touch-target"
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-2 mb-2">
        {row2.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => onKeyPress(ch)}
            className="w-14 h-14 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 transition-colors shadow-sm flex items-center justify-center touch-target"
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-2 mb-2">
        {row3.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => onKeyPress(ch)}
            className="w-14 h-14 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 transition-colors shadow-sm flex items-center justify-center touch-target"
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Row 4 */}
      <div className="flex justify-center gap-2 mb-2">
        {row4.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => onKeyPress(ch)}
            className="w-14 h-14 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 transition-colors shadow-sm flex items-center justify-center touch-target"
          >
            {ch}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="px-4 h-14 rounded-xl bg-red-950/60 text-red-300 border border-red-800 font-bold hover:bg-red-900 active:bg-red-500 active:text-white transition-colors flex items-center justify-center touch-target gap-1"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Space and Done row */}
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => onKeyPress(' ')}
          className="flex-1 max-w-md h-14 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 transition-colors shadow-sm flex items-center justify-center touch-target tracking-widest uppercase text-xs"
        >
          SPACE
        </button>
        <button
          type="button"
          onClick={onEnter}
          className="px-8 h-14 rounded-xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg flex items-center justify-center touch-target gap-2 text-sm uppercase tracking-wider"
        >
          <span>Done</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

