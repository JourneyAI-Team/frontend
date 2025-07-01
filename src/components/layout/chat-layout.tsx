import { useEffect, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
  NavLink,
  Outlet,
} from "react-router";
import {
  CirclePlus,
  UserRoundPlus,
  MessageCircle,
  House,
  ChevronsUpDown,
} from "lucide-react";

import { CreateAccountModal } from "@/features/chat/components/create-account-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";
import {
  getAccountQueryOptions,
  useAccount,
} from "@/features/chat/api/get-account";
import { useListAccounts } from "@/features/chat/api/list-accounts";

// import { useSessions } from "@/features/chat/api/get-sessions";
import { useListSessions } from "@/features/chat/api/list-sessions";
import { AccountSelectButton } from "@/features/chat/components/accounts-select-button";
import { AccountDropdownMenuItem } from "@/features/chat/components/account-dropdown-menu-item";
import { GptModelSelectButton } from "@/features/chat/components/gpt-model-select-button";

import type { Account, Base } from "@/types/models";
import { cn } from "@/utils/cn";
import { useListMessages } from "@/features/chat/api/list-messages";
import { FloatingButton } from "@/features/chat/components/floating-button";
import { GeneralAssistantChatBox } from "@/features/chat/components/general-chat-box";
import { WebSocketProvider } from "@/providers/web-sockets";
// import { GA_ACCOUNT_ID, GA_SESSION_ID } from "@/utils/vars";
// import { useCreateAccount } from "@/features/chat/api/create-account";

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const accountId = params.accountId as string;

    await queryClient.ensureQueryData(getAccountQueryOptions({ accountId }));
    return { accountId };
  };

const ChatSidebarGeneralGroupContent = ({
  accountId,
}: {
  accountId: string;
}) => {
  const sidebarItems = [
    {
      title: "Home",
      icon: House,
      url: "#",
    },
    {
      title: "New Chat",
      icon: MessageCircle,
      url: "#",
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>GENERAL</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.title} className="">
              <SidebarMenuButton asChild>
                <NavLink to={`/a/${accountId}`}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const ChatSidebarHeader = ({
  onAccountClick,
  onShowNewCreateAccountModal,
  onCreateAccount,
}: {
  onAccountClick: (accountId: string) => void;
  onShowNewCreateAccountModal: (value: boolean) => void;
  onCreateAccount: () => void;
}) => {
  const { accountId } = useParams();
  const { data: accountsList } = useListAccounts({});
  const { data: account } = useAccount({
    queryParams: { accountId: accountId! },
  });

  if (accountsList?.length === 0) {
    onShowNewCreateAccountModal(true);
  }

  const accountsDropdownOptions = [
    {
      name: "Create Workspace",
      icon: <CirclePlus />,
    },
    {
      name: "Join Workspace",
      icon: <UserRoundPlus />,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <AccountSelectButton accountName={account?.name || ""} />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dropdown-content-width-full">
        <DropdownMenuGroup>
          {accountsList?.map((account) => (
            <AccountDropdownMenuItem
              key={account.id}
              name={account.name}
              handleClick={() => onAccountClick(account.id)}
            />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {accountsDropdownOptions.map((item) => (
            <DropdownMenuItem
              key={item.name}
              className="text-xs"
              onClick={() => {
                if (item.name === "Create Workspace") {
                  onCreateAccount();
                }
              }}
            >
              {item.name}
              <DropdownMenuShortcut>{item.icon}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ChatSidebarSessionsGroupContent = ({
  onSessionClick,
}: {
  onSessionClick: (sessionId: string) => void;
}) => {
  const { sessionId, accountId } = useParams();

  // Reset the session title once messages length reach 4

  const queryClient = useQueryClient();
  const { data: messages } = useListMessages({
    queryParams: {
      query: {
        account_id: accountId!,
        session_id: sessionId!,
      },
    },
  });

  const { data: sessions } = useListSessions({
    queryParams: {
      query: {
        account_id: accountId!,
      },
    },
    queryConfig: {
      enabled: !!accountId,
    },
  });

  useEffect(() => {
    if (messages && messages?.length === 4) {
      queryClient.invalidateQueries({
        queryKey: [
          "sessions",
          {
            account_id: accountId,
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>HISTORY</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sessions &&
            sessions.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  onClick={() => onSessionClick(item.id)}
                  className={cn(
                    "inline-block truncate max-w-xs",
                    sessionId === item.id ? "bg-neutral-200 rounded-md" : ""
                  )}
                >
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const ChatSidebarUserDropdown = () => {
  const { user, logout } = useAuth();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="" alt="" />
                <AvatarFallback className="rounded-lg">
                  {(
                    user?.profile?.first_name?.[0] ||
                    user?.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.profile?.first_name || user?.email || "User"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dropdown-content-width-full">
            <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const Header = () => {
  const [selectedModel, setSelectedModel] = useState("gpt-4.1");
  const [isOpen, setIsOpen] = useState(false);

  const modelOptions = [
    {
      value: "gpt-4.1",
      label: "GPT-4.1",
      description: "Most capable model, best for complex tasks",
      badge: "POPULAR",
    },
    {
      value: "gpt-4o",
      label: "GPT-4o",
      description: "Fastest model, optimized for speed",
      badge: "FAST",
    },
    {
      value: "o3-mini",
      label: "o3-mini",
      description: "Advanced reasoning capabilities",
      badge: "REASONING",
    },
  ];

  const handleModelSelect = (modelValue: string) => {
    setSelectedModel(modelValue);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 px-4 z-40 bg-gray-50">
      <SidebarTrigger />
      <div>
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <div>
              <GptModelSelectButton selectedModel={selectedModel} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-[280px] z-[100] bg-white border border-gray-200 shadow-xl rounded-lg p-2"
            align="start"
            sideOffset={12}
          >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Select Model
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Choose the AI model for your conversations
              </p>
            </div>
            <DropdownMenuGroup>
              {modelOptions.map((model) => (
                <DropdownMenuItem
                  key={model.value}
                  className="relative px-3 py-3 cursor-grab hover:cursor-grab focus:cursor-grab rounded-md hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150"
                  onClick={() => handleModelSelect(model.value)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {model.label}
                        </span>
                        {model.badge && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              model.badge === "POPULAR"
                                ? "bg-blue-100 text-blue-700"
                                : model.badge === "FAST"
                                ? "bg-green-100 text-green-700"
                                : model.badge === "REASONING"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                    {selectedModel === model.value && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 ml-3 flex-shrink-0">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <div className="px-3 py-2 border-t border-gray-100 mt-1">
              <p className="text-xs text-gray-400">
                💡 Model affects response quality and speed
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export const ChatLayout = ({ isSetup = false }: { isSetup?: boolean }) => {
  const navigate = useNavigate();
  const { accountId } = useParams();

  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [forceCreateNewAccount, setForceCreateNewAccount] = useState(false);
  const [openGeneralAssistantChat, setOpenGeneralAssistantChat] =
    useState(false);

  const { data: account, isLoading: isAccountLoading } = useAccount({
    queryParams: { accountId: accountId! },
    queryConfig: {
      enabled: !!accountId,
    },
  });

  const { data: accounts, isLoading: isAccountsLoading } = useListAccounts({
    queryConfig: {
      enabled: !!account || isSetup,
    },
  });

  // const createAccount = useCreateAccount({});

  // handle setup mode - redirect to first account if available, otherwise show create modal
  useEffect(() => {
    if (isSetup && !isAccountsLoading) {
      if (accounts && accounts.length > 0) {
        navigate(`/a/${accounts[0].id}`);
      } else {
        // Only show modal if there are no accounts to redirect to
        setForceCreateNewAccount(true);
        setShowCreateAccountModal(true);
      }
    }
  }, [isSetup, accounts, isAccountsLoading, navigate]);

  // handle non-setup mode - ensure we have proper state
  useEffect(() => {
    if (!isSetup) {
      setForceCreateNewAccount(false);
      setShowCreateAccountModal(false);
    }
  }, [isSetup]);

  // handle account not found --> go to the first account or setup
  useEffect(() => {
    if (isSetup) return;
    if (isAccountLoading) return;
    if (!account) {
      if (accounts && accounts.length > 0) {
        navigate(`/a/${accounts[0].id}`);
      } else {
        navigate("/setup");
      }
    }
  }, [account, accounts, isSetup, isAccountLoading, navigate]);

  // Show loading state during setup when accounts are being loaded
  if (isSetup && isAccountsLoading) {
    return <div>Loading...</div>;
  }

  const handleAccountCreated = (account: Account & Base) => {
    navigate(`/a/${account.id}`);
  };

  const handleAccountClick = (accountId: string) => {
    navigate(`/a/${accountId}`);
  };
  const handleCreateAccount = () => {
    setShowCreateAccountModal(true);
  };
  const handleSessionClick = (sessionId: string) => {
    navigate(`/a/${accountId!}/s/${sessionId}`);
  };

  const handleCloseGeneralAssistantChat = () => {
    setOpenGeneralAssistantChat(false);
  };

  const handleToggleGeneralAssistantChat = () => {
    setOpenGeneralAssistantChat(!openGeneralAssistantChat);
    // if (!localStorage.getItem(GA_ACCOUNT_ID)) {
    //   createAccount.mutate(
    //     {
    //       name: "",
    //       description: "",
    //     },
    //     {
    //       onSuccess: () => {
    //         setOpenGeneralAssistantChat(!openGeneralAssistantChat);
    //       },
    //     }
    //   );
    // }
  };

  return (
    <>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <ChatSidebarHeader
              onShowNewCreateAccountModal={() => {}}
              onAccountClick={handleAccountClick}
              onCreateAccount={handleCreateAccount}
            />
          </SidebarHeader>
          <SidebarContent>
            <ChatSidebarGeneralGroupContent accountId={accountId!} />
            <ChatSidebarSessionsGroupContent
              onSessionClick={handleSessionClick}
            />
          </SidebarContent>
          <SidebarFooter>
            <Button disabled>Invite Teammate</Button>
            <ChatSidebarUserDropdown />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-gray-50">
          <Header />
          <div className="fixed bottom-10 right-20 z-40">
            <FloatingButton onClick={handleToggleGeneralAssistantChat} />
          </div>

          <div className="fixed bottom-25 right-20 z-39">
            <WebSocketProvider>
              <GeneralAssistantChatBox
                onClose={handleCloseGeneralAssistantChat}
                isOpen={openGeneralAssistantChat}
              />
            </WebSocketProvider>
          </div>
          <div className="flex flex-1 flex-col gap-4 bg-gray-50">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSuccess={handleAccountCreated}
        isForced={forceCreateNewAccount}
      />
    </>
  );
};
