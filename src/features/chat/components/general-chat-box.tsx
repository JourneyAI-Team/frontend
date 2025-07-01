import { useRef, useState, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useWebSocketConnection } from "@/hooks/use-ws";
import { useSession } from "../api/get-session";
import { useCreateSession } from "../api/create-session";
import { useAccount } from "../api/get-account";

const ChatInput = ({ isOpen }: { isOpen: boolean }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");

  const { sendJsonMessage } = useWebSocketConnection();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    setInputValue("");
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
      />
      <button
        // onClick={handleSendMessage}
        // disabled={!inputValue.trim()}
        className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </>
  );
};

export const GeneralAssistantChatBox = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem("JOURNEY_AI_GENERAL_ASSISTANT_SESSION_ID")
  );

  const [accountId, setAccountId] = useState<string | null>(() =>
    localStorage.getItem("JOURNEY_AI_GENERAL_ASSISTANT_ACCOUNT_ID")
  );

  const accountData = useAccount({
    queryParams: {
      accountId: accountId!,
    },
    queryConfig: {
      enabled: !!accountId,
    },
  });

  useEffect(() => {}, []);

  const sessionData = useSession({
    queryParams: {
      sessionId: sessionId!,
    },
    queryConfig: {
      enabled: !!sessionId,
    },
  });

  if (!isOpen) return;

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h3 className="font-semibold">General Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-600 rounded transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/** Insert chat messages here */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <ChatInput isOpen={isOpen} />
        </div>
      </div>
    </div>
  );
};
