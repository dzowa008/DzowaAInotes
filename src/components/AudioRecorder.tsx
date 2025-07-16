import React, { useState } from 'react';
import { Mic, Square, Play, Headphones } from 'lucide-react';
import { Note } from '../types';

interface AudioRecorderProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  audioNotes: Note[];
  onDeleteAudioNote?: (id: string) => void;
  onEditAudioNote?: (note: Note) => void;
}

function AudioRecorder({ isRecording, recordingTime, onStartRecording, onStopRecording, audioNotes, onDeleteAudioNote, onEditAudioNote }: AudioRecorderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTranscription, setEditTranscription] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hrs, mins, secs]
      .map(unit => unit.toString().padStart(2, '0'))
      .join(':');
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditTranscription(note.transcription || '');
  };

  const handleSaveEdit = (note: Note) => {
    if (onEditAudioNote) {
      onEditAudioNote({ ...note, title: editTitle, transcription: editTranscription });
    }
    setEditingId(null);
  };

  const handleSummarize = (note: Note) => {
    setSummarizingId(note.id);
    setTimeout(() => {
      if (onEditAudioNote) {
        onEditAudioNote({ ...note, summary: `AI Summary: This audio was recorded on ${note.createdAt.toLocaleDateString()} and is about ${note.transcription?.slice(0, 30) || 'the recorded content'}...` });
      }
      setSummarizingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <Mic className={`w-16 h-16 ${isRecording ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Audio Recorder</h3>
        <p className="text-gray-400 mb-6">Record audio notes and get AI-powered transcription and summaries</p>
        
        {isRecording && (
          <div className="mb-6">
            <div className="text-3xl font-mono text-red-400 mb-2">{formatTime(recordingTime)}</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={onStartRecording}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="flex items-center space-x-2 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold transition-all duration-200"
            >
              <Square className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Recordings</h3>
        <div className="space-y-3">
          {audioNotes.map(note => (
            <div key={note.id} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                {editingId === note.id ? (
                  <>
                    <input
                      className="w-full mb-1 px-2 py-1 rounded bg-gray-900 text-white border border-gray-700"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full mb-1 px-2 py-1 rounded bg-gray-900 text-white border border-gray-700"
                      value={editTranscription}
                      onChange={e => setEditTranscription(e.target.value)}
                      rows={2}
                    />
                    <div className="flex space-x-2 mb-1">
                      <button className="px-2 py-1 bg-purple-600 text-white rounded" onClick={() => handleSaveEdit(note)}>Save</button>
                      <button className="px-2 py-1 bg-gray-700 text-white rounded" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-white font-medium">{note.title}</h4>
                    {note.duration !== undefined && (
                      <div className="text-xs text-gray-400">Length: {formatTime(note.duration)}</div>
                    )}
                    <p className="text-gray-400 text-sm">{note.transcription || 'Processing transcription...'}</p>
                    {note.audioUrl && (
                      <audio src={note.audioUrl} controls className="mt-2 w-full" />
                    )}
                    {note.summary && (
                      <div className="text-xs text-purple-300 mt-1">{note.summary}</div>
                    )}
                  </>
                )}
              </div>
              {/* Edit, Summarize, Delete Buttons */}
              <div className="flex flex-col space-y-1 ml-2">
                {editingId !== note.id && (
                  <button className="text-xs text-blue-400 hover:underline" onClick={() => handleEdit(note)}>Edit</button>
                )}
                <button
                  className="text-xs text-green-400 hover:underline"
                  disabled={summarizingId === note.id}
                  onClick={() => handleSummarize(note)}
                >
                  {summarizingId === note.id ? 'Summarizing...' : 'Summarize'}
                </button>
                <button
                  className="text-xs text-red-400 hover:underline"
                  onClick={() => onDeleteAudioNote && onDeleteAudioNote(note.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AudioRecorder;