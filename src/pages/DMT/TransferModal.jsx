import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Send, Shield, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePost } from '../../hooks/usePost';
import { toast } from 'sonner';
import { apiEndpoints } from '../../api/apiEndpoints';
import { fetchPublicIp, formatNumberInput, formatToINR, handleValidationError } from '../../utils/helperFunction';
import { useSelector } from 'react-redux';

const TransferModal = ({ isOpen, onClose, details, setRecieptModalData }) => {
    const { data: wallet, error: walletError, loading: walletLoading } = useSelector((state) => state.wallet);
    console.log(wallet)
    const [amount, setAmount] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [errors, setErrors] = useState({});
    const [mounted, setMounted] = useState(false);
    const [location, setLocation] = useState({ lat: null, lng: null });

    const { post: transferPayment, isLoading: isTransferring } = usePost(apiEndpoints.dmtTransferAmount, {
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message || "Payment transferred successfully!");

                setRecieptModalData({
                    title: "Transaction Successful",
                    // date: res?.data?.timestamp,
                    subTitleLabel: "Amount",
                    subTitleValue: formatToINR(amount),
                    receiptData: {
                        "bank Name": details?.bank || "",
                        "Account Holder Name": details?.account_name || "",
                        "Account No.": details?.account_no || "",
                        "IFSC": details?.ifsc || "",
                        status: "Transaction Successful"
                    },
                    isOpen: true
                });
                onClose();
            }
        },
        onError: (error) => {
            console.error('Failed to transfer payment:', error);
            toast.error(handleValidationError(error) || "Failed to transfer payment");
        }
    });

    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    toast.error("Location access is required.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    }, []);
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !isTransferring) onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, isTransferring]);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setOtp('');
            setOtpSent(false);
            setErrors({});
        }
    }, [isOpen]);

    const validate = (field = 'all') => {
        const newErrors = {};

        if (field === 'all' || field === 'amount') {
            if (!amount) {
                newErrors.amount = 'Amount is required';
            } else if (parseFloat(amount) < 10) {
                newErrors.amount = 'Amount must be at least ₹10';
            } else if (parseFloat(amount) > 5000) { } else if (parseFloat(amount) > 5000) {
                newErrors.amount = 'Amount cannot exceed 5000';
            }
        }

        if (field === 'all' || field === 'otp') {
            if (otpSent && !otp) {
                newErrors.otp = 'OTP is required';
            } else if (otpSent && otp.length !== 4) {
                newErrors.otp = 'OTP must be 4 digits';
            }
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const { post: generateOtp, isLoading: isGeneratingOtp } = usePost(apiEndpoints.dmtGenerateOtpForTransfer, {
        onSuccess: (res) => {
            if (res.success) {
                setOtpSent(true);
                toast.success(res.message || "OTP sent successfully!");
            }
        },
        onError: (error) => {
            console.error('Failed to generate OTP:', error);
            toast.error(handleValidationError(error) || "Failed to generate OTP");
        }
    });



    const handleTransfer = async (e) => {
        if (e) e.preventDefault();
        if (!validate('amount')) return;

        if (location.lat === null || location.lng === null) {
            toast.error("Location access is required.");
            return;
        }
        const publicIp = await fetchPublicIp();
        if (!publicIp) {
            toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
            return;
        }
        if (!details || !details.mobileNumber || !details.account_no) {
            toast.error("Beneficiary details not found. Please try again.");
            return;
        }
        if (parseFloat(amount) > parseFloat(wallet?.mainWallet - wallet?.mainHoldAmount)) {
            toast.error("Amount must be less than wallet balance");
            return
        }

        generateOtp({
            amount: parseFloat(amount),
            beneficiaryAccount: details?.account_no,
            latitude: location.lat,
            longitude: location.lng,
            publicIp,
            mobileNumber: details?.mobileNumber,

        });
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        if (location.lat === null || location.lng === null) {
            toast.error("Location access is required.");
            return;
        }
        const publicIp = await fetchPublicIp();
        if (!publicIp) {
            toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
            return;
        }

        if (!details || !details.mobileNumber || !details.account_no) {
            toast.error("Beneficiary details not found. Please try again.");
            return;
        }
        if (parseFloat(amount) > parseFloat(wallet?.mainWallet - wallet?.mainHoldAmount)) {
            toast.error("Amount must be less than wallet balance");
            return
        }

        transferPayment({
            amount: parseFloat(amount),
            otp,
            beneficiaryAccount: details?.account_no,
            mobileNumber: details?.mobileNumber,
            latitude: location.lat,
            longitude: location.lng,
            publicIp,
        });
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isTransferring ? undefined : onClose}
                        className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Send size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                            Transfer Money
                                        </h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {details?.name || 'Beneficiary'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {details && (
                                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Account Number:</span>
                                            <span className="font-medium text-slate-800">{details.account_no}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">IFSC Code:</span>
                                            <span className="font-medium text-slate-800">{details.ifsc}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Bank Name:</span>
                                            <span className="font-medium text-slate-800">{details.bank}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={otpSent ? handleVerifyOtp : handleTransfer} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                                        Transfer Amount
                                    </label>
                                    <Input
                                        icon={IndianRupee}
                                        placeholder="Enter amount"
                                        maxLength={8}
                                        value={amount}
                                        disabled={otpSent}
                                        onChange={(e) => {
                                            const value = formatNumberInput(e.target.value, 8);
                                            setAmount(value);
                                            if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                                        }}
                                        error={errors.amount}
                                    />
                                </div>

                                {otpSent && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                                            Enter OTP
                                        </label>
                                        <Input
                                            icon={Shield}
                                            placeholder="Enter 4-digit OTP"
                                            maxLength={4}
                                            value={otp}
                                            onChange={(e) => {
                                                const value = formatNumberInput(e.target.value, 4);
                                                setOtp(value);
                                                if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                                            }}
                                            error={errors.otp}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isTransferring}
                                        className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={isGeneratingOtp || isTransferring}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20"
                                    >
                                        {otpSent ? 'Verify & Transfer' : 'Transfer'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default TransferModal;
