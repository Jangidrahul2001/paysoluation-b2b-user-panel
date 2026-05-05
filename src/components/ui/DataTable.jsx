"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./Button";
import { tableConfig } from "../../config/tables.config.js";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { TableSkeleton } from "./table-skeleton";
import { TableActions } from "./TableExportActions.jsx";
import { Select } from "./Select.jsx";

export function DataTable({
  showheaderAction = true,
  showSearch = true,
  columns,
  data,
  columnVisibility,
  setColumnVisibility,
  extraFilter,
  isLoading,
  searchChange,
  loadingMessage = "Loading Data...",
  onPaginationChange,
  totalRecords,
  pageSize = 10,
  searchPlaceholder = "Search...",
  searchValue,
  hidePagination = false,
  noPadding = false,
  fullHeight = false,
  fileName = "REC"
}) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState({});

  const visibilityState =
    columnVisibility !== undefined
      ? columnVisibility
      : internalColumnVisibility;
  const onVisibilityChange =
    setColumnVisibility !== undefined
      ? setColumnVisibility
      : setInternalColumnVisibility;

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRecords / pageSize),
    manualPagination: true,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: onVisibilityChange,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility: visibilityState,
      pagination,
    },
  });

  React.useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange({
        pageIndex: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      });
    }
  }, [pagination.pageIndex, pagination.pageSize]);



  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState(searchValue || '');

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchChange) {
        searchChange({ target: { value: debouncedSearchValue } });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [debouncedSearchValue, searchChange]);


  return (

    <>
      <div className={`${(showSearch || showheaderAction) ? "border border-indigo-200/60 bg-gradient-to-tr from-white via-white to-indigo-50/40 mx-2 rounded-[2rem]  shadow-sm overflow-hidden relative z-10 transition-all" : ""}`}>
        {
          (showSearch || showheaderAction) &&
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 p-5 border-b border-indigo-100/30 bg-indigo-50/20 relative z-20">
            <div className="flex flex-wrap items-center gap-3">
              {showheaderAction &&
                <TableActions
                  data={data}
                  columns={columns}
                  fileName={fileName}
                  columnVisibility={columnVisibility}
                  setColumnVisibility={setColumnVisibility}
                />}

              {/* Unique Dropdown Filter for Transaction Type */}
              {extraFilter && extraFilter.length > 0 &&
                extraFilter.map((filterOptions, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 flex-1 sm:flex-none sm:w-[150px] min-w-[130px]"
                  >
                    <div className="w-full relative group">
                      <Select
                        options={filterOptions.options}
                        value={filterOptions.value}
                        onChange={filterOptions.onChange}
                        placeholder={filterOptions.placeholder}
                        className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
                      />
                    </div>
                  </div>
                ))
              }



            </div>

            {showSearch && <div className="flex items-center justify-center lg:justify-end gap-4 w-full lg:w-auto px-1">
              <div className="w-full max-w-[400px] lg:w-auto relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors z-10" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={debouncedSearchValue}
                  onChange={(e) => setDebouncedSearchValue(e.target.value)}
                  className="w-full h-10 bg-white/70 border border-indigo-100 text-slate-800 text-[13px] font-bold rounded-full focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none pl-11 pr-5 placeholder:text-slate-300"
                />
              </div>
            </div>}
          </div>
        }


        <div className={cn(noPadding ? "p-0" : "px-2 py-3", fullHeight && "h-full flex flex-col")}>
          <div
            className={cn(
              "rounded-[1.5rem] border border-indigo-200/50 bg-gradient-to-tr from-white to-indigo-50/40 overflow-x-auto relative transition-all duration-500 flex flex-col",
              isLoading && "min-h-[350px]",
              fullHeight && "flex-1"
            )}
          >
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton rowCount={5} columnCount={columns.length} />
              </div>
            ) : (
              <Table className={cn(fullHeight && "h-full")}>
                <TableHeader className={tableConfig.styles.header}>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200/70">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className={cn("border-r border-slate-200/50 last:border-none relative text-center whitespace-nowrap", header.column.columnDef.headerClassName)}
                          // className={cn(
                          //   "border-r border-slate-200/50 last:border-none relative px-6 whitespace-nowrap text-center",
                          //   header.column.columnDef.center && "text-center"
                          // )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className={cn(fullHeight && "h-full")}>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-slate-50/50 transition-colors duration-150 border-b border-slate-200/60 last:border-none"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              tableConfig.styles.cell,
                              "border-r border-slate-100 last:border-none relative px-6",
                              cell.column.columnDef.center && "text-center"
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, {
                              ...cell.getContext(),
                              index: index,
                            })}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className={cn(fullHeight && "h-full items-center justify-center")}>
                      <TableCell
                        colSpan={columns.length}
                        className={cn(
                          "text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest",
                          fullHeight ? "h-full align-middle py-32" : "h-24"
                        )}
                      >
                        No Results Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {!hidePagination && totalRecords !== 0 && (
            <div className="flex items-center justify-between py-4 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-transparent hover:text-slate-900 text-slate-400"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      table.getPageCount() > 7 &&
                      page > 2 &&
                      page < table.getPageCount() - 1 &&
                      Math.abs(page - (table.getState().pagination.pageIndex + 1)) > 1
                    ) {
                      if (page === 3 || page === table.getPageCount() - 2) {
                        return (
                          <span key={page} className="text-slate-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(page - 1)}
                        className={`h-8 w-8 p-0 rounded-lg text-xs font-medium border-slate-200 ${table.getState().pagination.pageIndex + 1 === page
                          ? "bg-slate-100 text-slate-900 border-none font-bold"
                          : "bg-white text-slate-500 hover:bg-slate-50"
                          }`}
                      >
                        {page}
                      </Button>
                    );
                  },
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-transparent hover:text-slate-900 text-slate-400"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
