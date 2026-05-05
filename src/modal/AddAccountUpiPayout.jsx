import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CreditCard, Building2, Hash, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { usePost } from '../hooks/usePost';
import { toast } from "sonner";
import { apiEndpoints } from '../api/apiEndpoints';
import { formatIfscInput, formatNameInputWithSpace, formatNumberInput, formatUpiIdInput, handleValidationError, ifscRegex, nameWithSpaceRegex, upiRegex } from '../utils/helperFunction';
import { useFetch } from '../hooks/useFetch';

const AddAccountUpiPayout = ({ isOpen, onClose, fetchUpiId }) => {
    const [formData, setFormData] = useState({
        accountHolderName: '',
        upiId: '',

    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = () => {
        setFormData({
            accountHolderName: '',
            upiId: '',

        });
        setErrors({});
        onClose();
    }



    const { post: xpresspayoutAddBankAccount } = usePost(apiEndpoints.xpresspayoutAddBankAccount, {
        onSuccess: (res) => {
            toast.success(res.message || 'Bank account added successfully');
            setIsSubmitting(false);
            handleClose();
            fetchUpiId()
        },
        onError: (error) => {
            console.error('Failed to add UPI Id:', error);
            toast.error(handleValidationError(error) || "Something went wrong");
            setIsSubmitting(false);
        }
    });

    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleValidate = () => {
        const tempErrors = {};


        if (!formData.accountHolderName || formData.accountHolderName.trim() === "") {
            tempErrors.accountHolderName = "Account holder name is required";
        } else if (!nameWithSpaceRegex.test(formData.accountHolderName.trim())) {
            tempErrors.accountHolderName = "Enter a valid account holder name";
        }
        if (!formData.upiId || formData.upiId.trim() === "") {
            tempErrors.upiId = "UPI Id is required";
        } else if (!upiRegex.test(formData.upiId.trim())) {
            tempErrors.upiId = "Enter a valid Upi Id";
        }


        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (handleValidate()) {
            setIsSubmitting(true);
            xpresspayoutAddBankAccount(formData);
        } else {
            toast.error("Please fill the form correctly");
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-600/50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative z-10 bg-white rounded-[1.5rem] border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden my-8"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 size={24} className="text-indigo-600" />
                                    Add UPI Id
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                <Input
                                    label="UPI Id"
                                    icon={Hash}
                                    placeholder="Enter UPI Id"
                                    type="text"
                                    value={formData.upiId}
                                    error={errors.upiId}
                                    onChange={(e) => {
                                        setFormData({ ...formData, upiId: formatUpiIdInput(e.target.value) });
                                        clearError('upiId');
                                    }}
                                />
                                <Input
                                    label="Account Holder Name"
                                    icon={User}
                                    placeholder="Enter Account Holder Name"
                                    value={formData.accountHolderName}
                                    error={errors.accountHolderName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, accountHolderName: formatNameInputWithSpace(e.target.value, 100) });
                                        clearError('accountHolderName');
                                    }}
                                />





                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 border-0"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white border-0 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add UPI Id'}
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

export default AddAccountUpiPayout;
