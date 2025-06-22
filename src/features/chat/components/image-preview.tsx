import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type FilePreviewProps = {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
  aspectRatio?: "square" | "video" | "auto";
  showCloseButton?: boolean;
};

export const ImagePreview = ({
  src,
  alt,
  className,
  onClick,
  onClose,
  aspectRatio = "square",
  showCloseButton = true,
}: FilePreviewProps) => {
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted transition-all duration-200 cursor-pointer group",
        aspectRatioClasses[aspectRatio],
        className
      )}
      onClick={onClick}
      // style={aspectRatio === "auto" ? { width, height } : undefined}
    >
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-transform duration-200 rounded-xl"
        )}
        // style={aspectRatio === "auto" ? { width, height } : undefined}
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 rounded-xl" />

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        size="icon"
        // className="w-5 h-5 absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        className="w-5 h-5 absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1.5 transition-all duration-200"
        aria-label="Remove image"
      >
        <X size={14} />
      </Button>
    </div>
  );
};
