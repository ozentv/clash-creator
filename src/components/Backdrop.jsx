import { useEffect, useRef } from 'react';

// Fond de page : constellation animée (points reliés, attirés par le pointeur),
// halos de couleur et grille discrète.
const LINK_DISTANCE = 130;
const POINTER_DISTANCE = 190;

function useConstellation(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -9999, y: -9999 };
    let points = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round((width * height) / 16000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.6,
      }));
      if (still) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        if (!still) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 197, 49, 0.7)';
        ctx.fill();
      }
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.13 * (1 - d / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (dp < POINTER_DISTANCE) {
          ctx.strokeStyle = `rgba(245, 197, 49, ${0.5 * (1 - dp / POINTER_DISTANCE)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    function loop() {
      draw();
      frame = requestAnimationFrame(loop);
    }
    function onPointer(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    function onVisibility() {
      cancelAnimationFrame(frame);
      if (!document.hidden && !still) loop();
    }

    resize();
    if (!still) loop();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef]);
}

export default function Backdrop() {
  const canvasRef = useRef(null);
  useConstellation(canvasRef);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="halo-a absolute -top-48 -left-40 size-[38rem] rounded-full bg-amber-500/[0.13] blur-3xl" />
      <div className="halo-b absolute -right-48 bottom-[-10rem] size-[36rem] rounded-full bg-indigo-600/[0.16] blur-3xl" />
      <div className="backdrop-grid absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
