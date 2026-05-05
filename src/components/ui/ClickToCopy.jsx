import React from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { cn } from "../../lib/utils";

const ClickToCopy = ({ text, className, children }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        description: text,
      });
    });
  };

  return (
    <div
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all group active:scale-95",
        className
      )}
      title="Click to copy"
    >
      {children || <span className="truncate max-w-[120px]">{text}</span>}
      {/* <Copy size={10} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" /> */}
    </div>
  );
};

export default ClickToCopy;
