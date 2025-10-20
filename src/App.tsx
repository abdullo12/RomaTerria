import React, { useState } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Upload from './pages/Upload.tsx';
import Shots from './pages/Shots.tsx';
import Captions from './pages/Captions.tsx';
import Scenario from './pages/Scenario.tsx';
import Styles from './pages/Styles.tsx';
import Drafts from './pages/Drafts.tsx';
import Final from './pages/Final.tsx';
import Export from './pages/Export.tsx';
import { Shot, CaptionData } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedShots, setSelectedShots] = useState<number[]>([]);
  const [captions, setCaptions] = useState<CaptionData[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFrames, setVideoFrames] = useState<Shot[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const handleVideoProcessed = (videoId: string, frames: any[]) => {
    console.log('Video processed:', videoId, frames);
    setCurrentVideoId(videoId);
    setVideoFrames(frames);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'upload': return <Upload isDarkMode={isDarkMode} onNavigateToShots={() => setCurrentPage('shots')} onVideoUploaded={setVideoFile} onVideoProcessed={handleVideoProcessed} />;
      case 'shots': return <Shots isDarkMode={isDarkMode} selectedShots={selectedShots} onSelectedShotsChange={setSelectedShots} videoFile={videoFile} videoFrames={videoFrames} onVideoFramesChange={setVideoFrames} videoId={currentVideoId} />;
      case 'captions': return <Captions isDarkMode={isDarkMode} selectedShots={selectedShots} captions={captions} onCaptionsChange={setCaptions} videoFrames={videoFrames} />;
      case 'scenario': return <Scenario isDarkMode={isDarkMode} captions={captions} />;
      case 'styles': return <Styles isDarkMode={isDarkMode} />;
      case 'drafts': return <Drafts isDarkMode={isDarkMode} />;
      case 'final': return <Final isDarkMode={isDarkMode} />;
      case 'export': return <Export isDarkMode={isDarkMode} selectedShots={selectedShots} videoFrames={videoFrames} captions={captions} />;
      default: return <Upload isDarkMode={isDarkMode} onNavigateToShots={() => setCurrentPage('shots')} onVideoUploaded={setVideoFile} onVideoProcessed={handleVideoProcessed} />;
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
