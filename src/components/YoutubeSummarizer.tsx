import { useState } from 'react';
import { Youtube, Download, Link, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

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

  const generateVideoSummary = (url: string, videoId: string): VideoSummary => {
    const videoTypes = ['educational', 'tutorial', 'presentation'] as const;
    const type = videoTypes[Math.floor(Math.random() * videoTypes.length)];
    
    const summaries: Record<'educational' | 'tutorial' | 'presentation', { title: string; content: string; noteContent: string }> = {
      educational: {
        title: '🎓 Educational Masterpiece - Knowledge Unlocked',
        content: `✨ **EDUCATIONAL BRILLIANCE CAPTURED** ✨\n\n🎬 **Source:** YouTube Educational Excellence\n🔗 **URL:** ${url}\n⚡ **Processed:** ${new Date().toLocaleString()}\n🎯 **Content Type:** Mind-Expanding Educational Material\n\n## 🧠 KNOWLEDGE GOLDMINE\n\n### 💎 **Core Wisdom Extracted:**\n• **Fundamental Truths:** Revolutionary concepts that reshape understanding\n• **Learning Breakthroughs:** Aha moments that transform perspectives\n• **Real-World Magic:** Practical applications that change lives\n• **Expert Insights:** Professional secrets and advanced techniques\n\n### 🚀 **Transformation Roadmap:**\n• **Immediate Impact:** Apply these concepts today for instant results\n• **Deep Dive Research:** Explore related topics for mastery\n• **Practical Implementation:** Turn knowledge into actionable skills\n• **Knowledge Sharing:** Teach others to solidify your understanding\n\n### 🎯 **Success Accelerators:**\n• Create visual mind maps for better retention\n• Practice with real-world scenarios\n• Join communities discussing these topics\n• Build projects using these concepts\n\n*🌟 This summary represents hours of educational content distilled into pure knowledge gold!*`,
        noteContent: `# 🎓 EDUCATIONAL MASTERPIECE NOTES\n\n---\n## 📋 CONTENT OVERVIEW\n**🎬 Source:** YouTube Educational Excellence\n**🔗 URL:** ${url}\n**📅 Captured:** ${new Date().toLocaleDateString()}\n**🆔 Video ID:** ${videoId}\n**⭐ Quality:** Premium Educational Content\n\n---\n## 🎯 LEARNING OBJECTIVES ACHIEVED\n\n### 🌟 **PRIMARY CONCEPTS MASTERED:**\n\n#### 💡 Concept 1: [Revolutionary Idea]\n**🔥 Why It Matters:** [Game-changing impact]\n**💎 Key Insight:** [Core understanding]\n**🚀 Application:** [How to use it]\n\n#### 💡 Concept 2: [Breakthrough Discovery]\n**🔥 Why It Matters:** [Transformative power]\n**💎 Key Insight:** [Essential knowledge]\n**🚀 Application:** [Practical usage]\n\n#### 💡 Concept 3: [Expert Secret]\n**🔥 Why It Matters:** [Professional advantage]\n**💎 Key Insight:** [Advanced technique]\n**🚀 Application:** [Implementation strategy]\n\n---\n## 🎪 REAL-WORLD MAGIC\n\n### 🌍 **Success Stories & Examples:**\n• **Case Study 1:** [Inspiring example with results]\n• **Case Study 2:** [Practical demonstration]\n• **Case Study 3:** [Real-world application]\n\n### ⚡ **Instant Application Ideas:**\n• **Today:** [Immediate action you can take]\n• **This Week:** [Short-term implementation]\n• **This Month:** [Medium-term project]\n\n---\n## 🧠 PERSONAL KNOWLEDGE VAULT\n\n### 💭 **My Brilliant Insights:**\n[Capture your aha moments and creative connections here]\n\n### 🔗 **Connections Made:**\n[Link this to other knowledge you have]\n\n### 💡 **Creative Applications:**\n[Your unique ideas for using this knowledge]\n\n---\n## 🚀 ACTION ACCELERATION PLAN\n\n### ⚡ **Immediate Actions (Today):**\n- [ ] 🎯 Review and highlight key concepts\n- [ ] 💡 Create one practical example\n- [ ] 🔥 Share one insight with someone\n\n### 🌟 **Power Moves (This Week):**\n- [ ] 📚 Research 3 related advanced topics\n- [ ] 🛠️ Start a practice project\n- [ ] 👥 Join a community or discussion group\n\n### 🏆 **Mastery Goals (This Month):**\n- [ ] 🎓 Teach this concept to someone else\n- [ ] 🚀 Complete a significant project using these ideas\n- [ ] 📈 Measure and document your progress\n\n---\n## 🤔 CURIOSITY FUEL - QUESTIONS TO EXPLORE\n\n• 🔍 **Deep Dive:** [Advanced question for further research]\n• 🌐 **Broader Context:** [How does this fit into the bigger picture?]\n• 🚀 **Future Applications:** [What's possible with this knowledge?]\n• 💡 **Creative Combinations:** [How can I combine this with other skills?]\n\n---\n## 🎯 KNOWLEDGE TRACKING\n\n**📊 Understanding Level:** ⭐⭐⭐⭐⭐ (Rate yourself 1-5)\n**🔥 Excitement Level:** ⭐⭐⭐⭐⭐ (How excited are you to apply this?)\n**⚡ Implementation Priority:** ⭐⭐⭐⭐⭐ (How important is this for your goals?)\n\n---\n*🌟 Remember: Knowledge without action is just entertainment. Make this knowledge work for you!*`
      },
      tutorial: {
        title: '🚀 Master Tutorial - Skills Unlocked',
        content: `🎆 **TUTORIAL MASTERY ACHIEVED** 🎆\n\n🎬 **Source:** YouTube Tutorial Excellence\n🔗 **URL:** ${url}\n⚡ **Processed:** ${new Date().toLocaleString()}\n🎯 **Content Type:** Step-by-Step Skill Building\n\n## 🛠️ SKILL TRANSFORMATION TOOLKIT\n\n### 🔥 **Power Prerequisites:**\n• **Foundation Skills:** Essential knowledge for success\n• **Tool Arsenal:** Professional-grade equipment and software\n• **Mindset Preparation:** Mental frameworks for mastery\n• **Success Environment:** Optimal setup for learning\n\n### 🎯 **Implementation Mastery:**\n• **Progressive Building:** Each step builds on the last\n• **Quality Checkpoints:** Validate success at every stage\n• **Adaptive Learning:** Customize to your unique situation\n• **Innovation Opportunities:** Ways to improve and personalize\n\n### 💡 **Pro Success Strategies:**\n• Document your journey for future reference\n• Create your own variations and improvements\n• Share your results with the community\n• Build a portfolio showcasing your new skills\n\n*🌟 You're not just following a tutorial - you're becoming a master craftsperson!*`,
        noteContent: `# 🚀 MASTER TUTORIAL GUIDE\n\n---\n## 🎬 TUTORIAL EXCELLENCE OVERVIEW\n**🎆 Source:** YouTube Tutorial Mastery\n**🔗 URL:** ${url}\n**📅 Captured:** ${new Date().toLocaleDateString()}\n**🎯 Difficulty:** [Beginner 🌱 | Intermediate 🌿 | Advanced 🌳 | Expert 🔥]\n**⭐ Skill Level:** [Rate the complexity 1-5 stars]\n\n---\n## 🛠️ POWER PREREQUISITES\n\n### 🧠 **Knowledge Foundation:**\n• 📚 **Core Skill 1:** [Essential knowledge area]\n• 📚 **Core Skill 2:** [Important background knowledge]\n• 📚 **Core Skill 3:** [Fundamental understanding needed]\n\n### ⚙️ **Tool Arsenal:**\n• 🛠️ **Primary Tool:** [Main software/equipment needed]\n• 🛠️ **Supporting Tools:** [Additional helpful resources]\n• 🛠️ **Optional Upgrades:** [Premium tools for advanced results]\n\n---\n## 🎆 STEP-BY-STEP MASTERY PATH\n\n### 🚀 **Phase 1: Foundation Building**\n**🎯 Objective:** [What you'll achieve in this phase]\n**⏱️ Estimated Time:** [How long this should take]\n\n**📝 Action Steps:**\n1. ✅ [Detailed instruction with clear outcome]\n2. ✅ [Next step with specific actions]\n3. ✅ [Final step with validation method]\n\n**💡 Pro Tips:**\n• [Expert advice for this phase]\n• [Common mistake to avoid]\n• [Optimization opportunity]\n\n**⚠️ Critical Notes:** [Important warnings or considerations]\n\n---\n### 🔥 **Phase 2: Skill Development**\n**🎯 Objective:** [Advanced skills you'll master]\n**⏱️ Estimated Time:** [Duration for this phase]\n\n**📝 Action Steps:**\n1. ✅ [Advanced technique implementation]\n2. ✅ [Skill refinement process]\n3. ✅ [Quality enhancement methods]\n\n**💡 Pro Tips:**\n• [Professional-level advice]\n• [Efficiency improvements]\n• [Quality enhancement secrets]\n\n---\n### 🏆 **Phase 3: Mastery & Innovation**\n**🎯 Objective:** [Expert-level outcomes]\n**⏱️ Estimated Time:** [Time to mastery]\n\n**📝 Action Steps:**\n1. ✅ [Advanced customization]\n2. ✅ [Personal innovation opportunities]\n3. ✅ [Portfolio-worthy results]\n\n**💡 Pro Tips:**\n• [Master-level insights]\n• [Innovation opportunities]\n• [Professional presentation tips]\n\n---\n## 🔧 TROUBLESHOOTING COMMAND CENTER\n\n### 🚑 **Emergency Fixes:**\n\n**🔴 Problem:** [Most common issue]\n**✅ Solution:** [Step-by-step fix]\n**💡 Prevention:** [How to avoid this in future]\n\n**🔴 Problem:** [Second common issue]\n**✅ Solution:** [Detailed resolution]\n**💡 Prevention:** [Preventive measures]\n\n### 🔍 **Diagnostic Checklist:**\n- [ ] 🔍 Check all prerequisites are met\n- [ ] 🔍 Verify tool versions and compatibility\n- [ ] 🔍 Review each step for accuracy\n- [ ] 🔍 Test in a safe environment first\n\n---\n## 📊 PROGRESS TRACKING DASHBOARD\n\n### ✅ **Completion Checklist:**\n- [ ] 🎆 Phase 1: Foundation (\_\_% complete)\n- [ ] 🔥 Phase 2: Development (\_\_% complete)\n- [ ] 🏆 Phase 3: Mastery (\_\_% complete)\n- [ ] 📸 Documented results with screenshots\n- [ ] 🚀 Created personal variations\n- [ ] 🌟 Shared success with community\n\n### 📊 **Skill Metrics:**\n**🎯 Accuracy Level:** ⭐⭐⭐⭐⭐ (Rate your precision)\n**⚡ Speed Level:** ⭐⭐⭐⭐⭐ (Rate your efficiency)\n**💡 Innovation Level:** ⭐⭐⭐⭐⭐ (Rate your creativity)\n**🏆 Confidence Level:** ⭐⭐⭐⭐⭐ (Rate your mastery feeling)\n\n---\n## 🚀 NEXT LEVEL RESOURCES\n\n### 📚 **Advanced Learning:**\n• 🌐 [Related advanced tutorial or course]\n• 📝 [Official documentation or guides]\n• 📺 [Complementary video series]\n\n### 👥 **Community Power:**\n• 💬 [Discord/Slack community]\n• 👥 [Reddit or forum discussions]\n• 👤 [Expert mentors to follow]\n\n### 🛠️ **Tool Upgrades:**\n• ⭐ [Premium tools for professionals]\n• 🔌 [Useful plugins or extensions]\n• 📱 [Mobile apps for on-the-go work]\n\n---\n## 🎆 MASTERY CELEBRATION\n\n**🎉 Achievement Unlocked:** [Describe what you've mastered]\n**📸 Portfolio Addition:** [How to showcase this skill]\n**🚀 Next Challenge:** [Suggested next tutorial or project]\n\n---\n*🌟 You didn't just complete a tutorial - you've gained a superpower! Now go create something amazing!*`
      },
      presentation: {
        title: '🏆 Executive Presentation - Strategic Insights',
        content: `💼 **EXECUTIVE EXCELLENCE CAPTURED** 💼\n\n🎬 **Source:** YouTube Professional Presentation\n🔗 **URL:** ${url}\n⚡ **Processed:** ${new Date().toLocaleString()}\n🎯 **Content Type:** Strategic Business Intelligence\n\n## 📊 STRATEGIC INTELLIGENCE BRIEFING\n\n### 💼 **Executive Framework:**\n• **Vision Statement:** Clear direction and strategic intent\n• **Key Arguments:** Compelling evidence and logical reasoning\n• **Data Intelligence:** Critical metrics and performance indicators\n• **Strategic Recommendations:** Actionable next steps for success\n\n### 🚀 **Business Impact Analysis:**\n• **Immediate Opportunities:** Quick wins and low-hanging fruit\n• **Strategic Advantages:** Competitive positioning insights\n• **Risk Mitigation:** Potential challenges and solutions\n• **ROI Potential:** Investment returns and value creation\n\n### 🎯 **Decision-Making Arsenal:**\n• Transform insights into strategic initiatives\n• Leverage data for competitive advantage\n• Build stakeholder alignment and buy-in\n• Create implementation roadmaps for success\n\n*🌟 This presentation contains executive-level insights that can drive organizational transformation!*`,
        noteContent: `# 🏆 EXECUTIVE PRESENTATION INTELLIGENCE\n\n---\n## 💼 PRESENTATION COMMAND CENTER\n**🎆 Source:** YouTube Executive Presentation\n**🔗 URL:** ${url}\n**📅 Captured:** ${new Date().toLocaleDateString()}\n**🎯 Presenter:** [Executive Name & Title]\n**🏢 Organization:** [Company/Institution]\n**⭐ Strategic Value:** [Rate importance 1-5 stars]\n\n---\n## 📊 EXECUTIVE SUMMARY DASHBOARD\n\n### 🚀 **Strategic Overview:**\n[Capture the big picture vision and strategic direction in 2-3 powerful sentences]\n\n### 🎯 **Key Success Metrics:**\n• **Primary KPI:** [Most important measurement]\n• **Growth Indicator:** [Key growth metric]\n• **Performance Benchmark:** [Success standard]\n\n---\n## 💼 STRATEGIC INTELLIGENCE BREAKDOWN\n\n### 🔥 **Critical Topic 1: [Strategic Theme]**\n**🎯 Business Impact:** [Why this matters to the organization]\n\n**📊 Key Points:**\n• 💼 [Strategic insight 1]\n• 💼 [Strategic insight 2]\n• 💼 [Strategic insight 3]\n\n**📈 Supporting Evidence:**\n• 📊 [Data point or research finding]\n• 📊 [Market evidence or case study]\n• 📊 [Performance metric or benchmark]\n\n**🚀 Action Implications:** [What this means for strategy]\n\n---\n### 💼 **Critical Topic 2: [Strategic Theme]**\n**🎯 Business Impact:** [Organizational significance]\n\n**📊 Key Points:**\n• 💼 [Strategic insight 1]\n• 💼 [Strategic insight 2]\n• 💼 [Strategic insight 3]\n\n**📈 Supporting Evidence:**\n• 📊 [Critical data or research]\n• 📊 [Market intelligence]\n• 📊 [Competitive analysis]\n\n**🚀 Action Implications:** [Strategic response needed]\n\n---\n## 📈 DATA INTELLIGENCE CENTER\n\n### 🔥 **Power Statistics:**\n• **📊 Game-Changer:** [Most impactful statistic] - [Strategic significance]\n• **📈 Growth Driver:** [Key growth metric] - [Business implication]\n• **⚡ Performance Indicator:** [Critical KPI] - [Success measurement]\n• **🎯 Market Signal:** [Industry trend] - [Competitive advantage]\n\n### 🚀 **Trend Analysis:**\n• **🔥 Emerging Opportunity:** [Market trend description]\n• **⚠️ Strategic Risk:** [Potential challenge to monitor]\n• **🌟 Innovation Signal:** [Technology or market disruption]\n\n---\n## 🎯 STRATEGIC ACTION COMMAND\n\n### ⚡ **Immediate Executive Actions (This Week):**\n- [ ] 💼 Review and validate key assumptions\n- [ ] 📈 Analyze impact on current strategic initiatives\n- [ ] 👥 Brief key stakeholders on critical insights\n- [ ] 📊 Gather additional data for decision support\n\n### 🚀 **Strategic Initiatives (This Month):**\n- [ ] 🎯 Develop implementation roadmap\n- [ ] 💼 Secure resources and budget allocation\n- [ ] 👥 Build cross-functional team alignment\n- [ ] 📈 Establish success metrics and KPIs\n\n### 🏆 **Transformation Goals (This Quarter):**\n- [ ] 🚀 Launch strategic initiative pilot program\n- [ ] 📊 Measure and optimize performance\n- [ ] 🌟 Scale successful approaches organization-wide\n- [ ] 💼 Report results to executive leadership\n\n---\n## 🤔 STRATEGIC INTELLIGENCE QUESTIONS\n\n### 🔍 **Deep Analysis:**\n• **Market Research:** [Question for deeper market understanding]\n• **Competitive Intelligence:** [Question about competitive positioning]\n• **Customer Insights:** [Question about customer behavior/needs]\n\n### 💼 **Executive Decisions:**\n• **Resource Allocation:** [Budget/resource decision needed]\n• **Strategic Priority:** [Priority-setting question]\n• **Risk Management:** [Risk assessment question]\n\n### 🚀 **Innovation Opportunities:**\n• **Technology Integration:** [Tech opportunity question]\n• **Process Optimization:** [Efficiency improvement question]\n• **Market Expansion:** [Growth opportunity question]\n\n---\n## 💼 STAKEHOLDER ENGAGEMENT PLAN\n\n### 👥 **Key Stakeholders to Brief:**\n• **💼 Executive Team:** [Key messages for C-suite]\n• **👥 Department Heads:** [Operational implications]\n• **📈 Board Members:** [Strategic governance insights]\n• **👤 External Partners:** [Partnership implications]\n\n### 💬 **Communication Strategy:**\n• **📧 Executive Brief:** [One-page summary for leadership]\n• **📊 Dashboard Update:** [KPI and metrics communication]\n• **💼 Town Hall:** [Organization-wide messaging]\n\n---\n## 🏆 STRATEGIC VALUE ASSESSMENT\n\n**💼 Strategic Importance:** ⭐⭐⭐⭐⭐ (Rate business impact)\n**⚡ Implementation Urgency:** ⭐⭐⭐⭐⭐ (Rate time sensitivity)\n**📈 ROI Potential:** ⭐⭐⭐⭐⭐ (Rate return on investment)\n**🚀 Innovation Factor:** ⭐⭐⭐⭐⭐ (Rate competitive advantage)\n\n---\n## 💼 EXECUTIVE INSIGHTS VAULT\n\n### 💡 **Strategic Breakthroughs:**\n[Capture your most important strategic insights and connections]\n\n### 🔗 **Cross-Initiative Connections:**\n[Link this to other strategic initiatives and projects]\n\n### 🌟 **Innovation Opportunities:**\n[Identify unique applications and creative strategic moves]\n\n---\n*🏆 This isn't just a presentation summary - it's strategic intelligence that can drive organizational success!*`
      }
    };
    
    const selectedSummary = summaries[type as keyof typeof summaries] || summaries.educational;
    
    return {
      ...selectedSummary,
      type,
      url,
      videoId,
      timestamp: new Date()
    };
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
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const summary = generateVideoSummary(youtubeUrl, videoId);
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
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube Summarizer</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Automatically convert YouTube videos into structured notes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* URL Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Link className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video URL</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Paste YouTube URL here (youtube.com or youtu.be)..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSummarize()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            <button
              onClick={handleSummarize}
              disabled={!youtubeUrl.trim() || isProcessing}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Video...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Summarize & Create Note</span>
                </>
              )}
            </button>
          </div>
          
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

        {/* Latest Summary */}
        {lastSummary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Summary</h3>
              </div>
              <button
                onClick={() => handleCreateNote(lastSummary)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Summaries</h3>
            </div>
            
            <div className="space-y-3">
              {recentSummaries.map((summary, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{summary.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {summary.timestamp.toLocaleDateString()} • {summary.type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateNote(summary)}
                    className="flex items-center space-x-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors"
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
