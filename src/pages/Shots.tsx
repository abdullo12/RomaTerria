import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal.tsx';
import { Shot } from '../types';

interface ShotsProps {
  isDarkMode: boolean;
  selectedShots: number[];
  onSelectedShotsChange: (shots: number[]) => void;
  videoFile: File | null;
  videoFrames: Shot[];
  onVideoFramesChange: (frames: Shot[]) => void;
  videoId?: string | null;
}

const Shots: React.FC<ShotsProps> = ({ isDarkMode, selectedShots, onSelectedShotsChange, videoFile, videoFrames, onVideoFramesChange, videoId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);

  const loadFramesFromServer = async (videoId: string) => {
    try {
      console.log('Loading frames from server for video:', videoId);
      const response = await fetch(`http://localhost:3003/api/frames/${videoId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.frames) {
        console.log('Frames loaded from server:', result.frames.length);
        onVideoFramesChange(result.frames);
        return result.frames;
      } else {
        throw new Error('No frames received from server');
      }
    } catch (error) {
      console.error('Error loading frames from server:', error);
      return [];
    }
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    console.log('useEffect triggered:', { 
      videoFile: !!videoFile, 
      videoFramesLength: videoFrames.length,
      videoId: videoId 
    });
    
    if (videoId && videoFrames.length === 0) {
      console.log('Loading frames from server for videoId:', videoId);
      setIsExtractingFrames(true);
      loadFramesFromServer(videoId).finally(() => setIsExtractingFrames(false));
    }
  }, [videoFile, videoFrames.length, onVideoFramesChange, videoId]);

  // Mock data for shots (fallback)
  const generateMockShots = (): Shot[] => {
    const shots: Shot[] = [];
    for (let i = 1; i <= 50; i++) {
      shots.push({
        id: i,
        thumbnail: `https://picsum.photos/300/200?random=${i}`,
        timestamp: `${Math.floor(i / 10)}:${(i % 10) * 6}`,
        selected: false,
      });
    }
    return shots;
  };

  const shots = videoFrames;
  console.log('Current shots:', { 
    videoFramesLength: videoFrames.length, 
    shotsLength: shots.length, 
    isExtractingFrames,
    videoFile: !!videoFile 
  });
  const shotsPerPage = 10;
  const totalPages = Math.ceil(shots.length / shotsPerPage);
  const startIndex = (currentPage - 1) * shotsPerPage;
  const currentShots = shots.slice(startIndex, startIndex + shotsPerPage);

  const handleSelectShot = (shot: Shot) => {
    setSelectedShot(shot);
    // Update selection state
    const isSelected = selectedShots.includes(shot.id);
    if (isSelected) {
      onSelectedShotsChange(selectedShots.filter(id => id !== shot.id));
    } else {
      onSelectedShotsChange([...selectedShots, shot.id]);
    }
  };

  const handleEnlargeShot = (shot: Shot) => {
    setSelectedShot(shot);
    setIsModalOpen(true);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Кадры видео</h1>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isExtractingFrames ? (
              <span>Извлечение кадров...</span>
            ) : (
              <span>Страница {currentPage} из {totalPages} • {shots.length} кадров всего</span>
            )}
          </div>
        </div>

        {isExtractingFrames ? (
          <div className="text-center py-12">
            <div className={`text-6xl mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>🎬</div>
            <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Извлечение кадров из видео
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Пожалуйста, подождите...
            </p>
          </div>
        ) : (
          <>
            {/* 5x2 Grid */}
            <div className="grid grid-cols-5 gap-6 mb-8">
          {currentShots.map((shot) => (
            <div
              key={shot.id}
              className={`rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                selectedShots.includes(shot.id) ? 'ring-2 ring-blue-500' : ''
              } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={() => handleSelectShot(shot)}
            >
              <div className="relative">
                <img
                  src={shot.thumbnail}
                  alt={`Shot ${shot.id}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {shot.timestamp}
                </div>
                {selectedShots.includes(shot.id) && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      ✓ Выбрано
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Кадр #{shot.id}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnlargeShot(shot);
                    }}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Увеличить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ← Предыдущая
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Следующая →
          </button>
        </div>
          </>
        )}

        {/* Selected shots summary */}
        {selectedShots.length > 0 && (
          <div className={`mt-8 p-4 rounded-lg ${
            isDarkMode ? 'bg-blue-900' : 'bg-blue-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Выбранные кадры ({selectedShots.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedShots.map(shotId => (
                <span
                  key={shotId}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? 'bg-blue-800 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  Shot #{shotId}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for enlarged view */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isDarkMode={isDarkMode}>
        {selectedShot && (
          <div className="p-6">
            <div className="text-center">
              <img
                src={selectedShot.thumbnail}
                alt={`Кадр ${selectedShot.id}`}
                className="max-w-full max-h-[70vh] w-auto h-auto rounded-lg shadow-lg mx-auto"
              />
              <div className="mt-6">
                <h3 className={`text-2xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Кадр #{selectedShot.id}
                </h3>
                <p className={`text-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Временная метка: {selectedShot.timestamp}
                </p>
                <div className={`mt-4 px-4 py-2 rounded-lg inline-block ${
                  selectedShots.includes(selectedShot.id)
                    ? isDarkMode
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedShots.includes(selectedShot.id) ? '✓ Выбран' : '○ Не выбран'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Shots;
