import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { InputSimple } from "../components/ui/InputSimple";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { useFetch } from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { apiEndpoints } from "../api/apiEndpoints";
import { emailRegex, formatEmailInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, nameWithSpaceRegex, phoneRegex } from "../utils/helperFunction";
import { motion } from "framer-motion";
import { Input } from "../components/ui/Input";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [roles, setRoles] = useState([]);

  const {
    data,
    error,
    refetch: refetchRoles,
  } = useFetch(
    `${apiEndpoints.fetchRoleListForSignUp}`,
    {
      onSuccess: (data) => {
        if (data.success) {

          setRoles(data.data.map((role) => ({ label: role.name, value: role._id })));
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true, // auto fetch on mount
  );

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName.trim()) {
      tempErrors.firstName = "First Name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.firstName?.trim())) {
      tempErrors.firstName = "Enter a valid name";
    }
    if (!formData.lastName.trim())
      tempErrors.lastName = "Last Name is required";
    else if (!nameWithSpaceRegex.test(formData.lastName?.trim())) {
      tempErrors.lastName = "Enter a valid name";
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone Number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      tempErrors.phone = "Invalid phone number";
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (
      !emailRegex.test(formData.email)
    ) {
      tempErrors.email = "Enter a valid email address";
    }

    if (!formData.role) tempErrors.role = "Role selection is required";

    setErrors(tempErrors);
    // If there are errors, show a toast
    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
    }
    return Object.keys(tempErrors).length === 0;
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   let updatedValue = value;
  //   if (name === "firstName" || name === "lastName") {
  //     updatedValue = value.replace(/[^a-zA-Z]/g, "");
  //   }

  //   if (name === "phone") {
  //     updatedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
  //   }

  //   setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  //   // Clear error when user types
  //   if (errors[name]) {
  //     setErrors((prev) => ({ ...prev, [name]: "" }));
  //   }
  // };

  const { post: registerUser } = usePost(apiEndpoints?.userRegister, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          data.message || "User registered successfully! Please log in.",
        );
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          role: "",
        });
        navigate("/login");
      }
      setIsLoading(false);
    },
    onError: (error) => { setIsLoading(false); toast.error(handleValidationError(error) || "Something went wrong"); }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (isValid) {
      setIsLoading(true);
      registerUser(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tightest uppercase">
          Sign Up
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Join the Pay Soluation Network
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Personal Details"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, firstName: formatNameInputWithSpace(e.target.value, 50) }));
              if (errors?.firstName) {
                setErrors((prev) => ({ ...prev, firstName: "" }));
              }
            }}
            error={errors.firstName}

          />
          <Input
            label=" "
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, lastName: formatNameInputWithSpace(e.target.value, 50) }));
              if (errors?.lastName) {
                setErrors((prev) => ({ ...prev, lastName: "" }));
              }
            }}
            error={errors.lastName}

          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mobile Number"

            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, phone: formatNumberInput(e.target.value, 10) }));
              if (errors?.phone) {
                setErrors((prev) => ({ ...prev, phone: "" }));
              }
            }}
            error={errors.phone}

          />

          <Input
            label="Email Address"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: formatEmailInput(e.target.value) }));
              if (errors?.email) {
                setErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            error={errors.email}

          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Role Specification"
            name="role"
            options={roles}
            placeholder="Select Role Type"
            searchable={false}
            value={formData.role}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, role: val }));
              if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
            }}
            onOpen={refetchRoles}
            error={errors.role}

          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full h-12 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all transition-duration-500 mt-6"
        >
          {isLoading ? "Processing..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center pt-4 space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Already logged in?{" "}
          </span>
          <Link
            to="/login"
            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
          >
            Login
          </Link>
        </div>
        <p className="text-[10px] font-bold text-slate-600 max-w-[400px] mx-auto leading-relaxed uppercase tracking-[0.05em] opacity-60">
          By submitting, you agree to our{" "}
          <Link to="/terms" className="text-indigo-600 hover:underline">
            Terms
          </Link>{" "}
          &{" "}
          <Link to="/cookies" className="text-indigo-600 hover:underline">
            Policy
          </Link>
        </p>
      </div>
    </motion.div>

  );
};

export default Signup;
