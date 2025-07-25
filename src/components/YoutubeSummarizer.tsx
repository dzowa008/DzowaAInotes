import { useState } from 'react';
import { Youtube, Download, Link, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { aiService } from '../services/aiService';

interface YoutubeSummarizerProps {
  onCreateNote?: (note: any) => void;
}

interface VideoSummary {
  title: string;
  content: string;
  noteContent: string;
  type: string;
  url: string;
  videoId: string;
  timestamp: Date;
}

function YoutubeSummarizer({ onCreateNote }: YoutubeSummarizerProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSummary, setLastSummary] = useState<VideoSummary | null>(null);
  const [error, setError] = useState('');
  const [recentSummaries, setRecentSummaries] = useState<VideoSummary[]>([]);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };



  const handleSummarize = async () => {
    if (!youtubeUrl.trim()) return;
    
    setError('');
    const videoId = extractVideoId(youtubeUrl);
    
    if (!videoId) {
      setError('Please provide a valid YouTube URL (youtube.com or youtu.be)');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use AI service for real YouTube summarization
      const aiSummary = await aiService.summarizeYouTubeVideo(youtubeUrl, videoId);
      
      const summary: VideoSummary = {
        ...aiSummary,
        type: 'educational',
        url: youtubeUrl,
        videoId,
        timestamp: new Date()
      };
      
      setLastSummary(summary);
      setRecentSummaries(prev => [summary, ...prev.slice(0, 4)]);
      
      // Automatically create note from summary
      handleCreateNote(summary);
      
      setYoutubeUrl('');
      
    } catch (err) {
      setError('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNote = (summary: VideoSummary) => {
    if (onCreateNote) {
      const note = {
        id: Date.now().toString(),
        title: summary.title,
        content: summary.noteContent,
        category: 'YouTube Summaries',
        type: 'youtube',
        metadata: {
          videoUrl: summary.url,
          videoId: summary.videoId,
          videoType: summary.type,
          processedAt: summary.timestamp
        },
        timestamp: new Date(),
        tags: ['youtube', 'summary', summary.type]
      };
      onCreateNote(note);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 z-2 relative">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">YouTube Summarizer</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Automatically convert YouTube videos into structured notes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* URL Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Link className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video URL</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSummarize()}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                disabled={isProcessing}
              />
              <button
                onClick={handleSummarize}
                disabled={!youtubeUrl.trim() || isProcessing}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Summarize & Create Note</span>
                    <span className="sm:hidden">Summarize</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Supported formats:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
                  <li>• https://youtu.be/VIDEO_ID</li>
                  <li>• https://youtube.com/embed/VIDEO_ID</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Summary */}
        {lastSummary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Latest Summary</h3>
              </div>
              <button
                onClick={() => handleCreateNote(lastSummary)}
                className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Create Note</span>
              </button>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div><strong>Type:</strong> {lastSummary.type}</div>
                  <div><strong>Processed:</strong> {lastSummary.timestamp.toLocaleString()}</div>
                  <div><strong>URL:</strong> <a href={lastSummary.url} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">{lastSummary.url}</a></div>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm">{lastSummary.content}</div>
            </div>
          </div>
        )}

        {/* Recent Summaries */}
        {recentSummaries.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Summaries</h3>
            </div>
            
            <div className="space-y-3">
              {recentSummaries.map((summary, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{summary.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {summary.timestamp.toLocaleDateString()} • {summary.type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateNote(summary)}
                    className="flex items-center justify-center space-x-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors self-start sm:self-auto"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Note</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default YoutubeSummarizer;
