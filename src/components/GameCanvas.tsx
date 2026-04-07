import React, { useEffect, useRef, useState, useCallback } from 'react';

interface GameCanvasProps {
  levelIdx: number;
  onMove: (count: number) => void;
  onClear: (stats: { time: number; moves: number; visited: Set<string> }) => void;
  onRestart: () => void;
}

const GRID_SIZE = 5;
const TILE_W = 64;
const TILE_H = 32;
const ELEV_STEP = 16;

const COLORS = {
  top: '#F2E6D9',
  left: '#D4C4B0',
  right: '#C9B89A',
  accent: '#E8A87C',
  highlight: 'rgba(126, 184, 201, 0.4)',
  hint: 'rgba(126, 184, 201, 0.6)',
  char: '#FFFFFF'
};

const LEVELS = [
  {
    type: 'A',
    heights: [
      [1, 1, 2, 2, 2],
      [1, 0, 0, 2, 3],
      [1, 1, 0, 1, 3],
      [0, 1, 1, 1, 2],
      [0, 0, 1, 1, 1]
    ],
    hiddenBridge: [
      { r: 2, c: 3, h: 1 },
      { r: 3, c: 3, h: 1 }
    ],
    bridgeTrigger: { r: 2, c: 2 },
    optimal: 8,
    solution: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4]]
  },
  {
    type: 'B',
    heights: [
      [0, 0, 0, 0, 0],
      [0, 1, 2, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    rotatable: { r: 1, c: 1, size: 2 },
    optimal: 6,
    solution: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4]]
  }
];

export const GameCanvas: React.FC<GameCanvasProps> = ({ levelIdx, onMove, onClear, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    levelData: JSON.parse(JSON.stringify(LEVELS[levelIdx])),
    charPos: { r: 0, c: 0 },
    moveCount: 0,
    startTime: Date.now(),
    isMoving: false,
    isRotating: false,
    isCleared: false,
    visitedTiles: new Set<string>(['0,0']),
    hintActive: 0,
    bridgeAlpha: 0,
    charAnim: { r: 0, c: 0, t: 1 },
    tileFloatAnim: { active: false, t: 0 },
    particles: [] as any[]
  });

  const getScreenPos = (r: number, c: number, h: number, width: number, height: number) => {
    const offsetX = width / 2;
    const offsetY = height / 2 - 40;
    const x = (c - r) * (TILE_W / 2) + offsetX;
    const y = (c + r) * (TILE_H / 2) - h * ELEV_STEP + offsetY;
    return { x, y };
  };

  const getMovableTiles = useCallback(() => {
    const s = stateRef.current;
    if (s.isMoving || s.isRotating || s.isCleared) return [];
    const neighbors = [
      { r: s.charPos.r - 1, c: s.charPos.c },
      { r: s.charPos.r + 1, c: s.charPos.c },
      { r: s.charPos.r, c: s.charPos.c - 1 },
      { r: s.charPos.r, c: s.charPos.c + 1 }
    ];
    const currentH = s.levelData.heights[s.charPos.r][s.charPos.c];
    return neighbors.filter(n => {
      if (n.r < 0 || n.r >= GRID_SIZE || n.c < 0 || n.c >= GRID_SIZE) return false;
      if (s.levelData.type === 'A') {
        const isBridge = s.levelData.hiddenBridge.some((b: any) => b.r === n.r && b.c === n.c);
        if (isBridge && !s.levelData.bridgeActive) return false;
      }
      const targetH = s.levelData.heights[n.r][n.c];
      return Math.abs(targetH - currentH) <= 1;
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Background brightening on clear
    if (s.isCleared) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.8, s.tileFloatAnim.t)})`;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw rotatable area indicator
    if (s.levelData.type === 'B' && !s.isCleared) {
      const { r, c, size } = s.levelData.rotatable;
      ctx.strokeStyle = 'rgba(196, 168, 130, 0.4)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      const p1 = getScreenPos(r - 0.5, c - 0.5, 0, width, height);
      const p2 = getScreenPos(r - 0.5, c + size - 0.5, 0, width, height);
      const p3 = getScreenPos(r + size - 0.5, c + size - 0.5, 0, width, height);
      const p4 = getScreenPos(r + size - 0.5, c - 0.5, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y + 20);
      ctx.lineTo(p2.x, p2.y + 20);
      ctx.lineTo(p3.x, p3.y + 20);
      ctx.lineTo(p4.x, p4.y + 20);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const movable = getMovableTiles();

    // Render tiles back-to-front
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let h = s.levelData.heights[r][c];
        if (s.tileFloatAnim.active) {
          const delay = (r + c) * 0.05;
          const t = Math.max(0, s.tileFloatAnim.t - delay);
          h += t * 100;
        }

        const isHighlight = movable.some(t => t.r === r && t.c === c);
        const isHint = s.hintActive > 0 && s.levelData.solution.slice(0, s.hintActive).some((sol: any) => sol[0] === r && sol[1] === c);
        const bridgeTile = s.levelData.type === 'A' && s.levelData.hiddenBridge.find((b: any) => b.r === r && b.c === c);

        const alpha = bridgeTile ? (s.levelData.bridgeActive ? 1 : s.bridgeAlpha) : 1;
        if (alpha <= 0) continue;

        const { x, y } = getScreenPos(r, c, h, width, height);
        ctx.globalAlpha = alpha;

        // Right face
        ctx.fillStyle = COLORS.right;
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_H / 2);
        ctx.lineTo(x + TILE_W / 2, y);
        ctx.lineTo(x + TILE_W / 2, y + 100);
        ctx.lineTo(x, y + TILE_H / 2 + 100);
        ctx.fill();

        // Left face
        ctx.fillStyle = COLORS.left;
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_H / 2);
        ctx.lineTo(x - TILE_W / 2, y);
        ctx.lineTo(x - TILE_W / 2, y + 100);
        ctx.lineTo(x, y + TILE_H / 2 + 100);
        ctx.fill();

        // Top face
        ctx.fillStyle = COLORS.top;
        ctx.beginPath();
        ctx.moveTo(x, y - TILE_H / 2);
        ctx.lineTo(x + TILE_W / 2, y);
        ctx.lineTo(x, y + TILE_H / 2);
        ctx.lineTo(x - TILE_W / 2, y);
        ctx.closePath();
        ctx.fill();

        if (isHighlight) {
          ctx.fillStyle = COLORS.highlight;
          ctx.fill();
        }
        if (isHint) {
          const glow = Math.sin(Date.now() / 200) * 0.15 + 0.15;
          ctx.fillStyle = `rgba(126, 184, 201, ${glow})`;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    // Goal
    const goalH = s.levelData.heights[4][4];
    const goalPos = getScreenPos(4, 4, goalH, width, height);
    const pulse = Math.sin(Date.now() / 400) * 3 + 12;
    ctx.fillStyle = COLORS.accent;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(goalPos.x, goalPos.y, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Character
    const charR = s.charAnim.t < 1 ? s.charAnim.r : s.charPos.r;
    const charC = s.charAnim.t < 1 ? s.charAnim.c : s.charPos.c;
    const charH = s.levelData.heights[s.charPos.r][s.charPos.c];
    const charScreen = getScreenPos(charR, charC, charH, width, height);
    const jumpY = s.charAnim.t < 1 ? Math.sin(s.charAnim.t * Math.PI) * -10 : 0;

    ctx.fillStyle = COLORS.char;
    ctx.beginPath();
    ctx.arc(charScreen.x, charScreen.y + jumpY - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(charScreen.x - 8, charScreen.y + jumpY - 8);
    ctx.lineTo(charScreen.x + 8, charScreen.y + jumpY - 8);
    ctx.lineTo(charScreen.x, charScreen.y + jumpY - 22);
    ctx.closePath();
    ctx.fill();

    // Particles
    if (s.isCleared) {
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.vy;
        p.alpha -= 0.01;
      });
      s.particles = s.particles.filter(p => p.alpha > 0);
    }

    requestAnimationFrame(draw);
  }, [getMovableTiles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 500;
    canvas.height = 500;
    
    const s = stateRef.current;
    s.levelData = JSON.parse(JSON.stringify(LEVELS[levelIdx]));
    s.charPos = { r: 0, c: 0 };
    s.moveCount = 0;
    s.startTime = Date.now();
    s.isMoving = false;
    s.isRotating = false;
    s.isCleared = false;
    s.visitedTiles = new Set(['0,0']);
    s.hintActive = 0;
    s.bridgeAlpha = 0;
    s.charAnim = { r: 0, c: 0, t: 1 };
    s.tileFloatAnim = { active: false, t: 0 };
    s.particles = [];

    const hintInterval = setInterval(() => {
      if (s.isCleared) return;
      const elapsed = (Date.now() - s.startTime) / 1000;
      if (elapsed > 90) s.hintActive = 2;
      else if (elapsed > 60) s.hintActive = 1;
    }, 1000);

    const animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(hintInterval);
    };
  }, [levelIdx, draw]);

  const handleInput = (e: React.MouseEvent | React.TouchEvent) => {
    const s = stateRef.current;
    if (s.isCleared) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Tile click
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const h = s.levelData.heights[r][c];
        const pos = getScreenPos(r, c, h, canvas.width, canvas.height);
        const dx = Math.abs(x - pos.x);
        const dy = Math.abs(y - pos.y);
        if (dx / (TILE_W / 2) + dy / (TILE_H / 2) <= 1) {
          const movable = getMovableTiles();
          if (movable.some(m => m.r === r && m.c === c)) {
            moveChar(r, c);
            return;
          }
        }
      }
    }

    // Rotation click
    if (s.levelData.type === 'B') {
      const { r, c } = s.levelData.rotatable;
      const center = getScreenPos(r + 0.5, c + 0.5, 0, canvas.width, canvas.height);
      const dist = Math.sqrt((x - center.x) ** 2 + (y - (center.y + 20)) ** 2);
      if (dist < 60) {
        rotateBlock();
      }
    }
  };

  const moveChar = (r: number, c: number) => {
    const s = stateRef.current;
    if (s.isMoving) return;
    s.isMoving = true;
    const prevPos = { ...s.charPos };
    s.charAnim = { r: prevPos.r, c: prevPos.c, t: 0 };
    const start = Date.now();
    const duration = 200;

    const animate = () => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      s.charAnim.t = progress;
      s.charAnim.r = prevPos.r + (r - prevPos.r) * progress;
      s.charAnim.c = prevPos.c + (c - prevPos.c) * progress;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        s.charPos = { r, c };
        s.isMoving = false;
        s.moveCount++;
        onMove(s.moveCount);
        s.visitedTiles.add(`${r},${c}`);

        if (s.levelData.type === 'A' && r === s.levelData.bridgeTrigger.r && c === s.levelData.bridgeTrigger.c) {
          s.levelData.bridgeActive = true;
          const fadeStart = Date.now();
          const fade = () => {
            const p = Math.min(1, (Date.now() - fadeStart) / 300);
            s.bridgeAlpha = p;
            if (p < 1) requestAnimationFrame(fade);
          };
          fade();
        }

        if (r === 4 && c === 4) {
          clearGame();
        }
      }
    };
    animate();
  };

  const rotateBlock = () => {
    const s = stateRef.current;
    if (s.isRotating || s.isMoving || s.isCleared) return;
    s.isRotating = true;
    const { r, c, size } = s.levelData.rotatable;
    const h = s.levelData.heights;
    const temp = h[r][c];
    h[r][c] = h[r + 1][c];
    h[r + 1][c] = h[r + 1][c + 1];
    h[r + 1][c + 1] = h[r][c + 1];
    h[r][c + 1] = temp;

    if (s.charPos.r >= r && s.charPos.r < r + size && s.charPos.c >= c && s.charPos.c < c + size) {
      const dr = s.charPos.r - r;
      const dc = s.charPos.c - c;
      if (dr === 0 && dc === 0) s.charPos.c++;
      else if (dr === 0 && dc === 1) s.charPos.r++;
      else if (dr === 1 && dc === 1) s.charPos.c--;
      else if (dr === 1 && dc === 0) s.charPos.r--;
    }

    setTimeout(() => {
      s.isRotating = false;
      s.moveCount++;
      onMove(s.moveCount);
    }, 300);
  };

  const clearGame = () => {
    const s = stateRef.current;
    s.isCleared = true;
    const totalTime = Math.floor((Date.now() - s.startTime) / 1000);
    s.tileFloatAnim.active = true;
    const start = Date.now();
    const anim = () => {
      s.tileFloatAnim.t = (Date.now() - start) / 2000;
      if (s.tileFloatAnim.t < 1) requestAnimationFrame(anim);
    };
    anim();

    for (let i = 0; i < 20; i++) {
      s.particles.push({
        x: Math.random() * 500,
        y: 520,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 6 + 4,
        color: ['#F2E6D9', '#E8A87C', '#7EB8C9'][Math.floor(Math.random() * 3)],
        alpha: 1
      });
    }

    setTimeout(() => {
      onClear({ time: totalTime, moves: s.moveCount, visited: s.visitedTiles });
    }, 1500);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleInput}
      onTouchStart={(e) => {
        e.preventDefault();
        handleInput(e);
      }}
      className="max-w-full h-auto cursor-pointer"
    />
  );
};
