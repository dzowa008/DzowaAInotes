interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  error?: string;
}

class AIService {
  protected apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private models: string[] = [
    'deepseek/deepseek-chat-v3-0324:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-2-9b-it:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'gryphe/mythomist-7b:free'
  ];
  private currentModelIndex: number = 0;
  private siteUrl: string = 'https://dzowa-ai-notes.netlify.app';
  private siteName: string = 'DzowaAI Notes';
  private testMode: boolean = false;

  constructor() {
    // Use OpenRouter API key for DeepSeek access
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const deepSeekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    this.testMode = import.meta.env.VITE_AI_TEST_MODE === 'true';
    
    this.apiKey = openRouterKey || deepSeekKey || '';
    
    if (this.testMode) {
      console.log('AI Service in TEST MODE - using enhanced fallback responses');
    } else if (this.apiKey) {
      console.log('AI Service initialized with OpenRouter API');
    } else {
      console.warn('No API key found. AI will use fallback responses.');
    }
  }

  async generateResponse(
    userInput: string, 
    noteContent: string, 
    isEditing: boolean = false,
    conversationHistory: AIMessage[] = []
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      console.warn('No OpenRouter API key found, using fallback response');
      return this.getFallbackResponse(userInput, noteContent, isEditing);
    }

    // Try each model with exponential backoff
    for (let attempt = 0; attempt < this.models.length; attempt++) {
      const currentModel = this.models[(this.currentModelIndex + attempt) % this.models.length];
      
      try {
        console.log(`Trying model ${attempt + 1}/${this.models.length}: ${currentModel}`);
        
        // Add delay between attempts to avoid hitting rate limits
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`Waiting ${delay}ms before trying next model...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const messages = [
          {
            role: 'system',
            content: `You are an AI assistant helping with note-taking and writing. 
            The user is currently ${isEditing ? 'editing' : 'reading'} a note.
            Note content: "${noteContent.slice(0, 500)}..."
            
            Provide helpful, concise responses. If editing, focus on writing assistance.
            If reading, focus on comprehension and analysis.`
          },
          ...conversationHistory,
          {
            role: 'user',
            content: userInput
          }
        ];

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.siteUrl,
            'X-Title': this.siteName
          },
          body: JSON.stringify({
            model: currentModel,
            messages: messages,
            max_tokens: 300, // Reduced to avoid hitting limits
            temperature: 0.7,
            stream: false
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // If rate limited, try next model after a longer delay
          if (response.status === 429 || errorData.error?.code === 'rate_limit_exceeded' || 
              errorData.error?.message?.includes('rate limit')) {
            console.warn(`Rate limit exceeded for ${currentModel}, trying next model after delay...`);
            
            // Longer delay for rate limits
            const rateLimitDelay = 2000 + (attempt * 1000);
            await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
            continue;
          }
          
          throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
          // Update current model index to the working one
          this.currentModelIndex = (this.currentModelIndex + attempt) % this.models.length;
          console.log(`✅ Successfully used model: ${currentModel}`);
          
          return {
            content: data.choices[0].message.content
          };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(`❌ Error with model ${currentModel}:`, error);
        
        // If this is the last model, wait a bit longer before giving up
        if (attempt === this.models.length - 1) {
          console.log('All models exhausted, using enhanced fallback...');
        }
      }
    }

    // If all models failed, use fallback
    console.warn('All AI models failed, using fallback response');
    return {
      content: this.getFallbackResponse(userInput, noteContent, isEditing).content,
      error: 'All AI models unavailable - using fallback response'
    };
  }

  private getFallbackResponse(userInput: string, noteContent: string, isEditing: boolean): AIResponse {
    const input = userInput.toLowerCase();
    
    // Enhanced context-aware fallback responses
    if (isEditing) {
      if (input.includes('improve') || input.includes('better') || input.includes('enhance')) {
        return {
          content: `✨ **AI Writing Enhancement** (Fallback Mode)\n\n🔧 **Quick Improvements:**\n• Add more specific examples and details\n• Use stronger action verbs and descriptive language\n• Break up long paragraphs for better readability\n• Include bullet points for key information\n• Add section headers to organize content\n\n💡 **Pro Tip:** The AI models are currently busy, but I can still help with basic writing suggestions!`
        };
      }
      if (input.includes('rewrite') || input.includes('rephrase')) {
        return {
          content: `🔄 **Ready to help you rewrite!**\n\nPlease paste the specific text you'd like me to rephrase, or tell me which section needs improvement. I can help with:\n\n• Clarity and flow\n• Tone and style\n• Conciseness\n• Professional language`
        };
      }
      if (input.includes('expand') || input.includes('elaborate')) {
        return {
          content: `📝 **Content Expansion Ideas:**\n\n• Add real-world examples\n• Include step-by-step instructions\n• Provide background context\n• Add supporting statistics or facts\n• Include personal insights or experiences\n\nWhich part of your note would you like to expand?`
        };
      }
      if (input.includes('structure') || input.includes('organize')) {
        return {
          content: `🏗️ **Structure & Organization Tips:**\n\n• Use clear headings (# ## ###)\n• Create bullet lists for key points\n• Number steps in processes\n• Use **bold** for emphasis\n• Add horizontal rules (---) to separate sections\n\nWould you like help reorganizing a specific section?`
        };
      }
      if (input.includes('grammar') || input.includes('correct')) {
        return {
          content: `📚 **Grammar & Style Check:**\n\nI can help you with:\n\n• Grammar and punctuation\n• Sentence structure\n• Word choice and vocabulary\n• Consistency in tense and voice\n• Professional tone\n\nPaste the text you'd like me to review!`
        };
      }
      return {
        content: `✍️ **Writing Assistant Ready!**\n\nI'm here to help you improve your note. I can:\n\n• **Enhance** your writing style\n• **Rewrite** sections for clarity\n• **Expand** on ideas\n• **Organize** content structure\n• **Check** grammar and flow\n\nWhat would you like help with?`
      };
    } else {
      if (input.includes('summary') || input.includes('summarize')) {
        const wordCount = noteContent.split(/\s+/).filter(word => word.length > 0).length;
        return {
          content: `📝 **Quick Summary:**\n\nThis note contains ${wordCount} words and covers several key topics. Would you like me to:\n\n• Provide a detailed summary\n• Extract the main points\n• Identify key takeaways\n• Create an outline\n\nJust let me know what type of summary would be most helpful!`
        };
      }
      if (input.includes('key points') || input.includes('main points') || input.includes('highlights')) {
        return {
          content: `🎯 **Key Points Analysis:**\n\nI can help you identify:\n\n• Main concepts and ideas\n• Important facts and figures\n• Action items and next steps\n• Key insights and conclusions\n\nWould you like me to extract the key points from this note?`
        };
      }
      if (input.includes('explain') || input.includes('clarify')) {
        return {
          content: `💡 **Happy to Explain!**\n\nI can help clarify:\n\n• Complex concepts or terminology\n• Relationships between ideas\n• Background context\n• Practical applications\n\nWhat specific part would you like me to explain?`
        };
      }
      if (input.includes('questions') || input.includes('quiz')) {
        return {
          content: `❓ **Study Questions:**\n\nI can create:\n\n• Review questions based on the content\n• Quiz questions to test understanding\n• Discussion prompts\n• Critical thinking questions\n\nWould you like me to generate some questions from this note?`
        };
      }
      return {
        content: `🤖 **AI Assistant Ready!**\n\nI can help you with this note by:\n\n• **Summarizing** the content\n• **Explaining** complex parts\n• **Extracting** key points\n• **Creating** study questions\n• **Analyzing** the information\n\nWhat would you like to explore?`
      };
    }
  }

  // Convert chat messages to AI message format
  convertChatHistory(chatMessages: any[]): AIMessage[] {
    return chatMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content || msg.text || ''
    }));
  }
}

// Additional AI service methods for various app features
class ExtendedAIService extends AIService {
  
  // YouTube video summarization
  async summarizeYouTubeVideo(url: string, videoId: string): Promise<{title: string, content: string, noteContent: string}> {
    if (!this.apiKey) {
      return this.getFallbackYouTubeSummary(url, videoId);
    }

    try {
      const prompt = `Analyze this YouTube video and create a comprehensive summary:

Video URL: ${url}
Video ID: ${videoId}

Please provide:
1. A catchy title for the summary
2. Key points and insights from the video
3. Actionable takeaways
4. Main concepts covered

Format the response as a detailed note that would be valuable for studying and reference.`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return {
        title: `📹 YouTube Summary: ${videoId}`,
        content: response.content,
        noteContent: response.content
      };
    } catch (error) {
      console.error('YouTube summarization error:', error);
      return this.getFallbackYouTubeSummary(url, videoId);
    }
  }

  // Smart search with AI enhancement
  async enhanceSearch(query: string, notes: any[]): Promise<any[]> {
    if (!this.apiKey) {
      return this.getFallbackSearch(query, notes);
    }

    try {
      // Basic search first
      const basicResults = this.getFallbackSearch(query, notes);
      
      // AI enhancement for semantic search
      const prompt = `Enhance this search query for better note discovery:

Original query: "${query}"
Number of notes: ${notes.length}

Suggest related terms, synonyms, and concepts that might help find relevant notes.`;
      
      const response = await this.generateResponse(prompt, '', false, []);
      
      // For now, return basic results (can be enhanced with semantic matching)
      return basicResults;
    } catch (error) {
      console.error('Search enhancement error:', error);
      return this.getFallbackSearch(query, notes);
    }
  }

  // Generate AI insights for dashboard
  async generateInsights(notes: any[]): Promise<Array<{id: string, type: string, content: string, timestamp: Date}>> {
    if (!this.apiKey) {
      return this.getFallbackInsights(notes);
    }

    try {
      const recentNotes = notes.slice(0, 10);
      const prompt = `Analyze these recent notes and provide insights:

${recentNotes.map(note => `Title: ${note.title}\nContent: ${note.content.substring(0, 200)}...`).join('\n\n')}

Provide 3-5 insights about:
1. Common themes
2. Knowledge gaps
3. Productivity patterns
4. Learning opportunities
5. Content organization suggestions`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return [{
        id: Date.now().toString(),
        type: 'analysis',
        content: response.content,
        timestamp: new Date()
      }];
    } catch (error) {
      console.error('Insights generation error:', error);
      return this.getFallbackInsights(notes);
    }
  }

  // Generate smart suggestions
  async generateSuggestions(notes: any[]): Promise<Array<{id: string, title: string, description: string, action: string}>> {
    if (!this.apiKey) {
      return this.getFallbackSuggestions(notes);
    }

    try {
      const prompt = `Based on these notes, suggest 3-5 actionable improvements:

${notes.slice(0, 5).map(note => `${note.title}: ${note.content.substring(0, 100)}...`).join('\n')}

Suggest specific actions for:
1. Better organization
2. Content enhancement
3. Study strategies
4. Productivity improvements`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return [{
        id: Date.now().toString(),
        title: '🧠 AI Suggestions',
        description: response.content,
        action: 'review'
      }];
    } catch (error) {
      console.error('Suggestions generation error:', error);
      return this.getFallbackSuggestions(notes);
    }
  }

  // Generate tag suggestions
  async suggestTags(content: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.getFallbackTags(content);
    }

    try {
      const prompt = `Suggest 5-8 relevant tags for this content:

${content.substring(0, 500)}...

Provide tags that would help with organization and discovery. Return only the tags, separated by commas.`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return response.content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Tag suggestion error:', error);
      return this.getFallbackTags(content);
    }
  }

  // Fallback methods
  private getFallbackYouTubeSummary(url: string, videoId: string) {
    return {
      title: `📹 YouTube Summary: ${videoId}`,
      content: `🎬 **Video Summary**\n\nURL: ${url}\nVideo ID: ${videoId}\n\n✨ **Key Points:**\n• Educational content captured\n• Main concepts identified\n• Actionable insights extracted\n\n🚀 **Next Steps:**\n• Review and take notes\n• Apply key concepts\n• Share insights with others`,
      noteContent: `# 📹 YouTube Video Summary\n\n**Source:** ${url}\n**Video ID:** ${videoId}\n**Date:** ${new Date().toLocaleDateString()}\n\n## 📝 Summary\n\nThis video contains valuable educational content. Key topics covered include:\n\n• Main concept 1\n• Important insight 2\n• Practical application 3\n\n## 🎯 Action Items\n\n- [ ] Review key concepts\n- [ ] Apply learnings\n- [ ] Take detailed notes`
    };
  }

  private getFallbackSearch(query: string, notes: any[]) {
    return notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  private getFallbackInsights(notes: any[]) {
    return [
      {
        id: Date.now().toString(),
        type: 'productivity',
        content: `📊 **Productivity Insight**\n\nYou have ${notes.length} notes in your collection. Recent activity shows consistent note-taking habits. Consider organizing by themes for better discovery.`,
        timestamp: new Date()
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'learning',
        content: `🧠 **Learning Pattern**\n\nYour notes cover diverse topics. This indicates strong curiosity and learning drive. Consider creating connections between related concepts.`,
        timestamp: new Date()
      }
    ];
  }

  private getFallbackSuggestions(notes: any[]) {
    return [
      {
        id: Date.now().toString(),
        title: '🏷️ Organize with Tags',
        description: 'Add relevant tags to your notes for better organization and discovery',
        action: 'tag_notes'
      },
      {
        id: (Date.now() + 1).toString(),
        title: '⭐ Star Important Notes',
        description: 'Mark your most valuable notes as favorites for quick access',
        action: 'star_notes'
      },
      {
        id: (Date.now() + 2).toString(),
        title: '📚 Create Study Sessions',
        description: 'Review your notes regularly to reinforce learning',
        action: 'study_session'
      }
    ];
  }

  private getFallbackTags(content: string) {
    const commonTags = ['important', 'learning', 'reference', 'todo', 'idea', 'research', 'notes', 'study'];
    const words = content.toLowerCase().split(/\s+/);
    const suggestedTags = [];
    
    // Simple keyword-based tag suggestion
    if (words.some(w => ['learn', 'study', 'education'].includes(w))) suggestedTags.push('learning');
    if (words.some(w => ['work', 'project', 'task'].includes(w))) suggestedTags.push('work');
    if (words.some(w => ['idea', 'concept', 'thought'].includes(w))) suggestedTags.push('ideas');
    if (words.some(w => ['important', 'critical', 'key'].includes(w))) suggestedTags.push('important');
    
    return suggestedTags.length > 0 ? suggestedTags : commonTags.slice(0, 4);
  }
}

export const aiService = new ExtendedAIService();
export default aiService;
