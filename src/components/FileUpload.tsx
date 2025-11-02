import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Archive,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { apiService } from '../utils/apiService';

interface FileUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxFileSize = 10,
  allowedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  multiple = true,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf')) return FileText;
    if (file.type.includes('zip') || file.type.includes('rar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase()) || file.type === type;
    });

    if (!isAllowed) {
      return 'File type not supported';
    }

    return null;
  };

  const uploadFile = async (uploadFileItem: UploadFile) => {
    try {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === uploadFileItem.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 20, 90);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      // Call the actual upload API
      await apiService.uploadFile(uploadFileItem.file);
      
      clearInterval(progressInterval);
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFileItem.id 
          ? { ...f, progress: 100, status: 'completed' }
          : f
      ));

      // Call the onUpload callback if provided
      if (onUpload) {
        await onUpload([uploadFileItem.file]);
      }
    } catch (error) {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFileItem.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ));
    }
  };

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const newUploadFiles: UploadFile[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      const uploadFileItem: UploadFile = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: error ? 'error' : 'uploading',
        error: error || undefined
      };

      newUploadFiles.push(uploadFileItem);

      if (!error) {
        // Start actual upload
        setTimeout(() => uploadFile(uploadFileItem), 100);
      }
    });

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [maxFileSize, allowedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-accent bg-accent/10 scale-105' 
            : 'border-white/20 hover:border-accent/50 hover:bg-white/5'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-accent' : 'text-white/60'}`} />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Files'}
          </h3>
          
          <p className="text-white/60 mb-4">
            Drag and drop your files here or click to browse
          </p>
          
          <div className="text-white/40 text-sm space-y-1">
            <p>Supported formats: PDF, Images, Documents</p>
            <p>Maximum file size: {maxFileSize}MB</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-3"
          >
            <h4 className="text-white font-medium mb-4">Upload Progress</h4>
            
            {uploadFiles.map((uploadFile, index) => {
              const Icon = getFileIcon(uploadFile.file);
              
              return (
                <motion.div
                  key={uploadFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm truncate max-w-48">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-white/60 text-xs">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      )}
                      {uploadFile.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="text-white/60 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <div className="mb-3">
                      <p className="text-red-400 text-xs">{uploadFile.error}</p>
                    </div>
                  )}
                  
                  {uploadFile.status !== 'error' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">
                          {uploadFile.status === 'completed' ? 'Completed' : 'Uploading...'}
                        </span>
                        <span className="text-white/60">
                          {Math.round(uploadFile.progress)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-2 rounded-full ${
                            uploadFile.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-gradient-to-r from-accent to-secondary'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;