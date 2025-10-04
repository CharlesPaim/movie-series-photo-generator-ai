import React, { useState, useCallback } from 'react';
import { generateMovieThemedPhoto } from './services/geminiService';
import { UploadStep } from './components/UploadStep';
import { Loading } from './components/Loading';
import { ResultStep } from './components/ResultStep';
import { ThemeSelector } from './components/ThemeSelector';

type AppState = 'upload' | 'loading' | 'result';

const themes = [
    'Star Wars',
    'Indiana Jones',
    'De Volta para o Futuro',
    'Jurassic Park',
    'E.T. – O Extraterrestre',
    'O Exterminador do Futuro',
    'Caça-Fantasmas',
    'Rambo',
    'Rocky',
    'Matrix',
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = useCallback(async (file: File) => {
    if (!selectedTheme) {
        setError("Por favor, selecione um tema primeiro.");
        return;
    }
    setAppState('loading');
    setError(null);

    try {
      // Se o tipo de arquivo estiver ausente (comum em capturas de câmera), use 'image/jpeg' como padrão.
      const mimeType = file.type || 'image/jpeg';

      if (!mimeType.startsWith('image/')) {
        throw new Error("O arquivo fornecido não é um tipo de imagem válido.");
      }

      const base64String = await fileToBase64(file);
      const objectURL = URL.createObjectURL(file);
      setOriginalImage(objectURL);

      const resultBase64 = await generateMovieThemedPhoto(base64String, mimeType, selectedTheme);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
      setAppState('result');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      setAppState('upload');
    }
  }, [selectedTheme]);

  const handleRestart = () => {
    if (originalImage) {
        URL.revokeObjectURL(originalImage);
    }
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
    setSelectedTheme(null);
    setAppState('upload');
  };
  
  const handleCropConfirm = (newImageSrc: string) => {
    setGeneratedImage(newImageSrc);
  };

  const renderContent = () => {
    switch (appState) {
      case 'upload':
        if (!selectedTheme) {
            return (
                <div className="flex flex-col items-center w-full space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-center text-gray-200">1. Escolha um tema de filme</h2>
                    <ThemeSelector themes={themes} selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center w-full space-y-4 animate-fade-in">
                     <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-200">2. Envie sua foto</h2>
                        <p className="text-gray-400">Tema: <span className="font-semibold text-green-400">{selectedTheme}</span></p>
                        <button 
                            onClick={() => setSelectedTheme(null)} 
                            className="mt-1 text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                        >
                            Trocar tema
                        </button>
                    </div>
                    <div className="w-full max-w-lg">
                        <UploadStep onUpload={handleUpload} setError={setError} />
                    </div>
                </div>
            );
        }
      case 'loading':
        return <Loading />;
      case 'result':
        if (originalImage && generatedImage && selectedTheme) {
          return (
            <ResultStep
              originalImage={originalImage}
              generatedImage={generatedImage}
              onRestart={handleRestart}
              onCropConfirm={handleCropConfirm}
              theme={selectedTheme}
            />
          );
        }
        handleRestart();
        return null;
      default:
        handleRestart();
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-indigo-500">
          Gerador de Foto com Tema de Cinema
        </h1>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
          Escolha um filme, envie sua foto e deixe a IA te transformar em um astro do cinema!
        </p>
      </div>

      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>

       {error && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse">
            <p>{error}</p>
        </div>
      )}

      <footer className="w-full text-center mt-8 text-gray-500 text-sm">
        <p>Desenvolvido com a API Gemini do Google.</p>
      </footer>
    </div>
  );
};

export default App;