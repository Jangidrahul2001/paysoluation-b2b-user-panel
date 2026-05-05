import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import StatusBadge from "./StatusBadge";
import { apiEndpoints } from "../../api/apiEndpoints";
import { useFetch } from "../../hooks/useFetch";
import { handleValidationError } from "../../utils/helperFunction";
import { toast } from "sonner";

const modernDropdown = {
  transition: {
    type: "spring",
    stiffness: 450,
    damping: 38,
    mass: 0.8
  }
};

export function DownLineUserSelect({
  removeOwn = false,
  value,
  onChange,
  placeholder = "Select user",
  label,
  disabled,
  className,
  searchable = true,
  theme = "light",
}) {

  const [data, setData] = useState(null);
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const { refetch: fetchDownLine } = useFetch(
    `${apiEndpoints.fetchDownLineUser}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          if (removeOwn) {
            setData(data?.data?.children);
          }
          else {
            setData(data?.data);
          }
        }
      },
      onError: (error) => {
        console.log("error in fetching services data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOnTrigger = triggerRef.current && triggerRef.current.contains(event.target);
      const isClickOnDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);

      if (!isClickOnTrigger && !isClickOnDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setSearchQuery("");
    setIsOpen(!isOpen);
  };

  const toggleExpanded = (userId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const flattenUsers = (user, depth = 0) => {
    const users = [{ ...user, depth }];
    if (expandedNodes.has(user._id) && user.children?.length > 0) {
      user.children.forEach(child => {
        users.push(...flattenUsers(child, depth + 1));
      });
    }
    return users;
  };

  const allUsers = data ?
    (Array.isArray(data) ?
      data.flatMap(user => flattenUsers(user)) :
      flattenUsers(data)
    ) : [];

  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = allUsers.find(user => user._id === value);

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-4 h-11 text-sm rounded-xl transition-all duration-300 outline-none active:scale-[0.99] border",
          isDark
            ? isOpen
              ? "border-blue-500 bg-slate-900 ring-4 ring-blue-500/10 text-white"
              : "bg-slate-800/40 border-white/10 text-slate-100 hover:bg-slate-700/60"
            : isOpen
              ? "border-blue-600 bg-white ring-4 ring-blue-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedUser ? (
            <>
              <span className={cn(
                "truncate font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {selectedUser.fullName} ({selectedUser.userName})
              </span>
              {selectedUser.isSelf && (
                <StatusBadge status="SELF" className="text-[8px] px-1.5 py-0.5" />
              )}
            </>
          ) : value === "" ? (
            <span className={cn(
              "truncate font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}>
              Select All Users
            </span>
          ) : (
            <span className={cn(
              "truncate font-medium",
              isDark ? "text-slate-400/80" : "text-slate-400"
            )}>
              {placeholder}
            </span>
          )}
        </div>
        <ArrowLeft
          size={16}
          className={cn(
            "transition-all duration-300 shrink-0",
            isOpen ? "rotate-180" : "rotate-0",
            isDark
              ? isOpen ? "text-blue-400" : "text-slate-500"
              : isOpen ? "text-slate-900" : "text-slate-400"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={modernDropdown.transition}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              marginTop: "8px",
              zIndex: 9999,
              transformOrigin: "top center",
            }}
            className={cn(
              "border rounded-2xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto ring-1",
              isDark
                ? "bg-slate-900 border-white/10 ring-white/5"
                : "bg-white border-slate-200/60 ring-black/5"
            )}
          >
            {searchable && (
              <div className={cn(
                "px-3 py-2.5 border-b sticky top-0 backdrop-blur-md z-10",
                isDark ? "bg-slate-900/80 border-white/10" : "bg-white/80 border-slate-100"
              )}>
                <div className="relative">
                  <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5",
                    isDark ? "text-slate-500" : "text-slate-400"
                  )} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className={cn(
                      "w-full h-8.5 pl-9 pr-3 text-xs border rounded-lg focus:outline-none transition-all placeholder:text-slate-400 font-medium",
                      isDark
                        ? "bg-slate-800 border-white/10 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        : "bg-slate-100/50 border-slate-200 focus:border-slate-900/20 focus:ring-4 focus:ring-slate-950/5"
                    )}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus={!(("ontouchstart" in window) || (navigator.maxTouchPoints > 0))}
                  />
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto py-1.5 scrollbar-none">
              {/* Select All Users option */}
              <motion.div
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-[12px] cursor-pointer transition-all group mx-1.5 rounded-xl mb-0.5",
                  value === ""
                    ? isDark ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20" : "bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/10"
                    : isDark
                      ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold truncate text-sm">
                      Select All Users
                    </span>
                  </div>
                </div>
              </motion.div>

              {filteredUsers.length === 0 ? (
                <div className="px-4 py-6 text-xs text-slate-400 text-center font-medium">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = value === user._id;
                  const hasChildren = user.children?.length > 0;
                  const isExpanded = expandedNodes.has(user._id);

                  return (
                    <motion.div
                      key={user._id}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-[12px] cursor-pointer transition-all group mx-1.5 rounded-xl mb-0.5 last:mb-0",
                        isSelected
                          ? isDark ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20" : "bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/10"
                          : isDark
                            ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                      style={{ paddingLeft: `${16 + user.depth * 20}px` }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        onClick={() => {
                          onChange(user._id);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold truncate text-sm">
                            {user.fullName}
                          </span>
                          <span className={cn(
                            "text-xs truncate",
                            isSelected
                              ? "text-white/80"
                              : isDark ? "text-slate-500" : "text-slate-400"
                          )}>
                            {user.userName}
                          </span>
                        </div>

                        {user.isSelf && (
                          <div className="flex items-center">
                            <StatusBadge status="SELF" className="text-[8px] px-1.5 py-0.5" />
                          </div>
                        )}
                      </div>

                      {hasChildren && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(user._id);
                          }}
                          className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors shrink-0 flex items-center"
                        >
                          <ChevronDown
                            size={14}
                            className={cn(
                              "transition-transform",
                              isExpanded ? "rotate-180" : "rotate-0"
                            )}
                          />
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
