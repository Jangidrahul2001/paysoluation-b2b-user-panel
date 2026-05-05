export const tableConfig = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  },
  sorting: {
    defaultOrder: "desc",
  },
  search: {
    debounceTime: 300, // ms
    placeholder: "Search...",
  },
  styles: {
    // Shared classes for table components to maintain consistency
    table: "w-full caption-bottom text-sm",
    header: "[&_tr]:border-b",
    body: "[&_tr:last-child]:border-0",
    row: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
    headContainer: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
    cell: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
    caption: "mt-4 text-sm text-muted-foreground",
  }
}
