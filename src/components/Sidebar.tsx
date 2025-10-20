import React from 'react';
import logoImage from '../assets/roma tertia pic.jpg';

interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

type MenuItem = {
  name: string;
  id: string;
  icon: React.ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ onPageChange, currentPage, isDarkMode, onToggleDarkMode }) => {
  const menuItems: MenuItem[] = [
    { name: 'Загрузка', id: 'upload', icon: '📤' },
    { name: 'Кадры', id: 'shots', icon: '🎬' },
    { name: 'Captions', id: 'captions', icon: '💬' },
    { name: 'Сценарий', id: 'scenario', icon: '📝' },
    { name: 'Стили (LoRA)', id: 'styles', icon: '🎨' },
    { name: 'Черновики', id: 'drafts', icon: '📄' },
    { name: 'Финальный', id: 'final', icon: '✨' },
    { name: 'Экспорт', id: 'export', icon: '📦' },
  ];

  return (
    <div className={`w-64 shadow-lg h-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <img 
            src={logoImage} 
            alt="Roma Tertia Logo" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Roma Tertia Tool</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Creator Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? isDarkMode 
                      ? 'bg-blue-900 text-blue-300 border-r-2 border-blue-300'
                      : 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Версия 1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
