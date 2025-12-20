'use client';

import React from 'react';

type Preset = 'soft' | 'glow' | 'starfield';

const STORAGE_ENABLED = 'fl_bg_enabled';
const STORAGE_PRESET = 'fl_bg_preset';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isPreset(value?: string | null): value is Preset {
  return value === 'soft' || value === 'glow' || value === 'starfield';
}

export function BackgroundEffects() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [enabled, setEnabled] = React.useState(false);
  const [preset, setPreset] = React.useState<Preset>('soft');
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallQuery = window.matchMedia('(max-width: 768px)');
    const storedEnabled = localStorage.getItem(STORAGE_ENABLED);
    const storedPreset = localStorage.getItem(STORAGE_PRESET);
    const defaultEnabled = !smallQuery.matches;
    setEnabled(storedEnabled ? storedEnabled === 'true' : defaultEnabled);
    setPreset(isPreset(storedPreset) ? storedPreset : 'soft');
    setReducedMotion(reducedQuery.matches);

    const onReduced = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_ENABLED) {
        setEnabled(event.newValue === 'true');
      }
      if (event.key === STORAGE_PRESET && isPreset(event.newValue)) {
        setPreset(event.newValue);
      }
    };
    const onCustom = (event: Event) => {
      const custom = event as CustomEvent<{ enabled?: boolean; preset?: Preset }>;
      if (typeof custom.detail?.enabled === 'boolean') setEnabled(custom.detail.enabled);
      if (custom.detail?.preset) setPreset(custom.detail.preset);
    };

    if (reducedQuery.addEventListener) {
      reducedQuery.addEventListener('change', onReduced);
    } else {
      reducedQuery.addListener(onReduced);
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('fl-bg-settings', onCustom);
    return () => {
      if (reducedQuery.removeEventListener) {
        reducedQuery.removeEventListener('change', onReduced);
      } else {
        reducedQuery.removeListener(onReduced);
      }
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('fl-bg-settings', onCustom);
    };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || preset === 'glow') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const connection = (navigator as any)?.connection;
    const saveData = Boolean(connection?.saveData);
    const cores = navigator.hardwareConcurrency ?? 6;
    const maxFPS = saveData ? 20 : 30;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const buildParticles = () => {
      const area = width * height;
      const baseCount = preset === 'starfield' ? area / 55000 : area / 35000;
      const maxCount = preset === 'starfield' ? 45 : 75;
      const count = clamp(Math.floor(baseCount), 18, maxCount) * (saveData || cores <= 4 ? 0.7 : 1);
      particles = Array.from({ length: Math.max(12, Math.floor(count)) }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (preset === 'starfield' ? 0.08 : 0.12),
        vy: (Math.random() - 0.5) * (preset === 'starfield' ? 0.08 : 0.12),
        r: preset === 'starfield' ? Math.random() * 1.2 + 0.4 : Math.random() * 1.6 + 0.6,
        alpha: preset === 'starfield' ? 0.6 : 0.45
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = Math.floor(window.innerWidth);
      height = Math.floor(window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
      drawFrame(0, true);
    };

    const drawFrame = (time: number, force = false) => {
      if (!force && reducedMotion) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(106, 216, 255, 0.32)';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (preset === 'soft') {
        ctx.strokeStyle = 'rgba(106, 216, 255, 0.08)';
        for (let i = 0; i < particles.length; i += 1) {
          for (let j = i + 1; j < particles.length; j += 1) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.globalAlpha = 0.18 - dist / 700;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    };

    let last = 0;
    const loop = (time: number) => {
      if (reducedMotion) {
        drawFrame(time, true);
        return;
      }
      const interval = 1000 / maxFPS;
      if (time - last >= interval) {
        last = time;
        drawFrame(time);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, preset, reducedMotion]);

  if (!enabled) return null;

  return (
    <div className="background-layer" aria-hidden>
      {preset === 'glow' ? <div className="background-glow" /> : null}
      {preset === 'glow' ? <div className="background-noise" /> : null}
      {preset !== 'glow' ? <canvas ref={canvasRef} className="background-canvas" /> : null}
    </div>
  );
}
