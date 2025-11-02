import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Eye, FileText, Image as ImageIcon, Video, Music, Archive } from 'lucide-react';
import { type FileItem } from '../utils/apiService';
import CookieService from '../utils/cookieService';

interface FilePreviewProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (fileId: string) => void;
  onShare?: (fileId: string) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
  onShare
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && isOpen) {
      generatePreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, isOpen]);

  const generatePreview = async () => {
    if (!file || !file.type) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get auth token
      const token = CookieService.getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // For images, videos, and text files, we can generate previews
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || 
          file.type.startsWith('text/') || file.type === 'application/json') {
        
        const response = await fetch(`http://localhost:8000/api/v1/files/${file.id}/preview`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } else {
          setError('Failed to load preview');
        }
      }
    } catch (err) {
      setError('Impossibile generare l\'anteprima');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file || !file.type) return FileText;
    
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar')) return Archive;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    if (!file) return null;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/60">
          <Eye className="w-12 h-12 mb-4" />
          <p>{error}</p>
        </div>
      );
    }

    if (file.type.startsWith('image/') && previewUrl) {
      return (
        <div className="flex items-center justify-center max-h-96 overflow-hidden rounded-lg">
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            onError={() => setError('Impossibile caricare l\'immagine')}
          />
        </div>
      );
    }

    if (file.type.startsWith('video/') && previewUrl) {
      return (
        <div className="flex items-center justify-center max-h-96 overflow-hidden rounded-lg">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full"
            onError={() => setError('Impossibile caricare il video')}
          >
            Il tuo browser non supporta la riproduzione video.
          </video>
        </div>
      );
    }

    if (file.type.startsWith('audio/') && previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Music className="w-16 h-16 text-accent mb-4" />
          <audio
            src={previewUrl}
            controls
            className="w-full max-w-md"
            onError={() => setError('Impossibile caricare l\'audio')}
          >
            Il tuo browser non supporta la riproduzione audio.
          </audio>
        </div>
      );
    }

    // Default preview for unsupported file types
    const Icon = getFileIcon();
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60">
        <Icon className="w-16 h-16 mb-4" />
        <p>Anteprima non disponibile per questo tipo di file</p>
        <p className="text-sm mt-2">Usa il pulsante download per visualizzare il file</p>
      </div>
    );
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card/90 backdrop-blur-xl rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center">
                {React.createElement(getFileIcon(), { className: "w-5 h-5 text-white" })}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white truncate max-w-md">
                  {file.name}
                </h3>
                <p className="text-sm text-white/60">
                  {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onDownload && (
                <button
                  onClick={() => onDownload(file.id)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={() => onShare(file.id)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Condividi"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {renderPreview()}
          </div>

          {/* File Details */}
          <div className="px-6 pb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Dettagli File</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Nome:</span>
                  <p className="text-white">{file.name}</p>
                </div>
                <div>
                  <span className="text-white/60">Tipo:</span>
                  <p className="text-white">{file.type}</p>
                </div>
                <div>
                  <span className="text-white/60">Dimensione:</span>
                  <p className="text-white">{formatFileSize(file.size)}</p>
                </div>
                <div>
                  <span className="text-white/60">Caricato:</span>
                  <p className="text-white">{formatDate(file.uploadDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilePreview;