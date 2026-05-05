import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageLayout } from "../components/layout/PageLayout";
import { DataTable } from "../components/ui/DataTable";
import { TableActions } from "../components/ui/TableExportActions";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import {
  ShoppingBag,
  Cpu,
  Eye,
  Search,
  TrendingUp,
  Package,
  Clock,
  Tag
} from "lucide-react";
import {
  formatDate,
  handleValidationError
} from "../utils/helperFunction";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import StatusBadge from "../components/ui/StatusBadge";
import { ActionButtons } from "../components/ui/ActionButton";

// Premium Status Badge


const ProductCard = ({ product, onOrder }) => {
  const Icon = ShoppingBag;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white/90 backdrop-blur-xl rounded-[2.25rem] border border-slate-200/60 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col group relative overflow-hidden h-full w-full"
    >
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Discount Badge */}
      <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-lg shadow-rose-500/20 z-20 flex items-center gap-1">
        <Tag size={10} className="fill-white/20" />
        {product?.discountType === "flat" && "₹"}
        {product.discount}
        {product?.discountType === "percentage" && "%"} OFF
      </div>

      <div className="w-full aspect-[4/3.5] relative overflow-hidden bg-slate-50/30 m-2 rounded-[1.75rem] group-hover:bg-white transition-colors duration-500">
        {product.productImageUrl ? (
          <img
            src={`${import.meta.env.VITE_API_URL}${product?.productImageUrl}`}
            alt={product.name}
            className="w-full h-full object-contain p-4 relative transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-2xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon
              size={48}
              className="text-slate-200 group-hover:text-indigo-400 transition-all duration-500 group-hover:scale-110"
            />
          </div>
        )}
      </div>

      <div className="px-6 pt-3 pb-6 flex flex-col items-center flex-grow relative z-10">
        <h3 className="text-[15px] font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-center leading-tight h-10 flex items-center">
          {product.name}
        </h3>

        <div className="flex items-center gap-3 mb-5 mt-1">
          <span className="text-lg font-black text-indigo-600 tracking-tighter">
            ₹{Number(product?.priceAfterDiscount).toLocaleString("en-IN")}
          </span>
          <span className="text-slate-400 line-through text-[11px] font-bold">
            ₹{Number(product?.price).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mt-auto w-full">
          <Button
            onClick={() => onOrder(product)}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 active:scale-95 transition-all duration-300 border-none flex items-center justify-center gap-2 group/btn"
          >
            Order Now
            <TrendingUp size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ShoppingStore() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const handleOrderNow = (product) => {
    navigate(`/store/product`, { state: product });
  };

  useFetch(
    apiEndpoints.fetchProducts,
    {
      onSuccess: (data) => {
        if (data.success) {
          setProducts(data?.data);
        }
        setIsLoadingProducts(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch products");
        setIsLoadingProducts(false);
      },
    },
    true,
  );

  const { refetch: fetchMyOrders } = useFetch(
    `${apiEndpoints.fetchMyOrders}?page=${pageIndex}&limit=${pageSize}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setOrders(data?.data || []);
          setTotalRecords(data?.pagination.total);
        }
        setIsLoadingOrders(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch orders");
        setIsLoadingOrders(false);
      },
    },
    true,
  );

  useEffect(() => {
    fetchMyOrders();
  }, [pageIndex, pageSize]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const orderColumns = [
    {
      header: "SR.NO.",
      accessorKey: "index",
      cell: ({ row, index }) => (
        <span className="text-[12px] font-bold text-slate-300"> {(pageIndex - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      header: "PRODUCT",
      accessorKey: "productName",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Package size={14} className="text-indigo-600" />
          </div>
          <span className="text-[12px] font-black text-slate-800 tracking-tight">{row.original.productName}</span>
        </div>
      ),
    },
    {
      header: "QTY",
      accessorKey: "quantity",
      cell: ({ row }) => (
        <span className="text-[11px] font-black text-slate-700">{row.original.quantity}</span>
      ),
    },
    {
      header: "UNIT PRICE",
      accessorKey: "unitPrice",
      cell: ({ row }) => (
        <span className="text-[12px] font-bold text-slate-500">₹{Number(row.original.unitPrice).toLocaleString("en-IN")}</span>
      ),
    },
    {
      header: "GRAND TOTAL",
      accessorKey: "grandTotal",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-slate-900 tracking-tighter">₹{Number(row.original.grandTotal).toLocaleString("en-IN")}</span>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-0.5">Incl. GST & Shipping</span>
        </div>
      ),
    },
    {
      header: "STATUS",
      accessorKey: "orderStatus",
      cell: ({ row }) => <StatusBadge status={row.original.orderStatus} />,
    },
    {
      header: "DATE",
      accessorKey: "createdAt",
      cell: ({ row }) => (
          <span className="text-[11px] font-black whitespace-nowrap text-slate-700 uppercase tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>

      ),
    },
    {
      header: "ACTION",
      accessorKey: "action",
      cell: ({ row }) => (
        <ActionButtons
        onView={() => navigate(`/store/view-order`, { state: row.original })}
        viewTitle="View Order"             
            />
       
      ),
    },
  ];

  return (
    <PageLayout
      title="Shopping Store"
      subtitle="Examine premium hardware and essential services for your network"
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="flex flex-col gap-10">

        {/* Animated Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onOrder={handleOrderNow}
            />
          ))}

          {/* Coming Soon Teaser */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="rounded-[2.25rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 min-h-[350px]"
          >
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-400 shadow-inner">
              <Cpu size={28} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-black text-slate-800 uppercase tracking-widest leading-none">Expansion Protocol</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">New Inventory Synchronizing...</p>
            </div>
          </motion.div>
        </div>

        {/* Order History Table Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-1">
            <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Order Tracking History</h2>
          </div>

          <DataTable
            searchPlaceholder="Filter orders..."
            fileName="Order_History"
            searchChange={(e) => setSearch(e.target.value)}
            columns={orderColumns}
            data={orders}
            isLoading={isLoadingOrders}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPaginationChange={({ pageIndex, pageSize }) => {
              handlePageChange(pageIndex + 1, pageSize);
              setIsLoadingOrders(true);
            }}
            searchValue={search}
          />
        </div>
      </div>
    </PageLayout>
  );
}
