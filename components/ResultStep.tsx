
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DownloadIcon, CropIcon, RestartIcon, CheckIcon, CancelIcon, EyeIcon, EyeOffIcon, ShareIcon } from './icons';

interface ResultStepProps {
  originalImage: string;
  generatedImage: string;
  onRestart: () => void;
  onCropConfirm: (newImageSrc: string) => void;
  theme: string;
}

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const getCroppedImg = (image: HTMLImageElement, crop: Crop): string => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
  
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return canvas.toDataURL('image/jpeg', 0.95);
};


export const ResultStep: React.FC<ResultStepProps> = ({ originalImage, generatedImage, onRestart, onCropConfirm, theme }) => {
    const [showOriginal, setShowOriginal] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 100, height: 100 });
    const [isInteracting, setIsInteracting] = useState(false);
    const [interactionType, setInteractionType] = useState<string | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startCrop, setStartCrop] = useState<Crop | null>(null);
    const [isShareSupported, setIsShareSupported] = useState(false);
    
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (navigator.share) {
            setIsShareSupported(true);
        }
    }, []);

    const getClientCoords = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        const event = 'touches' in e ? e.touches[0] : e;
        return {
          x: event.clientX,
          y: event.clientY,
        };
    };
  
    const setDefaultCrop = () => {
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            const size = Math.min(width, height) * 0.9;
            setCrop({
                x: (width - size) / 2,
                y: (height - size) / 2,
                width: size,
                height: size,
            });
        }
    };

    const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsInteracting(true);
        setInteractionType(type);
        const { x, y } = getClientCoords(e);
        setStartPos({ x, y });
        setStartCrop(crop);
    };

    const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isInteracting || !startCrop || !containerRef.current || !imgRef.current) return;
        
        const rect = imgRef.current.getBoundingClientRect();
        const { x, y } = getClientCoords(e);
        const dx = x - startPos.x;
        const dy = y - startPos.y;
        let newCrop = { ...startCrop };
    
        if (interactionType === 'move') {
            newCrop.x = startCrop.x + dx;
            newCrop.y = startCrop.y + dy;
        } else {
            if (interactionType.includes('r')) newCrop.width = startCrop.width + dx;
            if (interactionType.includes('l')) {
                newCrop.width = startCrop.width - dx;
                newCrop.x = startCrop.x + dx;
            }
            if (interactionType.includes('b')) newCrop.height = startCrop.height + dy;
            if (interactionType.includes('t')) {
                newCrop.height = startCrop.height - dy;
                newCrop.y = startCrop.y + dy;
            }
        }
        
        if (newCrop.width < 20) newCrop.width = 20;
        if (newCrop.height < 20) newCrop.height = 20;

        if (newCrop.x < 0) newCrop.x = 0;
        if (newCrop.y < 0) newCrop.y = 0;
        if (newCrop.x + newCrop.width > rect.width) {
            if (interactionType === 'move' || interactionType.includes('l')) {
                 newCrop.x = rect.width - newCrop.width;
            } else {
                 newCrop.width = rect.width - newCrop.x;
            }
        }
        if (newCrop.y + newCrop.height > rect.height) {
            if(interactionType === 'move' || interactionType.includes('t')) {
                newCrop.y = rect.height - newCrop.height;
            } else {
                newCrop.height = rect.height - newCrop.y;
            }
        }
        
        setCrop(newCrop);
    }, [isInteracting, startPos, startCrop, interactionType]);

    const handleInteractionEnd = useCallback(() => {
        setIsInteracting(false);
        setInteractionType(null);
    }, []);

    useEffect(() => {
        const moveHandler = (e: MouseEvent | TouchEvent) => handleInteractionMove(e);
        const endHandler = () => handleInteractionEnd();

        if (isInteracting) {
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', endHandler);
            window.addEventListener('touchmove', moveHandler);
            window.addEventListener('touchend', endHandler);
        } else {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', endHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('touchend', endHandler);
        }
        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', endHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('touchend', endHandler);
        };
    }, [isInteracting, handleInteractionMove, handleInteractionEnd]);


    const handleSave = () => {
        const link = document.createElement('a');
        link.href = generatedImage;
        const safeThemeName = theme.toLowerCase().replace(/[^a-z0-9]/g, '_');
        link.download = `${safeThemeName}_photo.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (!isShareSupported) return;

        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const safeThemeName = theme.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const file = new File([blob], `${safeThemeName}_photo.png`, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Minha Foto de ${theme}`,
                    text: 'Veja a foto que criei com o Gerador de Foto com Tema de Cinema!',
                    files: [file],
                });
            } else {
                console.warn("Compartilhamento de arquivo não suportado, tentando compartilhar URL.");
                await navigator.share({
                    title: `Minha Foto de ${theme}`,
                    text: 'Veja a foto que criei com o Gerador de Foto com Tema de Cinema!',
                    url: window.location.href, 
                });
            }
        } catch (error: any) {
            // Ignora o erro se o usuário cancelar a ação de compartilhar, o que é um comportamento esperado.
            if (error.name === 'AbortError') {
                console.log('Compartilhamento cancelado pelo usuário.');
            } else {
                console.error('Erro ao compartilhar:', error);
            }
        }
    };
    
    const handleCrop = () => {
        setIsCropping(true);
        setDefaultCrop();
    };

    const handleConfirmCrop = () => {
        if (imgRef.current) {
            const newImageSrc = getCroppedImg(imgRef.current, crop);
            onCropConfirm(newImageSrc);
            setIsCropping(false);
        }
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
    };

    const imageSrc = showOriginal ? originalImage : generatedImage;

    return (
        <div className="w-full max-w-4xl flex flex-col items-center space-y-4 animate-fade-in">
            <div ref={containerRef} className="relative w-full max-w-xl aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <img
                    ref={imgRef}
                    src={imageSrc}
                    alt={showOriginal ? "Original" : "Gerada"}
                    className="w-full h-full object-contain"
                />
                {isCropping && (
                     <div
                        className="absolute top-0 left-0 w-full h-full"
                    >
                        <div
                            className="absolute border-4 border-dashed border-white bg-black bg-opacity-40 cursor-move"
                            style={{
                                top: crop.y,
                                left: crop.x,
                                width: crop.width,
                                height: crop.height,
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                            }}
                            onMouseDown={(e) => handleInteractionStart(e, 'move')}
                            onTouchStart={(e) => handleInteractionStart(e, 'move')}
                        >
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize" onMouseDown={(e) => handleInteractionStart(e, 'tl')} onTouchStart={(e) => handleInteractionStart(e, 'tl')} />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize" onMouseDown={(e) => handleInteractionStart(e, 'tr')} onTouchStart={(e) => handleInteractionStart(e, 'tr')} />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize" onMouseDown={(e) => handleInteractionStart(e, 'bl')} onTouchStart={(e) => handleInteractionStart(e, 'bl')} />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize" onMouseDown={(e) => handleInteractionStart(e, 'br')} onTouchStart={(e) => handleInteractionStart(e, 'br')} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                {isCropping ? (
                     <>
                        <ActionButton onClick={handleConfirmCrop} className="bg-green-600 hover:bg-green-500 text-white focus:ring-green-500">
                            <CheckIcon className="w-5 h-5" />
                            <span>Confirmar</span>
                        </ActionButton>
                        <ActionButton onClick={handleCancelCrop} className="bg-red-600 hover:bg-red-500 text-white focus:ring-red-500">
                            <CancelIcon className="w-5 h-5" />
                            <span>Cancelar</span>
                        </ActionButton>
                    </>
                ) : (
                    <>
                         <ActionButton onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500">
                            <DownloadIcon className="w-5 h-5" />
                            <span>Baixar</span>
                        </ActionButton>

                         {isShareSupported && (
                            <ActionButton onClick={handleShare} className="bg-purple-600 hover:bg-purple-500 text-white focus:ring-purple-500">
                                <ShareIcon className="w-5 h-5" />
                                <span>Compartilhar</span>
                            </ActionButton>
                         )}

                        <ActionButton onClick={handleCrop} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 focus:ring-yellow-400">
                            <CropIcon className="w-5 h-5" />
                            <span>Cortar</span>
                        </ActionButton>

                        <ActionButton onClick={() => setShowOriginal(!showOriginal)} className="bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500">
                            {showOriginal ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            <span>{showOriginal ? 'Ver Gerada' : 'Ver Original'}</span>
                        </ActionButton>
                        
                        <ActionButton onClick={onRestart} className="bg-red-600 hover:bg-red-500 text-white focus:ring-red-500">
                            <RestartIcon className="w-5 h-5" />
                            <span>Recomeçar</span>
                        </ActionButton>
                    </>
                )}
            </div>
        </div>
    );
};