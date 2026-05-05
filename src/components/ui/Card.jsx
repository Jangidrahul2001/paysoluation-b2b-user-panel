import React from "react";
import { cn } from "../../lib/utils";

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-[2.5rem] border border-slate-100 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };
