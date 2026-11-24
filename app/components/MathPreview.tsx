"use client";

import { useEffect, useRef } from "react";

type PreviewProps = {
  variant?: "mandelbrot" | "symmetry" | "curve" | "waves" | "recursive";
  compact?: boolean;
};

export default function MathPreview({ variant = "mandelbrot", compact = false }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#090b10";
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (variant === "mandelbrot") {
        for (let py = 0; py < rect.height; py += 2) {
          for (let px = 0; px < rect.width; px += 2) {
            const cx = (px / rect.width - 0.7) * 3.2;
            const cy = (py / rect.height - 0.5) * 2.4;
            let zx = 0, zy = 0, i = 0;
            while (zx * zx + zy * zy < 4 && i < 24) {
              const next = zx * zx - zy * zy + cx;
              zy = 2 * zx * zy + cy;
              zx = next;
              i++;
            }
            const c = i === 24 ? 18 : 30 + i * 7;
            ctx.fillStyle = `rgb(${c * 0.55},${c * 0.7},${c * 1.15})`;
            ctx.fillRect(px, py, 2, 2);
          }
        }
      } else if (variant === "symmetry") {
        ctx.translate(rect.width / 2, rect.height / 2);
        for (let i = 0; i < 18; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI * 2) / 18);
          ctx.strokeStyle = i % 2 ? "#42d9c8" : "#9b8cff";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.bezierCurveTo(rect.width * 0.18, -30, rect.width * 0.24, 38, rect.width * 0.35, 0);
          ctx.stroke();
          ctx.restore();
        }
      } else if (variant === "curve") {
        ctx.translate(rect.width / 2, rect.height / 2);
        ctx.strokeStyle = "#9b8cff";
        ctx.lineWidth = compact ? 1 : 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 720; i++) {
          const t = (i / 720) * Math.PI * 2;
          const r = rect.height * 0.28;
          const x = r * Math.sin(3 * t);
          const y = r * Math.sin(4 * t);
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
      } else if (variant === "waves") {
        ctx.lineWidth = 1.4;
        for (let w = 0; w < 4; w++) {
          ctx.strokeStyle = w % 2 ? "#42d9c8" : "#d4f36a";
          ctx.beginPath();
          for (let x = 0; x <= rect.width; x += 3) {
            const y = rect.height / 2 + Math.sin(x * 0.025 + w * 0.8) * (18 + w * 5);
            if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
          if (depth === 0) return;
          const x2 = x + Math.cos(angle) * len;
          const y2 = y + Math.sin(angle) * len;
          ctx.strokeStyle = depth > 3 ? "#9b8cff" : "#42d9c8";
          ctx.lineWidth = depth * 0.55;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          drawBranch(x2, y2, len * 0.72, angle - 0.48, depth - 1);
          drawBranch(x2, y2, len * 0.72, angle + 0.48, depth - 1);
        };
        drawBranch(rect.width / 2, rect.height * 0.9, rect.height * 0.22, -Math.PI / 2, 7);
      }
      if (!compact) {
        ctx.fillStyle = "rgba(255,255,255,.025)";
        for (let x = 0; x < rect.width; x += 32) {
          ctx.fillRect(x, 0, 1, rect.height);
        }
        for (let y = 0; y < rect.height; y += 32) {
          ctx.fillRect(0, y, rect.width, 1);
        }
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [variant, compact]);

  return <canvas ref={canvasRef} className={compact ? "preview-canvas compact" : "preview-canvas"} />;
}
