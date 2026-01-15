// import React, { useState } from 'react';
// import { HelpCircle, X, Sparkles } from 'lucide-react';

// export const GuideBot: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [message, setMessage] = useState('');

//   const quickTips = [
//     { text: "How do I create an agent?", response: "Click 'Create New Agent' or use the AI Wizard for guided setup!" },
//     { text: "What are nodes?", response: "Nodes are building blocks: Triggers start workflows, Actions do tasks, Conditions check rules, and Data sources connect to your tools." },
//     { text: "How do I connect nodes?", response: "Drag from the bottom dot of one node to the top dot of another!" },
//     { text: "Can I save my work?", response: "Yes! Click 'Save' in the builder. Your agents are automatically saved to your account." },
//   ];

//   return (
//     <>
//       {/* Guide Bot Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center group hover:scale-110"
//       >
//         {isOpen ? (
//           <X className="w-6 h-6 text-white" />
//         ) : (
//           <HelpCircle className="w-6 h-6 text-white animate-pulse" />
//         )}
//       </button>

//       {/* Guide Bot Panel */}
//       {isOpen && (
//         <div className="fixed bottom-24 right-6 z-40 w-96 bg-gradient-to-br from-slate-900 to-purple-900/50 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-b border-white/10 p-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
//                 <Sparkles className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-white">Guide Bot</h3>
//                 <p className="text-xs text-purple-200">Here to help! 👋</p>
//               </div>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="p-4 max-h-96 overflow-y-auto">
//             <div className="space-y-3">
//               <p className="text-sm text-gray-300 mb-4">
//                 Hi! I'm your guide. Ask me anything or try these quick tips:
//               </p>

//               {quickTips.map((tip, i) => (
//                 <button
//                   key={i}
//                   onClick={() => alert(tip.response)}
//                   className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors border border-white/10"
//                 >
//                   💡 {tip.text}
//                 </button>
//               ))}
//             </div>

//             {/* Input */}
//             <div className="mt-4">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Ask me anything..."
//                 className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter' && message.trim()) {
//                     alert('AI response coming soon! Connect Flask backend to enable.');
//                     setMessage('');
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };





import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, X, Sparkles, Send, 
  ChevronDown, ChevronUp, Lightbulb, Loader2 
} from 'lucide-react';
import { botService } from '../../services/bot'; // Path to your bot service

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export const GuideBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm your GuideBot. How can I help you build today?", sender: 'bot' }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickTips = [
    { text: "How do I create an agent?", response: "Click 'Create New Agent' or use the AI Wizard for a guided setup!" },
    { text: "What are nodes?", response: "Nodes are building blocks: Triggers start workflows, Actions do tasks, and Conditions check rules." },
    { text: "How do I connect nodes?", response: "Drag from the bottom dot of one node to the top dot of another!" },
    { text: "Can I save my work?", response: "Everything is saved automatically to your account!" },
  ];

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, showSuggestions]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender }]);
  };

  const handleUserInput = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    addMessage(userText, 'user');
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const response = await botService.getGeminiResponse(userText);
      addMessage(response, 'bot');
    } catch (err) {
      addMessage("I'm momentarily disconnected. Please try again.", 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all active:scale-95"
      >
        {isOpen ? <X className="text-white w-6 h-6" /> : <HelpCircle className="text-white w-6 h-6 animate-pulse" />}
      </button>

      {/* Main Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 max-h-[70vh] bg-[#0B0F1A] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          
          {/* Header (Fixed height) */}
          <div className="flex-none p-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center rotate-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AgentForge Guide</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">AI Online</p>
            </div>
          </div>

          {/* Chat Messages Area (Scrollable & Responsive) */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 scroll-smooth custom-scrollbar"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none shadow-lg' 
                    : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-[11px] ml-2">
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                Gemini is thinking...
              </div>
            )}
          </div>

          {/* Suggestions Drawer (Fixed height when open) */}
          <div className="flex-none px-4 pb-2 bg-black/20">
            <button 
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center justify-between w-full p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <Lightbulb className="w-3 h-3 text-yellow-500" /> Quick Tips
              </div>
              {showSuggestions ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>

            {showSuggestions && (
              <div className="grid gap-2 mt-2 max-h-32 overflow-y-auto pr-1">
                {quickTips.map((tip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      addMessage(tip.text, 'user');
                      setTimeout(() => addMessage(tip.response, 'bot'), 500);
                      setShowSuggestions(false);
                    }}
                    className="text-left px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-[11px] text-slate-400 hover:text-white transition-all"
                  >
                    💡 {tip.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Footer (Fixed height) */}
          <form onSubmit={handleUserInput} className="flex-none p-4 bg-white/5 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Type your question..."
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-blue-600 p-2.5 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};