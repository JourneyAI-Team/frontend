// TODO: Delete this file
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Presentation, Sparkles } from "lucide-react";

const getIconForAssistant = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("lead") || titleLower.includes("generation")) {
    return TrendingUp;
  }
  if (titleLower.includes("client") || titleLower.includes("outreach")) {
    return Users;
  }
  if (titleLower.includes("sales") || titleLower.includes("pitch")) {
    return Presentation;
  }
  return Sparkles;
};

export const AssistantCard = ({
  id,
  title,
  description,
  handleClick,
}: {
  id: string;
  title: string;
  description?: string;
  handleClick: (id: string) => void;
}) => {
  const IconComponent = getIconForAssistant(title);

  return (
    <Card className="bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:cursor-pointer">
      <CardAction onClick={() => handleClick(id)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex flex-col text-left gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </CardAction>
    </Card>
  );
};
