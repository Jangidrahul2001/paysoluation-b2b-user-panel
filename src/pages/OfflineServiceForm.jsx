import React, { useEffect, useState } from "react";
import { handleValidationError, checkAssignedService, rejectRequest } from "../utils/helperFunction";
import { toast } from "sonner";
import { useFetch } from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { apiEndpoints } from "../api/apiEndpoints";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useSelector } from "react-redux";
import { Skeleton } from "../components/ui/skeleton";
import NoPermission from "./NoPermission";
import RejectedRequest from "./RejectedRequest";

const FileInput = ({ label, value, onChange, error }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <label className={cn(
      "flex items-center px-4 h-11 bg-slate-50/50 border rounded-xl cursor-pointer transition-all hover:bg-slate-100/80 group",
      error ? "border-red-200" : "border-slate-200 hover:border-slate-300"
    )}>
      <Upload size={14} className="text-slate-400 mr-3 shrink-0" />
      <span className={cn(
        "text-[12px] truncate flex-1",
        value ? "text-slate-900 font-bold" : "text-slate-400 font-medium"
      )}>
        {value || "Upload document..."}
      </span>
      <input type="file" className="hidden" onChange={onChange} />
    </label>
    {error && (
      <p className="text-[9px] text-red-500 font-bold ml-1 uppercase tracking-tight">
        {error}
      </p>
    )}
  </div>
);

const FormSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex items-center gap-3 px-1">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-16" />
    </div>

    <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm p-8">
      <div className="mb-8 pb-6 border-b border-slate-50">
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="pt-6">
          <Skeleton className="h-11 w-60 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

const OfflineServiceForm = ({ serviceId, onBack }) => {
  const [serviceData, setSelectedServiceData] = useState({});
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServiceLoading, setIsServiceLoading] = useState(true);

  const { data: profile } = useSelector((state) => state.profile);

  const { refetch: fetchselectedService } = useFetch(
    `${apiEndpoints.fetchOfflineServiceById}/${serviceId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setSelectedServiceData(data?.data);
        }
        setIsServiceLoading(false);
      },
      onError: (error) => {
        console.log("error in fetching services data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsServiceLoading(false);
      },
    },
    false,
  );

  const { post } = usePost(apiEndpoints.createOfflineServiceRequest, {
    onSuccess: (data) => {
      toast.success("Service request submitted successfully");
      onBack();
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to submit request");
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (serviceId) fetchselectedService();
  }, []);

  // Show skeleton loading when profile is not available
  if (!profile) {
    return <FormSkeleton />;
  }
   if (rejectRequest("offline-service", profile?.requestedService)) return (<RejectedRequest service="offline-service" pipeline="offline-service" />)

  // Check permissions after profile is loaded
  if (!checkAssignedService("offline-service", "offline-service", profile?.assignedServices)) {
    return <NoPermission service="offline-service" pipeline="offline-service" />;
  }

  // Show skeleton while service data is loading
  if (isServiceLoading) {
    return <FormSkeleton />;
  }

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleFileChange = (key, file) => {
    if (file) {
      // File size validation (200KB = 200 * 1024 bytes)
      const maxSize = 200 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 200KB");
        return;
      }

      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, JPG and PDF files are allowed");
        return;
      }

      setDocuments((prev) => ({ ...prev, [key]: file }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    serviceData?.requiredFields?.forEach((field) => {
      if (!formData[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    serviceData?.requiredDocuments?.forEach((doc) => {
      if (!documents[doc.key]) {
        newErrors[doc.key] = `${doc.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("offlineServiceId", serviceId);

    const fieldData = (serviceData.requiredFields || []).map((field) => ({
      fieldId: field._id,
      value: formData[field.key],
    }));
    formDataToSend.append("fieldData", JSON.stringify(fieldData));

    (serviceData.requiredDocuments || []).forEach((field) =>
      formDataToSend.append(field._id, documents[field.key]),
    );

    await post(formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Go Back
        </span>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm p-8 relative overflow-hidden">
        <div className="mb-8 pb-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {serviceData?.serviceName}
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Offline Submission Form</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {serviceData?.requiredFields?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceData.requiredFields.map((field) => (
                <Input
                  key={field._id}
                  type={field.type}
                  label={field.label}
                  placeholder={`Enter ${field.label}...`}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  error={errors[field.key]}
                  className="!h-11 !rounded-xl !bg-slate-50/50 !text-[13px] border-slate-200 focus:!border-indigo-500/50 focus:!ring-indigo-500/5 shadow-none"
                />
              ))}
            </div>
          )}

          {serviceData?.requiredDocuments?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {serviceData.requiredDocuments.map((doc) => (
                <FileInput
                  key={doc._id}
                  label={doc.label}
                  value={documents[doc.key]?.name}
                  onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                  error={errors[doc.key]}
                  accept=".jpeg,.jpg,.pdf"
                />
              ))}
            </div>
          )}

          <div className="pt-6">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="h-11 w-full md:w-[240px] rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-950/10 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Submit Protocol
              <ArrowRight size={14} strokeWidth={3} className="opacity-60" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflineServiceForm;
