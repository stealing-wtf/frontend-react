import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  Heart, 
  HeartOff, 
  Eye, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { apiService, type SharedFile, type LikeAction } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';

const SharedFileView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [hasViewedFile, setHasViewedFile] = useState(false);

  useEffect(() => {
    if (shareId && !hasViewedFile) {
      loadSharedFile();
    }
  }, [shareId, hasViewedFile]);

  const loadSharedFile = async () => {
    if (!shareId) return;
    
    setLoading(true);
    try {
      const response = await apiService.getSharedFile(shareId);
      
      if (response.success && response.data) {
        setFile(response.data);
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setHasViewedFile(true); // Mark as viewed to prevent duplicate calls
        
        // Load preview if it's a supported file type
        if (response.data.fileType.startsWith('image/') || 
            response.data.fileType.startsWith('video/') ||
            response.data.fileType.startsWith('text/')) {
          const previewUrl = await apiService.getSharedFilePreview(shareId);
          setPreviewUrl(previewUrl);
        }
      } else {
        setError(response.error || 'File not found');
      }
    } catch (err) {
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (action: 'like' | 'dislike') => {
    if (!user || !shareId) {
      // Redirect to login if not authenticated
      navigate('/auth');
      return;
    }

    try {
      const likeAction: LikeAction = { action };
      const response = await apiService.likeSharedFile(shareId, likeAction);
      
      if (response.success && response.data) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setUserReaction(response.data.userReaction);
      }
    } catch (err) {
      console.error('Failed to like file:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file?.fileName,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // TODO: Show toast notification
  };

  const getFileIcon = () => {
    if (!file) return FileText;
    
    if (file.fileType.startsWith('image/')) return ImageIcon;
    if (file.fileType.startsWith('video/')) return Video;
    if (file.fileType.startsWith('audio/')) return Music;
    if (file.fileType.includes('zip') || file.fileType.includes('rar')) return Archive;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10 relative overflow-hidden flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">File Not Found</h1>
          <p className="text-white/60 mb-8">{error || 'The file you\'re looking for doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const FileIcon = getFileIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header */}
      <div className="bg-card/20 backdrop-blur-xl border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="text-white font-bold text-xl">blackfile.xyz</div>
            </div>
            
            {!user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/auth?mode=login')}
                  className="text-white/70 hover:text-white transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/auth?mode=register')}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm">Welcome, {user.username}</span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* File Preview */}
          <div className="aspect-video bg-black/50 flex items-center justify-center relative">
            {previewUrl ? (
              file.fileType.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={file.fileName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : file.fileType.startsWith('video/') ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-full"
                />
              ) : (
                <div className="text-center">
                  <FileIcon className="w-24 h-24 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Preview not available</p>
                </div>
              )
            ) : (
              <div className="text-center">
                <FileIcon className="w-24 h-24 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Preview not available</p>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{file.fileName}</h1>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {file.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(file.uploadDate)}
                  </span>
                  <span>{formatFileSize(file.fileSize)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="bg-card/20 hover:bg-card/30 text-white p-2 rounded-lg transition-colors border border-white/10"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.open(previewUrl || '#', '_blank')}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Like/Dislike */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => handleLike('like')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  userReaction === 'like'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : !user
                    ? 'bg-card/10 text-white/40 border border-white/5 cursor-not-allowed'
                    : 'bg-card/20 hover:bg-card/30 text-white/70 hover:text-white border border-white/10'
                }`}
                disabled={!user}
                title={!user ? 'Create a blackfile.xyz account to like this file' : ''}
              >
                <Heart className={`w-4 h-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                {likes.toLocaleString()}
              </button>
              
              <button
                onClick={() => handleLike('dislike')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  userReaction === 'dislike'
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    : !user
                    ? 'bg-card/10 text-white/40 border border-white/5 cursor-not-allowed'
                    : 'bg-card/20 hover:bg-card/30 text-white/70 hover:text-white border border-white/10'
                }`}
                disabled={!user}
                title={!user ? 'Create a blackfile.xyz account to dislike this file' : ''}
              >
                <HeartOff className={`w-4 h-4 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
                {dislikes.toLocaleString()}
              </button>

              {!user && (
                <div className="flex items-center gap-2 ml-4 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm">
                    <button
                      onClick={() => navigate('/auth')}
                      className="text-accent hover:text-accent/80 underline font-medium"
                    >
                      Create a blackfile.xyz account
                    </button>
                    {' '}to like files
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedFileView;