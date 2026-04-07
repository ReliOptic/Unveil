import React, { useEffect, useRef, useCallback } from 'react';

export const LandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const x = c.getContext('2d');
    if (!x) return;

    let W: number, H: number;
    const rz = () => {
      const d = window.devicePixelRatio || 1;
      W = c.width = window.innerWidth * d;
      H = c.height = window.innerHeight * d;
      c.style.width = window.innerWidth + 'px';
      c.style.height = window.innerHeight + 'px';
      x.setTransform(d, 0, 0, d, 0, 0);
    };
    rz();
    window.addEventListener('resize', rz);

    const iso = (cx: number, cy: number, bw: number, bh: number, dp: number, tc: string, lc: string, rc: string) => {
      const hw = bw / 2, hh = bh / 2;
      x.beginPath(); x.moveTo(cx, cy - dp); x.lineTo(cx + hw, cy + hh - dp); x.lineTo(cx, cy + bh - dp); x.lineTo(cx - hw, cy + hh - dp); x.closePath(); x.fillStyle = tc; x.fill();
      x.beginPath(); x.moveTo(cx - hw, cy + hh - dp); x.lineTo(cx, cy + bh - dp); x.lineTo(cx, cy + bh); x.lineTo(cx - hw, cy + hh); x.closePath(); x.fillStyle = lc; x.fill();
      x.beginPath(); x.moveTo(cx + hw, cy + hh - dp); x.lineTo(cx, cy + bh - dp); x.lineTo(cx, cy + bh); x.lineTo(cx + hw, cy + hh); x.closePath(); x.fillStyle = rc; x.fill();
    };

    const stars = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random() * .5, r: .5 + Math.random() * 1.2, p: Math.random() * 6.28 }));
    const cls = Array.from({ length: 7 }, () => ({ x: Math.random(), y: .15 + Math.random() * .35, w: 60 + Math.random() * 120, s: .00003 + Math.random() * .00005 }));

    let f = 0;
    const dr = () => {
      const ww = window.innerWidth, hh = window.innerHeight;
      x.clearRect(0, 0, ww, hh);
      const g = x.createLinearGradient(0, 0, 0, hh);
      g.addColorStop(0, '#C49070'); g.addColorStop(.25, '#D4A882'); g.addColorStop(.45, '#C8BEB0'); g.addColorStop(.65, '#A8C8D8'); g.addColorStop(.85, '#88B0C4'); g.addColorStop(1, '#6A98B0');
      x.fillStyle = g; x.fillRect(0, 0, ww, hh);

      const t = f * .02;
      stars.forEach(s => { const a = .15 + .25 * Math.sin(t + s.p); x.beginPath(); x.arc(s.x * ww, s.y * hh, s.r, 0, 6.28); x.fillStyle = `rgba(255,255,255,${a})`; x.fill() });

      const mt = (yB: number, hM: number, col: string) => {
        x.beginPath(); x.moveTo(0, yB); for (let i = 0; i <= 9; i++) { const px = i / 9 * (ww + 100) - 50; const pH = (30 + Math.sin(i * 1.7 + .5) * 40 + Math.cos(i * 2.3) * 25) * hM; x.lineTo(px, yB - pH); if (i < 9) { const mx = px + (ww + 100) / 18; const mH = (15 + Math.sin(i * 2.1) * 20) * hM; x.lineTo(mx, yB - mH) } } x.lineTo(ww, yB); x.closePath(); x.fillStyle = col; x.fill()
      }
      mt(hh * .72, 2.8, 'rgba(106,152,176,.18)'); mt(hh * .75, 2.2, 'rgba(106,152,176,.22)'); mt(hh * .78, 1.6, 'rgba(136,176,196,.28)');

      cls.forEach(c => { c.x = (c.x + c.s * 16) % 1.3; const cx2 = (c.x - .15) * ww; x.beginPath(); x.ellipse(cx2, c.y * hh, c.w, c.w * .25, 0, 0, 6.28); x.fillStyle = 'rgba(255,255,255,.06)'; x.fill() });

      const tcx = ww / 2, tcy = hh * .52, fy = Math.sin(t * .5) * 6, sc = Math.min(ww / 500, 1.2);
      x.save(); x.translate(tcx, tcy + fy); x.scale(sc, sc);
      iso(0, 80, 140, 70, 8, '#F2E6D9', '#D4C4B0', '#C9B89A');
      iso(0, -10, 80, 40, 100, '#F2E6D9', '#D4C4B0', '#C9B89A');
      iso(0, -80, 60, 30, 40, '#F2E6D9', '#D4C4B0', '#C9B89A');
      iso(0, -120, 40, 20, 20, '#E8A87C', '#D4908A', '#C47A6A');
      x.beginPath(); x.moveTo(0, -155); x.lineTo(6, -140); x.lineTo(-6, -140); x.closePath(); x.fillStyle = '#E8A87C'; x.fill();
      x.beginPath(); x.moveTo(0, -155); x.lineTo(0, -168); x.strokeStyle = '#D4908A'; x.lineWidth = 1; x.stroke();
      const fw2 = Math.sin(t * 2) * 3;
      x.beginPath(); x.moveTo(0, -168); x.quadraticCurveTo(10 + fw2, -165, 18 + fw2, -163); x.quadraticCurveTo(10 + fw2, -161, 0, -158); x.fillStyle = '#D4908A'; x.globalAlpha = .8; x.fill(); x.globalAlpha = 1;
      for (let i = 0; i < 5; i++) iso(-55 - i * 4, 40 - i * 16, 24, 12, 4, '#F2E6D9', '#D4C4B0', '#C9B89A');
      iso(65, 20, 36, 18, 50, '#F2E6D9', '#D4C4B0', '#C9B89A');
      iso(65, -30, 28, 14, 12, '#E8D5C4', '#C9B89A', '#B8A888');
      x.beginPath(); x.ellipse(0, -50, 8, 12, 0, 0, 6.28); x.fillStyle = 'rgba(138,175,196,.35)'; x.fill();
      x.beginPath(); x.moveTo(0, -125); x.lineTo(7, -115); x.lineTo(-7, -115); x.closePath(); x.fillStyle = '#FFF'; x.fill();
      x.beginPath(); x.roundRect(-4, -115, 8, 11, 2); x.fillStyle = '#FFF'; x.fill();
      x.restore(); f++; requestAnimationFrame(dr);
    };
    dr();

    return () => {
      window.removeEventListener('resize', rz);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end pb-24 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="relative z-10 text-center px-6">
        <h1 className="font-serif font-light text-7xl md:text-9xl tracking-widest text-white opacity-0 animate-[fadeInUp_1.5s_ease_0.3s_forwards]">
          UNVEIL
        </h1>
        <div className="w-10 h-px bg-white/50 mx-auto my-5 opacity-0 animate-[fadeInUp_1s_ease_0.8s_forwards]" />
        <p className="text-sm md:text-base font-light tracking-[0.25em] text-white/70 uppercase opacity-0 animate-[fadeInUp_1s_ease_1s_forwards]">
          말 없는 퍼즐이 당신을 읽는다
        </p>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-[fadeInUp_1s_ease_1.4s_forwards]">
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-[-1px] w-[3px] h-3 bg-[#E8A87C] rounded-sm animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDown {
          0%, 100% { top: 0; opacity: 1; }
          80% { top: 36px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
