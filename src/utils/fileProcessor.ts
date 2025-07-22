// File processing utilities for extracting data from various document types
import { Note } from '../types';

export interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  extractedText?: string;
  metadata?: Record<string, any>;
  thumbnail?: string;
  duration?: number; // for audio/video files
}

export class FileProcessor {
  private static readonly SUPPORTED_TYPES = {
    text: ['.txt', '.md', '.rtf'],
    document: ['.pdf', '.doc', '.docx', '.odt'],
    spreadsheet: ['.xls', '.xlsx', '.csv', '.ods'],
    presentation: ['.ppt', '.pptx', '.odp'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.xml', '.yaml', '.yml'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz']
  };

  static async processFile(file: File): Promise<ProcessedFile> {
    const extension = this.getFileExtension(file.name);
    const fileType = this.getFileType(extension);
    
    let extractedText = '';
    let metadata: Record<string, any> = {
      originalName: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified),
      type: file.type
    };

    try {
      switch (fileType) {
        case 'text':
          extractedText = await this.processTextFile(file);
          break;
        case 'document':
          extractedText = await this.processDocumentFile(file);
          break;
        case 'spreadsheet':
          extractedText = await this.processSpreadsheetFile(file);
          break;
        case 'image':
          extractedText = await this.processImageFile(file);
          metadata.thumbnail = await this.generateImageThumbnail(file);
          break;
        case 'audio':
          const audioData = await this.processAudioFile(file);
          extractedText = audioData.transcription || '';
          metadata.duration = audioData.duration;
          break;
        case 'video':
          const videoData = await this.processVideoFile(file);
          extractedText = videoData.transcription || '';
          metadata.duration = videoData.duration;
          metadata.thumbnail = videoData.thumbnail;
          break;
        case 'code':
          extractedText = await this.processCodeFile(file);
          break;
        case 'archive':
          extractedText = await this.processArchiveFile(file);
          break;
        default:
          extractedText = await this.processGenericFile(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      extractedText = `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return {
      name: file.name,
      type: fileType,
      size: file.size,
      content: extractedText,
      extractedText,
      metadata
    };
  }

  private static getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  private static getFileType(extension: string): string {
    for (const [type, extensions] of Object.entries(this.SUPPORTED_TYPES)) {
      if (extensions.includes(extension)) {
        return type;
      }
    }
    return 'unknown';
  }

  private static async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private static async processDocumentFile(file: File): Promise<string> {
    // For PDF and Office documents, we'll simulate extraction
    // In a real implementation, you'd use libraries like pdf-parse, mammoth, etc.
    const extension = this.getFileExtension(file.name);
    
    if (extension === '.pdf') {
      return this.simulatePDFExtraction(file);
    } else if (['.doc', '.docx'].includes(extension)) {
      return this.simulateWordExtraction(file);
    }
    
    return `Document content from ${file.name} (${file.size} bytes)`;
  }

  private static async simulatePDFExtraction(file: File): Promise<string> {
    // Immediate PDF text extraction simulation
    return `[PDF Content Extracted from ${file.name}]\n\nThis is simulated PDF text extraction. In a real implementation, you would use a library like pdf-parse or PDF.js to extract actual text content from the PDF file.\n\nFile size: ${file.size} bytes\nEstimated pages: ${Math.ceil(file.size / 50000)}`;
  }

  private static async simulateWordExtraction(file: File): Promise<string> {
    // Immediate Word document extraction simulation
    return `[Word Document Content from ${file.name}]\n\nThis is simulated Word document text extraction. In a real implementation, you would use a library like mammoth.js to extract actual text content from Word documents.\n\nFile size: ${file.size} bytes\nDocument type: ${file.type}`;
  }

  private static async processSpreadsheetFile(file: File): Promise<string> {
    const extension = this.getFileExtension(file.name);
    
    if (extension === '.csv') {
      return this.processCSVFile(file);
    }
    
    return `[Spreadsheet Data from ${file.name}]\n\nThis is simulated spreadsheet data extraction. In a real implementation, you would use libraries like xlsx or csv-parser to extract actual data from spreadsheet files.\n\nFile size: ${file.size} bytes`;
  }

  private static async processCSVFile(file: File): Promise<string> {
    const text = await this.processTextFile(file);
    const lines = text.split('\n').slice(0, 10); // First 10 lines
    return `[CSV Data Preview from ${file.name}]\n\n${lines.join('\n')}\n\n${text.split('\n').length > 10 ? '... (truncated)' : ''}`;
  }

  private static async processImageFile(file: File): Promise<string> {
    // Immediate image analysis simulation
    return `[Image Analysis for ${file.name}]\n\nImage dimensions: Analyzing...\nFile size: ${file.size} bytes\nFormat: ${file.type}\n\nThis is simulated image text extraction. In a real implementation, you would use OCR libraries like Tesseract.js to extract text from images, or AI services for image analysis.`;
  }

  private static async generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Create thumbnail (150x150)
          canvas.width = 150;
          canvas.height = 150;
          
          const scale = Math.min(150 / img.width, 150 / img.height);
          const x = (150 - img.width * scale) / 2;
          const y = (150 - img.height * scale) / 2;
          
          ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);
          resolve(canvas.toDataURL());
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private static async processAudioFile(file: File): Promise<{ transcription?: string; duration?: number }> {
    // Immediate audio transcription simulation
    const estimatedDuration = Math.floor(file.size / 16000); // Rough estimate
    return {
      transcription: `[Audio Transcription from ${file.name}]\n\nThis is simulated audio transcription. In a real implementation, you would use speech-to-text services like Web Speech API, Google Speech-to-Text, or OpenAI Whisper.\n\nEstimated duration: ${estimatedDuration} seconds\nFile size: ${file.size} bytes`,
      duration: estimatedDuration
    };
  }

  private static async processVideoFile(file: File): Promise<{ transcription?: string; duration?: number; thumbnail?: string }> {
    // Immediate video processing simulation
    const estimatedDuration = Math.floor(file.size / 100000); // Rough estimate
    return {
      transcription: `[Video Analysis from ${file.name}]\n\nThis is simulated video transcription and analysis. In a real implementation, you would extract audio for transcription and generate video thumbnails.\n\nEstimated duration: ${estimatedDuration} seconds\nFile size: ${file.size} bytes`,
      duration: estimatedDuration,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VmlkZW88L3RleHQ+Cjwvc3ZnPg=='
    };
  }

  private static async processCodeFile(file: File): Promise<string> {
    const text = await this.processTextFile(file);
    const extension = this.getFileExtension(file.name);
    const language = this.getLanguageFromExtension(extension);
    
    return `[Code File: ${file.name}]\nLanguage: ${language}\nLines: ${text.split('\n').length}\nSize: ${file.size} bytes\n\n${text}`;
  }

  private static getLanguageFromExtension(extension: string): string {
    const languageMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React JSX',
      '.tsx': 'React TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.html': 'HTML',
      '.css': 'CSS',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML'
    };
    return languageMap[extension] || 'Unknown';
  }

  private static async processArchiveFile(file: File): Promise<string> {
    // Simulate archive analysis
    return `[Archive File: ${file.name}]\n\nThis is simulated archive analysis. In a real implementation, you would use libraries like JSZip to extract and analyze archive contents.\n\nFile size: ${file.size} bytes\nType: ${file.type}`;
  }

  private static async processGenericFile(file: File): Promise<string> {
    try {
      // Try to read as text first
      const text = await this.processTextFile(file);
      return `[Generic File: ${file.name}]\n\n${text}`;
    } catch {
      return `[Binary File: ${file.name}]\n\nThis appears to be a binary file that cannot be processed as text.\nFile size: ${file.size} bytes\nType: ${file.type}`;
    }
  }

  static createNoteFromProcessedFile(processedFile: ProcessedFile, category: string = 'Uploads'): Note {
    const now = new Date();
    const noteType = this.mapFileTypeToNoteType(processedFile.type);
    
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: processedFile.name,
      content: processedFile.content,
      type: noteType,
      tags: [processedFile.type, 'uploaded', ...this.generateSmartTags(processedFile)],
      category,
      createdAt: now,
      updatedAt: now,
      summary: this.generateSummary(processedFile),
      transcription: processedFile.type === 'audio' || processedFile.type === 'video' ? processedFile.extractedText : undefined,
      isStarred: false,
      fileUrl: processedFile.metadata?.thumbnail || undefined,
      duration: processedFile.metadata?.duration
    };
  }

  private static mapFileTypeToNoteType(fileType: string): Note['type'] {
    const typeMap: Record<string, Note['type']> = {
      'text': 'text',
      'document': 'document',
      'spreadsheet': 'document',
      'presentation': 'document',
      'code': 'text',
      'image': 'image',
      'audio': 'audio',
      'video': 'video'
    };
    return typeMap[fileType] || 'document';
  }

  private static generateSmartTags(processedFile: ProcessedFile): string[] {
    const tags: string[] = [];
    const content = processedFile.content.toLowerCase();
    
    // Add size-based tags
    if (processedFile.size > 10 * 1024 * 1024) tags.push('large-file');
    if (processedFile.size < 1024) tags.push('small-file');
    
    // Add content-based tags
    if (content.includes('meeting') || content.includes('agenda')) tags.push('meeting');
    if (content.includes('project') || content.includes('task')) tags.push('project');
    if (content.includes('research') || content.includes('study')) tags.push('research');
    if (content.includes('report') || content.includes('analysis')) tags.push('report');
    if (content.includes('presentation') || content.includes('slide')) tags.push('presentation');
    
    return tags;
  }

  private static generateSummary(processedFile: ProcessedFile): string {
    const content = processedFile.content;
    if (content.length <= 200) return content;
    
    // Simple extractive summary - take first 150 characters
    const summary = content.substring(0, 150).trim();
    return summary + (summary.length < content.length ? '...' : '');
  }
}
