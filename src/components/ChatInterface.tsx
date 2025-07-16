import React from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  onSendMessage: () => void;
}

function ChatInterface({ chatMessages, chatInput, setChatInput, onSendMessage }: ChatInterfaceProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-gray-400 text-sm">Ask questions about your notes</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
              <p className="text-gray-400">Ask me anything about your notes, or request summaries and insights.</p>
            </div>
          ) : (
            chatMessages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-gray-800">
          <div className="flex space-x-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              placeholder="Ask about your notes..."
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={onSendMessage}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;