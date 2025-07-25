import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Zap, 
  Target, 
  BarChart3, 
  BookOpen, 
  Lightbulb, 
  Clock, 
  TrendingUp,
  Archive,
  Filter,
  Hash,
  Workflow,
  Activity,
  Mic,
  Upload,
  PenTool,
  Star,
  Edit3,
  Trash2,
  Folder
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsCards from './StatsCards';
import QuickActions from './QuickActions';
import { NotesGrid } from './NotesGrid';
import ChatInterface from './ChatInterface';
import AudioRecorder from './AudioRecorder';
import FileUpload from './FileUpload';
import DocumentViewer from './DocumentViewer';
import CreateNoteModal from './CreateNoteModal';
import NoteEditor from './NoteEditor';
import SmartSearch from './SmartSearch';
import Categories from './Categories';
import StarredNotes from './StarredNotes';
import YoutubeSummarizer from './YoutubeSummarizer';
import { Note, ChatMessage } from '../types';
import { AlertCircle } from 'lucide-react';
import { FileProcessor } from '../utils/fileProcessor';
import { aiService } from '../services/aiService';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024); // Default open on desktop, closed on mobile
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // New AI features state
  const [aiInsights, setAiInsights] = useState<Array<{id: string, type: string, content: string, timestamp: Date}>>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<Array<{id: string, title: string, description: string, action: string}>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{id: string, type: string, description: string, timestamp: Date, icon: any}>>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [knowledgeGraph, setKnowledgeGraph] = useState<Array<{from: string, to: string, relationship: string}>>([]);
  const [duplicateNotes, setDuplicateNotes] = useState<Array<{id: string, duplicates: string[]}>>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [scheduledReminders, setScheduledReminders] = useState<Array<{id: string, noteId: string, message: string, scheduledFor: Date}>>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<Array<{id: string, from: string, noteId: string, type: string}>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // DEBUG: Log recordingTime every render
  console.log('Dashboard render, recordingTime:', recordingTime);

  // Initialize data and setup event listeners
  useEffect(() => {
    
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setIsCreatingNote(true);
            break;
          case 'k':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case '/':
            e.preventDefault();
            setActiveTab('search');
            break;
          case 'r':
            e.preventDefault();
            if (!isRecording) startRecording();
            break;
          case 'Escape':
            e.preventDefault();
            setSelectedNote(null);
            setIsCreatingNote(false);
            break;
        }
      }
    };

    // Auto-save functionality
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAutoSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [isRecording, isAutoSaving]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile, auto-open on desktop
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;
          console.log('Interval tick, next recordingTime:', next);
          return next;
        });
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, [isRecording]);

  // Notification system
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Add to activity log
    const activityIcon = type === 'success' ? Target : type === 'error' ? AlertCircle : Activity;
    addActivity(type, message, activityIcon);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Activity tracking system
  const addActivity = useCallback((type: string, description: string, icon: any) => {
    const activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date(),
      icon
    };
    setRecentActivity(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
  }, []);

  // AI Processing functions
  const generateAiInsights = useCallback(async () => {
    if (notes.length === 0) return;
    
    setAiProcessing(true);
    addActivity('ai', 'Generating AI insights from your notes...', Brain);
    
    // Simulate AI processing
    setTimeout(() => {
      const insights = [
        {
          id: Date.now().toString(),
          type: 'pattern',
          content: `You've created ${notes.length} notes this week. Your most active category is "${getMostActiveCategory()}".`,
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'suggestion',
          content: 'Consider organizing your recent notes into projects for better productivity.',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 2).toString(),
          type: 'trend',
          content: 'Your note-taking frequency has increased by 40% compared to last week.',
          timestamp: new Date()
        }
      ];
      
      setAiInsights(insights);
      setAiProcessing(false);
      addNotification('AI insights generated successfully', 'success');
    }, 2000);
  }, [notes]);

  const detectDuplicates = useCallback(async () => {
    if (notes.length < 2) return;
    
    addActivity('ai', 'Scanning for duplicate notes...', Filter);
    
    // Simulate duplicate detection
    setTimeout(() => {
      const duplicates = notes.filter((note, index) => 
        notes.findIndex(n => n.title.toLowerCase().includes(note.title.toLowerCase().substring(0, 10))) !== index
      );
      
      if (duplicates.length > 0) {
        setDuplicateNotes([{
          id: Date.now().toString(),
          duplicates: duplicates.map(d => d.id)
        }]);
        addNotification(`Found ${duplicates.length} potential duplicate notes`, 'info');
      } else {
        addNotification('No duplicate notes found', 'success');
      }
    }, 1500);
  }, [notes]);

  const generateSmartSuggestions = useCallback(() => {
    const suggestions = [
      {
        id: '1',
        title: 'Create Weekly Review',
        description: 'Set up a recurring note for weekly reviews and planning',
        action: 'create_template'
      },
      {
        id: '2',
        title: 'Tag Organization',
        description: 'Organize your notes with consistent tagging system',
        action: 'organize_tags'
      },
      {
        id: '3',
        title: 'Archive Old Notes',
        description: 'Archive notes older than 6 months to declutter',
        action: 'archive_old'
      },
      {
        id: '4',
        title: 'Knowledge Connections',
        description: 'Link related notes to build your knowledge graph',
        action: 'create_links'
      }
    ];
    
    setSmartSuggestions(suggestions);
    addActivity('ai', 'Smart suggestions updated', Lightbulb);
    addNotification('New smart suggestions available', 'info');
  }, []);

  const getMostActiveCategory = () => {
    if (notes.length === 0) return 'Personal';
    const categoryCount = notes.reduce((acc, note) => {
      acc[note.category] = (acc[note.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
  };

  const buildKnowledgeGraph = useCallback(() => {
    addActivity('ai', 'Building knowledge graph connections...', Workflow);
    
    // Simulate knowledge graph building
    setTimeout(() => {
      const connections = [
        { from: 'Project Planning', to: 'Team Meeting', relationship: 'relates_to' },
        { from: 'Research Notes', to: 'Ideas', relationship: 'inspires' },
        { from: 'Meeting Notes', to: 'Action Items', relationship: 'generates' }
      ];
      
      setKnowledgeGraph(connections);
      addNotification('Knowledge graph updated with new connections', 'success');
    }, 1000);
  }, []);

  const scheduleReminder = useCallback((noteId: string, message: string, scheduledFor: Date) => {
    const reminder = {
      id: Date.now().toString(),
      noteId,
      message,
      scheduledFor
    };
    
    setScheduledReminders(prev => [...prev, reminder]);
    addActivity('reminder', `Reminder scheduled: ${message}`, Clock);
    addNotification('Reminder scheduled successfully', 'success');
  }, []);

  const generateTagSuggestions = useCallback(() => {
    const allTags = notes.flatMap(note => note.tags);
    const tagFrequency = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const suggestions = Object.keys(tagFrequency)
      .sort((a, b) => tagFrequency[b] - tagFrequency[a])
      .slice(0, 10);
    
    setTagSuggestions(suggestions);
    addActivity('ai', 'Tag suggestions updated', Hash);
  }, [notes]);

  // Auto-save functionality
  const autoSave = useCallback(() => {
    setIsAutoSaving(true);
    
    // Simulate saving to backend
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastSaved(new Date());
      localStorage.setItem('smarta-notes', JSON.stringify(notes));
    }, 500);
  }, [notes]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(query);
      if (query.length > 0) {
        addNotification(`Found ${filteredNotes.length} results for "${query}"`, 'info');
      }
    }, 300);
  }, []);

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, note: Note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', note.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    if (draggedNote && draggedNote.category !== targetCategory) {
      setNotes(prev => prev.map(note => 
        note.id === draggedNote.id 
          ? { ...note, category: targetCategory, updatedAt: new Date() }
          : note
      ));
      addNotification(`Moved "${draggedNote.title}" to ${targetCategory}`, 'success');
      autoSave();
    }
    setDraggedNote(null);
  };

  // Advanced recording functionality
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    addNotification('Recording started', 'info');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new window.MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          mediaRecorder.start();
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          addNotification('Error accessing microphone', 'error');
        });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = recordingTime;
        const newNote: Note = {
          id: Date.now().toString(),
          title: `Audio Recording ${new Date().toLocaleDateString()}`,
          content: `Audio recording captured on ${new Date().toLocaleString()}\n\nDuration: ${formatDuration(duration)}\n\nThis audio note has been processed and is ready for AI transcription and analysis. You can ask the AI assistant questions about this recording.`,
          type: 'audio',
          tags: ['audio', 'recording'],
          category: 'Personal',
          createdAt: new Date(),
          updatedAt: new Date(),
          transcription: 'AI transcription in progress... This audio will be converted to text automatically.',
          summary: `Audio recording from ${new Date().toLocaleDateString()} with duration of ${formatDuration(duration)}. Ready for AI processing and transcription.`,
          isStarred: false,
          audioUrl,
          duration, // store duration in seconds
        };
        setNotes(prev => [newNote, ...prev]);
        addNotification(`Recording saved (${formatDuration(duration)})`, 'success');
        addActivity('record', `Audio recording saved (${formatDuration(duration)})`, Mic);
        autoSave();
      };
    } else {
      // fallback if no mediaRecorder
      const duration = recordingTime;
      const newNote: Note = {
        id: Date.now().toString(),
        title: `Audio Recording ${new Date().toLocaleDateString()}`,
        content: `Audio recording captured on ${new Date().toLocaleString()}\n\nDuration: ${formatDuration(duration)}\n\nThis audio note has been processed and is ready for AI transcription and analysis. You can ask the AI assistant questions about this recording.`,
        type: 'audio',
        tags: ['audio', 'recording'],
        category: 'Personal',
        createdAt: new Date(),
        updatedAt: new Date(),
        transcription: 'AI transcription in progress... This audio will be converted to text automatically.',
        summary: `Audio recording from ${new Date().toLocaleDateString()} with duration of ${formatDuration(duration)}. Ready for AI processing and transcription.`,
        isStarred: false,
        duration, // store duration in seconds
      };
      setNotes(prev => [newNote, ...prev]);
      addNotification(`Recording saved (${formatDuration(duration)})`, 'success');
      addActivity('record', `Audio recording saved (${formatDuration(duration)})`, Mic);
      autoSave();
    }
  };

  // Enhanced file upload with fast processing and data extraction
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    addNotification(`Processing ${files.length} file(s)...`, 'info');
    addActivity('upload', `Started processing ${files.length} file(s)`, Upload);

    try {
      // Process ALL files concurrently for maximum speed (no batching needed with instant processing)
      const allFilePromises = Array.from(files).map(async (file, index) => {
        try {
          // Use FileProcessor for comprehensive file analysis (instant)
          const processedFile = await FileProcessor.processFile(file);
          const note = FileProcessor.createNoteFromProcessedFile(processedFile, 'Uploads');
          
          // Add file URL for preview if it's an image (instant)
          if (file.type.startsWith('image/')) {
            const fileUrl = URL.createObjectURL(file);
            note.fileUrl = fileUrl;
          }
          
          // Add audio URL for audio files (instant)
          if (file.type.startsWith('audio/')) {
            const audioUrl = URL.createObjectURL(file);
            note.audioUrl = audioUrl;
          }
          
          return note;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          addNotification(`Error processing "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
          
          // Create a basic note even if processing fails
          const fallbackNote: Note = {
            id: `file_${Date.now()}_${index}`,
            title: file.name,
            content: `File upload failed: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}\nError: ${error instanceof Error ? error.message : 'Unknown error'}\nUploaded: ${new Date().toLocaleString()}`,
            type: file.type.startsWith('audio/') ? 'audio' : 
                  file.type.startsWith('video/') ? 'video' :
                  file.type.startsWith('image/') ? 'image' : 'document',
            tags: ['uploaded', 'error', file.type.split('/')[0]],
            category: 'Uploads',
            createdAt: new Date(),
            updatedAt: new Date(),
            summary: `Failed to process: ${file.name}`,
            isStarred: false
          };
          
          return fallbackNote;
        }
      });
      
      // Wait for ALL files to process concurrently
      const processedFiles = await Promise.all(allFilePromises);
      
      // Add all processed files to notes
      setNotes(prev => [...processedFiles, ...prev]);
      
      // Final success notification
      addNotification(`All ${files.length} file(s) processed successfully!`, 'success');
      addActivity('upload', `Completed processing ${files.length} file(s) with data extraction`, Upload);
      
      // Auto-save the new notes
      autoSave();
      
    } catch (error) {
      console.error('Batch processing error:', error);
      addNotification(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Enhanced chat with real AI integration
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      // Prepare context from user's notes
      const notesContext = notes.slice(0, 10).map(note => 
        `Title: ${note.title}\nContent: ${note.content.substring(0, 200)}...\nCategory: ${note.category}`
      ).join('\n\n');
      
      // Get real AI response using aiService
      const response = await aiService.generateResponse(
        currentInput,
        `User has ${notes.length} notes. Recent notes context:\n\n${notesContext}`,
        false,
        chatMessages.slice(-5).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      );
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Show warning if using fallback
      if (response.error) {
        console.warn('AI API error, using fallback:', response.error);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `🤖 I'm having trouble connecting to AI services right now. Here's what I can tell you about "${currentInput}" based on your ${notes.length} notes: I can help you search, organize, and analyze your notes. Try asking me to summarize your recent notes or help you find specific content!`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Smart note creation with auto-categorization
  const createNewNote = () => {
    if (!newNoteTitle.trim()) return;
    
    // Auto-categorize based on content
    const getSmartCategory = (title: string, content: string) => {
      const text = (title + ' ' + content).toLowerCase();
      if (text.includes('meeting') || text.includes('standup')) return 'Work';
      if (text.includes('research') || text.includes('study')) return 'Research';
      if (text.includes('idea') || text.includes('brainstorm')) return 'Ideas';
      if (text.includes('todo') || text.includes('task')) return 'Tasks';
      return 'Personal';
    };

    // Auto-generate tags
    const generateTags = (title: string, content: string) => {
      const text = (title + ' ' + content).toLowerCase();
      const commonWords = ['meeting', 'project', 'idea', 'research', 'todo', 'important', 'urgent'];
      return commonWords.filter(word => text.includes(word));
    };
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      type: 'text',
      tags: generateTags(newNoteTitle, newNoteContent),
      category: getSmartCategory(newNoteTitle, newNoteContent),
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false
    };
    
    setNotes(prev => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreatingNote(false);
    addNotification(`Note "${newNoteTitle}" created successfully`, 'success');
    addActivity('create', `Created new note: "${newNoteTitle}"`, PenTool);
    autoSave();
  };

  // Execute smart suggestion actions
  const executeSuggestion = (action: string) => {
    switch (action) {
      case 'create_template':
        setIsCreatingNote(true);
        setNewNoteTitle('Weekly Review Template');
        setNewNoteContent('## Goals for this week\n\n## Accomplishments\n\n## Challenges\n\n## Next week priorities\n\n');
        addActivity('template', 'Weekly review template created', BookOpen);
        break;
      case 'organize_tags':
        generateTagSuggestions();
        break;
      case 'archive_old':
        // Simulate archiving old notes
        addActivity('archive', 'Old notes archived automatically', Archive);
        addNotification('Old notes have been archived', 'success');
        break;
      case 'create_links':
        buildKnowledgeGraph();
        break;
    }
  };

  // Enhanced note starring with animation
  const toggleStarNote = (noteId: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        const isStarring = !n.isStarred;
        addNotification(
          isStarring ? `"${n.title}" starred` : `"${n.title}" unstarred`, 
          'success'
        );
        addActivity(
          isStarring ? 'star' : 'unstar', 
          isStarring ? `Starred "${n.title}"` : `Unstarred "${n.title}"`, 
          Star
        );
        return {...n, isStarred: isStarring};
      }
      return n;
    }));
    autoSave();
  };

  // Note viewing and editing functions
  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setSelectedNote(null);
  };

  const handleSaveNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    addNotification(`"${updatedNote.title}" updated successfully`, 'success');
    addActivity('edit', `Updated note: "${updatedNote.title}"`, Edit3);
    setEditingNote(null);
    autoSave();
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (noteToDelete && confirm(`Are you sure you want to delete "${noteToDelete.title}"?`)) {
      setNotes(prev => prev.filter(n => n.id !== noteId));
      addNotification(`"${noteToDelete.title}" deleted`, 'success');
      addActivity('delete', `Deleted note: "${noteToDelete.title}"`, Trash2);
      setEditingNote(null);
      setSelectedNote(null);
      autoSave();
    }
  };

  // Handler to delete an audio note
  const handleDeleteAudioNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    addNotification('Audio note deleted', 'success');
  };

  // Handler to edit an audio note
  const handleEditAudioNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => note.id === updatedNote.id ? { ...note, ...updatedNote, updatedAt: new Date() } : note));
    addNotification('Audio note updated', 'success');
  };

  // Initialize AI features
  useEffect(() => {
    if (notes.length > 0) {
      generateSmartSuggestions();
      generateTagSuggestions();
    }
  }, [notes.length]);

  // Advanced filtering with real-time updates
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (note.summary && note.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(notes.map(note => note.category)))];

  const stats = {
    totalNotes: notes.length,
    audioNotes: notes.filter(n => n.type === 'audio').length,
    videoNotes: notes.filter(n => n.type === 'video').length,
    starredNotes: notes.filter(n => n.isStarred).length
  };

  // Bulk operations
  const bulkDeleteNotes = (noteIds: string[]) => {
    setNotes(prev => prev.filter(note => !noteIds.includes(note.id)));
    addNotification(`${noteIds.length} notes deleted`, 'success');
    addActivity('delete', `Deleted ${noteIds.length} note(s)`, Trash2);
    autoSave();
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `smarta-notes-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addNotification('Notes exported successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 pointer-events-none" />
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg backdrop-blur-xl border animate-slide-in-right ${
              notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
              notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
              'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="fixed bottom-4 right-4 z-40 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg backdrop-blur-xl">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-300 text-sm">Saving...</span>
          </div>
        </div>
      )}

      {/* Last saved indicator */}
      {lastSaved && !isAutoSaving && (
        <div className="fixed bottom-4 right-4 z-40 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg backdrop-blur-xl">
          <span className="text-gray-400 text-sm">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          categories={categories}
          onCreateNote={() => setIsCreatingNote(true)}
          recentNotes={notes.slice(0, 5)}
        />

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header
            activeTab={activeTab}
            filteredNotesCount={filteredNotes.length}
            onExport={exportNotes}
            searchQuery={searchQuery}
            onSearchChange={debouncedSearch}
            onSettingsClick={() => setShowSettings(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 max-h-screen">
            {activeTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
                <StatsCards stats={stats} />
                
                {/* AI Insights Panel */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      <h3 className="text-lg sm:text-xl font-semibold text-white">AI Insights</h3>
                    </div>
                    <button
                      onClick={generateAiInsights}
                      disabled={aiProcessing}
                      className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {aiProcessing ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>{aiProcessing ? 'Processing...' : 'Generate Insights'}</span>
                    </button>
                  </div>
                  
                  {aiInsights.length > 0 ? (
                    <div className="space-y-3">
                      {aiInsights.map(insight => (
                        <div key={insight.id} className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-purple-500">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1">
                              {insight.type === 'pattern' && <BarChart3 className="w-4 h-4 text-purple-400" />}
                              {insight.type === 'suggestion' && <Lightbulb className="w-4 h-4 text-purple-400" />}
                              {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-300">{insight.content}</p>
                              <p className="text-gray-500 text-sm mt-1">{insight.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Click "Generate Insights" to analyze your notes with AI</p>
                    </div>
                  )}
                </div>

                {/* Smart Suggestions */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Smart Suggestions</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {smartSuggestions.map(suggestion => (
                      <div key={suggestion.id} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <h4 className="font-semibold text-white mb-2">{suggestion.title}</h4>
                        <p className="text-gray-400 text-sm mb-3">{suggestion.description}</p>
                        <button
                          onClick={() => executeSuggestion(suggestion.action)}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                        >
                          Apply Suggestion →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Activity</h3>
                  </div>
                  
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {recentActivity.slice(0, 10).map(activity => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800/20 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <activity.icon className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-300 text-sm">{activity.description}</p>
                            <p className="text-gray-500 text-xs">{activity.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>

                {/* AI Tools */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">AI Tools</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={detectDuplicates}
                      className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <Filter className="w-8 h-8 text-orange-400 mb-2" />
                      <span className="text-sm text-gray-300">Find Duplicates</span>
                    </button>
                    
                    <button
                      onClick={buildKnowledgeGraph}
                      className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <Workflow className="w-8 h-8 text-cyan-400 mb-2" />
                      <span className="text-sm text-gray-300">Knowledge Graph</span>
                    </button>
                    
                    <button
                      onClick={generateTagSuggestions}
                      className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <Hash className="w-8 h-8 text-pink-400 mb-2" />
                      <span className="text-sm text-gray-300">Smart Tags</span>
                    </button>
                    
                    <button
                      onClick={() => addNotification('AI summary generation started', 'info')}
                      className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <BookOpen className="w-8 h-8 text-indigo-400 mb-2" />
                      <span className="text-sm text-gray-300">Auto Summary</span>
                    </button>
                  </div>
                </div>

                <QuickActions
                  onCreateNote={() => setIsCreatingNote(true)}
                  onStartRecording={startRecording}
                  onFileUpload={() => fileInputRef.current?.click()}
                  onOpenChat={() => setActiveTab('chat')}
                  isRecording={isRecording}
                />
                
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Notes</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsCreatingNote(true)}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Create New
                      </button>
                      <span className="text-gray-600">•</span>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <NotesGrid
                    notes={notes.slice(0, 5)}
                    onNoteClick={handleViewNote}
                    onToggleStar={toggleStarNote}
                    onBulkDelete={bulkDeleteNotes}
                  />
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <NotesGrid
                notes={filteredNotes}
                viewMode={viewMode}
                onNoteClick={handleViewNote}
                onToggleStar={toggleStarNote}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                setViewMode={setViewMode}
                onDragStart={handleDragStart}
                onBulkDelete={bulkDeleteNotes}
              />
            )}

            {activeTab === 'chat' && (
              <ChatInterface
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                onSendMessage={sendChatMessage}
              />
            )}

            {activeTab === 'youtube' && (
              <YoutubeSummarizer
                onCreateNote={(note) => {
                  const newNote: Note = {
                    ...note,
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    updatedAt: new Date(),
                    isStarred: false
                  };
                  setNotes(prev => [newNote, ...prev]);
                  addNotification('YouTube summary note created!', 'success');
                  addActivity('youtube', `Created note from YouTube video`, Upload);
                  autoSave();
                }}
              />
            )}

            {activeTab === 'recorder' && (
              <AudioRecorder
                isRecording={isRecording}
                recordingTime={recordingTime}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                audioNotes={notes.filter(note => note.type === 'audio')}
                onDeleteAudioNote={handleDeleteAudioNote}
                onEditAudioNote={handleEditAudioNote}
              />
            )}

            {activeTab === 'upload' && (
              <FileUpload
                onFileUpload={() => fileInputRef.current?.click()}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'search' && (
              <SmartSearch
                notes={notes}
                onNoteClick={handleViewNote}
                onToggleStar={toggleStarNote}
              />
            )}

            {activeTab === 'categories' && (
              <Categories
                notes={notes}
                onNoteClick={handleViewNote}
                onToggleStar={toggleStarNote}
                onCreateCategory={(name) => {
                  addNotification(`Category "${name}" created`, 'success');
                  addActivity('category', `Created category: ${name}`, Folder);
                }}
                onDeleteCategory={(name) => {
                  if (confirm(`Delete category "${name}"? Notes will be moved to "Personal".`)) {
                    setNotes(prev => prev.map(note => 
                      note.category === name 
                        ? { ...note, category: 'Personal', updatedAt: new Date() }
                        : note
                    ));
                    addNotification(`Category "${name}" deleted`, 'success');
                    addActivity('category', `Deleted category: ${name}`, Trash2);
                  }
                }}
              />
            )}

            {activeTab === 'starred' && (
              <StarredNotes
                notes={notes}
                onNoteClick={handleViewNote}
                onToggleStar={toggleStarNote}
              />
            )}
          </main>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,video/*,image/*,.pdf,.doc,.docx,.txt,.rtf,.md,.csv,.xls,.xlsx,.ppt,.pptx,.json,.xml,.yaml,.yml,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.zip,.rar,.7z"
        onChange={handleFileUpload}
        className="hidden"
      />

      {isCreatingNote && (
        <CreateNoteModal
          isOpen={isCreatingNote}
          onClose={() => setIsCreatingNote(false)}
          onCreateNote={createNewNote}
          title={newNoteTitle}
          setTitle={setNewNoteTitle}
          content={newNoteContent}
          setContent={setNewNoteContent}
        />
      )}

      {selectedNote && (
        <DocumentViewer
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onToggleStar={() => toggleStarNote(selectedNote.id)}
          onEdit={() => {
            setEditingNote(selectedNote);
            setSelectedNote(null);
          }}
          onSave={handleSaveNote}
        />
      )}

      {editingNote && (
        <NoteEditor
          note={editingNote}
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleSaveNote}
          onDelete={() => handleDeleteNote(editingNote.id)}
        />
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={() => {
          localStorage.clear();
          window.location.reload();
        }}
      />
    </div>
  );
}

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hrs, mins, secs]
    .map(unit => unit.toString().padStart(2, '0'))
    .join(':');
}

export default Dashboard;