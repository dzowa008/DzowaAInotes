import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: () => void;
  isProcessing: boolean;
}

function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center">
        <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Upload Files</h3>
        <p className="text-gray-400 mb-6">Upload documents, audio, video, or images for AI processing</p>
        <button
          onClick={onFileUpload}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
        >
          Choose Files
        </button>
        {isProcessing && (
          <div className="mt-4">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Processing files...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;