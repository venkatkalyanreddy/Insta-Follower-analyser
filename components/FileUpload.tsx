import React, { useCallback } from 'react';
import { Upload, FileJson, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onFileLoaded: (content: string) => void;
  isLoaded: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileLoaded, isLoaded }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoaded(content);
    };
    reader.readAsText(file);
  }, [onFileLoaded]);

  return (
    <div className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${isLoaded ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'}`}>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        {isLoaded ? (
          <>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-semibold text-green-800">{label} Loaded</h3>
            <p className="text-sm text-green-600">Ready to analyze</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-gray-100 rounded-full text-gray-500 group-hover:text-purple-600 group-hover:bg-purple-100 transition-colors">
              <FileJson size={32} />
            </div>
            <h3 className="font-semibold text-gray-700 group-hover:text-purple-700">{label}</h3>
            <p className="text-sm text-gray-500">Click to upload JSON</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
