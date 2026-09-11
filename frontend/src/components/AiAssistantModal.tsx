import React, { useState } from "react";
import { X, Send, Bot, Sparkles, AlertCircle } from "lucide-react";
import { assistantApi } from "../services/api";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId?: number;
  factoryName?: string;
}

interface Message {
  role: "user" | "copilot";
  content: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  assessmentId,
  factoryName,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "copilot",
      content: `Hello! I am **CarbonCopilot**, your factory's operational decarbonization assistant${
        factoryName ? ` for **${factoryName}**` : ""
      }.\n\nAsk me anything about your verified emission leak points, solar payback, or circular alternatives.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "Where are my biggest emissions?",
    "How much CO₂ can I save if I use 40% solar?",
    "Which recommendation gives the fastest ROI?",
    "What should I implement first?",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMsgs: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await assistantApi.chat(assessmentId, query);
      setMessages([...newMsgs, { role: "copilot", content: res.response }]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: "copilot",
          content: "Sorry, I encountered an error retrieving data. Please ensure an active assessment is loaded.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:w-[480px] h-[90vh] sm:h-[620px] bg-industrial-900 border border-industrial-700/80 rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 bg-industrial-850 border-b border-industrial-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-carbon-cyber/20 text-carbon-cyber flex items-center justify-center border border-carbon-cyber/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-semibold text-white text-sm">CarbonCopilot AI</h3>
                <span className="text-[10px] bg-carbon-green/20 text-carbon-green px-1.5 py-0.2 rounded font-mono font-bold">
                  Grounded
                </span>
              </div>
              <p className="text-[11px] text-industrial-400">Zero-hallucination plant decision engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-industrial-400 hover:text-white hover:bg-industrial-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-industrial-950/40 text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-carbon-green text-industrial-950 font-medium"
                    : "bg-industrial-800/90 text-industrial-100 border border-industrial-700/60"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-industrial-800/80 p-3 rounded-xl text-xs text-industrial-400 flex items-center space-x-2">
                <span className="animate-spin text-carbon-green">⟳</span>
                <span>Synthesizing plant emissions and financial model...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-industrial-850/80 border-t border-industrial-700/40 flex items-center gap-1.5 overflow-x-auto">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[10px] whitespace-nowrap bg-industrial-800 hover:bg-industrial-700 text-industrial-300 hover:text-white px-2.5 py-1 rounded-full border border-industrial-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-industrial-900 border-t border-industrial-700/60 flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about emissions, ROI, solar payback..."
            className="flex-1 bg-industrial-950 border border-industrial-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-carbon-green text-industrial-950 rounded-lg hover:bg-carbon-lime disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
