import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-15 h-15",
    lg: "w-20 h-20"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div 
        className={cn(
          "absolute rounded-full border-t-2 border-r-2 border-t-purple-600 border-r-transparent animate-spin",
          sizeClasses[size]
        )}
        style={{
          animation: "spin 0.8s linear infinite"
        }}
      />
    </div>
  );
}