import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Skull, Clock, Gift, Volume2, X, MessageSquare } from 'lucide-react';
import { MacarenoWheelEvent, Player } from '../types';
import { MACARENO_SLICES } from '../data/macarenoWheel';
import { soundManager } from '../utils/audio';

interface MacarenoWheelModalProps {
  isOpen: boolean;
  event: MacarenoWheelEvent | null;
  currentPlayer: Player;
  isHost?: boolean;
  timeRemaining: number;
  onCollectMigajas?: () => void;
  onClose?: () => void;
  onForceSpin?: () => void;
}

export const MacarenoWheelModal: React.FC<MacarenoWheelModalProps> = ({
  isOpen,
  event,
  currentPlayer,
  isHost,
  timeRemaining,
  onCollectMigajas,
  onClose,
  onForceSpin,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !event) return;

    // Calculate rotation angle so that the pointer lands on event.sliceIndex
    const totalSlices = MACARENO_SLICES.length;
    const sliceAngle = 360 / totalSlices;
    // Pointer is at top (270 deg or 0 deg).
    const targetSliceCenter = event.sliceIndex * sliceAngle + sliceAngle / 2;
    // We want the wheel to spin 5 full rotations + land on slice
    const spins = 5 * 360;
    const finalAngle = spins + (360 - targetSliceCenter);

    setIsSpinning(true);
    setHasLanded(false);
    soundManager.playTick();

    const spinTimer = setTimeout(() => {
      setRotation(finalAngle);
    }, 100);

    const landTimer = setTimeout(() => {
      setIsSpinning(false);
      setHasLanded(true);
      soundManager.playSuccess();
    }, 3800);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(landTimer);
    };
  }, [isOpen, event?.id, event?.sliceIndex]);

  if (!isOpen || !event) return null;

  const currentDef = MACARENO_SLICES[event.sliceIndex] || MACARENO_SLICES[0];
  const isAssignedToMe = currentPlayer.id === event.assignedPlayerId;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-lg w-full bg-neutral-900/95 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-950/50 text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {onClose && hasLanded && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300 uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>La Ruleta de Azar de Macareno</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-1">
          {isSpinning ? '¡Macareno está girando el destino!' : currentDef.title}
        </h2>

        <p className="text-xs text-neutral-300 max-w-sm mx-auto mb-4">
          {isSpinning
            ? 'El gato místico (mitad felino negro, mitad calavera huesuda) elige el caos de hoy...'
            : event.lore}
        </p>

        {/* Interactive Roulette Stage */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-2 flex items-center justify-center">
          {/* Top Indicator Needle */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />
          </div>

          {/* Spinning Wheel SVG */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/80 shadow-2xl overflow-hidden transition-transform duration-[3600ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {MACARENO_SLICES.map((slice, i) => {
                const total = MACARENO_SLICES.length;
                const angle = 360 / total;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                // SVG Arc math
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;
                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={slice.index}>
                    <path d={d} fill={slice.color} opacity={0.88} stroke="#171717" strokeWidth="0.8" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub: Macareno illustration (Half Cat / Half Skeleton) */}
          <div className="absolute z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-950 border-4 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 120 120" className="w-full h-full p-1">
              <defs>
                <clipPath id="left-half">
                  <rect x="0" y="0" width="60" height="120" />
                </clipPath>
                <clipPath id="right-half">
                  <rect x="60" y="0" width="60" height="120" />
                </clipPath>
                <radialGradient id="catEyeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#15803d" />
                </radialGradient>
                <radialGradient id="skelEyeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </radialGradient>
              </defs>

              {/* Background circle */}
              <circle cx="60" cy="60" r="56" fill="#0a0a0a" />

              {/* LEFT HALF: Elegant Black Cat */}
              <g clipPath="url(#left-half)">
                {/* Cat Ear Left */}
                <polygon points="25,48 35,15 54,38" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
                <polygon points="30,42 38,22 48,38" fill="#ec4899" opacity="0.6" />

                {/* Cat Face Left */}
                <path d="M 60,35 Q 26,38 28,68 Q 30,95 60,98 Z" fill="#1c1917" />
                
                {/* Whiskers */}
                <line x1="45" y1="72" x2="15" y2="68" stroke="#a8a29e" strokeWidth="1" />
                <line x1="45" y1="76" x2="12" y2="78" stroke="#a8a29e" strokeWidth="1" />
                <line x1="45" y1="80" x2="16" y2="88" stroke="#a8a29e" strokeWidth="1" />

                {/* Glowing Green Eye */}
                <ellipse cx="44" cy="58" rx="8" ry="11" fill="url(#catEyeGlow)" />
                <ellipse cx="44" cy="58" rx="2" ry="9" fill="#022c22" />
                <circle cx="42" cy="54" r="2.5" fill="#ffffff" />

                {/* Pink Nose */}
                <polygon points="56,74 60,78 60,74" fill="#f43f5e" />

                {/* Bowtie Left */}
                <polygon points="60,102 38,95 44,112 60,105" fill="#b91c1c" />
              </g>

              {/* RIGHT HALF: Skeletal Skull Cat */}
              <g clipPath="url(#right-half)">
                {/* Skull Ear Right */}
                <polygon points="95,48 85,15 66,38" fill="#e5e5e5" stroke="#737373" strokeWidth="1.5" />
                <polygon points="90,42 82,22 72,38" fill="#404040" opacity="0.7" />

                {/* Skull Face Right */}
                <path d="M 60,35 Q 94,38 92,68 Q 90,95 60,98 Z" fill="#e5e5e5" />

                {/* Skull Eye Socket Right (Dark with purple flame) */}
                <circle cx="76" cy="58" r="10" fill="#171717" stroke="#525252" strokeWidth="1.5" />
                <circle cx="76" cy="58" r="4" fill="url(#skelEyeGlow)" className="animate-ping" />
                <circle cx="76" cy="58" r="3" fill="#f3e8ff" />

                {/* Skeletal Nose Cavity */}
                <polygon points="60,74 64,74 60,82" fill="#171717" />

                {/* Skeletal Teeth */}
                <line x1="60" y1="88" x2="84" y2="88" stroke="#171717" strokeWidth="2" />
                <line x1="68" y1="84" x2="68" y2="92" stroke="#171717" strokeWidth="1.5" />
                <line x1="76" y1="85" x2="76" y2="91" stroke="#171717" strokeWidth="1.5" />

                {/* Bone Collar Right */}
                <ellipse cx="75" cy="104" rx="8" ry="4" fill="#d4d4d4" stroke="#525252" strokeWidth="1" />
              </g>

              {/* Center Dividing Stitch / Split */}
              <line x1="60" y1="18" x2="60" y2="108" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />
            </svg>
          </div>
        </div>

        {/* Action Panel after landing */}
        {hasLanded ? (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 text-left space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Elegido por Macareno:
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                {event.assignedPlayerName}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 leading-relaxed">
              {event.instructions}
            </div>

            {/* Special Interactive Event: Las Migajas de Luisda Quick Tap */}
            {event.effectType === 'migajas' && (
              <div className="pt-1">
                {event.migajasCollected ? (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold">
                    ✓ ¡{event.migajasCollectorName} fue el más rápido y recogió las migajas (+10 monedas)!
                  </div>
                ) : (
                  <button
                    onClick={onCollectMigajas}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 animate-bounce"
                  >
                    <Gift className="w-4 h-4 text-emerald-200" />
                    ¡RECOGER LAS MIGAJAS DE LUISDA AHORA! (+10 🪙)
                  </button>
                )}
              </div>
            )}

            {/* Remaining Event Timer */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Duración del evento:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {timeRemaining}s restantes
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs font-mono text-amber-400/80 animate-pulse">
            Macareno está decidiendo la fortuna...
          </div>
        )}

        {/* Host Control: Force Trigger Wheel */}
        {isHost && onForceSpin && (
          <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
            <button
              onClick={onForceSpin}
              className="text-[10px] text-neutral-400 hover:text-amber-300 font-mono transition"
            >
              [Host: Girar Ruleta de Macareno]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
