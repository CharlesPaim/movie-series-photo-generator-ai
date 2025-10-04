import React, { useState, useCallback } from 'react';
import { UploadIcon, CameraIcon } from './icons';

interface UploadStepProps {
  onUpload: (file: File) => void;
  setError: (error: string | null) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({ onUpload, setError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // A verificação do tipo de arquivo foi movida para o componente pai
    // para lidar melhor com os casos em que as fotos da câmera não possuem um tipo MIME.
    setError(null);
    onUpload(file);
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };


  return (
    <div className="w-full max-w-lg">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-green-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-gray-400">
          <UploadIcon className="w-12 h-12" />
          <p className="text-lg font-medium text-gray-200">Arraste e solte sua foto aqui</p>
          <p>ou</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <UploadIcon className="w-5 h-5" />
              <span>Selecione um arquivo</span>
            </label>
            <label
              htmlFor="camera-upload"
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <CameraIcon className="w-5 h-5" />
              <span>Tirar uma foto</span>
            </label>
          </div>
        </div>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
        <input id="camera-upload" name="camera-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" capture="user" />
      </div>
    </div>
  );
};