import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export const ToolCallIndicatorBadge = ({
  icon,
  text,
}: {
  icon?: string;
  text: string;
}) => {
  return (
    <Badge className="transition-all duration-300 animate-in fade-in-0">
      {icon}
      {text}
    </Badge>
  );
};
