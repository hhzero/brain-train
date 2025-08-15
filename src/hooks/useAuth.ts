import { useState, useEffect, useCallback } from 'react';

// 用户数据类型定义
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
}

// 注册数据类型
export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

// 登录数据类型
export interface LoginData {
  email: string;
  password: string;
}

// 认证状态类型
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// 本地存储键名
const AUTH_STORAGE_KEY = 'brainTrain_auth';
const USER_STORAGE_KEY = 'brainTrain_user';

/**
 * 用户认证Hook
 * 提供登录、注册、登出功能，以及用户状态管理
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // 从本地存储加载用户数据
  const loadUserFromStorage = useCallback(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      
      if (storedAuth && storedUser) {
        const authData = JSON.parse(storedAuth);
        const userData = JSON.parse(storedUser);
        
        // 检查token是否过期（简单的时间检查）
        const now = new Date().getTime();
        if (authData.expiresAt && now < authData.expiresAt) {
          setAuthState({
            user: {
              ...userData,
              createdAt: new Date(userData.createdAt)
            },
            loading: false,
            error: null
          });
          return;
        }
      }
      
      // 如果没有有效的认证信息，清除状态
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to load user data'
      });
    }
  }, []);

  // 保存用户数据到本地存储
  const saveUserToStorage = useCallback((user: User, token: string) => {
    try {
      const authData = {
        token,
        expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 7天后过期
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }, []);

  // 清除本地存储的用户数据
  const clearUserFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear user from storage:', error);
    }
  }, []);

  // 模拟用户注册（实际项目中应该调用API）
  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查用户是否已存在（简单的本地检查）
      const existingUsers = JSON.parse(localStorage.getItem('brainTrain_users') || '[]');
      const userExists = existingUsers.some((user: User) => 
        user.email === userData.email || user.username === userData.username
      );
      
      if (userExists) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'User with this email or username already exists'
        }));
        return { success: false, error: 'User already exists' };
      }
      
      // 创建新用户
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        username: userData.username,
        createdAt: new Date()
      };
      
      // 保存到用户列表
      existingUsers.push(newUser);
      localStorage.setItem('brainTrain_users', JSON.stringify(existingUsers));
      
      // 生成模拟token
      const token = `token_${newUser.id}_${Date.now()}`;
      
      // 保存认证信息
      saveUserToStorage(newUser, token);
      
      setAuthState({
        user: newUser,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [saveUserToStorage]);

  // 模拟用户登录
  const login = useCallback(async (loginData: LoginData): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 从本地存储查找用户
      const existingUsers = JSON.parse(localStorage.getItem('brainTrain_users') || '[]');
      const user = existingUsers.find((user: User) => user.email === loginData.email);
      
      if (!user) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Invalid email or password'
        }));
        return { success: false, error: 'Invalid credentials' };
      }
      
      // 在实际项目中，这里应该验证密码哈希
      // 现在我们简单地假设登录成功
      
      // 生成模拟token
      const token = `token_${user.id}_${Date.now()}`;
      
      // 保存认证信息
      saveUserToStorage(user, token);
      
      setAuthState({
        user: {
          ...user,
          createdAt: new Date(user.createdAt)
        },
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [saveUserToStorage]);

  // 用户登出
  const logout = useCallback(() => {
    clearUserFromStorage();
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  }, [clearUserFromStorage]);

  // 更新用户信息
  const updateUser = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'No user logged in' };
    }
    
    try {
      const updatedUser = { ...authState.user, ...updates };
      
      // 更新用户列表中的用户信息
      const existingUsers = JSON.parse(localStorage.getItem('brainTrain_users') || '[]');
      const userIndex = existingUsers.findIndex((user: User) => user.id === authState.user!.id);
      
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('brainTrain_users', JSON.stringify(existingUsers));
      }
      
      // 更新当前用户存储
      const currentAuth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
      saveUserToStorage(updatedUser, currentAuth.token || '');
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update user information' };
    }
  }, [authState.user, saveUserToStorage]);

  // 组件挂载时加载用户数据
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return {
    // 状态
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    
    // 方法
    login,
    register,
    logout,
    updateUser,
    
    // 清除错误
    clearError: () => setAuthState(prev => ({ ...prev, error: null }))
  };
};

export default useAuth;