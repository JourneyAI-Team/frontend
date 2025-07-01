import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
export const FloatingButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      className="rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-500/50 bg-green-700 hover:bg-green-800 text-white shadow-green-500/25 w-12 h-12"
      onClick={onClick}
    >
      <BotMessageSquare size={50} />
    </Button>
  );
};
