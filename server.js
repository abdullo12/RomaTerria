const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Только видео файлы разрешены!'), false);
    }
  }
});

// Создаем папки если их нет
const ensureDirectories = async () => {
  try {
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('frames', { recursive: true });
  } catch (error) {
    console.error('Ошибка создания папок:', error);
  }
};

// Функция для запуска Python-скрипта
const extractFrames = async (videoPath, outputDir) => {
  return new Promise(async (resolve, reject) => {
    console.log(`Запуск извлечения кадров для: ${videoPath}`);

    // Проверяем существование Python-скрипта
    try {
      await fs.access('backend/extract_scene_midframes.py');
    } catch (error) {
      reject(new Error('Файл backend/extract_scene_midframes.py не найден'));
      return;
    }

    const pythonBinary = process.env.PYTHON || 'python3';

    const pythonArgs = [
      'backend/extract_scene_midframes.py',
      '--video', videoPath,
      '--outdir', outputDir,
      '--threshold', '15.0',
      '--frames-per-scene', '1'
    ];
    
    // Логируем команду перед запуском (для отладки)
    console.log(`🚀 Запуск Python процесса: ${pythonBinary} ${pythonArgs.join(' ')}`);
    
    const pythonProcess = spawn(pythonBinary, pythonArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],  // читаем stdout/stderr
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python процесс завершен с кодом: ${code}`);
      console.log(`Python stdout: ${stdout}`);
      console.log(`Python stderr: ${stderr}`);

      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        const errorMsg = `Python скрипт завершился с ошибкой (код ${code}): ${stderr || stdout}`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error(`Ошибка запуска Python процесса: ${error}`);
      console.error(`Возможные причины:`);
      console.error(`1. Python не установлен или не в PATH`);
      console.error(`2. Файл backend/extract_scene_midframes.py не найден`);
      console.error(`3. Не установлены зависимости: pip install -r backend/requirements.txt`);
      reject(error);
    });
  });
};

// Функция для получения списка кадров
const getFramesList = async (framesDir) => {
  try {
    const files = await fs.readdir(framesDir);
    const frameFiles = files
      .filter(file => file.startsWith('scene_') && file.endsWith('.jpg'))
      .sort();

    const frames = [];
    for (const file of frameFiles) {
      const filePath = path.join(framesDir, file);
      const stats = await fs.stat(filePath);

      // Читаем файл как base64 для отправки на фронтенд
      const fileBuffer = await fs.readFile(filePath);
      const base64 = fileBuffer.toString('base64');

      // Извлекаем информацию из имени файла: scene_0001_frame_01.jpg
      const match = file.match(/scene_(\d+)_frame_(\d+)\.jpg/);
      const sceneNumber = match ? parseInt(match[1]) : 0;
      const frameNumber = match ? parseInt(match[2]) : 0;

      frames.push({
        id: frames.length + 1,
        filename: file,
        thumbnail: `data:image/jpeg;base64,${base64}`,
        timestamp: `${Math.floor(sceneNumber / 2)}:${(sceneNumber % 2) * 30}`,
        selected: false,
        sceneNumber: sceneNumber,
        frameNumber: frameNumber
      });
    }

    return frames;
  } catch (error) {
    console.error(`Ошибка чтения кадров: ${error}`);
    return [];
  }
};

// API маршруты

// Загрузка видео и извлечение кадров
app.post('/api/upload', upload.single('video'), async (req, res) => {
  console.log('📤 Получен POST запрос на /api/upload');
  console.log('📁 Файл:', req.file);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Видео файл не загружен' });
    }

    const videoPath = req.file.path;
    const videoId = path.basename(videoPath, path.extname(videoPath));
    const framesDir = path.join('frames', videoId);

    console.log(`Обработка видео: ${videoPath}`);
    console.log(`Папка для кадров: ${framesDir}`);

    // Создаем папку для кадров
    await fs.mkdir(framesDir, { recursive: true });

    // Запускаем извлечение кадров
    await extractFrames(videoPath, framesDir);

    // Получаем список извлеченных кадров
    const frames = await getFramesList(framesDir);

    res.json({
      success: true,
      videoId: videoId,
      frames: frames,
      message: `Извлечено ${frames.length} кадров`
    });

  } catch (error) {
    console.error('Ошибка обработки видео:', error);
    res.status(500).json({ 
      error: 'Ошибка обработки видео', 
      details: error.message 
    });
  }
});

// Получение кадров по videoId
app.get('/api/frames/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const framesDir = path.join('frames', videoId);

    console.log(`Запрос кадров для videoId: ${videoId}`);

    // Проверяем существование папки
    try {
      await fs.access(framesDir);
    } catch (error) {
      return res.status(404).json({ error: 'Кадры не найдены' });
    }

    // Получаем список кадров
    const frames = await getFramesList(framesDir);

    res.json({
      success: true,
      videoId: videoId,
      frames: frames
    });

  } catch (error) {
    console.error('Ошибка получения кадров:', error);
    res.status(500).json({ 
      error: 'Ошибка получения кадров', 
      details: error.message 
    });
  }
});

// Проверка статуса сервера
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает',
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
const startServer = async () => {
  await ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Папка загрузок: uploads/`);
    console.log(`🖼️ Папка кадров: frames/`);
    console.log(`🐍 Python скрипт: backend/extract_scene_midframes.py`);
    console.log(`\n📋 Доступные эндпоинты:`);
    console.log(`   POST /api/upload - загрузка видео и извлечение кадров`);
    console.log(`   GET  /api/frames/:videoId - получение кадров`);
    console.log(`   GET  /api/status - статус сервера`);
  });
};

startServer().catch(console.error);
