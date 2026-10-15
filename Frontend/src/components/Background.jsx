import { useEffect, useRef } from "react";
import { reduce } from "../lib/utils.js";

/* Soft colour glow + the constellation (dots and lines) that sits behind the whole page. */
export default function Background({ particles, aurora, theme }) {
  const cv = useRef(null);
  const api = useRef({});

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas.getContext("2d");
    const root = document.documentElement;
    let W = 0,
      H = 0,
      pts = [],
      stars = [],
      running = false,
      raf = 0,
      rgb = "150,110,230",
      light = false;
    const mouse = { x: -9999, y: -9999 };
    const LINK = 210,
      REACH = 220;

    const colors = () => {
      rgb = (
        getComputedStyle(root).getPropertyValue("--net") || "150,110,230"
      ).trim();
      light = root.getAttribute("data-theme") === "light";
    };

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const sc = light ? rgb : "255,255,255";
      for (const s of stars) {
        ctx.fillStyle =
          "rgba(" +
          sc +
          "," +
          (
            s.a *
            (0.65 + 0.35 * Math.sin(t / 1400 + s.ph)) *
            (light ? 0.7 : 1)
          ).toFixed(3) +
          ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j],
            d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle =
              "rgba(" + rgb + "," + ((1 - d / LINK) * 0.42).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < REACH) {
          ctx.strokeStyle =
            "rgba(" + rgb + "," + ((1 - md / REACH) * 0.7).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(" + rgb + ",.95)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.9, 0, 6.2832);
        ctx.fill();
      }
    }

    function step() {
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = mouse.x - p.x,
          dy = mouse.y - p.y,
          d = Math.hypot(dx, dy);
        if (d < REACH && d > 1) {
          p.x += dx * 0.0035;
          p.y += dy * 0.0035;
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(58, Math.max(24, (W * H) / 28000)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
      stars = Array.from(
        { length: Math.round(Math.min(90, (W * H) / 20000)) },
        () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1 + 0.3,
          a: Math.random() * 0.45 + 0.15,
          ph: Math.random() * 6.28,
        }),
      );
      draw(0);
    }

    const frame = (t) => {
      if (!running) return;
      step();
      draw(t);
      raf = requestAnimationFrame(frame);
    };
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    colors();
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    api.current = {
      recolor() {
        colors();
        if (!running) draw(0);
      },
      setOn(on) {
        if (!on) {
          running = false;
          cancelAnimationFrame(raf);
          return;
        }
        colors();
        if (reduce()) {
          draw(0);
          return;
        }
        if (!running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      },
    };

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    api.current.recolor && api.current.recolor();
  }, [theme]);
  useEffect(() => {
    api.current.setOn && api.current.setOn(particles);
  }, [particles]);

  return (
    <>
      <div id="aurora" aria-hidden="true" hidden={!aurora} />
      <canvas id="bg" ref={cv} aria-hidden="true" hidden={!particles} />
    </>
  );
}
