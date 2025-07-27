import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const MusicVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisualizerOn, setIsVisualizerOn] = useState(true);
  const [volume, setVolume] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Sample audio data for visualization
  const generateSampleData = () => {
    const data = new Uint8Array(128);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 255;
    }
    return data;
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisualizerOn) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Generate sample frequency data
    const data = generateSampleData();
    const barWidth = width / data.length;
    const barMaxHeight = height * 0.8;

    // Draw bars
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * barMaxHeight;
      const x = i * barWidth;
      const y = height - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, `hsl(${200 + (i * 2) % 60}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${200 + (i * 2) % 60}, 70%, 30%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(drawVisualizer);
  };

  useEffect(() => {
    if (isVisualizerOn && isPlaying) {
      drawVisualizer();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisualizerOn, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleVisualizer = () => {
    setIsVisualizerOn(!isVisualizerOn);
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 50 : 0);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Music <span className="text-primary">Visualizer</span>
            </h1>
            <p className="text-xl text-gray-600">
              Experience your music with dynamic visual effects
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Play/Pause */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Playback</span>
                  <Button
                    onClick={togglePlayback}
                    variant={isPlaying ? "destructive" : "default"}
                    size="sm"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                </div>

                {/* Visualizer Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visualizer</span>
                  <Switch
                    checked={isVisualizerOn}
                    onCheckedChange={toggleVisualizer}
                  />
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volume</span>
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                    >
                      {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {volume}%
                  </div>
                </div>

                {/* Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={isPlaying ? "text-green-400" : "text-red-400"}>
                        {isPlaying ? "Playing" : "Paused"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visualizer:</span>
                      <span className={isVisualizerOn ? "text-green-400" : "text-gray-400"}>
                        {isVisualizerOn ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visualizer Canvas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Visualizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={400}
                      className="w-full h-64 bg-black rounded-lg border"
                    />
                    {!isVisualizerOn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <p className="text-white text-lg">Visualizer Disabled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  <strong>How it works:</strong> This visualizer creates dynamic bars that respond to audio frequency data.
                </p>
                <p className="text-sm">
                  Toggle the visualizer on/off and control playback to see the effects in real-time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MusicVisualizer; 