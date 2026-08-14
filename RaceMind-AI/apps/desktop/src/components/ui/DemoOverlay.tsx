import React from "react";
import { Info } from "lucide-react";

export function DemoOverlay({
  children,
  message = "Live data unavailable (Demo Mode)",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div className="group relative h-full w-full overflow-hidden">
      {/* Dimmed content */}
      <div className="h-full w-full opacity-40 grayscale transition-all duration-300 group-hover:opacity-20 group-hover:blur-[2px]">
        {children}
      </div>
      
      {/* Overlay banner */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex items-center gap-2 rounded-full border border-electric/30 bg-carbon/80 px-4 py-2 text-xs font-medium text-electric shadow-lg backdrop-blur-md">
          <Info className="h-4 w-4" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
