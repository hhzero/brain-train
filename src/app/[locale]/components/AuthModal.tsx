'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import Button from './Button';
import { useAuth, RegisterData, LoginData } from '../../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const t = useTranslations('auth');
  const { login, register, loading, error, clearError } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 重置表单
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
    setFormErrors({});
    clearError();
  };

  // 切换模式
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  // 关闭模态框
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // 邮箱验证
    if (!formData.email) {
      errors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('errors.emailInvalid');
    }
    
    // 密码验证
    if (!formData.password) {
      errors.password = t('errors.passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('errors.passwordTooShort');
    }
    
    // 注册模式额外验证
    if (mode === 'register') {
      if (!formData.username) {
        errors.username = t('errors.usernameRequired');
      } else if (formData.username.length < 3) {
        errors.username = t('errors.usernameTooShort');
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = t('errors.confirmPasswordRequired');
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('errors.passwordMismatch');
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let result;
      
      if (mode === 'login') {
        const loginData: LoginData = {
          email: formData.email,
          password: formData.password
        };
        result = await login(loginData);
      } else {
        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          username: formData.username
        };
        result = await register(registerData);
      }
      
      if (result.success) {
        handleClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full max-w-md mx-4 bg-gray-900 bg-opacity-95 backdrop-blur-md rounded-2xl border border-cyan-700 shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X size={24} />
        </button>
        
        {/* 模态框头部 */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? t('login.title') : t('register.title')}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? t('login.subtitle') : t('register.subtitle')}
          </p>
        </div>
        
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* 全局错误信息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          {/* 注册模式：用户名 */}
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                {t('fields.username')}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  formErrors.username 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
                }`}
                placeholder={t('placeholders.username')}
                disabled={loading}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-400">{formErrors.username}</p>
              )}
            </div>
          )}
          
          {/* 邮箱 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail size={16} className="inline mr-2" />
              {t('fields.email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                formErrors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
              }`}
              placeholder={t('placeholders.email')}
              disabled={loading}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
            )}
          </div>
          
          {/* 密码 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock size={16} className="inline mr-2" />
              {t('fields.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 bg-gray-800 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  formErrors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
                }`}
                placeholder={t('placeholders.password')}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
            )}
          </div>
          
          {/* 注册模式：确认密码 */}
          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock size={16} className="inline mr-2" />
                {t('fields.confirmPassword')}
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  formErrors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'
                }`}
                placeholder={t('placeholders.confirmPassword')}
                disabled={loading}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
              )}
            </div>
          )}
          
          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full mb-4"
            size="large"
            disabled={loading}
          >
            {loading 
              ? t('common.loading') 
              : mode === 'login' 
                ? t('login.submit') 
                : t('register.submit')
            }
          </Button>
          
          {/* 切换模式 */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? t('login.switchToRegister') : t('register.switchToLogin')}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-medium"
                disabled={loading}
              >
                {mode === 'login' ? t('register.title') : t('login.title')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;