import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { parseKML } from '../utils/kmlParser';
import { TobaccoField } from '../types';

interface FileUploaderProps {
  onDataLoaded: (data: TobaccoField[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.kml')) {
      alert("请上传 KML 格式文件");
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    
    try {
      const text = await file.text();
      // Artificial delay to show loading state for better UX
      setTimeout(() => {
        const parsedData = parseKML(text);
        if (parsedData.length === 0) {
          alert("无法从文件中解析出有效的地块数据 (Polygon/Attributes)");
        } else {
          onDataLoaded(parsedData);
        }
        setIsProcessing(false);
      }, 500);
    } catch (e) {
      console.error(e);
      alert("文件解析失败");
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
        ${isDragging ? 'border-tobacco-500 bg-tobacco-50' : 'border-slate-300 hover:border-tobacco-400 hover:bg-slate-50'}
        ${isProcessing ? 'opacity-75 pointer-events-none' : ''}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".kml" 
      />
      
      <div className="flex flex-col items-center space-y-2">
        {isProcessing ? (
          <Loader2 className="animate-spin text-tobacco-600" size={32} />
        ) : fileName ? (
          <FileText className="text-tobacco-600" size={32} />
        ) : (
          <UploadCloud className="text-slate-400" size={32} />
        )}
        
        <div className="text-sm">
          {isProcessing ? (
            <span className="text-slate-600 font-medium">正在解析数据...</span>
          ) : fileName ? (
            <span className="text-tobacco-700 font-semibold">{fileName}</span>
          ) : (
            <>
              <span className="text-slate-700 font-medium">点击或拖拽上传 KML 文件</span>
              <p className="text-xs text-slate-400 mt-1">支持包含地块形状与属性的 KML</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
