'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Trash2, RotateCcw, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { dataPersistence, UserData } from '@/utils/DataPersistenceManager';

/**
 * 数据管理组件
 * 提供数据导入导出、备份恢复、清除等功能的用户界面
 */
export const DataManagement: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 显示通知
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 导出数据
  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = dataPersistence.exportData();
      if (!data) {
        showNotification('error', '没有可导出的数据');
        return;
      }

      // 创建下载链接
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nback-training-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('success', '数据导出成功！');
    } catch (error) {
      console.error('导出数据失败:', error);
      showNotification('error', '导出数据失败，请重试');
    } finally {
      setIsExporting(false);
    }
  }, [showNotification]);

  // 导入数据
  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = dataPersistence.importData(content);
        
        if (success) {
          showNotification('success', '数据导入成功！页面将刷新以应用新数据');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showNotification('error', '数据格式无效，导入失败');
        }
      } catch (error) {
        console.error('导入数据失败:', error);
        showNotification('error', '导入数据失败，请检查文件格式');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      showNotification('error', '读取文件失败');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    
    // 清除input值，允许重复选择同一文件
    event.target.value = '';
  }, [showNotification]);

  // 恢复备份
  const handleRestoreBackup = useCallback(() => {
    const success = dataPersistence.restoreFromBackup();
    if (success) {
      showNotification('success', '备份恢复成功！页面将刷新');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      showNotification('error', '没有可用的备份数据');
    }
  }, [showNotification]);

  // 清除所有数据
  const handleClearAllData = useCallback(() => {
    dataPersistence.clearAllData();
    showNotification('success', '所有数据已清除！页面将刷新');
    setTimeout(() => window.location.reload(), 1500);
    setShowClearConfirm(false);
  }, [showNotification]);

  // 获取存储信息
  const storageInfo = dataPersistence.getStorageInfo();
  const userData = dataPersistence.getUserData();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">数据管理</h3>
      </div>

      {/* 存储信息 */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">存储信息</span>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>训练会话:</span>
            <span className="text-cyan-400">{userData?.sessions.length || 0} 个</span>
          </div>

          <div className="flex justify-between">
            <span>存储使用:</span>
            <span className="text-green-400">
              {(storageInfo.used / 1024).toFixed(1)} KB ({storageInfo.percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 导出数据 */}
        <motion.button
          onClick={handleExportData}
          disabled={isExporting}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className={`w-5 h-5 text-green-400 ${isExporting ? 'animate-bounce' : ''}`} />
          <span className="text-white font-medium">
            {isExporting ? '导出中...' : '导出数据'}
          </span>
        </motion.button>

        {/* 导入数据 */}
        <motion.label
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-xl transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className={`w-5 h-5 text-blue-400 ${isImporting ? 'animate-bounce' : ''}`} />
          <span className="text-white font-medium">
            {isImporting ? '导入中...' : '导入数据'}
          </span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            disabled={isImporting}
            className="hidden"
          />
        </motion.label>

        {/* 恢复备份 */}
        <motion.button
          onClick={handleRestoreBackup}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-medium">恢复备份</span>
        </motion.button>

        {/* 清除数据 */}
        <motion.button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 rounded-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 className="w-5 h-5 text-red-400" />
          <span className="text-white font-medium">清除数据</span>
        </motion.button>
      </div>

      {/* 清除确认对话框 */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-red-500/30 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h4 className="text-lg font-bold text-white">确认清除数据</h4>
              </div>
              
              <p className="text-gray-300 mb-6">
                此操作将永久删除所有训练记录、成就和设置。此操作无法撤销，请确认是否继续？
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 px-4 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  取消
                </motion.button>
                <motion.button
                  onClick={handleClearAllData}
                  className="flex-1 py-2 px-4 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  确认清除
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通知消息 */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`
              flex items-center gap-3 p-4 rounded-xl backdrop-blur-md border
              ${notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-100' : ''}
              ${notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' : ''}
              ${notification.type === 'info' ? 'bg-blue-500/20 border-blue-500/30 text-blue-100' : ''}
            `}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataManagement;