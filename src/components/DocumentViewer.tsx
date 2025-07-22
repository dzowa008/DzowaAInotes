import React, { useState, useEffect } from 'react';
import { X, Star, Edit3, Download, Copy, ZoomIn, ZoomOut, FileText, Calendar, Tag, User, MessageCircle, Send, Bot, Minimize2, Maximize2, Save, Eye } from 'lucide-react';
import { Note, ChatMessage } from '../types';
import { generateNotePDF } from '../utils/pdfGenerator';

interface DocumentViewerProps {
  note: Note;
  onClose: () => void;
  onToggleStar?: () => void;
  onEdit?: () => void;
  onSave?: (updatedNote: Note) => void;
}

function DocumentViewer({ note, onClose, onToggleStar, onEdit, onSave }: DocumentViewerProps) {
  const [fontSize, setFontSize] = useState(16);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiMinimized, setAiMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.content);
    // You could add a notification here
  };

  const handleDownloadPDF = () => {
    generateNotePDF(note);
  };

  const handleSave = () => {
    if (onSave) {
      const updatedNote: Note = {
        ...note,
        title: editedTitle,
        content: editedContent,
        updatedAt: new Date()
      };
      onSave(updatedNote);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      setIsEditing(true);
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);

    // Simulate AI response based on note content and editing context
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatInput, isEditing ? editedContent : note.content, isEditing);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string, content: string, editing: boolean): string => {
    const input = userInput.toLowerCase();
    const noteContent = content.toLowerCase();
    
    if (editing) {
      // Writing assistance responses
      if (input.includes('improve') || input.includes('better') || input.includes('enhance')) {
        return `✨ **Writing Enhancement Suggestions:**\n\n• Add more specific examples and details\n• Use stronger action verbs and descriptive language\n• Break up long paragraphs for better readability\n• Include bullet points for key information\n• Add section headers to organize content\n\nWould you like me to help rewrite a specific section?`;
      }
      
      if (input.includes('rewrite') || input.includes('rephrase')) {
        return `🔄 **I can help you rewrite content!**\n\nPlease select the text you want me to rephrase, or tell me which section needs improvement. I can help with:\n• Making it clearer and more concise\n• Improving flow and readability\n• Adding more engaging language\n• Restructuring for better organization`;
      }
      
      if (input.includes('expand') || input.includes('add more') || input.includes('elaborate')) {
        return `📝 **Content Expansion Ideas:**\n\n• Add real-world examples and case studies\n• Include step-by-step instructions\n• Provide background context\n• Add supporting statistics or research\n• Include personal insights and reflections\n\nWhich section would you like me to help expand?`;
      }
      
      if (input.includes('structure') || input.includes('organize') || input.includes('format')) {
        return `🏗️ **Structure Improvement Suggestions:**\n\n• Use clear headings (# ## ###)\n• Add bullet points for lists\n• Create numbered steps for processes\n• Use bold text for emphasis\n• Add horizontal lines (---) as dividers\n\nWould you like me to help restructure a specific section?`;
      }
      
      if (input.includes('grammar') || input.includes('spelling') || input.includes('correct')) {
        return `📚 **Writing Quality Check:**\n\n• Check for spelling and grammar errors\n• Ensure consistent tense usage\n• Verify proper punctuation\n• Review sentence structure\n• Confirm clarity and flow\n\nPaste the text you'd like me to review, and I'll provide specific suggestions!`;
      }
      
      return `✍️ **Writing Assistant Ready!**\n\nI'm here to help you write and edit your note. I can assist with:\n• Improving clarity and flow\n• Expanding on ideas\n• Restructuring content\n• Grammar and style\n• Adding examples and details\n\nWhat would you like help with?`;
    } else {
      // Reading assistance responses
      if (input.includes('summary') || input.includes('summarize')) {
        return `📝 **Quick Summary:**\n\nThis note contains ${content.split(' ').length} words covering key concepts. The main themes focus on the core ideas presented. Would you like me to create a detailed summary or highlight specific sections?`;
      }
      
      if (input.includes('key points') || input.includes('main points')) {
        return `🎯 **Key Points:**\n\n• The note covers several important concepts\n• There are actionable insights throughout\n• Information is well-structured for understanding\n\nWould you like me to elaborate on any specific point?`;
      }
      
      return `🤖 **I'm here to help!**\n\nI can assist you with:\n• Understanding the content\n• Summarizing key points\n• Answering questions\n• Suggesting improvements\n\nClick the edit button to start writing with my assistance!`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const formatContent = (content: string) => {
    // Convert markdown-like content to HTML-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-6">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-5">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 mt-4">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={index} className="text-gray-700 dark:text-gray-300 mb-1 ml-4">{line.substring(2)}</li>;
        } else if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-bold text-gray-800 dark:text-gray-200 mb-2">{line.substring(2, line.length - 2)}</p>;
        } else if (line.trim() === '') {
          return <div key={index} className="mb-3"></div>;
        } else if (line.trim() === '---') {
          return <hr key={index} className="border-gray-300 dark:border-gray-600 my-6" />;
        } else {
          return <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{line}</p>;
        }
      });
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Document Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{note.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{note.timestamp.toLocaleDateString()}</span>
                  </span>
                  {note.category && (
                    <span className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>{note.category}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseFontSize}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Decrease font size"
            >
              <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {fontSize}px
            </span>
            
            <button
              onClick={increaseFontSize}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Increase font size"
            >
              <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

            {onToggleStar && (
              <button
                onClick={onToggleStar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={note.isStarred ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-5 h-5 ${note.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
            )}

            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Save changes"
                >
                  <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleEditMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit note"
              >
                <Edit3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            <button
              onClick={handleCopyContent}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy content"
            >
              <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleDownloadPDF}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Download as PDF"
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                showAIAssistant ? 'bg-purple-100 dark:bg-purple-900' : ''
              }`}
              title="Toggle AI assistant"
            >
              <MessageCircle className={`w-5 h-5 ${
                showAIAssistant ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto flex">
        {/* Main Content Area */}
        <div className={`${showAIAssistant && !aiMinimized ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Metadata Panel */}
          {showMetadata && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Information</h3>
                <button
                  onClick={() => setShowMetadata(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                {note.updatedAt && note.updatedAt.getTime() !== note.timestamp.getTime() && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {note.updatedAt.toLocaleDateString()} at {note.updatedAt.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{note.category || 'Uncategorized'}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Word Count:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {note.content.split(/\s+/).filter(word => word.length > 0).length} words
                  </span>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {note.metadata && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Source:</span>
                    <div className="mt-1 text-gray-900 dark:text-white">
                      {note.metadata.videoUrl && (
                        <div className="text-sm">
                          <span className="font-medium">Video URL:</span>
                          <a 
                            href={note.metadata.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {note.metadata.videoUrl}
                          </a>
                        </div>
                      )}
                      {note.metadata.processedAt && (
                        <div className="text-sm mt-1">
                          <span className="font-medium">Processed:</span>
                          <span className="ml-2">{new Date(note.metadata.processedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!showMetadata && (
            <button
              onClick={() => setShowMetadata(true)}
              className="mb-6 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Show document information
            </button>
          )}

            {/* Document Body */}
            {isEditing ? (
              <div className="space-y-4">
                {/* Title Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ fontSize: `${fontSize}px` }}
                  />
                </div>
                
                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.7', minHeight: '400px' }}
                    placeholder="Start writing your note..."
                  />
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.7' }}
              >
                <div className="space-y-1">
                  {formatContent(note.content)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <div className={`${aiMinimized ? 'w-16' : 'w-1/3'} border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-all duration-300 flex flex-col`}>
            {/* AI Assistant Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {!aiMinimized && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {isEditing ? 'Writing Assistant' : 'AI Assistant'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isEditing ? 'Help me write and edit' : 'Ask me about this note'}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setAiMinimized(!aiMinimized)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={aiMinimized ? "Expand assistant" : "Minimize assistant"}
                >
                  {aiMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!aiMinimized && (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {isEditing 
                          ? "Hi! I'm here to help you write and edit your note. Ask me for suggestions!"
                          : "Hi! I'm here to help you understand and work with this note. Ask me anything!"
                        }
                      </p>
                    </div>
                  )}
                  
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isEditing ? "Ask for writing help..." : "Ask me about this note..."}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      disabled={isAiTyping}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isAiTyping}
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Document Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Document created with DzowaAI Notes
          </div>
          <div>
            {note.content.split(/\s+/).filter(word => word.length > 0).length} words • {note.content.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
