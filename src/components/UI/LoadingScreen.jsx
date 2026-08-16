import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useProgress, Float } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../../store/useGameStore';

// ─── 3D Genesis Diorama (Detailed Living Miniature Island) ─────

function GenesisDiorama({ progress }) {
  const groupRef = useRef();
  const campfireRef = useRef();
  const cloudsRef = useRef();
  const sparksRef = useRef();

  // Mini ember spark particles
  const sparkCount = 30;
  const [sparkPositions, sparkSeeds] = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const seeds = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 0.35;
      pos[i * 3 + 1] = Math.random() * 1.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return [pos, seeds];
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Gentle floating & smooth rotation of the entire diorama
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.4;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.1;
    }

    // Dynamic campfire flicker
    if (campfireRef.current) {
      campfireRef.current.intensity = 2.8 + Math.sin(t * 18) * 0.6 + Math.cos(t * 24) * 0.5;
    }

    // Sparks rising from campfire
    if (sparksRef.current) {
      const arr = sparksRef.current.geometry.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        arr[i * 3 + 1] += 0.022;
        arr[i * 3 + 0] += Math.sin(t * 6 + sparkSeeds[i]) * 0.005;
        if (arr[i * 3 + 1] > 1.3) {
          arr[i * 3 + 1] = 0.08;
          arr[i * 3 + 0] = (Math.random() - 0.5) * 0.25;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
        }
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Puffy clouds orbiting smoothly
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = -t * 0.25;
    }
  });

  return (
    <group>
      {/* Diorama Main Body */}
      <group ref={groupRef}>
        {/* Floating Rock Island Base - Layer 1 (Dark Bottom Spire) */}
        <mesh position={[0, -0.85, 0]}>
          <coneGeometry args={[1.2, 1.2, 7]} rotation={[Math.PI, 0, 0]} />
          <meshStandardMaterial color="#2c221e" roughness={0.9} flatShading />
        </mesh>

        {/* Floating Rock Island Base - Layer 2 (Middle Rock Strata) */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[1.6, 1.2, 0.7, 7]} />
          <meshStandardMaterial color="#423530" roughness={0.85} flatShading />
        </mesh>

        {/* Grass Top Surface */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[1.64, 1.6, 0.18, 7]} />
          <meshStandardMaterial color="#4a7c3f" roughness={0.65} flatShading />
        </mesh>

        {/* Dirt Path running through the island */}
        <mesh position={[0.1, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[0.5, 2.2]} />
          <meshStandardMaterial color="#6d5843" roughness={0.9} flatShading />
        </mesh>

        {/* ── Campfire Area ── */}
        <group position={[0.25, 0.14, 0.25]}>
          {/* Stone Circle */}
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
            const a = (idx / 7) * Math.PI * 2;
            return (
              <mesh key={idx} position={[Math.cos(a) * 0.24, 0.03, Math.sin(a) * 0.24]}>
                <dodecahedronGeometry args={[0.065, 0]} />
                <meshStandardMaterial color="#555555" roughness={0.8} flatShading />
              </mesh>
            );
          })}
          {/* Wooden Campfire Logs */}
          <mesh position={[0, 0.06, 0]} rotation={[0, 0.8, 0.6]}>
            <cylinderGeometry args={[0.03, 0.03, 0.28, 5]} />
            <meshStandardMaterial color="#3a1e05" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[0, -0.8, -0.6]}>
            <cylinderGeometry args={[0.03, 0.03, 0.28, 5]} />
            <meshStandardMaterial color="#3a1e05" roughness={0.9} />
          </mesh>
          {/* Glowing Fiery Core */}
          <mesh position={[0, 0.1, 0]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial color="#ff7700" />
          </mesh>
          <pointLight ref={campfireRef} color="#ff8822" intensity={3.5} distance={5} decay={1.5} />
          {/* Rising Sparks */}
          <points ref={sparksRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={sparkCount} array={sparkPositions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.055} color="#ffcc33" transparent opacity={0.95} blending={THREE.AdditiveBlending} />
          </points>
        </group>

        {/* ── Seating Logs beside Campfire ── */}
        <group position={[0.7, 0.12, 0.4]} rotation={[0, -0.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.55, 6]} />
            <meshStandardMaterial color="#5c3818" roughness={0.85} flatShading />
          </mesh>
        </group>
        <group position={[0.4, 0.12, 0.75]} rotation={[0, 1.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 6]} />
            <meshStandardMaterial color="#4e2f14" roughness={0.85} flatShading />
          </mesh>
        </group>

        {/* ── Mini Welcome Signpost ── */}
        <group position={[-0.3, 0.12, 1.1]} rotation={[0, 0.3, 0]}>
          {/* Post */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 4]} />
            <meshStandardMaterial color="#5c3818" roughness={0.9} />
          </mesh>
          {/* Sign board */}
          <mesh position={[0, 0.32, 0]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.3, 0.14, 0.04]} />
            <meshStandardMaterial color="#a0522d" roughness={0.8} />
          </mesh>
        </group>

        {/* ── Pine Tree 1 (Large 3-Tier Pine, NW) ── */}
        <group position={[-0.7, 0.12, -0.4]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.4, 5]} />
            <meshStandardMaterial color="#3d2314" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.42, 0.5, 6]} />
            <meshStandardMaterial color="#245120" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <coneGeometry args={[0.32, 0.45, 6]} />
            <meshStandardMaterial color="#2d6328" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <coneGeometry args={[0.22, 0.4, 6]} />
            <meshStandardMaterial color="#367530" roughness={0.7} flatShading />
          </mesh>
        </group>

        {/* ── Pine Tree 2 (Medium Pine, West) ── */}
        <group position={[-1.05, 0.12, 0.2]} scale={0.8}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 0.4, 5]} />
            <meshStandardMaterial color="#3d2314" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.35, 0.48, 5]} />
            <meshStandardMaterial color="#1e441b" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <coneGeometry args={[0.26, 0.42, 5]} />
            <meshStandardMaterial color="#265622" roughness={0.7} flatShading />
          </mesh>
        </group>

        {/* ── Pine Tree 3 (Tall Alpine Spruce, North-East) ── */}
        <group position={[0.45, 0.12, -0.85]} scale={1.1}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.055, 0.075, 0.5, 5]} />
            <meshStandardMaterial color="#3a2010" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.36, 0.55, 5]} />
            <meshStandardMaterial color="#1b4318" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.27, 0.48, 5]} />
            <meshStandardMaterial color="#235320" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 1.22, 0]}>
            <coneGeometry args={[0.18, 0.4, 5]} />
            <meshStandardMaterial color="#2d6829" roughness={0.7} flatShading />
          </mesh>
        </group>

        {/* ── Pine Tree 4 (Compact Forest Pine, South-West) ── */}
        <group position={[-0.45, 0.12, 0.95]} scale={0.7}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 0.4, 5]} />
            <meshStandardMaterial color="#3d2314" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.34, 0.45, 5]} />
            <meshStandardMaterial color="#2a5725" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <coneGeometry args={[0.24, 0.4, 5]} />
            <meshStandardMaterial color="#35682d" roughness={0.7} flatShading />
          </mesh>
        </group>

        {/* ── Deciduous Canopy Tree 1 (Lush Green Oak, East) ── */}
        <group position={[1.0, 0.12, -0.4]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.6, 5]} />
            <meshStandardMaterial color="#4a2e18" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <dodecahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial color="#3b7a30" roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0.1, 0.95, 0.05]}>
            <dodecahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color="#469339" roughness={0.6} flatShading />
          </mesh>
        </group>

        {/* ── Deciduous Canopy Tree 2 (Golden Birch, North) ── */}
        <group position={[-0.1, 0.12, -0.85]} scale={0.85}>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.045, 0.065, 0.55, 5]} />
            <meshStandardMaterial color="#ded7cc" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <dodecahedronGeometry args={[0.33, 0]} />
            <meshStandardMaterial color="#558b2f" roughness={0.6} flatShading />
          </mesh>
        </group>

        {/* ── Baby Pine Sapling (South-East) ── */}
        <group position={[0.85, 0.12, 0.65]} scale={0.55}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.35, 4]} />
            <meshStandardMaterial color="#3d2314" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <coneGeometry args={[0.3, 0.42, 5]} />
            <meshStandardMaterial color="#2d6328" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.2, 0.35, 5]} />
            <meshStandardMaterial color="#367530" roughness={0.7} flatShading />
          </mesh>
        </group>

        {/* ── Decorative Pebbles & Flowers ── */}
        <mesh position={[-0.5, 0.13, 0.8]}>
          <dodecahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#7f8c8d" roughness={0.8} />
        </mesh>
        <mesh position={[0.8, 0.13, 0.1]}>
          <dodecahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial color="#95a5a6" roughness={0.8} />
        </mesh>
      </group>

      {/* ── Orbiting Soft Puffy Clouds ── */}
      <group ref={cloudsRef}>
        <group position={[2.0, 0.1, 0]}>
          <mesh position={[0, 0, 0]}><sphereGeometry args={[0.22, 8, 8]} /><meshStandardMaterial color="#ffffff" roughness={0.3} flatShading /></mesh>
          <mesh position={[0.15, 0.05, 0]}><sphereGeometry args={[0.16, 8, 8]} /><meshStandardMaterial color="#ffffff" roughness={0.3} flatShading /></mesh>
          <mesh position={[-0.15, -0.02, 0]}><sphereGeometry args={[0.15, 8, 8]} /><meshStandardMaterial color="#ffffff" roughness={0.3} flatShading /></mesh>
        </group>
        <group position={[-1.9, -0.25, -1.0]}>
          <mesh position={[0, 0, 0]}><sphereGeometry args={[0.2, 8, 8]} /><meshStandardMaterial color="#f0f4ff" roughness={0.3} flatShading /></mesh>
          <mesh position={[0.13, 0.04, 0]}><sphereGeometry args={[0.14, 8, 8]} /><meshStandardMaterial color="#f0f4ff" roughness={0.3} flatShading /></mesh>
          <mesh position={[-0.13, 0, 0]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#f0f4ff" roughness={0.3} flatShading /></mesh>
        </group>
        <group position={[0.2, -0.5, 1.9]}>
          <mesh position={[0, 0, 0]}><sphereGeometry args={[0.18, 8, 8]} /><meshStandardMaterial color="#eef2ff" roughness={0.3} flatShading /></mesh>
          <mesh position={[0.12, 0.03, 0]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#eef2ff" roughness={0.3} flatShading /></mesh>
        </group>
      </group>

      {/* Atmospheric Lighting */}
      <directionalLight position={[4, 6, 3]} intensity={2.5} color="#fff8e7" />
      <directionalLight position={[-3, -2, -3]} intensity={0.8} color="#3867d6" />
    </group>
  );
}

// ─── Main Loading Screen ───────────────────────────────────────

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [isFading, setIsFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const setLoadingComplete = useGameStore((state) => state.setLoadingComplete);

  // Smooth local percentage tracking
  const [displayProgress, setDisplayProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const MIN_DURATION = 5000; // 5.0 seconds loading experience

  useEffect(() => {
    const startTime = startTimeRef.current;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / MIN_DURATION);
      
      // Calculate target: must honor both 3.5s pacing and real asset progress
      // Easing curve (ease-out cubic for realistic loading feel)
      const easedTime = 1 - Math.pow(1 - timeRatio, 3);
      const computedTarget = Math.round(easedTime * 100);
      
      setDisplayProgress(computedTarget);

      // Once 3.5s has elapsed and assets are ready (or progress >= 90)
      if (elapsed >= MIN_DURATION && progress >= 100) {
        clearInterval(interval);
        setDisplayProgress(100);
        
        const finishTimer = setTimeout(() => {
          setIsFading(true);
          setLoadingComplete(true); // Signal player and world right as the world starts fading in!
          setTimeout(() => {
            setHidden(true);
          }, 1100); // 1.1s cinematic fade
        }, 300);
        
        return () => clearTimeout(finishTimer);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [progress, setLoadingComplete]);

  if (hidden) return null;

  const currentPercent = Math.round(displayProgress);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#05030a',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px 20px',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        transition: 'opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1), transform 1.1s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFading ? 0 : 1,
        transform: isFading ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: isFading ? 'none' : 'auto'
      }}
    >
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 180, 80, 0.5), 0 0 40px rgba(255, 120, 0, 0.2); }
          50% { text-shadow: 0 0 35px rgba(255, 200, 100, 0.8), 0 0 70px rgba(255, 140, 20, 0.4); }
        }
        @keyframes borderGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Top Header */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div style={{
          fontSize: '11px',
          letterSpacing: '6px',
          color: 'rgba(255, 200, 100, 0.7)',
          textTransform: 'uppercase',
          marginBottom: '6px',
          fontWeight: 600
        }}>
          System Initializing
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: 800,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #ffffff 30%, #ffc837 70%, #ff8008 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'glowPulse 3s ease-in-out infinite'
        }}>
          Kishan Pokal
        </h1>
        <div style={{
          fontSize: '12px',
          letterSpacing: '4px',
          color: 'rgba(255, 255, 255, 0.4)',
          textTransform: 'uppercase',
          marginTop: '4px'
        }}>
          3D Interactive Portfolio
        </div>
      </div>

      {/* Center 3D Interactive Canvas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ width: '100vw', height: '100vh', maxWidth: '600px', maxHeight: '600px' }}>
          <Canvas
            camera={{ position: [0, 2.5, 6.0], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.7} />
            <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.5}>
              <GenesisDiorama progress={displayProgress} />
            </Float>
          </Canvas>
        </div>
      </div>

      {/* Bottom Progress & HUD Footer */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10
      }}>
        {/* Real-time Percentage & Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '12px',
          letterSpacing: '2px',
          fontFamily: "'Inter', monospace",
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <span style={{ color: 'rgba(255, 200, 100, 0.9)' }}>
            {currentPercent < 30 ? 'LOADING ASSETS...' : currentPercent < 70 ? 'GENERATING ISLAND...' : currentPercent < 100 ? 'PREPARING ENVIRONMENT...' : 'READY'}
          </span>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>
            {currentPercent}%
          </span>
        </div>

        {/* Sleek Glowing Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 0 15px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: `${currentPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ff8008, #ffc837, #00e5ff)',
            boxShadow: '0 0 12px rgba(255, 200, 50, 0.9), 0 0 24px rgba(0, 229, 255, 0.5)',
            borderRadius: '4px',
            transition: 'width 0.15s ease-out'
          }} />
        </div>

        {/* Subtle Hint */}
        <div style={{
          fontSize: '10px',
          letterSpacing: '3px',
          color: 'rgba(255, 255, 255, 0.3)',
          textTransform: 'uppercase',
          marginTop: '4px'
        }}>
          {currentPercent >= 100 ? 'ENTERING BASECAMP...' : 'INITIALIZING EXPERIENCE'}
        </div>
      </div>
    </div>
  );
}
