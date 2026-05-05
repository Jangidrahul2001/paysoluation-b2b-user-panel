// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   Download,
//   Check,
//   Copy as CopyIcon,
//   FileSpreadsheet,
//   FileText,
//   ChevronDown,
// } from "lucide-react";
// import { Button } from "./Button";
// import { Input } from "./Input";
// import { TableSkeleton } from "./table-skeleton";
// import { TableActions } from "./TableExportActions";
// import { cn } from "../../lib/utils";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "./table";

// export function AdminTable({
//   title,
//   subtitle,
//   columns = [],
//   data = [],
//   actions,
//   searchPlaceholder = "Search...",
//   onSearch,
//   filterButtons,
//   isLoading = false,
//   mergeHeader = false,
//   pageSize = 10,
//   totalRecords = 0,
//   onPaginationChange,
//   isScrollable = false,
//   showSearch = true,
//   showPagination = true,
//   showHeader = true,
//   emptyMessage = "No results found.",
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [pageIndex, setPageIndex] = useState(0);

//   // Column Visibility State
//   const initialVisible = columns.reduce((acc, col) => {
//     acc[col.accessor] = true;
//     return acc;
//   }, {});
//   const [visibleColumns, setVisibleColumns] = useState(initialVisible);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (onSearch) onSearch(searchTerm);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchTerm, onSearch]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const visibleColsList = columns.filter((col) => visibleColumns[col.accessor]);

//   const defaultFilterButtons = (
//     <TableActions
//       data={data}
//       columns={columns.map(c => ({ 
//         header: c.header, 
//         accessorKey: c.accessor,
//         id: c.accessor 
//       }))}
//       fileName={title || "Export"}
//       columnVisibility={visibleColumns}
//       setColumnVisibility={setVisibleColumns}
//     />
//   );

//   // Pagination calculations
//   const totalPages = Math.ceil(totalRecords / pageSize);
//   const startEntry = totalRecords === 0 ? 0 : pageIndex * pageSize + 1;
//   const endEntry = Math.min((pageIndex + 1) * pageSize, totalRecords);

//   const handlePageChange = (newPageIndex) => {
//     setPageIndex(newPageIndex);
//     if (onPaginationChange) {
//       onPaginationChange({ pageIndex: newPageIndex, pageSize });
//     }
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisible = 5;

//     if (totalPages <= maxVisible) {
//       for (let i = 0; i < totalPages; i++) pages.push(i);
//     } else {
//       if (pageIndex < 3) {
//         for (let i = 0; i < 4; i++) pages.push(i);
//         pages.push("...");
//         pages.push(totalPages - 1);
//       } else if (pageIndex >= totalPages - 3) {
//         pages.push(0);
//         pages.push("...");
//         for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
//       } else {
//         pages.push(0);
//         pages.push("...");
//         pages.push(pageIndex - 1);
//         pages.push(pageIndex);
//         pages.push(pageIndex + 1);
//         pages.push("...");
//         pages.push(totalPages - 1);
//       }
//     }
//     return pages;
//   };

//   return (
//     <div className={cn(
//       "flex flex-col gap-6",
//       isScrollable && "h-full"
//     )}>
//       {/* Page Header (separate card - only when NOT mergeHeader AND showHeader is true) */}
//       {!mergeHeader && showHeader && (title || actions) && (
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
//           <div>
//             {title && (
//               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
//                 {title}
//               </h1>
//             )}
//             {subtitle && (
//               <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
//                 {subtitle}
//               </p>
//             )}
//           </div>

//           {actions && (
//             <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
//               {actions}
//             </motion.div>
//           )}
//         </div>
//       )}

//       {/* Table Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className={cn(
//           "mx-1 rounded-[2rem] border border-indigo-200/60 bg-gradient-to-tr from-white via-white to-indigo-50/40 shadow-sm overflow-hidden relative z-10 transition-all",
//           isScrollable && "h-full"
//         )}
//       >
//         {/* Controls Bar - Title (if merged) + Filters + Search - only show if showHeader is true */}
//         {showHeader && (
//           <div className="p-4 md:px-6 md:py-3.5 border-b border-indigo-100/30 bg-indigo-50/20 flex flex-col items-stretch lg:flex-row gap-4 justify-between items-start lg:items-center rounded-t-[2rem]">
//             {/* Left side: Title (merged) + Filter Buttons */}
//             <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full flex-1">
//               {/* Merged Title */}
//               {mergeHeader && title && (
//                 <div className="shrink-0 mr-4">
//                   <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
//                     {title}
//                   </h1>
//                   {subtitle && (
//                     <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
//                       {subtitle}
//                     </p>
//                   )}
//                 </div>
//               )}

//               {/* Filter Buttons */}
//               <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar relative">
//                 {filterButtons || defaultFilterButtons}
//               </div>
//             </div>

//             {/* Search Input */}
//             {showSearch && (
//               <div className="w-full sm:w-72 shrink-0">
//                 <Input
//                   placeholder={searchPlaceholder}
//                   icon={Search}
//                   value={searchTerm}
//                   onChange={handleSearch}
//                   className="bg-white"
//                   containerClassName="space-y-0"
//                 />
//               </div>
//             )}
//           </div>
//         )}

//         {/* Table Content */}
//         <div className={cn(
//           "overflow-x-auto min-h-0",
//           isScrollable && "flex-1 overflow-y-auto no-scrollbar",
//           !showHeader && !showPagination && "rounded-[2rem]",
//           !showHeader && showPagination && "rounded-t-[2rem]"
//         )}>
//           {isLoading ? (
//             <TableSkeleton
//               rowCount={8}
//               columnCount={visibleColsList.length}
//               className="border-none rounded-none shadow-none bg-transparent"
//             />
//           ) : (
//             <Table className="border-separate border-spacing-0">
//               <TableHeader className="sticky top-0 z-20 bg-white">
//                 <TableRow className="border-y border-indigo-100/30 bg-indigo-50/20 hover:bg-indigo-50/20 border-t-0">
//                   {visibleColsList.map((col, idx) => (
//                     <TableHead
//                       key={idx}
//                       className={cn(
//                         "h-16 p-6 text-[11px] font-black text-slate-300 uppercase tracking-widest border-r border-indigo-100/30 last:border-r-0 whitespace-nowrap bg-transparent",
//                         col.center ? "text-center" : "text-left",
//                         col.className
//                       )}
//                     >
//                       {col.header}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>
//               <TableBody className="divide-y divide-indigo-100/30">
//                 {(data || []).map((row, rowIdx) => (
//                   <TableRow
//                     key={row.id || rowIdx}
//                     className="group"
//                   >
//                     {visibleColsList.map((col, colIdx) => (
//                       <TableCell
//                         key={colIdx}
//                         className={cn(
//                           "p-6 h-20 text-[13px] font-bold border-r border-indigo-100/30 last:border-r-0 text-slate-900 transition-colors bg-white group-hover:bg-slate-50/10",
//                           col.center ? "text-center" : "text-left",
//                           col.className,
//                           col.cellClassName
//                         )}
//                       >
//                         {col.render
//                           ? col.render(row, rowIdx)
//                           : row[col.accessor]}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//                 {data.length === 0 && (
//                   <TableRow>
//                     <TableCell
//                       colSpan={visibleColsList.length}
//                       className="p-16 text-center text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-none"
//                     >
//                       No Records Available
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </div>

//         {/* Pagination - only show if showPagination is true */}
//         {showPagination && (
//           <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-[2rem]">
//             <span className="text-xs font-semibold text-slate-400">
//               Showing {startEntry}-{endEntry} of {totalRecords} entries
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handlePageChange(pageIndex - 1)}
//                 disabled={pageIndex === 0}
//                 className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white shadow-sm hover:shadow-md"
//               >
//                 <ChevronLeft size={16} />
//               </button>

//               {getPageNumbers().map((page, idx) =>
//                 page === "..." ? (
//                   <span
//                     key={`ellipsis-${idx}`}
//                     className="w-9 h-9 flex items-center justify-center text-slate-400"
//                   >
//                     ...
//                   </span>
//                 ) : (
//                   <button
//                     key={page}
//                     onClick={() => handlePageChange(page)}
//                     className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-xs transition-colors ${pageIndex === page
//                         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700"
//                         : "border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 bg-white shadow-sm hover:shadow-md"
//                       } cursor-pointer`}
//                   >
//                     {page + 1}
//                   </button>
//                 ),
//               )}

//               <button
//                 onClick={() => handlePageChange(pageIndex + 1)}
//                 disabled={pageIndex >= totalPages - 1}
//                 className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white shadow-sm hover:shadow-md"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }
