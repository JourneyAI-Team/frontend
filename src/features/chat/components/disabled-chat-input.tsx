import { Button } from "@/components/ui/button";
import { Paperclip, Send, AtSign, Globe, Layers } from "lucide-react";

export const DisabledChatInput = () => {
  return (
    <div className="sticky bottom-0 border-t bg-white/80 backdrop-blur-sm px-4 py-6 mt-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative opacity-50 pointer-events-none">
          <div className="relative bg-background border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
            <textarea
              className="w-full resize-none rounded-2xl border-0 px-4 py-3 pb-12 placeholder:text-gray-400 text-sm min-h-[52px] max-h-32 bg-gray-50"
              placeholder="Select an assistant above to start chatting..."
              rows={1}
              disabled
              readOnly
            />

            {/* Action Buttons */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-8 w-8 rounded-lg text-gray-300 p-0"
                >
                  <Paperclip size={16} />
                  <span className="sr-only">Add attachment</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-8 w-8 rounded-lg text-gray-300 p-0"
                >
                  <Globe size={16} />
                  <span className="sr-only">Web search</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-8 w-8 rounded-lg text-gray-300 p-0"
                >
                  <AtSign size={16} />
                  <span className="sr-only">AI Extension</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled
                  className="h-8 w-8 rounded-lg text-gray-300 p-0"
                >
                  <Layers size={16} />
                  <span className="sr-only">Templates</span>
                </Button>
              </div>

              <div className="flex items-center">
                <Button
                  size="sm"
                  disabled
                  className="h-8 w-8 rounded-lg bg-gray-300 p-0"
                >
                  <Send size={16} className="text-gray-500" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-400 mt-3">
          Journey AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
