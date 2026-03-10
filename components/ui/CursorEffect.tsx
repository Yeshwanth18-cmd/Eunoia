"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isEnabled, setIsEnabled] = useState(true);

    // Initial check and event listener for toggle
    useEffect(() => {
        const checkEnabled = () => {
            const saved = localStorage.getItem("cursorEffectEnabled");
            if (saved !== null) {
                setIsEnabled(saved === "true");
            }
        };

        checkEnabled();

        const handleStorageChange = () => checkEnabled();
        window.addEventListener("cursor-effect-toggle", handleStorageChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("cursor-effect-toggle", handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (!isEnabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let mouseX = 0;
        let mouseY = 0;

        // Grid System (Static Dots)
        const spacing = 30; // Spacing for grid
        let dots: Dot[] = [];

        class Dot {
            x: number;
            y: number;
            baseSize: number;
            color: string;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseSize = 1.2;
                this.color = Math.random() > 0.5 ? "212, 175, 55" : "100, 149, 237";
            }

            draw() {
                if (!ctx) return;

                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const maxDist = 160; // 160px Radius
                let alpha = 0.05;
                let scale = 1;

                if (dist < maxDist) {
                    const intensity = (maxDist - dist) / maxDist;
                    alpha += intensity * 0.8;
                    scale = 1 + intensity * 1.2;
                }

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.baseSize * scale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
                ctx.fill();
            }
        }

        const initDots = () => {
            if (!canvas) return;
            dots = []; // Clear existing
            const cols = Math.ceil(canvas.width / spacing);
            const rows = Math.ceil(canvas.height / spacing);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push(new Dot(i * spacing, j * spacing));
                }
            }
        };

        // Resize handling
        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots(); // Regenerate dots on resize
        };
        window.addEventListener("resize", resize);
        resize();

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            dots.forEach(dot => dot.draw());

            // Larger Spotlight Glow
            const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isEnabled]);

    if (!isEnabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
}
