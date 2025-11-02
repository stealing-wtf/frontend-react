import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  FolderOpen, 
  Upload, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Grid3X3,
  List,
  Search,
  User,
  Download,
  Share2,
  Crown,
  File,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/apiService';
import type { FileItem, UserStats } from '../utils/apiService';
import FileManager from './FileManager';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';
import Analytics from './Analytics';
import CustomNotification from './CustomNotification';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Context menu state for overview section
  const [showContextMenu, setShowContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string;
  } | null>(null);
  
  // Custom notification state
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    title: string;
    message: string;
    shareUrl?: string;
    type?: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    title: '',
    message: '',
    shareUrl: '',
    type: 'success'
  });

  useEffect(() => {
    console.log('🚀 Dashboard useEffect triggered. User:', user);
    if (user) {
      console.log('👤 User exists, loading dashboard data...');
      loadDashboardData();
    } else {
      console.log('❌ No user found, skipping data load');
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading dashboard data...');
      
      const [filesResponse, statsResponse] = await Promise.all([
        apiService.getFiles(),
        apiService.getUserStats()
      ]);

      console.log('📁 Files response:', filesResponse);
      console.log('📊 Stats response:', statsResponse);

      if (filesResponse.success && filesResponse.data) {
        console.log('✅ Files data received:', filesResponse.data.files);
        setFiles(filesResponse.data.files || []);
      } else {
        console.log('❌ No files data or unsuccessful response');
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle context menu for overview section
  const handleOverviewContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimated menu dimensions
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

  const handleFileAction = async (action: string, fileId: string) => {
    const file = files.find(f => f.id === fileId);
    
    try {
      switch (action) {
        case 'view':
        case 'preview':
          if (file) {
            setPreviewFile(file);
            setIsPreviewOpen(true);
          }
          break;
          
        case 'download':
          if (file) {
            try {
              const response = await apiService.downloadFile(fileId);
              if (response.success && response.data) {
                const url = window.URL.createObjectURL(response.data);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }
            } catch (error) {
              console.error('Download failed:', error);
            }
          }
          break;
          
        case 'delete':
          if (file && window.confirm(`Sei sicuro di voler eliminare "${file.name}"?`)) {
            try {
              const response = await apiService.deleteFile(fileId);
              if (response.success) {
                await loadDashboardData();
              }
            } catch (error) {
              console.error('Delete failed:', error);
            }
          }
          break;
          
        case 'share':
          try {
            const response = await apiService.createShareLink(fileId);
            if (response.success && response.data) {
              const shareUrl = `${window.location.origin}/share/${response.data.shareId}`;
              
              // Copy share URL to clipboard
              await navigator.clipboard.writeText(shareUrl);
              
              // Show custom notification
              setNotification({
                isVisible: true,
                title: 'File condiviso con successo!',
                message: 'Il link è stato copiato negli appunti',
                shareUrl: shareUrl,
                type: 'success'
              });
              
              await loadDashboardData();
            }
          } catch (error) {
            console.error('Share failed:', error);
            
            // Show custom error notification instead of alert
            setNotification({
              isVisible: true,
              title: 'Errore di condivisione',
              message: 'Si è verificato un errore durante la condivisione del file',
              type: 'error'
            });
          }
          break;
        case 'unshare':
          try {
            const response = await apiService.shareFile(fileId, false);
            if (response.success) {
              setNotification({
                isVisible: true,
                title: 'Condivisione interrotta',
                message: 'Il file non è più condiviso pubblicamente',
                type: 'info'
              });
              
              await loadDashboardData();
            }
          } catch (error) {
            console.error('Unshare failed:', error);
            
            setNotification({
              isVisible: true,
              title: 'Errore',
              message: 'Si è verificato un errore durante l\'interruzione della condivisione',
              type: 'error'
            });
          }
          break;
        case 'star':
          await apiService.starFile(fileId, !files.find(f => f.id === fileId)?.isStarred);
          await loadDashboardData();
          break;
        case 'rename':
          const newName = prompt('Enter new name:');
          if (newName) {
            await apiService.renameFile(fileId, newName);
            await loadDashboardData();
          }
          break;
        case 'copy':
          const shareUrl = `${window.location.origin}/file/${fileId}`;
          await navigator.clipboard.writeText(shareUrl);
          break;
        default:
          console.log(`Action ${action} not implemented yet`);
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      setError(`Failed to ${action} file`);
    }
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const handlePreviewDownload = (fileId: string) => {
    handleFileAction('download', fileId);
  };

  const handlePreviewShare = (fileId: string) => {
    handleFileAction('share', fileId);
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    console.log(`${uploadedFiles.length} file(s) uploaded successfully`);
    // Reload dashboard data to show newly uploaded files
    await loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'files', label: 'My Files', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="flex h-screen relative z-10">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card/20 backdrop-blur-xl border border-white/10 rounded-lg text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          className={`
            w-64 bg-card/20 backdrop-blur-xl border-r border-white/10 p-6 
            lg:static lg:block
            fixed inset-y-0 left-0 z-50 
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform duration-300 ease-in-out
          `}
        >
          {/* Brand */}
          <motion.div 
            className="flex items-center space-x-3 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-accent to-secondary rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">blackfile.xyz</h1>
              <p className="text-white/60 text-sm">{user?.username}</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    console.log(`🔄 Switching to tab: ${tab.id}`);
                    setActiveTab(tab.id);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* User Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Account Status</span>
              {user?.isPremium && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-accent to-secondary rounded-full">
                  <Crown className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">Pro</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${user?.isPremium ? 'bg-accent' : 'bg-white/40'}`} />
              <span className="text-white font-medium text-sm">
                {user?.isPremium ? 'Premium User' : 'Free User'}
              </span>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 hover:border-white/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0"
            >
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-white/60 text-sm lg:text-base">
                  {activeTab === 'overview' && 'Welcome back! Here\'s your file management overview.'}
                  {activeTab === 'files' && 'Manage and organize your uploaded files.'}
                  {activeTab === 'upload' && 'Upload new files to your storage.'}
                  {activeTab === 'settings' && 'Manage your account settings and preferences.'}
                </p>
              </div>
              
              {activeTab === 'files' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={loadDashboardData}
                      className="p-2 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      title="Aggiorna file"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-white/60 hover:text-white'}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-white/60 hover:text-white'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Content based on active tab */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                >
                  Retry
                </button>
              </div>
            ) : activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
                >
                  {stats && [
                    { label: 'Total Files', value: (stats.totalFiles || 0).toString(), icon: File, color: 'from-blue-500 to-blue-600' },
                    { label: 'Storage Used', value: `${((stats.storageUsed || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`, icon: BarChart3, color: 'from-green-500 to-green-600' },
                    { label: 'Shared Files', value: (stats.sharedFiles || 0).toString(), icon: Share2, color: 'from-purple-500 to-purple-600' },
                    { label: 'Downloads', value: (stats.totalDownloads || 0).toString(), icon: Download, color: 'from-orange-500 to-orange-600' },
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-card/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Recent Files */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-card/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Files</h3>
                    <button
                      onClick={() => setActiveTab('files')}
                      className="text-accent hover:text-accent/80 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {files.slice(0, 3).map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                        onDoubleClick={() => {
                          setPreviewFile(file);
                          setIsPreviewOpen(true);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg flex items-center justify-center">
                            <File className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-white/60 text-sm">{(file.size / (1024 * 1024)).toFixed(1)} MB • {new Date(file.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.isShared && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Shared" />
                          )}
                          <button 
                            className="text-white/60 hover:text-white"
                            onClick={(e) => handleOverviewContextMenu(e, file.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Files Tab */}
            {!isLoading && !error && activeTab === 'files' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FileManager
                  files={files}
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                  onFileAction={handleFileAction}
                />
              </motion.div>
            )}

            {/* Upload Tab */}
            {!isLoading && !error && activeTab === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Upload Files</h3>
                <FileUpload
                  onUpload={handleFileUpload}
                  maxFileSize={user?.isPremium ? 100 : 10}
                  multiple={true}
                />
              </motion.div>
            )}

            {/* Analytics Tab */}
            {!isLoading && !error && activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Analytics />
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                {/* Account Settings */}
                <div className="bg-card/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-6">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Username</label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">User ID</label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Storage Settings */}
                <div className="bg-card/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-6">Storage & Limits</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Storage Used</span>
                      <span className="text-white font-medium">2.1 GB / 10 GB</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-accent to-secondary h-2 rounded-full" style={{ width: '21%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">File Upload Limit</span>
                      <span className="text-white font-medium">{user?.isPremium ? '100 MB' : '10 MB'}</span>
                    </div>
                  </div>
                </div>

                {/* Premium Upgrade */}
                {!user?.isPremium && (
                  <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-2xl p-6 border border-accent/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Upgrade to Premium</h3>
                        <p className="text-white/60 text-sm">Get unlimited storage, larger file uploads, and premium features.</p>
                      </div>
                      <button className="bg-gradient-to-r from-accent to-secondary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreview
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        onDownload={handlePreviewDownload}
        onShare={handlePreviewShare}
      />

      {/* Custom Notification */}
      <CustomNotification
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        title={notification.title}
        message={notification.message}
        shareUrl={notification.shareUrl}
        type={notification.type}
      />

      {/* Context Menu for Overview */}
      {showContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-card/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl py-2 min-w-[200px]"
            style={{
              left: showContextMenu.x,
              top: showContextMenu.y,
            }}
          >
            <button
              onClick={() => {
                handleFileAction('preview', showContextMenu.fileId);
                setShowContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center space-x-3"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => {
                handleFileAction('download', showContextMenu.fileId);
                setShowContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center space-x-3"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
               onClick={() => {
                 handleFileAction('share', showContextMenu.fileId);
                 setShowContextMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center space-x-3"
             >
               <Share2 className="w-4 h-4" />
               <span>Share</span>
             </button>
             {files.find(f => f.id === showContextMenu.fileId)?.isShared && (
               <button
                 onClick={() => {
                   handleFileAction('unshare', showContextMenu.fileId);
                   setShowContextMenu(null);
                 }}
                 className="w-full px-4 py-2 text-left text-orange-400 hover:bg-orange-500/10 flex items-center space-x-3"
               >
                 <Share2 className="w-4 h-4" />
                 <span>Stop Sharing</span>
               </button>
             )}
            <hr className="border-white/10 my-1" />
            <button
              onClick={() => {
                handleFileAction('delete', showContextMenu.fileId);
                setShowContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center space-x-3"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;