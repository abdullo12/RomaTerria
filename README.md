# 🎬 Система извлечения кадров из видео

## 📋 Описание

React приложение с Node.js сервером для загрузки видео и извлечения кадров с помощью Python скрипта.

## 🏗️ Структура проекта

```
RomaTertiaToolFrontend/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # Переиспользуемые компоненты
│   ├── pages/             # Страницы приложения
│   ├── hooks/             # React хуки
│   ├── types/             # TypeScript типы
│   └── utils/             # Утилиты
├── backend/               # Python скрипты
│   ├── extract_scene_midframes.py
│   └── requirements.txt
├── uploads/               # Загруженные видео
├── frames/                # Извлеченные кадры
├── server.js              # Node.js сервер
├── start_server.bat       # Скрипт запуска сервера
└── README.md              # Документация
```

## 🚀 Запуск

### 1. Установи зависимости:
```cmd
npm install express multer cors
cd backend
py -m pip install -r requirements.txt
```

### 2. Запусти сервер:
```cmd
start_server.bat
```
Или вручную:
```cmd
node server.js
```

### 3. Запусти фронтенд:
```cmd
npm start
```

## 🎯 Функциональность

1. **Загрузка видео** - перетаскивание или выбор файла
2. **Извлечение кадров** - Python скрипт определяет сцены и извлекает кадры
3. **Просмотр кадров** - сетка с пагинацией
4. **Выбор кадров** - клик для выбора нужных кадров
5. **Увеличение** - просмотр кадра в полном размере

## 🔧 Технологии

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Multer
- **Python**: PySceneDetect + OpenCV
- **Архитектура**: Модульная структура

## 📡 API

- `POST /api/upload` - загрузка видео и извлечение кадров
- `GET /api/frames/:videoId` - получение кадров
- `GET /api/status` - статус сервера

## 🎉 Результат

Система работает с серверной обработкой видео через Python скрипт для точного определения сцен и извлечения кадров.