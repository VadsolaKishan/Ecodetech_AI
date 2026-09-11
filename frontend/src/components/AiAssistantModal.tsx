import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, RotateCcw } from "lucide-react";
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
  modelUsed?: string;
  isLlmActive?: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  assessmentId,
  factoryName,
}) => {
  const initialGreeting: Message = {
    role: "copilot",
    content: `Hello! I am **CarbonCopilot AI**, your factory's operational decarbonization copilot${
      factoryName ? ` for **${factoryName}**` : ""
    }.\n\nAsk me anything about your verified Scope 1/2/3 emissions, top hotspots, solar transition ROI, or circular interventions.`,
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [isLlmActive, setIsLlmActive] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    "Where are my biggest emissions?",
    "How much CO₂ can I save if I use 40% solar?",
    "Which recommendation gives the fastest ROI?",
    "What should I implement first?",
    "How can we improve our circularity score?",
    "How to reduce Scope 2 grid electricity emissions?",
  ];

  const handleResetChat = () => {
    setMessages([initialGreeting]);
    setActiveModel(null);
    setIsLlmActive(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: Message = { role: "user", content: query };
    const newMsgs = [...messages, userMessage];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for LLM grounding (user and assistant turns)
      const history = newMsgs.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await assistantApi.chat(assessmentId, query, history);
      
      const copilotMessage: Message = {
        role: "copilot",
        content: res.response,
        modelUsed: res.model_used,
        isLlmActive: res.is_llm_active,
      };

      setMessages([...newMsgs, copilotMessage]);
      if (res.model_used) setActiveModel(res.model_used);
      if (res.is_llm_active !== undefined) setIsLlmActive(res.is_llm_active);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: "copilot",
          content: "Sorry, I encountered an error connecting to the AI service. Please ensure an active assessment is loaded.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format basic markdown (bold, bullet points, blockquotes)
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Blockquote line
      if (line.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-2 border-carbon-cyan/60 pl-2.5 my-1.5 text-industrial-300 italic text-[11px] bg-industrial-900/60 py-1 rounded-r">
            {line.substring(2)}
          </blockquote>
        );
      }
      
      // Parse inline bolding **word**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-white">
              {part.substring(2, part.length - 2)}
            </strong>
          );
        }
        return part;
      });

      // Bullet points
      if (line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().startsWith("*")) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-0.5 ml-1">
            <span className="text-carbon-green font-bold text-xs leading-5">•</span>
            <span className="flex-1 leading-relaxed">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "leading-relaxed my-0.5"}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:w-[520px] h-[92vh] sm:h-[650px] bg-industrial-900 border border-industrial-700/80 rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3.5 bg-industrial-850 border-b border-industrial-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-carbon-cyber/20 text-carbon-cyber flex items-center justify-center border border-carbon-cyber/40 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-sm tracking-tight">CarbonCopilot AI</h3>
                {isLlmActive ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-full font-medium">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Gemini Live</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-carbon-green/20 text-carbon-green border border-carbon-green/30 px-1.5 py-0.2 rounded font-mono font-medium">
                    {activeModel || "Grounded"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-industrial-400">Industrial Decarbonization & Circularity Copilot</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-1.5 text-industrial-400 hover:text-white hover:bg-industrial-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-industrial-400 hover:text-white hover:bg-industrial-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-industrial-950/50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-xl leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-carbon-green text-industrial-950 font-medium rounded-br-none"
                    : "bg-industrial-850/95 text-industrial-100 border border-industrial-700/60 rounded-bl-none"
                }`}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div>{renderFormattedText(m.content)}</div>
                )}
                {m.modelUsed && (
                  <div className="mt-2 pt-1.5 border-t border-industrial-700/40 text-[9px] text-industrial-400 flex items-center justify-between">
                    <span>Engine: {m.modelUsed}</span>
                    {m.isLlmActive && <span className="text-emerald-400 font-medium">Verified LLM</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-industrial-850/80 border border-industrial-700/50 p-3 rounded-xl text-xs text-industrial-300 flex items-center space-x-2.5">
                <span className="animate-spin text-carbon-green text-sm">⟳</span>
                <span className="text-[11px]">CarbonCopilot reasoning with Gemini & plant context...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-industrial-850/90 border-t border-industrial-700/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[10px] whitespace-nowrap bg-industrial-800 hover:bg-industrial-700 text-industrial-300 hover:text-white px-2.5 py-1 rounded-full border border-industrial-700/60 transition-colors shrink-0"
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
            placeholder="Ask Gemini about emissions, ROI, solar payback, circularity..."
            className="flex-1 bg-industrial-950 border border-industrial-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-carbon-green text-industrial-950 rounded-lg hover:bg-carbon-lime disabled:opacity-40 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
