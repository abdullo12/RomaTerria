import React, { useState } from 'react';
import { Shot, CaptionData } from '../types';

interface ExportProps {
  isDarkMode: boolean;
  selectedShots: number[];
  videoFrames: Shot[];
  captions: CaptionData[];
}

const Export: React.FC<ExportProps> = ({ isDarkMode, selectedShots, videoFrames, captions }) => {
  const getProjectStats = () => {
    const totalFrames = videoFrames.length;
    const selectedFramesCount = selectedShots.length;
    const captionsCount = captions.length;
    const editedCaptionsCount = captions.filter(caption => 
      caption.captionText && caption.captionText.trim() !== ''
    ).length;
    
    const captionsForSelectedFrames = captions.filter(caption => 
      selectedShots.includes(caption.shotId) && 
      caption.captionText && 
      caption.captionText.trim() !== ''
    ).length;
    
    const hasAnimation = selectedFramesCount > 0 && 
                        captionsForSelectedFrames === selectedFramesCount &&
                        captionsForSelectedFrames > 0;
    
    return {
      totalFrames,
      selectedFramesCount,
      captionsCount,
      editedCaptionsCount,
      captionsForSelectedFrames,
      hasAnimation
    };
  };

  const stats = getProjectStats();

  const handleDownload = async (type: string) => {
    // Download logic without progress animation
    console.log(`Downloading ${type}`);
  };

  const handleCollectMaterials = async () => {
    // Collect materials logic without progress animation
    console.log('Collecting materials');
  };

  const exportOptions = [
    {
      id: 'frames',
      title: 'Скачать кадры',
      description: 'Download all selected frames as individual images',
      icon: '🖼️',
      format: 'PNG/JPEG',
      size: stats.selectedFramesCount > 0 ? `~${Math.round(stats.selectedFramesCount * 2)}MB` : '~0MB',
      color: 'bg-blue-600 hover:bg-blue-700',
      disabled: stats.selectedFramesCount === 0
    },
    {
      id: 'animation',
      title: 'Скачать анимацию',
      description: 'Download the final animated video',
      icon: '🎬',
      format: 'MP4',
      size: stats.hasAnimation ? `~${Math.round(stats.selectedFramesCount * 15)}MB` : '~0MB',
      color: 'bg-green-600 hover:bg-green-700',
      disabled: !stats.hasAnimation
    },
    {
      id: 'poml',
      title: 'Скачать POML',
      description: 'Download the generated POML prompt file',
      icon: '📝',
      format: 'TXT',
      size: stats.editedCaptionsCount > 0 ? `~${Math.round(stats.editedCaptionsCount * 0.1)}MB` : '~0MB',
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: stats.editedCaptionsCount === 0
    },
    {
      id: 'materials',
      title: 'Собрать материалы',
      description: 'Create a complete project package with all assets',
      icon: '📦',
      format: 'ZIP',
      size: stats.selectedFramesCount > 0 ? `~${Math.round(stats.selectedFramesCount * 3 + stats.editedCaptionsCount * 0.1)}MB` : '~0MB',
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: stats.selectedFramesCount === 0 && stats.editedCaptionsCount === 0
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Экспорт</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Скачайте готовые материалы проекта</p>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {exportOptions.map((option) => (
            <div
              key={option.id}
              className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{option.icon}</div>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {option.title}
                  </h3>
                  <p className={`mb-4 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{option.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Format:</span>
                      <span className="ml-2 text-gray-600">{option.format}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Size:</span>
                      <span className="ml-2 text-gray-600">{option.size}</span>
                    </div>
                  </div>


                  <button
                    onClick={() => option.id === 'materials' ? handleCollectMaterials() : handleDownload(option.id)}
                    disabled={option.disabled}
                    className={`w-full px-4 py-3 text-white rounded-lg transition-colors ${
                      option.disabled 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : option.color
                    }`}
                  >
                    {option.disabled ? 'Недоступно' : option.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Summary */}
        <div className={`rounded-lg shadow-md p-6 mb-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Сводка проекта
          </h2>
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {stats.selectedFramesCount}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Выбранные кадры
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {stats.totalFrames}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Всего кадров
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {stats.captionsForSelectedFrames}/{stats.selectedFramesCount}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Подписи для выбранных кадров
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                {stats.hasAnimation ? '✓' : '✗'}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {stats.hasAnimation ? 'Готово к экспорту' : 'Не готово'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-lg p-6 ${
          isDarkMode ? 'bg-blue-900' : 'bg-blue-50'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-800'
          }`}>
            Быстрые действия
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`text-lg font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Поделиться проектом</div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Создать ссылку для совместного использования</div>
            </button>
            
            <button className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`text-lg font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Создать резервную копию</div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Сохранить проект в облачное хранилище</div>
            </button>
            
            <button className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`text-lg font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Начать новый проект</div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Начать с текущими настройками</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
