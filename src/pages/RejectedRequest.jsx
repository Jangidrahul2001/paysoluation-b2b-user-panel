import React, { useState } from 'react';
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { PageLayout } from "../components/layout/PageLayout";
import { XCircle, Home, Send, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useDispatch, useSelector } from 'react-redux';
import { useFetch } from '../hooks/useFetch';
import { usePost } from '../hooks/usePost';
import { apiEndpoints } from '../api/apiEndpoints';
import { toast } from 'sonner';
import { handleValidationError } from '../utils/helperFunction';
import { fetchProfile } from '../store/slices/profileSlice';
import NoAccessIcon from "../assets/no-access.json?url";


const RejectedRequest = ({ service = "", pipeline = "" }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { data: profile } = useSelector((state) => state.profile);
    const requestedServiceItem = profile?.requestedService.find((item) => item.serviceName === pipeline);
    const status = requestedServiceItem?.status || "pending";
    const reason = requestedServiceItem?.reason || "";

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
        true,
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
            console.error('Failed to Request service:', error);
            toast.error(handleValidationError(error) || "Something went wrong");
        }
    });

    const handleRequestAccess = () => {
        const selectedService = allServices.find((item) => item.name === service);
        if (pipeline === "" || !pipeline) {
            toast.error("Pipeline not found");
            return;
        }
        if (selectedService?._id) {
            setIsPending(true);
            serviceRequest({ serviceId: selectedService?._id, pipeline })
        }
        else {
            toast.error("Service not found");
            return;
        }
    };

    const isRejected = status === "rejected";
    const isPendingStatus = status === "pending";



    return (
        <PageLayout
            title={isRejected ? "Request Rejected" : "Request Pending"}
            subtitle={isRejected ? "Your service request has been declined" : "Your service request is under review"}
            showBackButton={true}
        >
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 min-h-[calc(100vh-150px)] -mt-8 sm:-mt-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="w-full max-w-[280px] sm:max-w-lg aspect-square sm:aspect-video relative flex items-center justify-center"
                >
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

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                            Request <span className={isRejected ? "text-red-500" : "text-yellow-500"}>
                                {isRejected ? "Rejected" : "Pending"}
                            </span>
                        </h2>
                        {service && (
                            <p className="text-slate-700 text-sm sm:text-base font-semibold">
                                Service: <span className="text-indigo-600">{allServices.find((item) => item.name === service)?.label || service}</span>
                            </p>
                        )}
                        <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[280px] sm:max-w-md mx-auto leading-relaxed">
                            {isRejected ? reason : "Your request is being reviewed by the administrator. Please wait for approval."}
                        </p>
                    </div>

                    <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                        {isRejected && (
                            <Button
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
                            </Button>
                        )}
                        <Button
                            className="w-full xs:w-auto h-11 sm:h-12 px-6 sm:px-8 gap-2 rounded-2xl bg-indigo-600 hover:bg-linear-to-tr hover:from-indigo-600 hover:to-violet-600 text-white text-sm sm:text-base font-bold shadow-sm"
                            onClick={() => navigate("/")}
                        >
                            <Home className="w-4 h-4" />
                            Go to Dashboard
                        </Button>
                    </div>
                </motion.div>
            </div>
        </PageLayout>
    );
};

export default RejectedRequest;
