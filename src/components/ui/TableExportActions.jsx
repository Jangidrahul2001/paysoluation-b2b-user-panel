"use client";

import React from "react";
import { Copy, FileSpreadsheet, FileText, ChevronDown, Check } from "lucide-react";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "./dropdown-menu";
import { exportToPDF, exportToExcel, copyToClipboard } from "../../lib/export-utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Reusable Table Action Buttons (Copy, Excel, PDF, Column Visibility)
 * @param {Array} data - The data to export/copy
 * @param {Array} columns - The table column definitions
 * @param {string} fileName - Name for the exported files
 * @param {Object} columnVisibility - Current column visibility state
 * @param {Function} setColumnVisibility - Function to update column visibility
 */
export function TableActions({
  data = [],
  columns = [],
  fileName = "table_data",
  columnVisibility = {},
  setColumnVisibility
}) {
  const handleExportPDF = () => {
    const exportCols = columns.filter(col => {
      const id = col.accessorKey || col.id;
      return id && id !== 'actions' && col.header && typeof col.header === 'string';
    });
    exportToPDF(data, exportCols, fileName);
  };

  const handleExportExcel = () => {
    const exportCols = columns.filter(col => {
      const id = col.accessorKey || col.id;
      return id && id !== 'actions' && col.header && typeof col.header === 'string';
    });

    const mappedData = data.map(row => {
      const newRow = {};
      exportCols.forEach(col => {
        const header = col.header;
        const key = col.accessorKey || col.id;
        newRow[header] = row[key];
      });
      return newRow;
    });

    exportToExcel(mappedData, fileName);
  };

  const handleCopy = () => {
    const exportCols = columns.filter(col => {
      const id = col.accessorKey || col.id;
      return id && id !== 'actions' && col.header && typeof col.header === 'string';
    });

    const mappedData = data.map(row => {
      const newRow = {};
      exportCols.forEach(col => {
        const header = col.header;
        const key = col.accessorKey || col.id;
        newRow[header] = row[key];
      });
      return newRow;
    });

    copyToClipboard(mappedData);
  };

  const ActionButton = ({ onClick, icon: Icon, children, className }) => (
    <motion.div whileTap={{ scale: 0.96 }}>
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        className={`bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/60 h-10 px-6 rounded-full text-sm font-semibold transition-all shadow-sm flex items-center gap-2.5 ${className}`}
      >
        <Icon className="h-4 w-4 text-slate-500" /> 
        <span>{children}</span>
      </Button>
    </motion.div>
  );

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
      <ActionButton onClick={handleCopy} icon={Copy}>Copy</ActionButton>
      <ActionButton onClick={handleExportExcel} icon={FileSpreadsheet}>Excel</ActionButton>
      <ActionButton onClick={handleExportPDF} icon={FileText}>PDF</ActionButton>

      {setColumnVisibility && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-none h-10 px-6 rounded-full text-sm font-semibold transition-all shadow-md flex items-center gap-2.5 group"
              >
                <span>Column Visibility</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={8}
            className="w-[220px] bg-white/98 backdrop-blur-xl border-slate-200/50 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[20px] p-2 overflow-hidden border"
          >
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-3 py-2 ml-0.5">
              Customize Display
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 mx-1 mb-1" />
            
            <div className="max-h-[250px] overflow-y-auto px-1 custom-scrollbar">
              {columns.map((col, index) => {
                const colId = col.accessorKey || col.id;
                if (!colId || colId === 'actions' || colId === 'select') return null;

                const isVisible = columnVisibility[colId] !== false;
                const label = typeof col.header === 'string' ? col.header : colId;

                return (
                  <motion.div
                    key={colId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    <div
                      role="menuitemcheckbox"
                      aria-checked={isVisible}
                      onClick={() => {
                        setColumnVisibility(prev => ({
                          ...prev,
                          [colId]: !isVisible
                        }))
                      }}
                      className={`
                        group flex items-center justify-between gap-2 px-3 py-2 mb-0.5 rounded-xl cursor-pointer transition-all duration-200
                        ${isVisible ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-700'}
                      `}
                    >
                      <span className="text-[13px] font-medium capitalize truncate">
                        {label}
                      </span>
                      <div className={`
                        w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all duration-300
                        ${isVisible ? 'bg-indigo-600 scale-100' : 'bg-slate-100 scale-90 opacity-0 group-hover:opacity-40'}
                      `}>
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
