'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { User, LogIn, UserPlus, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';

const UserMenu: React.FC = () => {
  const t = useTranslations('userMenu');
  const { user, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 打开登录模态框
  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    setIsDropdownOpen(false);
  };

  // 打开注册模态框
  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
    setIsDropdownOpen(false);
  };

  // 打开用户资料
  const openProfile = () => {
    setIsProfileOpen(true);
    setIsDropdownOpen(false);
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // 获取用户头像显示文本
  const getAvatarText = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {user ? (
          // 已登录用户
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-600 hover:border-cyan-500 transition-all duration-200 group"
          >
            {/* 用户头像 */}
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getAvatarText()}
            </div>
            
            {/* 用户名 */}
            <span className="text-white font-medium hidden sm:block">
              {user.username}
            </span>
            
            {/* 下拉箭头 */}
            <ChevronDown 
              size={16} 
              className={`text-gray-400 group-hover:text-cyan-400 transition-all duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        ) : (
          // 未登录用户
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-600 hover:border-cyan-500 transition-all duration-200 group"
          >
            <User size={20} className="text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
            <span className="text-gray-400 group-hover:text-white transition-colors duration-200 hidden sm:block">
              {t('guest')}
            </span>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 group-hover:text-cyan-400 transition-all duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        )}

        {/* 下拉菜单 */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 bg-opacity-95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-50">
            {user ? (
              // 已登录用户菜单
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-700">
                  <div className="text-sm text-gray-400">{t('signedInAs')}</div>
                  <div className="text-white font-medium truncate">{user.email}</div>
                </div>
                
                <button
                  onClick={openProfile}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Settings size={16} />
                  <span>{t('profile')}</span>
                </button>
                
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            ) : (
              // 未登录用户菜单
              <div className="py-2">
                <button
                  onClick={openLoginModal}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                >
                  <LogIn size={16} />
                  <span>{t('login')}</span>
                </button>
                
                <button
                  onClick={openRegisterModal}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                >
                  <UserPlus size={16} />
                  <span>{t('register')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 认证模态框 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* 用户资料模态框 */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default UserMenu;