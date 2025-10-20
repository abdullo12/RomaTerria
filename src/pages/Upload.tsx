import React, { useState, useCallback, useEffect } from 'react';

interface UploadProps {
  isDarkMode: boolean;
  onNavigateToShots?: () => void;
  onVideoUploaded?: (file: File) => void;
  onVideoProcessed?: (videoId: string, frames: any[]) => void;
}

const Upload: React.FC<UploadProps> = ({ isDarkMode, onNavigateToShots, onVideoUploaded, onVideoProcessed }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Call onVideoUploaded when uploadedFile changes
  useEffect(() => {
    if (uploadedFile && onVideoUploaded) {
      console.log('File uploaded, calling onVideoUploaded:', uploadedFile.name);
      onVideoUploaded(uploadedFile);
    }
  }, [uploadedFile, onVideoUploaded]);

  const extractFramesFromVideo = async (videoFile: File): Promise<any[]> => {
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
        
        const frames: any[] = [];
        
        let frameCount: number;
        let frameInterval: number;
        
        if (duration <= 30) {
          frameInterval = 3;
          frameCount = Math.floor(duration / frameInterval);
        } else if (duration <= 120) {
          frameInterval = 5;
          frameCount = Math.floor(duration / frameInterval);
        } else {
          frameInterval = 8;
          frameCount = Math.min(30, Math.floor(duration / frameInterval));
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

  const processVideo = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress('Загрузка видео на сервер...');

    try {
      const formData = new FormData();
      formData.append('video', file);

      setProcessingProgress('Обработка видео Python скриптом...');

      const response = await fetch('http://localhost:3003/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setProcessingProgress(`Извлечено ${result.frames.length} кадров`);
        
        await new Promise(resolve => setTimeout(resolve, 500));

        setProcessingProgress('Видео успешно обработано!');
        console.log('Video processed by server:', result.frames.length, 'frames');

        if (onVideoProcessed) {
          onVideoProcessed(result.videoId, result.frames);
        }

        return { success: true, frames: result.frames };
      } else {
        throw new Error(result.error || 'Неизвестная ошибка сервера');
      }
    } catch (error) {
      console.error('Error processing video:', error);
      setProcessingProgress(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      setUploadedFile(videoFile);
      processVideo(videoFile);
    }
  }, [onVideoProcessed]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      processVideo(file);
    }
  }, [onVideoProcessed]);

  const handleNavigateToShots = () => {
    if (onNavigateToShots) {
      onNavigateToShots();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Загрузка видео</h1>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragOver
              ? isDarkMode
                ? 'border-blue-400 bg-blue-900'
                : 'border-blue-500 bg-blue-50'
              : isDarkMode
                ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <div className="text-green-600 text-6xl">✅</div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Файл успешно загружен</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                Размер: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {processingProgress}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-400 text-6xl">📹</div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Перетащите видео сюда
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>или нажмите для выбора файла</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Выбрать видео файл
              </label>
            </div>
          )}
        </div>

        {uploadedFile && !isProcessing && (
          <div className="mt-8 text-center">
            <button 
              onClick={handleNavigateToShots}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Перейти к кадрам
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;