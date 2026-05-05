import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Minus,
  LayoutGrid,
  Database,
  Info,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SidebarPageTransition } from "../components/layout/sidebar-PageTransition";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import { handleValidationError } from "../utils/helperFunction";
import { apiEndpoints } from "../api/apiEndpoints";
import { useFetch } from "../hooks/useFetch";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);

  const { refetch: fetchProductById } = useFetch(
    `${apiEndpoints.fetchProductById}/${state?._id}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setProduct(data?.data);
          // Add small delay to prevent flickering
          setTimeout(() => setIsLoading(false), 300);
        }
      },
      onError: (error) => {
        console.log("error in fetching Product details", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    if (state?._id) {
      fetchProductById();
    }
  }, [state?._id]);

  const handlePlaceOrder = () => {
    navigate("/store/checkout", {
      state: {
        product,
        quantity,
      },
    });
  };

  return (
    <div className="min-h-screen py-4 md:py-6 flex flex-col space-y-4 w-full px-4 md:px-8 bg-transparent lg:overflow-hidden lg:h-[95vh]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-4 w-full"
          >
            {/* Header Skeleton */}
            <div className="shrink-0">
              <Skeleton className="h-10 w-20 rounded-xl" />
            </div>

            {/* Main Content Skeleton */}
            <div className="flex flex-col gap-6 lg:h-auto lg:max-h-[60%]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-4 flex flex-col h-[300px] md:h-[400px] lg:h-full min-h-[300px]">
                  <Skeleton className="flex-grow rounded-[2rem]" />
                </div>
                <div className="lg:col-span-8 flex flex-col h-full lg:max-h-full min-h-[400px]">
                  <div className="flex-grow bg-white rounded-[2rem] border border-slate-50 p-6 md:p-8 lg:p-10 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-3/4 rounded" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-32 rounded" />
                          <Skeleton className="h-6 w-16 rounded-lg" />
                        </div>
                      </div>
                      <div className="space-y-3 pt-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full rounded" />
                          <Skeleton className="h-4 w-5/6 rounded" />
                          <Skeleton className="h-4 w-4/5 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 mt-6 pt-4 border-t border-slate-50">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                        <Skeleton className="h-12 w-44 rounded-2xl" />
                        <Skeleton className="h-12 w-full sm:w-64 rounded-[2rem]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col space-y-4 w-full"
          >
            {/* Header */}
            <div className="shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest transition-all bg-white px-4 py-2 rounded-xl border border-slate-50 shadow-sm"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-6 lg:h-auto lg:max-h-[60%]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-4 flex flex-col h-[300px] md:h-[400px] lg:h-full min-h-[300px]">
                  <div className="relative flex-grow overflow-hidden rounded-[2rem] bg-white border border-slate-50 shadow-xl shadow-slate-200/20 p-6 flex items-center justify-center">
                    <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-indigo-50/80 backdrop-blur-sm text-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100/50 z-20">
                      <LayoutGrid size={11} />
                      {product.category}
                    </div>
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={`${import.meta.env.VITE_API_URL}${product?.productImageUrl}`}
                      alt={product.name}
                      className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col h-full lg:max-h-full min-h-[400px]">
                  <div className="flex-grow bg-white rounded-[2rem] border border-slate-50 p-6 md:p-8 lg:p-10 shadow-xl shadow-slate-200/20 flex flex-col justify-between overflow-hidden">
                    <div className="space-y-4 md:space-y-1 overflow-y-auto no-scrollbar pr-1">
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600">
                          Verified Item
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Database size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {product.stock} Units Stocked
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 shrink-0">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight leading-normal">
                          {product.name}
                        </h1>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl lg:text-4xl font-black text-indigo-600">
                            ₹{product.priceAfterDiscount}
                          </div>
                          <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                            {product?.discountType === "flat" && "₹"}
                            {product.discount}
                            {product?.discountType === "percentage" && "%"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Info size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            Description
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6 mt-6 pt-4 border-t border-slate-50 shrink-0">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 min-w-[180px]">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                            Qty
                          </span>
                          <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 py-1 px-2">
                            <button
                              onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                              }
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-xs font-black text-slate-800">
                              {quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={handlePlaceOrder}
                            className="w-full sm:w-64 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.15em] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
                          >
                            Confirm transaction
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
