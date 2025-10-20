import React, { useState } from 'react';
import { CaptionData } from '../types';

interface ScenarioProps {
  isDarkMode: boolean;
  captions: CaptionData[];
}

const Scenario: React.FC<ScenarioProps> = ({ isDarkMode, captions }) => {
  const [scenario, setScenario] = useState('');
  const [pomlPrompt, setPomlPrompt] = useState('');
  
  // New state for caption selection and merged prompt
  const [selectedCaptions, setSelectedCaptions] = useState<CaptionData[]>([]);
  const [mergedPrompt, setMergedPrompt] = useState('');

  const handleGeneratePOML = async () => {
    // Generate POML logic without loading animation
    
    // Generate POML based on captions and scenario
    const captionsText = captions.length > 0 
      ? captions.map(caption => `- ${caption.frameName}: ${caption.captionText}`).join('\n')
      : 'No captions available';
    
    const mockPOML = `# POML Generated Prompt

## Scene Description
${scenario || 'No scenario provided'}

## Frame-by-Frame Breakdown
${captionsText}

## Visual Elements
- Composition: Balanced framing with clear subject focus
- Lighting: Natural lighting with soft shadows
- Color palette: Warm tones with complementary accents
- Style: Cinematic quality with professional grading

## Technical Specifications
- Resolution: 1920x1080 minimum
- Frame rate: 24fps for cinematic feel
- Duration: 10-15 seconds per shot
- Format: MP4 with H.264 encoding

## Animation Guidelines
- Smooth transitions between keyframes
- Natural movement patterns
- Consistent pacing throughout
- Professional post-production effects

## Quality Standards
- High definition output
- Consistent visual style
- Professional color grading
- Smooth animation flow`;

    setPomlPrompt(mockPOML);
  };

  const handleSaveScenario = () => {
    // Save scenario logic
    console.log('Scenario saved:', scenario);
  };

  const handleToggleCaptionSelection = (caption: CaptionData) => {
    const isSelected = selectedCaptions.some(c => c.id === caption.id);
    if (isSelected) {
      setSelectedCaptions(selectedCaptions.filter(c => c.id !== caption.id));
    } else {
      setSelectedCaptions([...selectedCaptions, caption]);
    }
  };

  const handleMergeWithPOML = async () => {
    if (!pomlPrompt.trim() || selectedCaptions.length === 0) return;
    
    // Create merged prompt
    const selectedCaptionsText = selectedCaptions.map((caption, index) => 
      `${index + 1}. ${caption.frameName}: ${caption.captionText}`
    ).join('\n');
    
    const mergedPromptText = `${pomlPrompt}

## Selected Captions Integration
${selectedCaptionsText}

## Enhanced Prompt with Captions
This enhanced prompt combines the original POML structure with the selected captions to create a more detailed and specific video generation prompt. The captions provide additional context and detail for each frame, ensuring better alignment between the narrative and visual elements.

## Caption-Based Enhancements
- Frame-specific descriptions from selected captions
- Enhanced visual context for each shot
- Improved narrative flow with caption details
- Better alignment between story and visuals`;

    setMergedPrompt(mergedPromptText);
  };

  const handleSavePOML = () => {
    // Save POML logic
    console.log('POML saved:', pomlPrompt);
  };

  const handleSaveMergedPrompt = () => {
    // Save merged prompt logic
    console.log('Merged prompt saved:', mergedPrompt);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Сценарий</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Напишите свой сценарий и сгенерируйте POML промпты на основе созданных Captions</p>
        </div>

        {/* Captions Overview */}
        {captions.length > 0 && (
          <div className={`mb-8 rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Созданные Captions ({captions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {caption.frameName}
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {caption.captionText}
                  </p>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Shot #{caption.shotId} • {caption.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {captions.length === 0 && (
          <div className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'}`}>
            <p className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
              ⚠️ Сначала создайте Captions в разделе "Captions", чтобы они появились здесь
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scenario Input */}
          <div className={`rounded-lg shadow-md p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Напишите свой сценарий
              </h2>
              
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Describe your video scenario here. Include details about the setting, characters, actions, and overall narrative flow..."
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveScenario}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Сохранить сценарий
              </button>
              <button
                onClick={handleGeneratePOML}
                disabled={(!scenario.trim() && captions.length === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Сгенерировать POML
              </button>
            </div>
          </div>

          {/* POML Output */}
          <div className={`rounded-lg shadow-md p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Сгенерированный POML промпт
              </h2>
              
              <textarea
                value={pomlPrompt}
                onChange={(e) => setPomlPrompt(e.target.value)}
                placeholder="Сгенерированный POML промпт появится здесь..."
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSavePOML}
                disabled={!pomlPrompt.trim()}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save POML
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(pomlPrompt)}
                disabled={!pomlPrompt.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>

        {/* Caption Selection and Merge Section */}
        {captions.length > 0 && (
          <div className={`mt-8 rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                🔗 Объединение Captions с POML промптом
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Выберите Captions для объединения с сгенерированным POML промптом
              </p>
            </div>

            {/* Caption Selection */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Выберите Captions для объединения ({selectedCaptions.length} выбрано)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {captions.map((caption) => {
                  const isSelected = selectedCaptions.some(c => c.id === caption.id);
                  return (
                    <div
                      key={caption.id}
                      onClick={() => handleToggleCaptionSelection(caption)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? isDarkMode
                            ? 'border-blue-400 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {caption.frameName}
                        </h4>
                        {isSelected && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}>
                            ✓ Выбрано
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {caption.captionText}
                      </p>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Shot #{caption.shotId} • {caption.timestamp}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Merge Button */}
            <div className="mb-6">
              <button
                onClick={handleMergeWithPOML}
                disabled={!pomlPrompt.trim() || selectedCaptions.length === 0}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                🔗 Объединить с POML промптом
              </button>
              {(!pomlPrompt.trim() || selectedCaptions.length === 0) && (
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {!pomlPrompt.trim() && 'Сначала сгенерируйте POML промпт. '}
                  {selectedCaptions.length === 0 && 'Выберите хотя бы один Caption для объединения.'}
                </p>
              )}
            </div>

            {/* Merged Prompt Output */}
            {mergedPrompt && (
              <div className="mb-6">
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Объединенный промпт
                </h3>
                
                <textarea
                  value={mergedPrompt}
                  onChange={(e) => setMergedPrompt(e.target.value)}
                  placeholder="Объединенный промпт появится здесь..."
                  className={`w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleSaveMergedPrompt}
                    disabled={!mergedPrompt.trim()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Сохранить промпт
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(mergedPrompt)}
                    disabled={!mergedPrompt.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Копировать в буфер
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scenario;
