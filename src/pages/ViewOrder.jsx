import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  Calendar,
  ExternalLink,
  Printer,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SidebarPageTransition } from "../components/layout/sidebar-PageTransition";
import { toast } from "sonner";
import { apiEndpoints } from "../api/apiEndpoints";
import { useFetch } from "../hooks/useFetch";
import { Skeleton } from "../components/ui/skeleton";
import StatusBadge from "../components/ui/StatusBadge";

// Mock Order Data (In a real app, this would be fetched based on ID)
const mockOrderDetails = {
  id: "#ORD-8829-X1",
  date: "15 Feb 2024, 10:30 AM",
  status: "In Transit",
  statusStep: 2, // 0: Processing, 1: Shipped, 2: In Transit, 3: Delivered
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
  },
  shippingAddress: {
    label: "Home",
    street: "H.No 123, Street 5",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    country: "India",
  },
  payment: {
    method: "Wallet",
    status: "Paid",
    transactionId: "TXN_772819002",
    date: "15 Feb 2024",
  },
  items: [
    {
      id: 1,
      name: "Mantra L1 Biometric Scanner",
      quantity: 1,
      price: 2990.0,
      image: "fingerprint",
    },
    {
      id: 2,
      name: "USB-C OTG Adapter",
      quantity: 1,
      price: 150.0,
      image: "cable",
    },
  ],
  pricing: {
    subtotal: 3140.0,
    shipping: 50.0,
    discount: 10.0,
    tax: 0.0,
    total: 3180.0,
  },
  timeline: [
    { status: "Order Placed", date: "15 Feb, 10:30 AM", completed: true },
    { status: "Processing", date: "15 Feb, 02:20 PM", completed: true },
    { status: "Shipped", date: "16 Feb, 09:15 AM", completed: true },
    {
      status: "In Transit",
      date: "17 Feb, 08:30 AM",
      completed: false,
      active: true,
    },
    { status: "Delivered", date: "Expected 19 Feb", completed: false },
  ],
};



export default function ViewOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = location.state?._id;

  useFetch(
    `${apiEndpoints.fetchMyOrderByID}/${orderId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data.data);
          setOrderDetails(data?.data);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch order");
        setIsLoading(false);
      },
    },
    !!orderId,
  );

  if (isLoading) {
    return (
      <SidebarPageTransition>
        <div className="min-h-screen py-4 md:py-8 space-y-8 max-w-7xl mx-auto px-4">
          <Skeleton className="h-32 w-full rounded-[2rem]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-[2rem]" />
              <Skeleton className="h-96 w-full rounded-[2rem]" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-80 w-full rounded-[2rem]" />
              <Skeleton className="h-64 w-full rounded-[2rem]" />
            </div>
          </div>
        </div>
      </SidebarPageTransition>
    );
  }

  if (!orderDetails) {
    return <div>Order not found</div>;
  }

  return (
    // <SidebarPageTransition>
    <div className="min-h-screen py-4 md:py-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Store
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
              Order Details
              <span className="text-slate-400 font-medium text-lg lowercase">
                #{"8829"}
              </span>
            </h1>
            <StatusBadge status={mockOrderDetails.status} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl font-bold text-xs gap-2 border-slate-200"
          >
            <Printer size={16} /> Print Invoice
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs gap-2 shadow-lg shadow-indigo-600/20">
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Progress */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              Tracking Timeline
            </h3>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 hidden md:block">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "66%" }}
                  className="h-full bg-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {mockOrderDetails.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center gap-4 relative"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 
                      ${step.completed
                          ? "bg-indigo-600 text-white"
                          : step.active
                            ? "bg-indigo-50 text-indigo-600 border-2 border-indigo-600 border-dashed animate-pulse"
                            : "bg-slate-50 text-slate-300"
                        }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p
                        className={`text-xs font-black uppercase tracking-tight ${step.active || step.completed ? "text-slate-800" : "text-slate-400"}`}
                      >
                        {step.status}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" />
                Items Ordered
              </h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                Product
              </span>
            </div>

            <div className="p-2">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-center">Price</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[{ id: 1 }].map((item) => (
                    <tr key={item?.id} className="group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <Package size={24} className="text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {orderDetails.productName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">
                        x{orderDetails.quantity}
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">
                        ₹{orderDetails.unitPrice}
                      </td>
                      <td className="px-6 py-6 text-right text-sm font-bold text-indigo-600">
                        ₹{orderDetails.unitPrice * orderDetails.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50/50 p-8 flex justify-end">
              <div className="w-full max-w-[280px] space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 uppercase">Subtotal</span>
                  <span className="text-slate-700">
                    ₹{orderDetails?.subTotal}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 uppercase">Shipping</span>
                  <span className="text-slate-700">
                    ₹{orderDetails?.shippingCharge}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 uppercase">GST</span>
                  <span>₹{orderDetails.gst}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-800 uppercase">
                    Total Amount
                  </span>
                  <span className="text-lg font-black text-indigo-600">
                    ₹{orderDetails.grandTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-8">
          {/* Customer & Shipping */}
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-600" />
                  Shipping Address
                </h4>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-sm font-black text-slate-800 mb-1">
                    {orderDetails.shippingAddress.name}
                  </p>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    {orderDetails.shippingAddress.address}
                    <br />
                    {orderDetails.shippingAddress.city},{" "}
                    {orderDetails.shippingAddress.state}
                    <br />
                    {orderDetails.shippingAddress.pincode}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={14} className="text-indigo-600" />
                  Payment Info
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Method
                    </span>
                    <span className="text-xs font-black text-slate-700 uppercase">
                      {mockOrderDetails.payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Status
                    </span>
                    <span className="text-xs font-black text-emerald-600 uppercase italic">
                      SUCCESS
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      TXN ID
                    </span>
                    <span className="text-[10px] font-black text-slate-700 font-mono">
                      {mockOrderDetails.payment.transactionId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-6 text-white text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                Estimated Delivery
              </p>
              <p className="text-sm font-bold">within 7 to 10 days</p>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all" />

            <AlertCircle size={32} className="mb-6 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-white/70 font-medium mb-6 leading-relaxed">
              If you have any issues with your order, please contact our support
              team.
            </p>
            <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 font-black text-xs uppercase tracking-widest py-6 rounded-xl">
              Get Support
            </Button>
          </div>
        </div>
      </div>
    </div>
    // </SidebarPageTransition>
  );
}

// Icons
function ShoppingBag(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
