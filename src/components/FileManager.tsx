import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  File, 
  Image, 
  FileText, 
  Archive,
  Video,
  Music,
  Eye,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  Star,
  Copy,
  Edit3,
  Filter,
  SortAsc,
  HardDrive,
  Upload,
  CloudUpload
} from 'lucide-react';
import type { FileItem } from '../utils/apiService';
import { apiService } from '../utils/apiService';

interface FileManagerProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onFileAction?: (action: string, fileId: string) => void;
  onFilesUploaded?: () => void;
  className?: string;
}

const FileManager: React.FC<FileManagerProps> = ({
  files,
  viewMode,
  searchQuery,
  onFileAction,
  onFilesUploaded,
  className = ''
}) => {
  console.log('📂 FileManager received files:', files, 'Length:', files?.length || 0);
  
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'videos' | 'audio'>('all');
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);
  
  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files one by one with progress tracking
      for (const file of droppedFiles) {
        const fileId = `${file.name}-${Date.now()}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: Math.min((prev[fileId] || 0) + Math.random() * 20, 90)
            }));
          }, 200);

          await apiService.uploadFile(file);
          
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
          // Remove progress after a short delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
          
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      }
      
      // Refresh file list after all uploads
      if (onFilesUploaded) {
        onFilesUploaded();
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onFilesUploaded]);

  const getFileIcon = (file: FileItem) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    if (file.type.includes('video/')) return Video;
    if (file.type.includes('audio/')) return Music;
    if (file.type.includes('zip') || file.type.includes('rar')) return Archive;
    return File;
  };

  const getFileTypeColor = (file: FileItem) => {
    if (file.type.startsWith('image/')) return 'from-blue-500/20 to-blue-600/20 text-blue-400';
    if (file.type.includes('pdf')) return 'from-red-500/20 to-red-600/20 text-red-400';
    if (file.type.includes('document')) return 'from-blue-500/20 to-blue-600/20 text-blue-400';
    if (file.type.includes('video/')) return 'from-purple-500/20 to-purple-600/20 text-purple-400';
    if (file.type.includes('audio/')) return 'from-green-500/20 to-green-600/20 text-green-400';
    return 'from-gray-500/20 to-gray-600/20 text-gray-400';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredAndSortedFiles = useMemo(() => {
    console.log('🔍 Filtering files. Input files:', files, 'Search query:', searchQuery, 'Filter type:', filterType);
    
    let filtered = files.filter(file => {
      // Search filter
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      let matchesType = true;
      switch (filterType) {
        case 'images':
          matchesType = file.type.startsWith('image/');
          break;
        case 'documents':
          matchesType = file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text');
          break;
        case 'videos':
          matchesType = file.type.startsWith('video/');
          break;
        case 'audio':
          matchesType = file.type.startsWith('audio/');
          break;
        default:
          matchesType = true;
      }
      
      return matchesSearch && matchesType;
    });

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    console.log('✅ Filtered and sorted files:', filtered, 'Count:', filtered.length);
    return filtered;
  }, [files, searchQuery, filterType, sortBy, sortOrder]);

  const handleFileSelect = (fileId: string, isCtrlClick: boolean = false) => {
    if (isCtrlClick) {
      setSelectedFiles(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    } else {
      setSelectedFiles([fileId]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimated menu dimensions (adjust based on actual menu size)
    const menuWidth = 200;
    const menuHeight = 280;
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust horizontal position if menu would go off-screen
    if (x + menuWidth > viewportWidth) {
      x = e.clientX - menuWidth;
    }
    
    // Adjust vertical position if menu would go off-screen
    if (y + menuHeight > viewportHeight) {
      y = e.clientY - menuHeight;
    }
    
    // Ensure menu doesn't go off the left or top edge
    x = Math.max(10, x);
    y = Math.max(10, y);
    
    setShowContextMenu({
      x,
      y,
      fileId
    });
  };

  const handleDoubleClick = (file: FileItem) => {
    // Open preview for image and video files on double-click
    if ((file.type.startsWith('image/') || file.type.startsWith('video/')) && onFileAction) {
      onFileAction('preview', file.id);
    }
  };

  const handleAction = (action: string, fileId?: string) => {
    const targetFileId = fileId || selectedFiles[0];
    if (onFileAction && targetFileId) {
      onFileAction(action, targetFileId);
    }
    setShowContextMenu(null);
  };

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-accent/20 backdrop-blur-sm border-2 border-dashed border-accent rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CloudUpload className="w-10 h-10 text-accent" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Drop files here</h3>
              <p className="text-white/70">Release to upload your files</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {isUploading && Object.keys(uploadProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 z-40 bg-card/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 min-w-[300px]"
          >
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Uploading files...
            </h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => {
                const fileName = fileId.split('-')[0];
                return (
                  <div key={fileId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 truncate">{fileName}</span>
                      <span className="text-white/60">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-gradient-to-r from-accent to-secondary h-2 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-4">
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            {['all', 'images', 'documents', 'videos', 'audio'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filterType === type
                    ? 'bg-accent text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="w-px h-6 bg-white/20" />
          
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-white/60" />
            {['name', 'date', 'size', 'type'].map((sort) => (
              <button
                key={sort}
                onClick={() => toggleSort(sort as any)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all ${
                  sortBy === sort
                    ? 'bg-accent/20 text-accent'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{sort.charAt(0).toUpperCase() + sort.slice(1)}</span>
                {sortBy === sort && (
                  <SortAsc className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-white/60 text-sm">{selectedFiles.length} selected</span>
            <button
              onClick={() => handleAction('download')}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction('share')}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Files Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredAndSortedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              const colorClass = getFileTypeColor(file);
              const isSelected = selectedFiles.includes(file.id);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={(e) => handleFileSelect(file.id, e.ctrlKey)}
                  onDoubleClick={() => handleDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  className={`relative bg-white/5 rounded-xl p-4 border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-accent bg-accent/10' 
                      : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                  
                  {/* File Icon/Thumbnail */}
                  <div className="relative w-full h-32 mb-3 bg-white/5 rounded-lg overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={`http://localhost:8000/api/v1/files/${file.id}/preview`} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : file.type.startsWith('video/') ? (
                      <video 
                        src={`http://localhost:8000/api/v1/files/${file.id}/preview`}
                        className="w-full h-full object-cover"
                        muted
                        onMouseEnter={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.currentTime = 0;
                          video.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.pause();
                          video.currentTime = 0;
                        }}
                        onError={(e) => {
                          // Fallback to icon if video fails to load
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : file.type.startsWith('text/') || file.type.includes('pdf') ? (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <div className="text-center">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-white/60" />
                          <div className="text-xs text-white/40 px-2 truncate">{file.name}</div>
                        </div>
                      </div>
                    ) : null}
                    <div className={`${file.type.startsWith('image/') || file.type.startsWith('video/') ? 'hidden' : ''} absolute inset-0 bg-gradient-to-r ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <h4 className="text-white font-medium mb-1 truncate">{file.name}</h4>
                  <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                  <p className="text-white/40 text-xs mt-1">{formatDate(file.uploadDate)}</p>
                  
                  {/* File Status */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1">
                      {file.isStarred && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                      {file.isShared && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, file.id);
                      }}
                      className="text-white/60 hover:text-white p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredAndSortedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              const colorClass = getFileTypeColor(file);
              const isSelected = selectedFiles.includes(file.id);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={(e) => handleFileSelect(file.id, e.ctrlKey)}
                  onDoubleClick={() => handleDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-accent/10 border border-accent' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium">{file.name}</p>
                        {file.isStarred && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <p className="text-white/60 text-sm">
                        {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {file.isShared && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-400 text-xs">Shared</span>
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('view', file.id);
                      }}
                      className="text-white/60 hover:text-white p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('download', file.id);
                      }}
                      className="text-white/60 hover:text-white p-2"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('share', file.id);
                      }}
                      className="text-white/60 hover:text-white p-2"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, file.id);
                      }}
                      className="text-white/60 hover:text-white p-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: showContextMenu.y,
              left: showContextMenu.x,
              zIndex: 1000
            }}
            className="bg-card/90 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl"
            onMouseLeave={() => setShowContextMenu(null)}
          >
            {[
              { icon: Eye, label: 'View', action: 'view' },
              { icon: Download, label: 'Download', action: 'download' },
              { icon: Share2, label: 'Share', action: 'share' },
              { icon: Copy, label: 'Copy Link', action: 'copy' },
              { icon: Edit3, label: 'Rename', action: 'rename' },
              { icon: Star, label: 'Star', action: 'star' },
              { icon: Trash2, label: 'Delete', action: 'delete', danger: true }
            ].map((item) => (
              <button
                key={item.action}
                onClick={() => handleAction(item.action, showContextMenu.fileId)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  item.danger
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            {files.find(f => f.id === showContextMenu.fileId)?.isShared && (
              <button
                onClick={() => handleAction('unshare', showContextMenu.fileId)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
              >
                <Share2 className="w-4 h-4" />
                <span>Stop Sharing</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredAndSortedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <HardDrive className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">No files found</h3>
          <p className="text-white/40">
            {searchQuery ? 'Try adjusting your search or filters' : 'Upload some files to get started'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FileManager;