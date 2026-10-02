'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPreviewProps {
  src?: string;
}

export function VideoPreview({ src }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-black relative group">
      {src ? (
        <>
          {/* Video element */}
          <video
            ref={videoRef}
            src={src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-contain"
          />

          {/* Controls overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex flex-col justify-between p-4">
            {/* Play button */}
            <div className="flex-1 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 bg-qc-primary hover:bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 ml-1" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-qc-border rounded appearance-none cursor-pointer accent-qc-primary"
              />
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Mute button (always visible) */}
          <button
            onClick={handleMute}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-lg transition z-10"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No media selected</p>
            <p className="text-sm">Upload or select a media file to preview</p>
          </div>
        </div>
      )}
    </div>
  );
          }
