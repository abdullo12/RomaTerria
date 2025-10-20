import { useState, useCallback } from 'react';
import { Shot } from '../types';

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');

  const processVideo = useCallback(async (file: File): Promise<Shot[]> => {
    setIsProcessing(true);
    setProcessingProgress('Анализ видео...');

    try {
      const frames = await extractFramesFromVideo(file);
      setProcessingProgress(`Извлечено ${frames.length} кадров`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress('Видео успешно обработано!');
      
      return frames;
    } catch (error) {
      console.error('Error processing video:', error);
      setProcessingProgress(`Ошибка: ${error.message}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    processingProgress,
    processVideo
  };
};

const extractFramesFromVideo = async (videoFile: File): Promise<Shot[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
      reject(new Error('Video failed to load'));
    });
    
    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      if (duration === 0 || isNaN(duration)) {
        reject(new Error('Invalid video duration'));
        return;
      }
      
      console.log(`Video duration: ${duration}s, resolution: ${video.videoWidth}x${video.videoHeight}`);
      
      const frames: Shot[] = [];
      
      let frameCount: number;
      
      if (duration <= 30) {
        frameCount = Math.floor(duration / 3);
      } else if (duration <= 120) {
        frameCount = Math.floor(duration / 5);
      } else {
        frameCount = Math.min(30, Math.floor(duration / 8));
      }
      
      const startTime = Math.min(2, duration * 0.1);
      const endTime = Math.max(duration - 2, duration * 0.9);
      
      const frameTimes = new Set<number>();
      frameTimes.add(startTime);
      
      for (let i = 1; i <= frameCount; i++) {
        const time = (i / (frameCount + 1)) * duration;
        frameTimes.add(time);
      }
      
      frameTimes.add(endTime);
      
      const sortedTimes = Array.from(frameTimes).sort((a, b) => a - b);
      console.log(`Will extract ${sortedTimes.length} frames at times:`, sortedTimes);
      
      let currentFrameIndex = 0;
      
      const extractFrame = () => {
        if (currentFrameIndex >= sortedTimes.length) {
          console.log('Frame extraction completed:', frames.length, 'frames');
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }
        
        const time = sortedTimes[currentFrameIndex];
        video.currentTime = time;
        
        video.addEventListener('seeked', () => {
          try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const thumbnail = canvas.toDataURL('image/jpeg', 0.85);
            const timestamp = formatTime(time);
            
            frames.push({
              id: currentFrameIndex + 1,
              thumbnail,
              timestamp,
              selected: false,
              timeInSeconds: time
            });
            
            console.log(`Extracted frame ${currentFrameIndex + 1}/${sortedTimes.length} at ${timestamp} (${time.toFixed(1)}s)`);
            currentFrameIndex++;
            extractFrame();
          } catch (error) {
            console.error('Error extracting frame:', error);
            reject(error);
          }
        }, { once: true });
      };
      
      extractFrame();
    });
    
    video.src = URL.createObjectURL(videoFile);
  });
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
