// // TODO: Delete this file
// import { useState } from "react";
// import { useNavigate, useParams } from "react-router";
// import { AssistantCard } from "@/features/chat/components/assistant-card";
// import { useAssistants } from "@/features/chat/api/get-assistants";
// import { useCreateSession } from "@/features/chat/api/create-session";
// import { DisabledChatInput } from "@/features/chat/components/disabled-chat-input";

// const LoadingSpinner = () => (
//   <div className="flex flex-col items-center justify-center py-16">
//     {/* Simple spinner */}
//     <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-blue-600 mb-4"></div>

//     {/* Simple loading text */}
//     <p className="text-gray-600 font-medium">Loading assistants...</p>
//   </div>
// );

// export const NewChat = () => {
//   const navigate = useNavigate();
//   const { accountId } = useParams();
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");

//   const { data, isLoading } = useAssistants({
//     queryParams:
//       selectedCategory === "all" ? undefined : { category: selectedCategory },
//   });

//   const createSession = useCreateSession({
//     mutationConfig: {
//       onError: () => {},
//       onSuccess: (data) => {
//         navigate(`/a/${accountId}/s/${data.id}`);
//       },
//     },
//   });

//   const handleClick = (id: string) => {
//     createSession.mutate({
//       title: "New Session",
//       summary: "",
//       account_id: accountId!,
//       assistant_id: id,
//     });
//   };

//   const categories = [
//     { key: "all", label: "All", color: "teal" },
//     { key: "Prospecting", label: "Prospecting", color: "blue" },
//     { key: "Prep", label: "Prep", color: "purple" },
//     { key: "Performance", label: "Performance", color: "green" },
//   ];

//   const getCategoryStyles = (
//     category: (typeof categories)[0],
//     isSelected: boolean
//   ) => {
//     if (isSelected) {
//       return {
//         teal: "bg-teal-100 text-teal-800 border-teal-200",
//         blue: "bg-blue-100 text-blue-800 border-blue-200",
//         purple: "bg-purple-100 text-purple-800 border-purple-200",
//         green: "bg-green-100 text-green-800 border-green-200",
//       }[category.color];
//     }
//     return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:border-gray-300";
//   };

//   return (
//     <div className="flex flex-col h-full bg-gray-50">
//       {/* Main Content Area */}
//       <div className="flex-1 overflow-auto px-4 py-6">
//         <div className="max-w-4xl mx-auto text-center">
//           {/* Welcome Section */}
//           <div className="mb-8">
//             <h1 className="text-5xl font-mabry-pro-bold mb-4">
//               Hi! I'm Journey AI
//             </h1>
//             <p className="text-2xl font-mabry-pro-regular text-gray-600 max-w-3xl mx-auto">
//               Your AI-powered assistant for automating sales tasks, enriching
//               leads, and optimizing customer success.
//             </p>
//           </div>

//           {/* Assistant Selection Tabs */}
//           <div className="mb-8">
//             <div className="flex flex-wrap justify-center gap-3 mb-8">
//               {categories.map((category) => (
//                 <button
//                   key={category.key}
//                   onClick={() => setSelectedCategory(category.key)}
//                   className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 hover:scale-105 ${getCategoryStyles(
//                     category,
//                     selectedCategory === category.key
//                   )}`}
//                 >
//                   {category.label}
//                   {selectedCategory === category.key && (
//                     <span className="ml-2 inline-block w-2 h-2 bg-current rounded-full animate-pulse"></span>
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Loading State */}
//             {isLoading ? (
//               <LoadingSpinner />
//             ) : (
//               /* Assistant Cards Grid */
//               <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
//                 {data?.map((assistant) => (
//                   <AssistantCard
//                     id={assistant.id}
//                     title={assistant.name}
//                     description={assistant.description}
//                     key={assistant.id}
//                     handleClick={handleClick}
//                   />
//                 ))}
//                 {data?.length === 0 && (
//                   <div className="col-span-2 py-12 text-center">
//                     <div className="text-gray-400 text-lg mb-2">🤖</div>
//                     <p className="text-gray-600 font-medium">
//                       No assistants found in this category
//                     </p>
//                     <p className="text-gray-500 text-sm mt-1">
//                       Try selecting a different category
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Disabled Chat Input */}
//       <DisabledChatInput />
//     </div>
//   );
// };
