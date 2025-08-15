'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../hooks/useAuth';
import { useTrainingData, formatTrainingTime, formatScore, getTrainingTypeName } from '../../../hooks/useTrainingData';
import { User, Mail, Edit3, Save, X, Trophy, Target, Clock, TrendingUp, Download, Upload, Trash2 } from 'lucide-react';
import Button from './Button';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('profile');
  const { user, updateUser, logout, loading } = useAuth();
  const { 
    userStats, 
    recentTrainings, 
    loading: dataLoading, 
    error: dataError,
    exportData,
    importData,
    clearData
  } = useTrainingData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置编辑数据
  const resetEditData = () => {
    setEditData({
      username: user?.username || '',
      email: user?.email || ''
    });
    setErrors({});
  };

  // 开始编辑
  const startEditing = () => {
    resetEditData();
    setIsEditing(true);
  };

  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(false);
    resetEditData();
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!editData.username.trim()) {
      newErrors.username = t('errors.usernameRequired');
    } else if (editData.username.length < 3) {
      newErrors.username = t('errors.usernameTooShort');
    }
    
    if (!editData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = t('errors.emailInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存更改
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await updateUser(editData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    onClose();
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 处理数据导出
  const handleExportData = () => {
    const data = exportData();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brain-train-data-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // 处理数据导入
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as string;
        const success = await importData(data);
        if (success) {
          alert(t('profile.importSuccess'));
        }
      };
      reader.readAsText(file);
    }
  };

  // 处理数据清除
  const handleClearData = async () => {
    if (confirm(t('profile.confirmClearData'))) {
      await clearData();
      alert(t('profile.dataClearedSuccess'));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full max-w-2xl mx-4 bg-gray-900 bg-opacity-95 backdrop-blur-md rounded-2xl border border-cyan-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10"
        >
          <X size={24} />
        </button>
        
        {/* 用户头像和基本信息 */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.username 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
                      }`}
                      placeholder={t('fields.username')}
                      disabled={loading}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
                      }`}
                      placeholder={t('fields.email')}
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                  <p className="text-gray-400 flex items-center">
                    <Mail size={16} className="mr-2" />
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('joinedOn')} {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    size="small"
                    disabled={loading}
                    className="!px-3"
                  >
                    <Save size={16} />
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="secondary"
                    size="small"
                    disabled={loading}
                    className="!px-3"
                  >
                    <X size={16} />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={startEditing}
                  variant="secondary"
                  size="small"
                  className="!px-3"
                >
                  <Edit3 size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* 统计数据 */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('stats.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <Target className="text-cyan-400" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">{userStats?.totalTrainings || 0}</div>
              <div className="text-sm text-gray-400">{t('stats.totalTrainings')}</div>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <Clock className="text-green-400" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">
                {userStats ? formatTrainingTime(userStats.totalTime) : '0秒'}
              </div>
              <div className="text-sm text-gray-400">{t('stats.totalTime')}</div>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="text-yellow-400" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">{userStats ? formatScore(userStats.bestScore) : '0'}</div>
              <div className="text-sm text-gray-400">{t('stats.bestScore')}</div>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">{userStats?.streakDays || 0}</div>
              <div className="text-sm text-gray-400">{t('stats.streak')}</div>
            </div>
          </div>
          
          {/* 最近训练记录 */}
          <h4 className="text-md font-semibold text-white mb-3">{t('recentTrainings')}</h4>
          <div className="space-y-2 mb-6">
            {recentTrainings.length > 0 ? (
              recentTrainings.map((training) => (
                <div key={training.id} className="bg-gray-800 bg-opacity-30 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{getTrainingTypeName(training.type, 'zh')}</div>
                    <div className="text-sm text-gray-400">{new Date(training.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-semibold">{formatScore(training.score)}</div>
                    <div className="text-sm text-gray-400">{formatTrainingTime(training.duration)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('profile.noTrainings')}
              </div>
            )}
          </div>
          
          {/* 数据管理 */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">{t('dataManagement')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={handleExportData}
                variant="secondary"
                size="small"
                className="flex items-center justify-center gap-2"
                disabled={dataLoading}
              >
                <Download size={16} />
                {t('exportData')}
              </Button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  disabled={dataLoading}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                  <Upload size={16} />
                  {t('importData')}
                </div>
              </label>
              
              <Button
                onClick={handleClearData}
                variant="secondary"
                size="small"
                className="flex items-center justify-center gap-2 !bg-red-900 !bg-opacity-50 !border-red-700 !text-red-300 hover:!bg-red-800 hover:!text-red-200"
                disabled={dataLoading}
              >
                <Trash2 size={16} />
                {t('clearData')}
              </Button>
            </div>
          </div>

          {/* 登出按钮 */}
          <div className="flex justify-center">
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="!bg-red-900 !bg-opacity-50 !border-red-700 !text-red-300 hover:!bg-red-800 hover:!text-red-200"
            >
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;