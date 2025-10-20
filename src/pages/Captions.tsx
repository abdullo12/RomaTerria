import React, { useState } from 'react';
import { Shot, CaptionData } from '../types';

interface CaptionsProps {
  isDarkMode: boolean;
  selectedShots: number[];
  captions: CaptionData[];
  onCaptionsChange: (captions: CaptionData[]) => void;
  videoFrames: Shot[];
}

const Captions: React.FC<CaptionsProps> = ({ isDarkMode, selectedShots, captions, onCaptionsChange, videoFrames }) => {
  const [selectedCaption, setSelectedCaption] = useState<CaptionData | null>(null);
  const [editingCaption, setEditingCaption] = useState<CaptionData | null>(null);
  const [editText, setEditText] = useState('');

  const getFrameData = (shotId: number): Shot | undefined => {
    return videoFrames.find(frame => frame.id === shotId);
  };

  // Generate captions for selected shots
  const generateCaptionsForShots = () => {
    const autoCaptions = [
      "A person walking down a busy street",
      "Close-up of hands typing on a keyboard", 
      "Sunset over a mountain landscape",
      "A cat sitting on a windowsill",
      "Raindrops falling on a window",
      "A chef preparing food in a kitchen",
      "Children playing in a park",
      "A car driving through city traffic",
      "Ocean waves crashing on the shore",
      "A bird flying across the sky",
      "A dog running in a field",
      "A city skyline at night",
      "A flower blooming in spring",
      "A train arriving at a station",
      "A person reading a book"
    ];

    const newCaptions: CaptionData[] = selectedShots.map((shotId, index) => ({
      id: Date.now() + index,
      shotId: shotId,
      frameName: `Frame_${shotId}`,
      captionText: autoCaptions[index % autoCaptions.length] || `Auto-generated caption for shot ${shotId}`,
      timestamp: `${Math.floor(shotId / 10)}:${(shotId % 10) * 6}`,
    }));

    onCaptionsChange([...captions, ...newCaptions]);
  };

  const handleGenerateCaption = async (shotId: number) => {
    // Generate caption logic without loading animation
    
    const autoCaptions = [
      "A person walking down a busy street",
      "Close-up of hands typing on a keyboard",
      "Sunset over a mountain landscape", 
      "A cat sitting on a windowsill",
      "Raindrops falling on a window"
    ];
    
    const newCaption: CaptionData = {
      id: Date.now(),
      shotId: shotId,
      frameName: `Frame_${shotId}`,
      captionText: autoCaptions[Math.floor(Math.random() * autoCaptions.length)],
      timestamp: `${Math.floor(shotId / 10)}:${(shotId % 10) * 6}`,
    };

    // Check if caption already exists for this shot
    const existingCaptionIndex = captions.findIndex(c => c.shotId === shotId);
    if (existingCaptionIndex >= 0) {
      // Update existing caption
      const updatedCaptions = [...captions];
      updatedCaptions[existingCaptionIndex] = newCaption;
      onCaptionsChange(updatedCaptions);
    } else {
      // Add new caption
      onCaptionsChange([...captions, newCaption]);
    }
  };

  const handleEditCaption = (captionId: number, newText: string) => {
    const updatedCaptions = captions.map(caption => 
      caption.id === captionId ? { ...caption, captionText: newText } : caption
    );
    onCaptionsChange(updatedCaptions);
  };

  const handleStartEdit = (caption: CaptionData) => {
    setEditingCaption(caption);
    setEditText(caption.captionText);
  };

  const handleSaveEdit = () => {
    if (editingCaption) {
      handleEditCaption(editingCaption.id, editText);
      setEditingCaption(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCaption(null);
    setEditText('');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Captions</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Выберите кадры и сгенерируйте подписи для них</p>
          {selectedShots.length === 0 && (
            <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'}`}>
              <p className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                ⚠️ Сначала выберите кадры на странице "Кадры", чтобы создать для них подписи
              </p>
            </div>
          )}
        </div>

        {selectedShots.length > 0 ? (
          <div className="space-y-6">
            {/* Selected Shots List */}
            <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Выбранные кадры ({selectedShots.length})
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedShots.map((shotId) => {
                  const existingCaption = captions.find(c => c.shotId === shotId);
                  const frameData = getFrameData(shotId);
                  return (
                    <div
                      key={shotId}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        existingCaption 
                          ? isDarkMode 
                            ? 'border-green-500 bg-green-900/20' 
                            : 'border-green-500 bg-green-50'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700'
                            : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        {/* Миниатюра кадра */}
                        <div className="mb-3">
                          {frameData?.thumbnail ? (
                            <img 
                              src={frameData.thumbnail} 
                              alt={`Frame ${shotId}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-300"
                            />
                          ) : (
                            <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center ${
                              isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
                            }`}>
                              <span className={`text-2xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                🎬
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {frameData ? `Frame_${frameData.id}` : `Frame_${shotId}`}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Shot #{shotId}
                        </p>
                        {frameData?.timestamp && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {frameData.timestamp}
                          </p>
                        )}
                        
                        {existingCaption ? (
                          <div className="mt-3">
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700'
                            }`}>
                              ✓ Подпись создана
                            </div>
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {existingCaption.captionText.length > 50 
                                ? existingCaption.captionText.substring(0, 50) + '...'
                                : existingCaption.captionText
                              }
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateCaption(shotId)}
                            className={`mt-3 px-3 py-1 text-xs rounded-lg transition-colors ${
                              isDarkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            Сгенерировать
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Captions List */}
            {captions.length > 0 && (
              <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Созданные Captions ({captions.length})
                </h2>
                
                <div className="space-y-4">
                  {captions.map((caption) => {
                    const frameData = getFrameData(caption.shotId);
                    return (
                      <div
                        key={caption.id}
                        className={`p-4 rounded-lg border transition-all ${
                          editingCaption?.id === caption.id
                            ? isDarkMode
                              ? 'border-purple-400 bg-purple-900/20'
                              : 'border-purple-500 bg-purple-50'
                            : isDarkMode
                              ? 'border-gray-600 bg-gray-700'
                              : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex gap-4 mb-3">
                          {/* Миниатюра кадра */}
                          <div className="flex-shrink-0">
                            {frameData?.thumbnail ? (
                              <img 
                                src={frameData.thumbnail} 
                                alt={`Frame ${caption.shotId}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${
                                isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
                              }`}>
                                <span className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  🎬
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Информация о кадре */}
                          <div className="flex-1">
                            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                              {frameData ? `Frame_${frameData.id}` : caption.frameName} (Shot #{caption.shotId})
                            </h3>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {frameData?.timestamp || caption.timestamp}
                            </p>
                          </div>
                          
                          {/* Кнопки управления */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartEdit(caption)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                isDarkMode
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              ✏️ Редактировать
                            </button>
                            <button
                              onClick={() => handleGenerateCaption(caption.shotId)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                isDarkMode
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              🔄 Перегенерировать
                            </button>
                          </div>
                        </div>
                        
                        {editingCaption?.id === caption.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              placeholder="Введите текст caption..."
                              className={`w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                ✅ Сохранить
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                              >
                                ❌ Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {caption.captionText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">🎬</div>
            <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Нет выбранных кадров
            </h2>
            <p>Перейдите на страницу "Кадры" и выберите кадры для создания подписей</p>
          </div>
        )}

        {/* Summary */}
        {selectedShots.length > 0 && (
          <div className={`mt-8 p-4 rounded-lg ${
            isDarkMode ? 'bg-blue-900' : 'bg-blue-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Сводка Captions
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Выбрано кадров:</span> {selectedShots.length}
              </div>
              <div>
                <span className="font-medium">Создано Captions:</span> {captions.length}
              </div>
              <div>
                <span className="font-medium">Осталось создать:</span> {selectedShots.length - captions.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Captions;
