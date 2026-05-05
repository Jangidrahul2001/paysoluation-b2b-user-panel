import React from "react";
import { Select } from "../ui/Select";

const  DashboardWalletFilter = ({ activeValue, onChange }) => {
  const options = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "7 Days", value: "last7days" },
    { label: "This Month", value: "thismonth" },
  ];

  return (
    <div className="w-[120px] xs:w-[140px]">
      <Select
        searchable={false}
        theme="dark" // Pass the theme prop
        options={options}
        value={activeValue}
        onChange={onChange}
        className="h-10 bg-slate-800/40 border-white/10 text-white hover:bg-slate-700/60 transition-all text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-2xl"
      />
    </div>
  );
};

export default DashboardWalletFilter;
