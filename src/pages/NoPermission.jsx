import React, { useState } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { PageLayout } from "../components/layout/PageLayout";
import { ShieldAlert, ArrowLeft, Home, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { handleValidationError } from "../utils/helperFunction";
import { usePost } from "../hooks/usePost";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../store/slices/profileSlice";
import NoAccessIcon from "../assets/no-access.json?url";

const NoPermission = ({ service = "", pipeline = "", nonService = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const [allServices, setAllServices] = useState([])

  const { refetch: fetchAllServices } = useFetch(
    `${apiEndpoints.allServiceList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setAllServices(data?.data || []);
        }
      },
      onError: (error) => {
        console.log("error in fetching Services data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    !nonService,
  );

  const { post: serviceRequest } = usePost(apiEndpoints.requestService, {
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Request sent successfully to admin");
        setIsPending(false);
        dispatch(fetchProfile())
      }
    },
    onError: (error) => {
      setIsPending(false);
      console.error('Failed to REquest service:', error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });

  const handleRequestAccess = () => {
    const selectedService = allServices.find((item) => item.name === service);
    if (pipeline === "" || !pipeline) {
      toast.error("Pipeline not found");
    }
    if (selectedService && selectedService?._id) {
      setIsPending(true);
      serviceRequest({ serviceId: selectedService?._id, pipeline })
    }
    else {
      toast.error("Service not found");
    }

  };

  return (
    <PageLayout
      title="Access Restricted"
      subtitle="You don't have permission to view this page"
      showBackButton={true}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4  min-h-[calc(100vh-150px)]  -mt-8 sm:-mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="w-full max-w-[280px] sm:max-w-lg  aspect-square sm:aspect-video relative flex items-center justify-center"
        >
          {/* Lottie Container with Glass Design */}
          <div className="relative w-full h-full backdrop-blur-xl rounded-[3rem] overflow-hidden flex items-center justify-center p-6 md:p-12 group">
            <DotLottieReact
              src={NoAccessIcon}
              loop
              autoplay
              className="w-full h-full object-contain relative z-10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 sm:mt-12 text-center space-y-4 sm:space-y-6"
        >
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
              <div className="h-px w-6 sm:w-12 bg-rose-200/50" />
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
              <div className="h-px w-6 sm:w-12 bg-rose-200/50" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">
              Restricted <span className="text-rose-500">Access</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[280px] sm:max-w-md mx-auto leading-relaxed">
              Your account lacks the necessary permissions for this service.
              Contact your system administrator for activation.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            {!nonService && <Button
              className="w-full xs:w-auto h-11 sm:h-12 px-6 sm:px-8 gap-2 rounded-2xl bg-indigo-600 hover:bg-linear-to-tr hover:from-indigo-600 hover:to-violet-600 text-white text-sm sm:text-base font-bold shadow-sm"
              onClick={handleRequestAccess}
              disabled={isPending}
            >
              {isPending ? "Sending..." : (
                <>
                  <Send className="w-4 h-4" />
                  Request Access
                </>
              )}
            </Button>}
            <Button
              variant="outline"
              className="w-full xs:w-auto h-11 sm:h-12 px-6 sm:px-8 gap-2 rounded-2xl text-sm sm:text-base font-bold"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default NoPermission;
