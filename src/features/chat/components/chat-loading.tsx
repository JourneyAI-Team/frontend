import { LoadingDots } from "./loading";

export const ChatLoading = () => {
  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-col space-y-1 max-w-[80%]">
        <div className="px-4 py-3">
          <LoadingDots className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};
