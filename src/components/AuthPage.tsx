import React, { useState, useEffect } from 'react';
import { Bot, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}

function AuthPage({ onAuthSuccess, onBackToLanding }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isVisible, setIsVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Sign up specific validations
    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simulate authentication process with loading stages
  const simulateAuth = async () => {
    const stages = [
      { stage: 'Validating credentials...', duration: 800 },
      { stage: 'Connecting to server...', duration: 600 },
      { stage: 'Verifying account...', duration: 700 },
      { stage: 'Setting up session...', duration: 500 },
      { stage: 'Loading dashboard...', duration: 400 }
    ];

    let progress = 0;
    
    for (let i = 0; i < stages.length; i++) {
      setLoadingStage(stages[i].stage);
      
      // Animate progress
      const targetProgress = ((i + 1) / stages.length) * 100;
      const progressIncrement = (targetProgress - progress) / 20;
      
      for (let j = 0; j < 20; j++) {
        progress += progressIncrement;
        setLoadingProgress(Math.min(progress, targetProgress));
        await new Promise(resolve => setTimeout(resolve, stages[i].duration / 20));
      }
    }

    // Show success message
    setSuccessMessage(isLogin ? 'Login successful!' : 'Account created successfully!');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onAuthSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStage('');
    setSuccessMessage('');

    try {
      await simulateAuth();
    } catch (error) {
      setErrors({ email: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        
        {/* Floating Orbs */}
        <div className="fixed top-1/4 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="fixed top-1/3 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="fixed bottom-1/4 left-1/3 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        <div className="relative z-10 bg-gray-900/80 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-12 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            {/* Animated Logo */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 border-2 border-purple-500/30 rounded-full animate-spin"></div>
            </div>

            {/* Loading Animation */}
            <div className="mb-8">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"
                  style={{
                    animation: 'spin 1s linear infinite'
                  }}
                ></div>
                <div className="absolute inset-2 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-purple-300 text-sm font-medium">{Math.round(loadingProgress)}% Complete</p>
            </div>

            {/* Loading Stage */}
            <div className="mb-6">
              <p className="text-white font-semibold mb-3 text-lg">{loadingStage}</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      {/* Animated Mesh Gradient */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-1/4 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="fixed top-1/3 right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl animate-float delay-1000"></div>
      <div className="fixed bottom-1/4 left-1/3 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl animate-float delay-2000"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Premium Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 relative">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            {/* Logo Section */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Bot className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur opacity-30"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                  SmaRta
                </h1>
                <p className="text-gray-400 font-medium">AI Notes Dashboard</p>
              </div>
            </div>

            {/* Hero Content */}
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Welcome to the
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                Future of Notes
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-lg">
              Join thousands of professionals who have transformed their productivity with AI-powered note-taking and intelligent insights.
            </p>

            {/* Feature List */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300 text-lg">AI-powered transcription and summaries</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300 text-lg">Smart search across all your content</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300 text-lg">Chat with your notes using AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Premium Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 relative">
          <div className={`w-full max-w-md transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="bg-gray-900/80 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    SmaRta
                  </h1>
                </div>

                {/* Header */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {isLogin 
                      ? 'Sign in to access your AI-powered notes' 
                      : 'Join thousands of users transforming their productivity'
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name (Sign Up Only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                        <input
                          type="text"
                          value={formData.fullName || ''}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 form-input ${
                            errors.fullName ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-purple-500 focus:bg-gray-800/70'
                          }`}
                          placeholder="Enter your full name"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                      </div>
                      {errors.fullName && (
                        <div className="flex items-center space-x-2 mt-3 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.fullName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 form-input ${
                          errors.email ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-purple-500 focus:bg-gray-800/70'
                        }`}
                        placeholder="Enter your email"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                    {errors.email && (
                      <div className="flex items-center space-x-2 mt-3 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-12 pr-14 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 form-input ${
                          errors.password ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-purple-500 focus:bg-gray-800/70'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                    {errors.password && (
                      <div className="flex items-center space-x-2 mt-3 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password (Sign Up Only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword || ''}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`w-full pl-12 pr-14 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 form-input ${
                            errors.confirmPassword ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-purple-500 focus:bg-gray-800/70'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                      </div>
                      {errors.confirmPassword && (
                        <div className="flex items-center space-x-2 mt-3 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.confirmPassword}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Forgot Password (Login Only) */}
                  {isLogin && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="group relative w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl btn-primary overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-400">or</span>
                    </div>
                  </div>

                  {/* Toggle Auth Mode */}
                  <div className="text-center">
                    <p className="text-gray-400 text-lg">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        onClick={toggleAuthMode}
                        className="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      >
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  </div>

                  {/* Back to Landing */}
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={onBackToLanding}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      ← Back to homepage
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;