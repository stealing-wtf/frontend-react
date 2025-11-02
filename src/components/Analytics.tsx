import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  Share2, 
  TrendingUp, 
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { apiService, type FileItem, type FileAnalytics } from '../utils/apiService';

interface AnalyticsData {
  file: FileItem;
  analytics: FileAnalytics;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load all files
      const filesResponse = await apiService.getFiles();
      if (filesResponse.success && filesResponse.data) {
        const allFiles = filesResponse.data.files; // Fix: access the files array

        // Load analytics for shared files
        const sharedFiles = allFiles.filter((file: FileItem) => file.isShared);
        const analyticsPromises = sharedFiles.map(async (file: FileItem) => {
          const analyticsResponse = await apiService.getFileAnalytics(file.id);
          if (analyticsResponse.success && analyticsResponse.data) {
            return {
              file,
              analytics: analyticsResponse.data
            };
          }
          return null;
        });

        const results = await Promise.all(analyticsPromises);
        const validResults = results.filter((result: any): result is AnalyticsData => result !== null);
        setAnalyticsData(validResults);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('zip') || fileType.includes('rar')) return Archive;
    return FileText;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTotalStats = () => {
    return analyticsData.reduce((acc, data) => ({
      totalViews: acc.totalViews + data.analytics.views,
      totalLikes: acc.totalLikes + data.analytics.likes,
      totalDislikes: acc.totalDislikes + data.analytics.dislikes,
      totalShares: acc.totalShares + data.analytics.shares
    }), { totalViews: 0, totalLikes: 0, totalDislikes: 0, totalShares: 0 });
  };

  const getViewsByPeriod = (analytics: FileAnalytics) => {
    switch (selectedPeriod) {
      case 'today':
        return analytics.viewsToday;
      case 'week':
        return analytics.viewsThisWeek;
      case 'month':
        return analytics.viewsThisMonth;
      default:
        return analytics.views;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const totalStats = getTotalStats();
  const sortedData = [...analyticsData].sort((a, b) => 
    getViewsByPeriod(b.analytics) - getViewsByPeriod(a.analytics)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="today">Oggi</option>
            <option value="week">Questa settimana</option>
            <option value="month">Questo mese</option>
            <option value="all">Tutto il tempo</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Visualizzazioni Totali</p>
              <p className="text-2xl font-bold text-white">{formatNumber(totalStats.totalViews)}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Like Totali</p>
              <p className="text-2xl font-bold text-white">{formatNumber(totalStats.totalLikes)}</p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">File Condivisi</p>
              <p className="text-2xl font-bold text-white">{analyticsData.length}</p>
            </div>
            <Share2 className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Engagement Rate</p>
              <p className="text-2xl font-bold text-white">
                {totalStats.totalViews > 0 
                  ? ((totalStats.totalLikes / totalStats.totalViews) * 100).toFixed(1) + '%'
                  : '0%'
                }
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Top Performing Files */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">File più Performanti</h3>
        
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Nessun file condiviso ancora</p>
            <p className="text-gray-500 text-sm mt-2">Condividi alcuni file per vedere le analytics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedData.map((data, index) => {
              const FileIcon = getFileIcon(data.file.type);
              const views = getViewsByPeriod(data.analytics);
              const maxViews = Math.max(...sortedData.map(d => getViewsByPeriod(d.analytics)));
              const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;

              return (
                <motion.div
                  key={data.file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{data.file.name}</p>
                      <p className="text-white/60 text-sm">
                        {formatNumber(views)} visualizzazioni • {formatNumber(data.analytics.likes)} like
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-32 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-white font-medium">{formatNumber(views)}</p>
                      <p className="text-white/60 text-sm">views</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Detailed Analytics Table */}
      {sortedData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Statistiche Dettagliate</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white/60 font-medium py-3">File</th>
                  <th className="text-right text-white/60 font-medium py-3">Visualizzazioni</th>
                  <th className="text-right text-white/60 font-medium py-3">Like</th>
                  <th className="text-right text-white/60 font-medium py-3">Dislike</th>
                  <th className="text-right text-white/60 font-medium py-3">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((data) => {
                  const FileIcon = getFileIcon(data.file.type);
                  const engagement = data.analytics.views > 0 
                    ? ((data.analytics.likes / data.analytics.views) * 100).toFixed(1)
                    : '0';

                  return (
                    <tr key={data.file.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-purple-400" />
                          <span className="text-white truncate max-w-xs">{data.file.name}</span>
                        </div>
                      </td>
                      <td className="text-right text-white py-4">
                        {formatNumber(data.analytics.views)}
                      </td>
                      <td className="text-right text-green-400 py-4">
                        {formatNumber(data.analytics.likes)}
                      </td>
                      <td className="text-right text-red-400 py-4">
                        {formatNumber(data.analytics.dislikes)}
                      </td>
                      <td className="text-right text-white py-4">
                        {engagement}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;