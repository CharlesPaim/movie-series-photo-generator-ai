import React from 'react';

const LandscapeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="13.5" y="0.25" rx="2"/></svg>
);
const PortraitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 14 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="13.5" height="24" x="0.25" rx="2"/></svg>
);
const SquareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="2"/></svg>
);

interface AspectRatioSelectorProps {
  selectedAspectRatio: string;
  onSelectAspectRatio: (ratio: string) => void;
}

const ratios = [
    { label: 'Paisagem', value: '16:9', icon: <LandscapeIcon className="h-6" /> },
    { label: 'Retrato', value: '9:16', icon: <PortraitIcon className="h-8" /> },
    { label: 'Quadrado', value: '1:1', icon: <SquareIcon className="h-6" /> },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedAspectRatio, onSelectAspectRatio }) => {
  return (
    <div className="w-full max-w-lg">
      <div className="flex justify-center gap-4">
        {ratios.map(({label, value, icon}) => (
          <button
            key={value}
            aria-label={`Selecionar proporção ${label} ${value}`}
            onClick={() => onSelectAspectRatio(value)}
            className={`p-3 rounded-lg text-center font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-between space-y-2 shadow-lg w-24 h-28 sm:w-28 sm:h-32
              ${
                selectedAspectRatio === value
                  ? 'bg-green-500 text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-green-400 scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
              }`}
          >
            {icon}
            <div className="flex flex-col">
              <span className="font-bold">{value}</span>
              <span className="text-xs">{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};