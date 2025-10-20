import React from 'react';

interface StylesProps {
  isDarkMode: boolean;
}

const Styles: React.FC<StylesProps> = ({ isDarkMode }) => {
  return (
    <div className="w-full h-screen bg-white">
    </div>
  );
};

export default Styles;
