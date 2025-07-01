import { Badge } from "@/components/ui/badge";

export const ToolCallIndicatorBadge = ({
  icon,
  text,
}: {
  icon?: string;
  text: string;
}) => {
  return (
    <Badge>
      {icon}
      {text}
    </Badge>
  );
};
