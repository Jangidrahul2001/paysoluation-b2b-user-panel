import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Truck,
  MapPin,
  ShoppingBag,
  Info,
  ChevronRight,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarPageTransition } from "../components/layout/sidebar-PageTransition";
import { toast } from "sonner";
import { apiEndpoints } from "../api/apiEndpoints";
import { usePost } from "../hooks/usePost";
import { emailRegex, formatEmailInput, handleValidationError, nameWithSpaceRegex, phoneRegex, pincodeRegex } from "../utils/helperFunction";
import { fetchWallet } from "../store/slices/walletSlice";
import { useDispatch } from "react-redux";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch()

  const { product, quantity } = location.state;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    

   

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
     else if(!nameWithSpaceRegex.test(formData.name?.trim())){
            newErrors.name = "Enter a valid full name";
          }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!pincodeRegex.test(formData.pincode)) {
      newErrors.pincode = "Invalid PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReviewOrder = () => {
    if (validateForm()) {
      setStep(2);
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  const { post: createOrder } = usePost(apiEndpoints.createOrder, {
    onSuccess: (res) => {
      toast.success(res.message || "Order Created successfully");
      dispatch(fetchWallet());
      navigate(`/store`);
    },
    onError: (error) => {
      console.error("Failed to create Order account:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleProcessOrder = () => {
    if (validateForm()) {
      createOrder({
        product: { productId: product._id, quantity },
        shippingAddress: formData,
        shippingCharge: 100,
        gst: 18,
      });
    } else {
      toast.error("Please fill all required fields correctly");
      return;
    }
  };

  const totalAmount = (product?.priceAfterDiscount || 0) * (quantity || 1);
  const taxAmount = totalAmount * 0.18;
  const shippingFee = 100;
  const grandTotal = totalAmount + taxAmount + shippingFee;

  return (
    <>
      <div className="min-h-screen py-6 md:py-10 px-4 md:px-12 lg:px-16 space-y-10 w-full bg-transparent overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="space-y-1.5">
            <button
              onClick={() => navigate(-1, { state: product })}
              className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest transition-all group px-4 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight uppercase">
              Secure Checkout
            </h1>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm overflow-x-auto no-scrollbar">
            {[
              { id: 1, label: "Address", icon: MapPin },
              { id: 2, label: "Review", icon: ShieldCheck },
            ].map((s, idx) => (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${step === s.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400"}`}
                >
                  <s.icon size={15} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
                {idx < 1 && (
                  <ChevronRight size={14} className="text-slate-200 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Layout Content */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-50 p-6 md:p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Truck size={20} />
                      </div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        Shipping Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        icon={User}
                        label="Full Name"
                        placeholder="Rahul Jangid"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        error={errors.name}
                        required
                      />
                      <Input
                        icon={Phone}
                        label="Phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          handleInputChange("phone", value);
                        }}
                        error={errors.phone}
                        required
                      />
                      <Input
                        icon={Mail}
                        label="Email Address"
                        placeholder="rahul@example.com"
                        className="md:col-span-2"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", formatEmailInput(e.target.value))
                        }
                        error={errors.email}
                        required
                      />
                      <Input
                        icon={MapPin}
                        label="Street Address"
                        placeholder="Street/House Details"
                        className="md:col-span-2"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        error={errors.address}
                        required
                      />

                      <Input
                        icon={MapPin}
                        label="State"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        error={errors.state}
                        required
                      />

                      <Input
                        icon={MapPin}
                        label="City"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        error={errors.city}
                        required
                      />

                      <Input
                        icon={Building2}
                        label="PIN Code"
                        placeholder="110001"
                        value={formData.pincode}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          handleInputChange("pincode", value);
                        }}
                        error={errors.pincode}
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        onClick={handleReviewOrder}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                      >
                        Review Order
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] border border-slate-50 p-6 md:p-10 shadow-xl shadow-slate-200/20 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <ShieldCheck size={20} />
                      </div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        Order Review
                      </h2>
                    </div>

                    {/* Shipping Address Review */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">
                        Shipping Address
                      </h3>
                      <div className="bg-slate-50 rounded-2xl p-6 space-y-2">
                        <p className="font-bold text-slate-800">
                          {formData.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formData.address}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formData.city}, {formData.state} - {formData.pincode}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formData.phone}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formData.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="px-8 py-4 border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest"
                      >
                        Edit Address
                      </Button>
                      <Button
                        onClick={handleProcessOrder}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-50 p-6 md:p-8 shadow-xl shadow-slate-200/20 sticky top-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
                    <ShoppingBag size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                    Order Summary
                  </h3>
                </div>

                {/* Product Details */}
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${product?.productImageUrl}`}
                    alt={product?.name}
                    className="w-16 h-16 object-contain rounded-xl bg-white"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {product?.name}
                    </h4>
                    <p className="text-xs text-slate-500">Qty: {quantity}</p>
                    <p className="text-sm font-black text-indigo-600">
                      ₹{product?.priceAfterDiscount}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (18%)</span>
                    <span className="font-bold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-bold">₹{shippingFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black pt-3 border-t border-slate-100">
                    <span className="text-slate-800">Total</span>
                    <span className="text-indigo-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
