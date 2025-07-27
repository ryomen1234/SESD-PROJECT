import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedSphereProps {
  position: [number, number, number];
  color: string;
  speed: number;
}

const AnimatedSphere: React.FC<AnimatedSphereProps> = ({ position, color, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.8, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.7}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const FloatingNotes: React.FC = () => {
  const notes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      color: `hsl(${Math.random() * 60 + 260}, 70%, 60%)`, // Purple/pink range
      speed: 0.3 + Math.random() * 0.8,
    }));
  }, []);

  return (
    <>
      {notes.map((note) => (
        <AnimatedSphere
          key={note.id}
          position={note.position}
          color={note.color}
          speed={note.speed}
        />
      ))}
    </>
  );
};

const WaveformVisualization: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const bars = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      position: [
        Math.cos((i / 32) * Math.PI * 2) * 4,
        0,
        Math.sin((i / 32) * Math.PI * 2) * 4,
      ] as [number, number, number],
      height: 0.5 + Math.random() * 2.5,
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {bars.map((bar, index) => (
        <mesh key={bar.id} position={bar.position}>
          <boxGeometry args={[0.15, bar.height, 0.15]} />
          <meshStandardMaterial
            color={`hsl(${(index / 32) * 360 + 240}, 70%, 60%)`}
            emissive={`hsl(${(index / 32) * 360 + 240}, 30%, 20%)`}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

const MusicVisualizer3D: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // Handle context loss
    const handleContextLost = () => {
      setContextLost(true);
      console.warn('WebGL context lost');
    };

    const handleContextRestored = () => {
      setContextLost(false);
      console.log('WebGL context restored');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="relative w-full h-[400px] lg:h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
        <div className="text-center text-white/80">
          <div className="text-2xl mb-2">🎵</div>
          <p className="text-sm">WebGL not supported</p>
          <p className="text-xs text-white/60">3D visualization unavailable</p>
        </div>
      </div>
    );
  }

  if (contextLost) {
    return (
      <div className="relative w-full h-[400px] lg:h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
        <div className="text-center text-white/80">
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-sm">WebGL context lost</p>
          <p className="text-xs text-white/60">Refreshing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] lg:h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        className="w-full h-full"
      >
        {/* Basic lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff6b9d" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4ecdc4" />
        
        {/* 3D Components */}
        <FloatingNotes />
        <WaveformVisualization />
        
        {/* Simple background */}
        <mesh position={[0, 0, -10]}>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial color="#0a0a0a" transparent opacity={0.3} />
        </mesh>
        
        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-white/80 text-sm font-mono bg-black/20 px-2 py-1 rounded">
          🎵 Music Visualizer 3D
        </div>
        <div className="absolute bottom-4 right-4 text-white/60 text-xs bg-black/20 px-2 py-1 rounded">
          Drag to explore • Auto-rotating
        </div>
        <div className="absolute top-4 right-4 text-white/70 text-xs">
          <div className="flex items-center space-x-2 bg-black/20 px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Audio Visualization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicVisualizer3D; 