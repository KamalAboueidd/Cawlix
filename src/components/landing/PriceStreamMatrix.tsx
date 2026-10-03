import { useEffect, useRef, useState } from 'react';
import { Activity, Zap, Cpu, Server } from 'lucide-react';

interface RetailerNode {
  name: string;
  code: string;
  latency: number;
  lastPrice: string;
  delta: string;
  isSpike: boolean;
}

const INITIAL_NODES: RetailerNode[] = [
  { name: 'Amazon EG', code: 'AMZ_EG', latency: 68, lastPrice: 'EGP 42,999', delta: '-4.2%', isSpike: false },
  { name: 'Noon Egypt', code: 'NOON_EG', latency: 84, lastPrice: 'EGP 43,450', delta: '+1.1%', isSpike: false },
  { name: 'B.TECH', code: 'BTECH_SYS', latency: 112, lastPrice: 'EGP 45,999', delta: '+12.4%', isSpike: true },
  { name: '2B Egypt', code: 'TWOB_HW', latency: 95, lastPrice: 'EGP 42,800', delta: '-5.1%', isSpike: false },
  { name: 'Raya Shop', code: 'RAYA_MKT', latency: 130, lastPrice: 'EGP 44,200', delta: '0.0%', isSpike: false },
  { name: 'Tradeline', code: 'TLINE_APL', latency: 74, lastPrice: 'EGP 46,500', delta: '+2.0%', isSpike: false },
  { name: 'Sharaf DG', code: 'SHARAF_EG', latency: 104, lastPrice: 'EGP 43,900', delta: '-1.8%', isSpike: false },
  { name: 'Dream 2000', code: 'DREAM_MOB', latency: 142, lastPrice: 'EGP 42,650', delta: '-6.0%', isSpike: false },
  { name: 'El-Araby Group', code: 'ARABY_CORP', latency: 118, lastPrice: 'EGP 44,800', delta: '+3.5%', isSpike: false },
  { name: 'Dubai Phone', code: 'DUBAI_PH', latency: 136, lastPrice: 'EGP 42,900', delta: '-2.2%', isSpike: false },
  { name: 'CompuMe', code: 'COMPU_ME', latency: 125, lastPrice: 'EGP 43,200', delta: '-0.5%', isSpike: false },
  { name: 'Vodafone Store', code: 'VF_RETAIL', latency: 88, lastPrice: 'EGP 44,999', delta: '+0.8%', isSpike: false },
];

export default function PriceStreamMatrix() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<RetailerNode[]>(INITIAL_NODES);
  const [packetCount, setPacketCount] = useState(14820);
  const [avgLatency, setAvgLatency] = useState(98);

  // High-performance laser wave canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // Particle streams
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * (canvas.width / 2),
      y: Math.random() * (canvas.height / 2),
      speed: 1.5 + Math.random() * 2.5,
      radius: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.7,
      streamIndex: Math.floor(Math.random() * 4),
    }));

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSpacing = 32;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw multi-harmonic laser fiber waves
      const waveConfigs = [
        { freq: 0.012, amp: 26, speed: 0.035, color: '#3ECF8E', glow: 'rgba(62, 207, 142, 0.28)', width: 2.2 },
        { freq: 0.02, amp: 18, speed: 0.028, color: 'rgba(62, 207, 142, 0.55)', glow: 'rgba(62, 207, 142, 0.15)', width: 1.5 },
        { freq: 0.008, amp: 38, speed: 0.02, color: 'rgba(255, 255, 255, 0.35)', glow: 'rgba(255, 255, 255, 0.1)', width: 1.0 },
      ];

      waveConfigs.forEach((cfg, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = cfg.color;
        ctx.shadowColor = cfg.glow;
        ctx.shadowBlur = 12;
        ctx.lineWidth = cfg.width;

        const centerY = h * 0.45 + idx * 8;
        for (let x = 0; x <= w; x += 4) {
          const y = centerY + Math.sin(x * cfg.freq + step * cfg.speed) * cfg.amp * Math.cos(x * 0.003);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // Draw flowing data packets along fiber rails
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > w) {
          p.x = 0;
          p.y = h * 0.2 + Math.random() * (h * 0.6);
        }

        const waveY = h * 0.45 + Math.sin(p.x * 0.012 + step * 0.035) * 26;
        const currentY = (p.y + waveY) / 2;

        ctx.beginPath();
        ctx.arc(p.x, currentY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(62, 207, 142, ${p.opacity})`;
        ctx.shadowColor = '#3ECF8E';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Data tail
        ctx.beginPath();
        ctx.moveTo(p.x - p.speed * 4, currentY);
        ctx.lineTo(p.x, currentY);
        ctx.strokeStyle = `rgba(62, 207, 142, ${p.opacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      step += 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Periodic telemetry refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount((prev) => prev + Math.floor(18 + Math.random() * 24));
      setAvgLatency((prev) => Math.round(92 + (Math.random() * 14 - 7)));

      // Random jitter on a single retailer node
      setNodes((prev) => {
        const copy = [...prev];
        const targetIdx = Math.floor(Math.random() * copy.length);
        const node = { ...copy[targetIdx] };
        node.latency = Math.max(55, Math.min(185, node.latency + Math.floor(Math.random() * 11 - 5)));
        copy[targetIdx] = node;
        return copy;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: '#0B0B0B',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Telemetry Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.015)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={14} color="#3ECF8E" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            PRICE_STREAM_MATRIX // FIBER_WAVE_BUS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#737373',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              paddingLeft: '10px',
            }}
          >
            12 EGYPT RETAILERS CONCURRENT
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={12} color="#3ECF8E" />
            <span style={{ color: '#737373' }}>THROUGHPUT:</span>
            <span style={{ color: '#FFFFFF' }}>{packetCount.toLocaleString()} pings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={12} color="#3ECF8E" />
            <span style={{ color: '#737373' }}>AVG_LATENCY:</span>
            <span style={{ color: '#3ECF8E', fontWeight: 600 }}>{avgLatency}ms</span>
          </div>
        </div>
      </div>

      {/* Fiber Laser Wave Visual Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: '#080808' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {/* Floating Telemetry Annotation */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: '#737373',
            background: 'rgba(10, 10, 10, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            pointerEvents: 'none',
          }}
        >
          ACTIVE CARRIER: DUAL-POLARIZED WEBSOCKET PIPELINE · ZERO BUFFER BLOAT
        </div>
      </div>

      {/* 12 Retailer Nodes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {nodes.map((node) => (
          <div
            key={node.code}
            style={{
              background: '#0D0D0D',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                {node.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: node.latency < 90 ? '#3ECF8E' : node.latency < 130 ? '#EAB308' : '#EF4444',
                }}
              >
                {node.latency}ms
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#D4D4D4' }}>
                {node.lastPrice}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: node.delta.startsWith('-') ? '#3ECF8E' : node.isSpike ? '#EF4444' : '#737373',
                }}
              >
                {node.delta}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: node.isSpike ? '#EF4444' : '#3ECF8E',
                  boxShadow: node.isSpike ? '0 0 6px #EF4444' : '0 0 6px #3ECF8E',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  color: node.isSpike ? '#EF4444' : '#737373',
                  letterSpacing: '0.04em',
                }}
              >
                {node.isSpike ? 'SPIKE_INTERCEPTED' : 'STREAM_ACTIVE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
