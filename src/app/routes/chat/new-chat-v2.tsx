import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Star,
  Search,
  FileText,
  TrendingUp,
  PenTool,
  Phone,
  BarChart3,
  Calendar,
  Sparkles,
} from "lucide-react";

import {
  useListAssistants,
  type ListAssistantsResponse,
} from "@/features/chat/api/list-assistants";

import { useListAssistantCategories } from "@/features/chat/api/list-assistant-categories";
import { useCreateSession } from "@/features/chat/api/create-session";
import { useFavoriteAssistant } from "@/features/chat/api/favorite-assistant";

import { cn } from "@/utils/cn";
import { capitalize } from "@/utils/capitalize";

import { useAuth } from "@/hooks/use-auth";

const CustomTabsTrigger = ({
  value,
  onClick,
  icon,
}: {
  value: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) => {
  return (
    <TabsTrigger
      value={value}
      className="flex-1 h-10 text-base"
      onClick={onClick}
    >
      {icon}
      {capitalize(value)}
    </TabsTrigger>
  );
};

/**
 * Returns the appropriate icon component for an assistant based on its internal_name.
 *
 * @param internal_name - The internal identifier for the assistant
 * @returns The corresponding Lucide React icon component
 */
const getIconForAssistant = (internal_name: string) => {
  const iconMap: Record<string, any> = {
    new_client_research_prep: Search,
    new_client_account_plan: FileText,
    lookalike_leads: TrendingUp,
    social_media_writer: PenTool,
    sales_call_prep: Phone,
    annual_report_summarizer: BarChart3,
    meetings_made_easy: Calendar,
  };

  return iconMap[internal_name] || Sparkles; // Default to Sparkles if no match
};

export const LoadingAssistantCard = () => {
  return <Skeleton className="h-[120px] w-full bg-gray-200" />;
};

export const AssistantCard = ({
  assistant,
  handleClick,
}: {
  assistant: ListAssistantsResponse;
  handleClick: (id: string) => void;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentFavorites = user?.profile.favorite_assistants ?? [];
  const isCurrentlyFavorited = currentFavorites.includes(assistant.id);

  const favoriteAssistant = useFavoriteAssistant({
    mutationConfig: {
      onError: () => {},
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["user"],
        });
      },
    },
  });

  const toggleFavoriteAssistant = () => {
    const updatedFavorites = isCurrentlyFavorited
      ? currentFavorites.filter((id) => id !== assistant.id) // Remove if exists
      : [...currentFavorites, assistant.id]; // Add if doesn't exist

    favoriteAssistant.mutate({
      favorite_assistants: updatedFavorites,
    });
  };

  const IconComponent = getIconForAssistant(assistant.internal_name);

  return (
    <Card className="bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:cursor-pointer relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-10"
        onClick={toggleFavoriteAssistant}
      >
        <Star
          className={cn("", isCurrentlyFavorited && "text-yellow-500")}
          fill={isCurrentlyFavorited ? "yellow" : "none"}
        />
      </Button>
      <CardAction onClick={() => handleClick(assistant.id)}>
        <CardContent className="pr-14">
          <div className="flex flex-row items-center gap-4">
            <div className="flex-shrink-0 w-15 h-15 bg-gray-100 rounded-xl flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex flex-col text-left gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {assistant.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {assistant.description}
              </p>
            </div>
          </div>
        </CardContent>
      </CardAction>
    </Card>
  );
};

export const NewChatV2 = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<
    string | "all" | "favorites"
  >("all");

  const { data: categories } = useListAssistantCategories({});
  const { data: assistants, isLoading } = useListAssistants({
    queryParams: {
      query: {
        category: selectedCategory === "all" ? undefined : selectedCategory,
        ids:
          selectedCategory === "favorites"
            ? user?.profile.favorite_assistants ?? ["empty"]
            : undefined,
      },
    },
  });

  const createSession = useCreateSession({
    mutationConfig: {
      onError: () => {},
      onSuccess: (data) => {
        navigate(`/a/${accountId}/s/${data.id}`);
      },
    },
  });

  const handleSelectAssistant = (assistantId: string) => {
    createSession.mutate({
      title: "New Session",
      summary: "",
      account_id: accountId!,
      assistant_id: assistantId,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-5xl font-mabry-pro-bold mb-4">
              Hi! I'm Journey AI
            </h1>
            <p className="text-2xl font-mabry-pro-regular text-gray-600 max-w-3xl mx-auto">
              Your AI-powered assistant for automating sales tasks, enriching
              leads, and optimizing customer success.
            </p>
          </div>

          {/* Assistant Selection Tabs */}
          <div className="mb-8">
            <div className="flex w-full flex-col gap-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full h-12">
                  <CustomTabsTrigger
                    value="all"
                    onClick={() => setSelectedCategory("all")}
                  />
                  <CustomTabsTrigger
                    value="favorites"
                    onClick={() => setSelectedCategory("favorites")}
                    icon={<Star className="text-yellow-500" fill="yellow" />}
                  />
                  {categories?.assistant_categories.map((category) => (
                    <CustomTabsTrigger
                      key={category}
                      value={category}
                      onClick={() => setSelectedCategory(category)}
                    />
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          {/* Assistant Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto transition-all duration-300 ease-in-out">
            {isLoading ? (
              <div className="contents animate-in fade-in duration-1000 fade-out duration-1000">
                <LoadingAssistantCard />
                <LoadingAssistantCard />
                <LoadingAssistantCard />
                <LoadingAssistantCard />
              </div>
            ) : assistants && assistants?.length === 0 ? (
              <div className="col-span-2 py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-gray-400 text-lg mb-2">🤖</div>
                <p className="text-gray-600 font-medium">
                  No assistants found in this category
                </p>
              </div>
            ) : (
              assistants?.map((assistant) => (
                <AssistantCard
                  key={assistant.id}
                  assistant={assistant}
                  handleClick={handleSelectAssistant}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
