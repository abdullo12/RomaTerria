import React from 'react';

interface FinalProps {
  isDarkMode: boolean;
}

const Final: React.FC<FinalProps> = ({ isDarkMode }) => {
  return (
    <div className="w-full h-screen bg-white">
    </div>
  );
};

export default Final;
