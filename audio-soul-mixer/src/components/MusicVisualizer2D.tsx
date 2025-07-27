import React, { useRef, useEffect, useState } from 'react';
import { X, Music, Volume2 } from 'lucide-react';

interface MusicVisualizer2DProps {
  isVisible: boolean;
  onClose: () => void;
  audioElement: HTMLAudioElement | null;
  currentTrack: {
    title: string;
    artist: string;
    artwork?: string;
  } | null;
}

const MusicVisualizer2D: React.FC<MusicVisualizer2DProps> = ({
  isVisible,
  onClose,
  audioElement,
  currentTrack
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!isVisible || !audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 200;

    // Initialize audio context and analyzer
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512; // Higher resolution for better analysis
    analyser.smoothingTimeConstant = 0.8; // Smooth transitions
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    // Connect audio element to analyzer
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    // Don't connect to destination to avoid double playback
    // analyser.connect(audioContext.destination);

    setIsAnalyzing(true);

    const animate = () => {
      if (!isVisible || !analyser || !dataArray || !ctx) return;

      animationRef.current = requestAnimationFrame(animate);
      
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e40af');
      gradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars with better audio response
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Get frequency data and apply some processing for better visual response
        const frequency = dataArray[i];
        const normalizedHeight = frequency / 255;
        
        // Apply different scaling for different frequency ranges
        let scale = 1;
        if (i < bufferLength * 0.1) scale = 1.2; // Bass frequencies
        else if (i < bufferLength * 0.3) scale = 1.0; // Mid frequencies  
        else scale = 0.8; // High frequencies
        
        barHeight = normalizedHeight * canvas.height * 0.8 * scale;

        // Create dynamic color based on frequency intensity
        const intensity = normalizedHeight;
        const r = Math.floor(255 * intensity);
        const g = Math.floor(150 + 105 * intensity);
        const b = Math.floor(255 * (1 - intensity * 0.5));

        // Create bar gradient
        const barGradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        barGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        barGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.7)`);
        barGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.3)`);

        ctx.fillStyle = barGradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Add glow effect based on intensity
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${intensity})`;
        ctx.shadowBlur = intensity * 15;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 0;

        x += barWidth + 1;
      }

      // Draw waveform line
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.moveTo(0, canvas.height / 2);

      for (let i = 0; i < bufferLength; i++) {
        const x = (i / bufferLength) * canvas.width;
        const y = (dataArray[i] / 255) * canvas.height * 0.3 + canvas.height / 2;
        ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Draw center circle that responds to bass frequencies
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Use bass frequencies (first 10% of data) for circle animation
      const bassIntensity = dataArray.slice(0, Math.floor(bufferLength * 0.1))
        .reduce((sum, val) => sum + val, 0) / (bufferLength * 0.1);
      const normalizedBass = bassIntensity / 255;
      
      const radius = 15 + normalizedBass * 25;
      const pulseRadius = radius + Math.sin(Date.now() * 0.01) * 5;

      // Draw pulsing circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + normalizedBass * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + normalizedBass * 0.5})`;
      ctx.lineWidth = 2 + normalizedBass * 3;
      ctx.stroke();
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnalyzing(false);
    };
  }, [isVisible, audioElement]);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Music Visualizer</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Track Info */}
      {currentTrack && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              {currentTrack.artwork ? (
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Canvas */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded-lg bg-gradient-to-b from-blue-600 to-blue-800"
        />
        
        {/* Status */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isAnalyzing ? 'Analyzing audio...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MusicVisualizer2D; 