import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Menu, 
  X,
  Shield,
  User,
  FileText,
  Share2,
  Code,
  Key,
  Database,
  Globe,
  Lock,
  Unlock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <motion.button
          onClick={copyToClipboard}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/70" />
          )}
        </motion.button>
      </div>
      <pre className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 overflow-x-auto text-sm">
        <code className={`language-${language} text-white/90`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

interface EndpointProps {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    type: string;
    example: string;
  };
  responses?: Array<{
    status: number;
    description: string;
    example: string;
  }>;
}

const Endpoint: React.FC<EndpointProps> = ({ 
  method, 
  path, 
  description, 
  auth = false, 
  parameters = [], 
  requestBody, 
  responses = [] 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="p-6 cursor-pointer hover:bg-white/5 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getMethodColor(method)}`}>
              {method.toUpperCase()}
            </span>
            <code className="text-white font-mono text-sm bg-black/20 px-3 py-1 rounded-lg">
              {path}
            </code>
            {auth && (
              <div className="flex items-center space-x-1 text-amber-400">
                <Lock className="w-4 h-4" />
                <span className="text-xs">Auth Required</span>
              </div>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-white/60" />
          </motion.div>
        </div>
        <p className="text-white/80 mt-2 text-sm">{description}</p>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-6 space-y-6">
              {/* Parameters */}
              {parameters.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Database className="w-4 h-4 mr-2 text-blue-400" />
                    Parameters
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 text-white/70 font-medium">Name</th>
                          <th className="text-left py-2 text-white/70 font-medium">Type</th>
                          <th className="text-left py-2 text-white/70 font-medium">Required</th>
                          <th className="text-left py-2 text-white/70 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameters.map((param, index) => (
                          <tr key={index} className="border-b border-white/5">
                            <td className="py-2 text-white font-mono text-xs bg-black/20 rounded px-2 my-1 inline-block">
                              {param.name}
                            </td>
                            <td className="py-2 text-blue-400">{param.type}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                param.required 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {param.required ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-2 text-white/70">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Request Body */}
              {requestBody && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Code className="w-4 h-4 mr-2 text-green-400" />
                    Request Body ({requestBody.type})
                  </h4>
                  <CodeBlock code={requestBody.example} language="json" />
                </div>
              )}

              {/* Responses */}
              {responses.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-purple-400" />
                    Responses
                  </h4>
                  <div className="space-y-4">
                    {responses.map((response, index) => (
                      <div key={index}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            response.status < 300 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : response.status < 400
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {response.status}
                          </span>
                          <span className="text-white/70 text-sm">{response.description}</span>
                        </div>
                        <CodeBlock code={response.example} language="json" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ApiDocumentation: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: FileText,
      subsections: [
        { id: 'overview', title: 'Overview' },
        { id: 'base-url', title: 'Base URL' },
        { id: 'authentication', title: 'Authentication' }
      ]
    },
    {
      id: 'auth-endpoints',
      title: 'Authentication',
      icon: Shield,
      subsections: [
        { id: 'register', title: 'Register' },
        { id: 'verify-otp', title: 'Verify OTP' },
        { id: 'login', title: 'Login' },
        { id: 'refresh', title: 'Refresh Token' },
        { id: 'logout', title: 'Logout' }
      ]
    },
    {
      id: 'user-endpoints',
      title: 'User Management',
      icon: User,
      subsections: [
        { id: 'profile', title: 'User Profile' },
        { id: 'update-profile', title: 'Update Profile' },
        { id: 'user-stats', title: 'Statistics' }
      ]
    },
    {
      id: 'file-endpoints',
      title: 'File Management',
      icon: FileText,
      subsections: [
        { id: 'upload', title: 'Upload File' },
        { id: 'list-files', title: 'List Files' },
        { id: 'download', title: 'Download File' },
        { id: 'delete-file', title: 'Delete File' },
        { id: 'star-file', title: 'Star File' },
        { id: 'rename-file', title: 'Rename File' }
      ]
    },
    {
      id: 'sharing-endpoints',
      title: 'Sharing',
      icon: Share2,
      subsections: [
        { id: 'share-file', title: 'Share File' },
        { id: 'view-shared', title: 'View Shared' },
        { id: 'preview-shared', title: 'Preview Shared' }
      ]
    },
    {
      id: 'error-codes',
      title: 'Error Codes',
      icon: ExternalLink,
      subsections: [
        { id: 'http-codes', title: 'HTTP Status Codes' },
        { id: 'api-errors', title: 'API Error Codes' }
      ]
    }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = 'introduction';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.getAttribute('data-section') || 'introduction';
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">API Documentation</h1>
                <p className="text-white/60 text-sm">Complete guide to BlackFile.xyz API</p>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <AnimatePresence>
            {(isMobileMenuOpen || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed lg:sticky top-20 left-0 z-40 w-80 h-[calc(100vh-5rem)] bg-card/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 overflow-y-auto lg:block"
              >
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <motion.button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeSection === section.id || section.subsections?.some(sub => activeSection === sub.id)
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'hover:bg-white/5 text-white/70 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <section.icon className="w-5 h-5" />
                        <span className="font-medium">{section.title}</span>
                      </motion.button>
                      
                      {section.subsections && (
                        <div className="ml-8 mt-2 space-y-1">
                          {section.subsections.map((subsection) => (
                            <motion.button
                              key={subsection.id}
                              onClick={() => scrollToSection(subsection.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                activeSection === subsection.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-white/60 hover:text-white hover:bg-white/5'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              {subsection.title}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 ml-0">
            <div className="space-y-12">
              
              {/* Introduction */}
              <section id="introduction" data-section="introduction" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold gradient-text">Introduction</h2>
                  </div>
                  
                  <div id="overview" data-section="overview" className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Overview</h3>
                    <p className="text-white/80 leading-relaxed">
                      Welcome to the BlackFile.xyz API documentation. This RESTful API allows you to integrate 
                      file storage, sharing, and management capabilities into your applications. Our API is 
                      designed to be simple, secure, and scalable.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <Shield className="w-6 h-6 text-green-400 mb-2" />
                        <h4 className="font-semibold text-green-400">Secure</h4>
                        <p className="text-sm text-white/70">JWT authentication and encrypted storage</p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <Globe className="w-6 h-6 text-blue-400 mb-2" />
                        <h4 className="font-semibold text-blue-400">RESTful</h4>
                        <p className="text-sm text-white/70">Standard HTTP methods and status codes</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <Code className="w-6 h-6 text-purple-400 mb-2" />
                        <h4 className="font-semibold text-purple-400">JSON</h4>
                        <p className="text-sm text-white/70">All requests and responses in JSON format</p>
                      </div>
                    </div>
                  </div>

                  <div id="base-url" data-section="base-url" className="space-y-4 mt-8">
                    <h3 className="text-xl font-semibold text-white">Base URL</h3>
                    <p className="text-white/80">All API requests should be made to:</p>
                    <CodeBlock 
                      code="https://api.blackfile.xyz" 
                      language="text" 
                    />
                  </div>

                  <div id="authentication" data-section="authentication" className="space-y-4 mt-8">
                    <h3 className="text-xl font-semibold text-white">Authentication</h3>
                    <p className="text-white/80">
                      The API uses JWT (JSON Web Tokens) for authentication. Include the token in the 
                      Authorization header for protected endpoints:
                    </p>
                    <CodeBlock 
                      code="Authorization: Bearer YOUR_JWT_TOKEN" 
                      language="text" 
                    />
                  </div>
                </motion.div>
              </section>

              {/* Authentication Endpoints */}
              <section id="auth-endpoints" data-section="auth-endpoints" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold gradient-text">Authentication</h2>
                  </div>
                  <p className="text-white/80 mb-8">
                    Manage user authentication, registration, and session handling.
                  </p>

                  <div className="space-y-6">
                    <div id="register" data-section="register">
                      <Endpoint
                        method="POST"
                        path="/auth/register"
                        description="Register a new user account with email verification"
                        parameters={[
                          { name: 'email', type: 'string', required: true, description: 'User email address' },
                          { name: 'password', type: 'string', required: true, description: 'User password (min 8 characters)' },
                          { name: 'username', type: 'string', required: true, description: 'Unique username' }
                        ]}
                        requestBody={{
                          type: 'application/json',
                          example: `{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe"
}`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'Registration successful, OTP sent',
                            example: `{
  "message": "Registration successful. Please verify your email.",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}`
                          },
                          {
                            status: 400,
                            description: 'Invalid input or user already exists',
                            example: `{
  "detail": "Email already registered"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="verify-otp" data-section="verify-otp">
                      <Endpoint
                        method="POST"
                        path="/auth/verify-otp"
                        description="Verify email with OTP code sent during registration"
                        parameters={[
                          { name: 'email', type: 'string', required: true, description: 'User email address' },
                          { name: 'otp', type: 'string', required: true, description: '6-digit OTP code' }
                        ]}
                        requestBody={{
                          type: 'application/json',
                          example: `{
  "email": "user@example.com",
  "otp": "123456"
}`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'Email verified successfully',
                            example: `{
  "message": "Email verified successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}`
                          },
                          {
                            status: 400,
                            description: 'Invalid or expired OTP',
                            example: `{
  "detail": "Invalid or expired OTP"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="login" data-section="login">
                      <Endpoint
                        method="POST"
                        path="/auth/login"
                        description="Authenticate user and receive access tokens"
                        parameters={[
                          { name: 'email', type: 'string', required: true, description: 'User email address' },
                          { name: 'password', type: 'string', required: true, description: 'User password' }
                        ]}
                        requestBody={{
                          type: 'application/json',
                          example: `{
  "email": "user@example.com",
  "password": "securepassword123"
}`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'Login successful',
                            example: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "is_verified": true
  }
}`
                          },
                          {
                            status: 401,
                            description: 'Invalid credentials',
                            example: `{
  "detail": "Invalid email or password"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="refresh" data-section="refresh">
                      <Endpoint
                        method="POST"
                        path="/auth/refresh"
                        description="Refresh access token using refresh token"
                        auth={true}
                        requestBody={{
                          type: 'application/json',
                          example: `{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'Token refreshed successfully',
                            example: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}`
                          },
                          {
                            status: 401,
                            description: 'Invalid refresh token',
                            example: `{
  "detail": "Invalid or expired refresh token"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="logout" data-section="logout">
                      <Endpoint
                        method="POST"
                        path="/auth/logout"
                        description="Logout user and invalidate tokens"
                        auth={true}
                        responses={[
                          {
                            status: 200,
                            description: 'Logout successful',
                            example: `{
  "message": "Logged out successfully"
}`
                          }
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* User Endpoints */}
              <section id="user-endpoints" data-section="user-endpoints" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold gradient-text">User Management</h2>
                  </div>
                  <p className="text-white/80 mb-8">
                    Manage user profiles, settings, and account information.
                  </p>

                  <div className="space-y-6">
                    <div id="profile" data-section="profile">
                      <Endpoint
                        method="GET"
                        path="/users/profile"
                        description="Get current user profile information"
                        auth={true}
                        responses={[
                          {
                            status: 200,
                            description: 'Profile retrieved successfully',
                            example: `{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "johndoe",
  "is_verified": true,
  "created_at": "2024-01-15T10:30:00Z",
  "storage_used": 1048576,
  "storage_limit": 1073741824
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="update-profile" data-section="update-profile">
                      <Endpoint
                        method="PUT"
                        path="/users/profile"
                        description="Update user profile information"
                        auth={true}
                        parameters={[
                          { name: 'username', type: 'string', required: false, description: 'New username' },
                          { name: 'email', type: 'string', required: false, description: 'New email address' }
                        ]}
                        requestBody={{
                          type: 'application/json',
                          example: `{
  "username": "newusername",
  "email": "newemail@example.com"
}`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'Profile updated successfully',
                            example: `{
  "message": "Profile updated successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newemail@example.com",
    "username": "newusername",
    "is_verified": true
  }
}`
                          },
                          {
                            status: 400,
                            description: 'Invalid input or username taken',
                            example: `{
  "detail": "Username already taken"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="user-stats" data-section="user-stats">
                      <Endpoint
                        method="GET"
                        path="/users/stats"
                        description="Get user statistics and usage information"
                        auth={true}
                        responses={[
                          {
                            status: 200,
                            description: 'Statistics retrieved successfully',
                            example: `{
  "total_files": 42,
  "total_size": 1048576,
  "storage_limit": 1073741824,
  "files_shared": 5,
  "total_downloads": 128,
  "account_created": "2024-01-15T10:30:00Z"
}`
                          }
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* File Endpoints */}
              <section id="file-endpoints" data-section="file-endpoints" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold gradient-text">File Management</h2>
                  </div>
                  <p className="text-white/80 mb-8">
                    Upload, download, manage, and organize your files.
                  </p>

                  <div className="space-y-6">
                    <div id="upload" data-section="upload">
                      <Endpoint
                        method="POST"
                        path="/files/upload"
                        description="Upload a new file to your storage"
                        auth={true}
                        parameters={[
                          { name: 'file', type: 'file', required: true, description: 'File to upload (multipart/form-data)' },
                          { name: 'folder', type: 'string', required: false, description: 'Folder path (optional)' }
                        ]}
                        requestBody={{
                          type: 'multipart/form-data',
                          example: `Content-Type: multipart/form-data
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Disposition: form-data; name="folder"

/documents`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'File uploaded successfully',
                            example: `{
  "message": "File uploaded successfully",
  "file": {
    "id": "file_123e4567-e89b-12d3-a456-426614174000",
    "filename": "document.pdf",
    "size": 1048576,
    "mime_type": "application/pdf",
    "folder": "/documents",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "download_url": "/files/download/file_123e4567-e89b-12d3-a456-426614174000"
  }
}`
                          },
                          {
                            status: 413,
                            description: 'File too large or storage limit exceeded',
                            example: `{
  "detail": "File size exceeds limit or storage quota exceeded"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="list-files" data-section="list-files">
                      <Endpoint
                        method="GET"
                        path="/files/"
                        description="List all files in user's storage"
                        auth={true}
                        parameters={[
                          { name: 'folder', type: 'string', required: false, description: 'Filter by folder path' },
                          { name: 'search', type: 'string', required: false, description: 'Search by filename' },
                          { name: 'limit', type: 'integer', required: false, description: 'Number of files to return (default: 50)' },
                          { name: 'offset', type: 'integer', required: false, description: 'Number of files to skip (default: 0)' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'Files retrieved successfully',
                            example: `{
  "files": [
    {
      "id": "file_123e4567-e89b-12d3-a456-426614174000",
      "filename": "document.pdf",
      "size": 1048576,
      "mime_type": "application/pdf",
      "folder": "/documents",
      "uploaded_at": "2024-01-15T10:30:00Z",
      "is_starred": false,
      "is_shared": true,
      "download_count": 5
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="download" data-section="download">
                      <Endpoint
                        method="GET"
                        path="/files/download/{file_id}"
                        description="Download a file by its ID"
                        auth={true}
                        parameters={[
                          { name: 'file_id', type: 'string', required: true, description: 'Unique file identifier' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'File download started',
                            example: `Content-Type: application/octet-stream
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 1048576

[Binary file content]`
                          },
                          {
                            status: 404,
                            description: 'File not found',
                            example: `{
  "detail": "File not found"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="delete-file" data-section="delete-file">
                      <Endpoint
                        method="DELETE"
                        path="/files/{file_id}"
                        description="Delete a file permanently"
                        auth={true}
                        parameters={[
                          { name: 'file_id', type: 'string', required: true, description: 'Unique file identifier' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'File deleted successfully',
                            example: `{
  "message": "File deleted successfully"
}`
                          },
                          {
                            status: 404,
                            description: 'File not found',
                            example: `{
  "detail": "File not found"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="star-file" data-section="star-file">
                      <Endpoint
                        method="POST"
                        path="/files/{file_id}/star"
                        description="Toggle star status of a file"
                        auth={true}
                        parameters={[
                          { name: 'file_id', type: 'string', required: true, description: 'Unique file identifier' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'Star status updated',
                            example: `{
  "message": "File starred successfully",
  "is_starred": true
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="rename-file" data-section="rename-file">
                      <Endpoint
                        method="PUT"
                        path="/files/{file_id}/rename"
                        description="Rename a file"
                        auth={true}
                        parameters={[
                          { name: 'file_id', type: 'string', required: true, description: 'Unique file identifier' },
                          { name: 'new_name', type: 'string', required: true, description: 'New filename' }
                        ]}
                        requestBody={{
                          type: 'application/json',
                          example: `{
  "new_name": "renamed_document.pdf"
}`
                        }}
                        responses={[
                          {
                            status: 200,
                            description: 'File renamed successfully',
                            example: `{
  "message": "File renamed successfully",
  "file": {
    "id": "file_123e4567-e89b-12d3-a456-426614174000",
    "filename": "renamed_document.pdf",
    "size": 1048576,
    "mime_type": "application/pdf"
  }
}`
                          }
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* Sharing Endpoints */}
              <section id="sharing-endpoints" data-section="sharing-endpoints" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Share2 className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold gradient-text">Sharing</h2>
                  </div>
                  <p className="text-white/80 mb-8">
                    Share files publicly and manage shared content.
                  </p>

                  <div className="space-y-6">
                    <div id="share-file" data-section="share-file">
                      <Endpoint
                        method="POST"
                        path="/files/{file_id}/share"
                        description="Create a public share link for a file"
                        auth={true}
                        parameters={[
                          { name: 'file_id', type: 'string', required: true, description: 'Unique file identifier' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'Share link created successfully',
                            example: `{
  "message": "File shared successfully",
  "share_url": "https://blackfile.xyz/s/abc123def456",
  "share_id": "abc123def456",
  "expires_at": null
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="view-shared" data-section="view-shared">
                      <Endpoint
                        method="GET"
                        path="/shared/{share_id}"
                        description="Get information about a shared file"
                        parameters={[
                          { name: 'share_id', type: 'string', required: true, description: 'Share identifier from URL' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'Shared file information',
                            example: `{
  "filename": "document.pdf",
  "size": 1048576,
  "mime_type": "application/pdf",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "download_count": 42,
  "likes": 5,
  "dislikes": 1,
  "preview_available": true
}`
                          },
                          {
                            status: 404,
                            description: 'Shared file not found',
                            example: `{
  "detail": "Shared file not found or expired"
}`
                          }
                        ]}
                      />
                    </div>

                    <div id="preview-shared" data-section="preview-shared">
                      <Endpoint
                        method="GET"
                        path="/shared/{share_id}/preview"
                        description="Get preview of shared file (for supported formats)"
                        parameters={[
                          { name: 'share_id', type: 'string', required: true, description: 'Share identifier from URL' }
                        ]}
                        responses={[
                          {
                            status: 200,
                            description: 'File preview content',
                            example: `Content-Type: image/jpeg
Content-Length: 524288

[Preview image data]`
                          },
                          {
                            status: 404,
                            description: 'Preview not available',
                            example: `{
  "detail": "Preview not available for this file type"
}`
                          }
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* Error Codes */}
              <section id="error-codes" data-section="error-codes" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <ExternalLink className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold gradient-text">Error Codes</h2>
                  </div>
                  <p className="text-white/80 mb-8">
                    Understanding API error responses and status codes.
                  </p>

                  <div id="http-codes" data-section="http-codes" className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">HTTP Status Codes</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 text-white/70 font-medium">Code</th>
                            <th className="text-left py-3 text-white/70 font-medium">Status</th>
                            <th className="text-left py-3 text-white/70 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold">
                                200
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">OK</td>
                            <td className="py-3 text-white/70">Request successful</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold">
                                201
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Created</td>
                            <td className="py-3 text-white/70">Resource created successfully</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                400
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Bad Request</td>
                            <td className="py-3 text-white/70">Invalid request parameters</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                401
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Unauthorized</td>
                            <td className="py-3 text-white/70">Authentication required or invalid</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                403
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Forbidden</td>
                            <td className="py-3 text-white/70">Access denied</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                404
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Not Found</td>
                            <td className="py-3 text-white/70">Resource not found</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                413
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Payload Too Large</td>
                            <td className="py-3 text-white/70">File size exceeds limit</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                429
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Too Many Requests</td>
                            <td className="py-3 text-white/70">Rate limit exceeded</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3">
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold">
                                500
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">Internal Server Error</td>
                            <td className="py-3 text-white/70">Server error occurred</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div id="api-errors" data-section="api-errors" className="space-y-4 mt-8">
                    <h3 className="text-xl font-semibold text-white">Common Error Response Format</h3>
                    <p className="text-white/80">
                      All error responses follow a consistent JSON format:
                    </p>
                    <CodeBlock 
                      code={`{
  "detail": "Error message description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                      language="json" 
                    />
                  </div>
                </motion.div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;