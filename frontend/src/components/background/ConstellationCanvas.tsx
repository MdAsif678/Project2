import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  radius: number;
}

interface Packet {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

export const ConstellationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const isMobile = width < 768;
    const spacing = isMobile ? 48 : 36;
    const maxConnectionDist = isMobile ? 90 : 120;
    const repulsionRadius = 180;
    const damping = 0.85;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Initialize Grid Nodes
    let nodes: Node[] = [];
    const initNodes = () => {
      nodes = [];
      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const jitterX = (Math.random() - 0.5) * spacing * 0.4;
          const jitterY = (Math.random() - 0.5) * spacing * 0.4;
          const x = i * spacing + jitterX;
          const y = j * spacing + jitterY;
          nodes.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.005 + Math.random() * 0.01,
            radius: 1.2 + Math.random() * 0.6,
          });
        }
      }
    };

    initNodes();

    // Data packets travelling between nearby nodes
    const packets: Packet[] = [];
    const packetColors = ['#6366f1', '#a855f7', '#00ff88', '#00f0ff'];

    const spawnPacket = () => {
      if (nodes.length < 2 || packets.length > 15) return;
      const from = Math.floor(Math.random() * nodes.length);
      // Find a close node
      const fromNode = nodes[from];
      const candidates: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue;
        const dx = nodes[i].x - fromNode.x;
        const dy = nodes[i].y - fromNode.y;
        if (dx * dx + dy * dy < maxConnectionDist * maxConnectionDist) {
          candidates.push(i);
        }
      }
      if (candidates.length > 0) {
        const to = candidates[Math.floor(Math.random() * candidates.length)];
        packets.push({
          fromNode: from,
          toNode: to,
          progress: 0,
          speed: 0.015 + Math.random() * 0.02,
          color: packetColors[Math.floor(Math.random() * packetColors.length)],
        });
      }
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // Chance to spawn packet
      if (Math.random() < 0.1) spawnPacket();

      // 1. Update & Physics on Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Ambient sine drift
        n.phase += n.speed;
        const ambientX = Math.sin(n.phase) * 3;
        const ambientY = Math.cos(n.phase * 0.8) * 3;

        // Mouse repulsion
        const dx = n.x - mouseX;
        const dy = n.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < repulsionRadius * repulsionRadius && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / repulsionRadius) * 4;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }

        // Return to origin spring
        const ox = n.originX + ambientX;
        const oy = n.originY + ambientY;
        const springForceX = (ox - n.x) * 0.04;
        const springForceY = (oy - n.y) * 0.04;

        n.vx = (n.vx + springForceX) * damping;
        n.vy = (n.vy + springForceY) * damping;

        n.x += n.vx;
        n.y += n.vy;
      }

      // 2. Draw Connections
      for (let i = 0; i < nodes.length; i++) {
        const na = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nb = nodes[j];
          const dx = na.x - nb.x;
          const dy = na.y - nb.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectionDist * maxConnectionDist) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxConnectionDist) * 0.12;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.x - mouseX;
        const dy = n.y - mouseY;
        const isNearMouse = dx * dx + dy * dy < repulsionRadius * repulsionRadius;

        ctx.fillStyle = isNearMouse ? 'rgba(99, 102, 241, 0.7)' : 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, isNearMouse ? n.radius * 1.5 : n.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Update & Draw Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const na = nodes[p.fromNode];
        const nb = nodes[p.toNode];
        if (!na || !nb) continue;

        const px = na.x + (nb.x - na.x) * p.progress;
        const py = na.y + (nb.y - na.y) * p.progress;

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-90"
      style={{ willChange: 'transform' }}
    />
  );
};
