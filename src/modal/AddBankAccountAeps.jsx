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
import { formatIfscInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, ifscRegex, nameWithSpaceRegex } from '../utils/helperFunction';
import { useFetch } from '../hooks/useFetch';
import { form } from '@heroui/theme';

const AddBankAccountAeps = ({ isOpen, onClose, refetchAepsBankAccounts }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankId: '',
    cheque: null
  });
  const [banksList, setBanksList] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setFormData({
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankId: '',
      cheque: null
    });
    setErrors({});
    onClose();
  }

  const { refetch: fetchBankList } = useFetch(
    `${apiEndpoints.fetchAepsBankAccountList}`,
    {
      onSuccess: (data) => {
        if (data.success) {

          const temp = data?.data?.map((item) => ({ ...item, label: item.bankName, value: item._id }))
          setBanksList(temp || []);
        }
      },
      onError: (error) => {
        console.log("error in fetching bank list data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { post: addAepsBankAccount } = usePost(apiEndpoints.addAepsBankAccount, {
    onSuccess: (res) => {
      toast.success(res.message || 'Bank account added successfully');
      setIsSubmitting(false);
      handleClose();
      refetchAepsBankAccounts()
    },
    onError: (error) => {
      console.error('Failed to add bank account:', error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsSubmitting(false);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 200 * 1024; // 200KB

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, cheque: 'Only PNG, JPEG, and JPG files are allowed' }));
        e.target.value = ''; // Clear the input
        return;
      }

      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, cheque: 'File size must be less than 200KB' }));
        e.target.value = ''; // Clear the input
        toast.error('File size must be less than 200KB');
        return;
      }

      // File is valid, set it
      setFormData({ ...formData, cheque: file });
      setErrors(prev => ({ ...prev, cheque: null }));
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleValidate = () => {
    const tempErrors = {};

    if (!formData.bankId || formData.bankId.trim() === "") {
      tempErrors.bankId = "Bank name is required";
    }
    if (!formData.accountHolderName || formData.accountHolderName.trim() === "") {
      tempErrors.accountHolderName = "Account holder name is required";
    } else if (!nameWithSpaceRegex.test(formData.accountHolderName.trim())) {
      tempErrors.accountHolderName = "Enter a valid account holder name";
    }
    if (!formData.accountNumber || formData.accountNumber.trim() === "") {
      tempErrors.accountNumber = "Account number is required";
    } else if (formData.accountNumber.length < 11) {
      tempErrors.accountNumber = "Enter a valid account number";
    }
    if (!formData.ifscCode || formData.ifscCode.trim() === "") {
      tempErrors.ifscCode = "IFSC code is required";
    } else if (!ifscRegex.test(formData.ifscCode)) {
      tempErrors.ifscCode = "Invalid IFSC format (e.g. HDFC0001234)";
    }
    if (!formData.cheque) {
      tempErrors.cheque = "Cheque image is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidate()) {
      const formDataBackend = new FormData();
      formDataBackend.append('accountHolderName', formData.accountHolderName);
      formDataBackend.append('accountNumber', formData.accountNumber);
      formDataBackend.append('ifscCode', formData.ifscCode);
      formDataBackend.append('bankId', formData.bankId);
      formDataBackend.append('cheque', formData.cheque);
      setIsSubmitting(true);
      addAepsBankAccount(formDataBackend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
            className="relative z-10 bg-[var(--content-card-bg)] rounded-[1.5rem] border border-[var(--border-color)] shadow-2xl w-full max-w-md overflow-hidden my-8"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)] opacity-5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--content-text)] flex items-center gap-2">
                  <Building2 size={24} className="text-[var(--primary-color)]" />
                  Add Bank Account
                </h2>
                <button
                  onClick={handleClose}
                  className="text-[var(--content-text-muted)] hover:text-[var(--content-text)] transition-colors p-1 hover:bg-[var(--content-bg-secondary)] rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Select
                  label="Bank Name"
                  placeholder="Select Bank"
                  searchable={true}
                  options={banksList}
                  value={formData?.bankId}
                  error={errors.bankId}
                  onChange={(val) => {
                    setFormData({ ...formData, bankId: val });
                    clearError('bankId');
                  }}
                  renderOption={(bank, index) => (
                    <div className="flex items-center gap-3" key={`bank-${bank?.value}-${index}`}>
                      <div className={`w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm border border-white/20`}>
                        {bank?.label?.[0]}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-700 tracking-tight uppercase">{bank.label}</span>
                      </div>
                    </div>
                  )}
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

                <Input
                  label="Account Number"
                  icon={Hash}
                  placeholder="Enter Account Number"
                  type="text"
                  value={formData.accountNumber}
                  error={errors.accountNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, accountNumber: formatNumberInput(e.target.value, 20) });
                    clearError('accountNumber');
                  }}
                />

                <Input
                  label="IFSC Code"
                  icon={CreditCard}
                  placeholder="Enter IFSC Code"
                  value={formData.ifscCode}
                  error={errors.ifscCode}
                  onChange={(e) => {
                    setFormData({ ...formData, ifscCode: formatIfscInput(e.target.value.toUpperCase()) });
                    clearError('ifscCode');
                  }}
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Cheque Image (max 200kB)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500">
                      <Upload size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      type="file"
                      accept=".png,.jpeg,.jpg"
                      onChange={handleFileChange}
                      className={`flex h-9 md:h-10 w-full rounded-2xl border bg-white px-4 py-2 pl-11 text-sm font-bold text-slate-800 transition-all duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-300 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 hover:border-slate-300 ${errors.cheque ? 'border-red-500 focus:ring-red-50' : 'border-slate-200'}`}
                    />
                  </div>
                  {formData.cheque && (
                    <p className="text-xs text-slate-600 ml-1">
                      Selected: {formData.cheque.name} ({(formData.cheque.size / 1024).toFixed(1)}KB)
                    </p>
                  )}
                  {errors.cheque && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.cheque}
                    </p>
                  )}
                </div>

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
                    {isSubmitting ? 'Adding...' : 'Add Account'}
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

export default AddBankAccountAeps;
