#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для извлечения средних кадров из сцен видео
Использует PySceneDetect для определения сцен и OpenCV для извлечения кадров
"""

import argparse
import logging
import os
import sys
from typing import List, Optional, Tuple

import cv2
import numpy as np
from scenedetect import VideoManager, SceneManager, ContentDetector

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def detect_scenes(video_path: str, threshold: float = 30.0) -> List[Tuple[float, float]]:
    """
    Определяет сцены в видео с помощью PySceneDetect.

    Args:
        video_path: Путь к видео файлу
        threshold: Порог для детектора контента (по умолчанию 30.0)

    Returns:
        Список кортежей (start_time, end_time) для каждой сцены в секундах
    """
    logging.info(f"Анализ сцен в видео: {video_path}")

    # Создаем менеджер видео
    video_manager = VideoManager([video_path])

    # Создаем менеджер сцен
    scene_manager = SceneManager()

    # Добавляем детектор контента
    scene_manager.add_detector(ContentDetector(threshold=threshold))

    try:
        # Запускаем анализ
        video_manager.start()
        scene_manager.detect_scenes(frame_source=video_manager)

        # Получаем список сцен
        scene_list = scene_manager.get_scene_list()

        logging.info(f"Найдено {len(scene_list)} сцен")

        return scene_list

    except Exception as e:
        logging.error(f"Ошибка при анализе сцен: {e}")
        raise
    finally:
        video_manager.release()


def extract_frames_from_scene(video_path: str, start_time, end_time,
                              scene_number: int, frames_per_scene: int = 3) -> List[Tuple[np.ndarray, str]]:
    """
    Извлекает несколько кадров из сцены.

    Args:
        video_path: Путь к видео файлу
        start_time: Время начала сцены в секундах
        end_time: Время окончания сцены в секундах
        scene_number: Номер сцены для именования файлов
        frames_per_scene: Количество кадров для извлечения из сцены

    Returns:
        Список кортежей (кадр, временная_метка) для каждого извлеченного кадра
    """
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        logging.error(f"Не удалось открыть видео: {video_path}")
        return []

    try:
        # Преобразуем FrameTimecode в секунды
        start_seconds = start_time.get_seconds()
        end_seconds = end_time.get_seconds()

        # Получаем FPS видео
        fps = cap.get(cv2.CAP_PROP_FPS)

        # Вычисляем временные позиции для кадров
        scene_duration = end_seconds - start_seconds

        # Распределяем кадры равномерно по сцене
        frame_times = []
        if frames_per_scene == 1:
            # Один кадр в середине сцены
            frame_times = [(start_seconds + end_seconds) / 2.0]
        elif frames_per_scene == 2:
            # Два кадра: начало и конец сцены
            frame_times = [start_seconds + scene_duration * 0.25, start_seconds + scene_duration * 0.75]
        else:
            # Три или больше кадров: равномерно распределены
            for i in range(frames_per_scene):
                time_offset = scene_duration * (i + 1) / (frames_per_scene + 1)
                frame_times.append(start_seconds + time_offset)

        extracted_frames = []

        for i, frame_time in enumerate(frame_times):
            # Вычисляем номер кадра
            frame_number = int(frame_time * fps)

            # Устанавливаем позицию на нужный кадр
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

            # Читаем кадр
            ret, frame = cap.read()

            if ret:
                timestamp = format_time(frame_time)
                frame_id = f"scene_{scene_number:04d}_frame_{i+1:02d}"
                logging.info(f"Извлечен кадр {frame_id} в {timestamp} (кадр {frame_number})")
                extracted_frames.append((frame, timestamp, frame_id))
            else:
                logging.warning(f"Не удалось извлечь кадр {i+1} из сцены {scene_number} в {frame_time:.2f}с")

        return extracted_frames

    except Exception as e:
        logging.error(f"Ошибка при извлечении кадров из сцены {scene_number}: {e}")
        return []
    finally:
        cap.release()


def save_frame(frame: np.ndarray, output_path: str, frame_id: str) -> bool:
    """
    Сохраняет кадр в файл.

    Args:
        frame: Массив изображения
        output_path: Путь для сохранения
        frame_id: Уникальный идентификатор кадра

    Returns:
        True если сохранение успешно, False иначе
    """
    try:
        filename = f"{frame_id}.jpg"
        filepath = os.path.join(output_path, filename)

        success = cv2.imwrite(filepath, frame)

        if success:
            logging.info(f"Сохранен кадр: {filepath}")
            return True
        else:
            logging.error(f"Не удалось сохранить кадр: {filepath}")
            return False

    except Exception as e:
        logging.error(f"Ошибка при сохранении кадра {frame_id}: {e}")
        return False


def format_time(seconds: float) -> str:
    """
    Форматирует время в формат MM:SS.

    Args:
        seconds: Время в секундах

    Returns:
        Строка в формате MM:SS
    """
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"


def main():
    """Основная функция скрипта."""
    parser = argparse.ArgumentParser(
        description='Извлечение средних кадров из сцен видео',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Примеры использования:

1. Базовое использование:
   python extract_scene_midframes.py --video input.mp4 --outdir frames

2. Настройка чувствительности детекции:
   python extract_scene_midframes.py --video movie.mp4 --outdir frames --threshold 20.0

3. Извлечение 1 кадра на сцену:
   python extract_scene_midframes.py --video video.mp4 --outdir frames --frames-per-scene 1
        """
    )

    # Обязательные аргументы
    parser.add_argument('--video', required=True, help='Путь к видео файлу')
    parser.add_argument('--outdir', required=True, help='Папка для сохранения кадров')

    # Опциональные аргументы
    parser.add_argument('--threshold', type=float, default=30.0,
                        help='Порог для детектора сцен (по умолчанию: 30.0)')
    parser.add_argument('--frames-per-scene', type=int, default=1,
                        help='Количество кадров для извлечения из каждой сцены (по умолчанию: 1)')

    args = parser.parse_args()

    try:
        # Проверяем существование видео файла
        if not os.path.exists(args.video):
            logging.error(f"Видео файл не найден: {args.video}")
            sys.exit(1)

        # Создаем папку для кадров
        os.makedirs(args.outdir, exist_ok=True)
        logging.info(f"Папка для кадров: {args.outdir}")

        # Определяем сцены
        scenes = detect_scenes(args.video, args.threshold)

        if not scenes:
            logging.warning("Сцены не найдены")
            return

        # Извлечение и сохранение кадров
        successful_frames = 0

        for i, (start_time, end_time) in enumerate(scenes, 1):
            logging.info(f"Обработка сцены {i}/{len(scenes)}: {start_time.get_seconds():.2f}с - {end_time.get_seconds():.2f}с")

            # Извлечение нескольких кадров из сцены
            extracted_frames = extract_frames_from_scene(
                args.video, start_time, end_time, i, args.frames_per_scene
            )

            for frame, timestamp, frame_id in extracted_frames:
                # Сохранение кадра
                if save_frame(frame, args.outdir, frame_id):
                    successful_frames += 1

        # Итоговая статистика
        logging.info("=" * 50)
        logging.info("РЕЗУЛЬТАТЫ:")
        logging.info(f"Всего сцен найдено: {len(scenes)}")
        logging.info(f"Кадров на сцену: {args.frames_per_scene}")
        logging.info(f"Всего кадров извлечено: {successful_frames}")
        logging.info(f"Кадры сохранены в: {args.outdir}")
        logging.info("=" * 50)

    except KeyboardInterrupt:
        logging.info("Прервано пользователем")
        sys.exit(1)
    except Exception as e:
        logging.error(f"Неожиданная ошибка: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()