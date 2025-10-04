
import React from 'react';

interface ThemeSelectorProps {
  themes: string[];
  selectedTheme: string | null;
  onSelectTheme: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, selectedTheme, onSelectTheme }) => {
  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => onSelectTheme(theme)}
            className={`p-2 rounded-lg text-center font-semibold text-xs sm:text-sm transition-all duration-200 aspect-square flex items-center justify-center shadow-lg
              ${
                selectedTheme === theme
                  ? 'bg-green-500 text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-green-400 scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
              }`}
          >
            <span>{theme}</span>
          </button>
        ))}
      </div>
    </div>
  );
};