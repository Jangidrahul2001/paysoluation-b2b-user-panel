import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MoveLeft,
  User,
  Mail,
  Smartphone,
  Shield,
  Package,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PageLayout } from "../components/layout/PageLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { apiEndpoints } from "../api/apiEndpoints";
import { useFetch } from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { emailRegex, formatEmailInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, nameWithSpaceRegex } from "../utils/helperFunction";
import { UserCheck } from "lucide-react";

export default function AddUser() {
  const navigate = useNavigate();
  const [roleList, setRoleList] = useState();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  });

  const {
    data,
    error,
    refetch: fetchRoles,
  } = useFetch(
    `${apiEndpoints.fetchRole}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const tempRoles = data?.data?.map((role) => ({
            label: role.name,
            value: role._id,
          }));
          setRoleList(tempRoles);
        }
      },
      onError: (error) => {
        console.log("error in fetching roles data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { post: addUser } = usePost(apiEndpoints?.createUser, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "User Added Successfully!");
        navigate("/users");
      }
    },
    onError: (error) => {
      console.log("error in adding user", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    else if (!nameWithSpaceRegex.test(formData.firstName?.trim())) {
      newErrors.firstName = "Enter a valid first name";
    }
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (!nameWithSpaceRegex.test(formData.lastName?.trim())) {
      newErrors.lastName = "Enter a valid last name";
    }


    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const mobileDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone) {
      newErrors.phone = "Mobile number is required";
    } else if (mobileDigits.length !== 10) {
      newErrors.phone = "Must be exactly 10 digits";
    }

    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      addUser(formData);
    } catch (error) {
      console.log("error in adding user", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title="Add New User"
      subtitle="Onboard a new direct member to your network hierarchy"
      showBackButton={true}
      onBack={() => navigate("/users")}
      className="w-full px-2 py-4"
    >
      <div className="w-full bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-sm rounded-[2rem] relative group">
        {/* Ambient Decorative Blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-slate-900/3 rounded-full blur-3xl pointer-events-none group-hover:bg-slate-900/5 transition-colors duration-1000" />

        <div className="p-8 lg:p-10 relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-4">
                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-[0.2em] leading-none">
                  <User size={16} className="text-indigo-600" /> Personal Identity
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  First Name
                </label>
                <Input
                  placeholder="First Name"
                  className="h-10 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: formatNameInputWithSpace(e.target.value, 50) });
                    if (errors.firstName) setErrors({ ...errors, firstName: "" });
                  }}
                  error={errors.firstName}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Last Name
                </label>
                <Input
                  placeholder="Last Name"
                  className="h-10 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: formatNameInputWithSpace(e.target.value, 50) });
                    if (errors.lastName) setErrors({ ...errors, lastName: "" });
                  }}
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-100/50 mb-4">
                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-[0.2em] leading-none">
                  <Smartphone size={16} className="text-indigo-600" /> Connectivity
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Email Address
                </label>

                <Input

                  placeholder="Email Address"
                  className="h-10 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: formatEmailInput(e.target.value) });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  error={errors.email}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Mobile Number
                </label>
                <Input

                  placeholder="Mobile Number"
                  className="h-10 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: formatNumberInput(e.target.value, 10) });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  error={errors.phone}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-100/50 mb-4">
                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-[0.2em] leading-none">
                  <Shield size={16} className="text-indigo-600" /> Account Privilege
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Access Level / Role
                </label>
                <Select
                  placeholder="Select Role"
                  value={formData.role}
                  className="h-10 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  onChange={(val) => {
                    setFormData({ ...formData, role: val });
                    if (errors.role) setErrors({ ...errors, role: "" });
                  }}
                  options={roleList}
                  error={errors.role}
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-t border-slate-100 mt-2">
              <Button
                type="submit"
                className="h-10 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em]  active:scale-95 transition-all duration-300 w-full sm:w-auto flex-1 md:flex-none"
                isLoading={isLoading}
              >
                Create Account
                <Check className="ml-2 w-3 h-3 stroke-3" />
              </Button>
              <Link to="/users" className="w-full sm:w-auto flex-1 md:flex-none">
                <Button
                  variant="ghost"
                  type="button"
                  className="h-10 px-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-200 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
