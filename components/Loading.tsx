
import React from 'react';

const messages = [
  "Viajando no tempo para 1985...",
  "Entrando na Matrix...",
  "Desviando de uma pedra gigante...",
  "Carregando o T-Rex...",
  "Quem você vai chamar? Ghostbusters!",
  "Ajustando o capacitor de fluxo...",
  "Evitando dinossauros no parque...",
];

export const Loading: React.FC = () => {
    const [messageIndex, setMessageIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-400"></div>
      <p className="text-xl font-semibold text-gray-200">{messages[messageIndex]}</p>
      <p className="text-gray-400">Isso pode levar alguns instantes.</p>
    </div>
  );
};
