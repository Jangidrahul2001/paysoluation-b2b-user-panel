import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Smartphone, Banknote, UserPlus,
  Search, Copy, FileText, FileSpreadsheet,
  Columns, ArrowRight, Wallet, CheckCircle2,
  AlertCircle, ChevronDown, Rocket, ArrowRightLeft,
  File
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/table-skeleton';
import { Skeleton } from '../components/ui/skeleton';
import { PageLayout } from '../components/layout/PageLayout';
import { DataTable } from '../components/ui/DataTable';
import { cn } from '../lib/utils';
import { containerEntrance } from '../lib/animations';
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from './NoPermission';
import { checkAssignedService, formatDate, formatNumberInput, formatToINR, handleValidationError, phoneRegex, rejectRequest } from '../utils/helperFunction';
import AddBankAccountXpressTransfer from '../modal/AddBankAccountXpressTransfer';
import { apiEndpoints } from '../api/apiEndpoints';
import { useFetch } from '../hooks/useFetch';
import { useDelete } from '../hooks/useDelete';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import { toast } from 'sonner';
import ReceiptModal from '../modal/RecieptModal';
import { usePost } from '../hooks/usePost';
import ClickToCopy from '../components/ui/ClickToCopy';
import RejectedRequest from './RejectedRequest';
import StatusBadge from '../components/ui/StatusBadge';
import { ActionButtons } from '../components/ui/ActionButton';

export default function XpressTransfer() {
  
      const { data: wallet, error: walletError, loading: walletLoading } = useSelector((state) => state.wallet);
  const [formData, setFormData] = useState({
    mobile: '',
    amount: '',
    bankId: '',
    purpose: "",
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { data: profile, error: profileError } = useSelector((state) => state.profile);

  const [searchQuery, setSearchQuery] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);


  const [isTransferingMoney, setIsTransferingMoney] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recieptModalData, setRecieptModalData] = useState({
    title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  });


  const columns = [
    {
      header: "sr. no.",
      id: "index",
      center: true,
      cell: ({ row }) => (
        <span className="text-[11px] font-bold text-slate-500">
          {row.index + 1}
        </span>
      ),
    },
    {
      header: "Name",
      accessorKey: "beneficiaryName",
      center: true,
      cell: ({ row }) => <span className=" text-slate-800 tracking-tight">{row.original.beneficiaryName}</span>
    },
    {
      header: "REFERENCE ID",
      accessorKey: "referenceId",
      center: true,
      cell: ({ row }) => (
        <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 whitespace-nowrap py-1 rounded-lg border border-indigo-100/50">
          <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
            {row.original.referenceId}
          </span>
        </ClickToCopy>
      ),
    },

    {
      header: "Account Number",
      accessorKey: "bankAccount",
      center: true,
      cell: ({ row }) => (

        <div className="flex flex-col">
          <span className=" text-slate-800 ">{row.original.bankAccount}</span>
        </div>
      )
    },
    {
      header: "ifsc",
      accessorKey: "ifsc",
      center: true,
      cell: ({ row }) => (
        <span className="text-slate-800 ">
          {row.original.ifsc}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 text-[13px]">{formatToINR(row.original.amount)}</span>

        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">

          <StatusBadge status={row.original.status} />
        </div>
      )
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      center: true,
      cell: ({ row }) => (
        <span className=" text-slate-800 whitespace-nowrap">
          {row.original.createdAt ? formatDate(row.original.createdAt) : "-"}
        </span>
      ),
    },
  ];

  const accountColumns = [
    {
      header: "SR.NO.",
      id: "index",
      center:true,
      cell: ({ row }) => <span className=" text-slate-500">{row.index + 1}</span>
    },
    { header: "Account Holder",center:true, accessorKey: "accountHolderName", className: " text-slate-800" },
    { header: "Account Number",center:true, accessorKey: "accountNumber", className: " text-slate-500" },
    { header: "IFSC",center:true, accessorKey: "ifscCode", className: " text-slate-500" },
    // {
    //   header: "Date",
    //   accessorKey: "createdAt",
    //   cell: ({ row }) => <span className="text-slate-500 whitespace-nowrap">{row.original.createdAt ? formatDate(row.original.createdAt) : ""}</span>
    // },
    {
      header: "Action",
      id: "actions",
      center:true,
      cell: ({ row }) => (
        <ActionButtons
          onDelete={() => handleBankAccountDelete(row.original)}
          deleteTitle={"Delete Account"}
        />


      )
    }
  ];

  const [columnVisibility, setColumnVisibility] = useState({});
  const [accountVisibility, setAccountVisibility] = useState({});

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          toast.error("Location access is required for AePS Payout.");
        }
      );
    }
  }, []);


  const {
    refetch: xpressPayoutList,
  } = useFetch(
    `${apiEndpoints.xpressPayoutList}?page=${pageIndex}&limit=${pageSize}&search=${searchQuery}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data)
          setTransactions(data?.data || []);
          setTotalRecords(data?.pagination?.total || 0);
        }
        setIsLoadingTransactions(false)
      },
      onError: (error) => {
        setIsLoadingTransactions(false)
        console.log("error in fetching payout list ", error);
        toast.error(handleValidationError(error) || "Something went wrong");

      },
    },
    false,
  );

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);

    }
  };

  useEffect(() => {
    xpressPayoutList();
  }, [pageIndex, pageSize, searchQuery]);

  const {
    refetch: fetchXpressAddedBankAccount,
  } = useFetch(
    `${apiEndpoints.fetchXpressAddedBankAccount}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setAccounts(data?.data || []);
        }
        setIsLoadingAccounts(false)
      },
      onError: (error) => {
        setIsLoadingAccounts(false)
        console.log("error in fetching account list ", error);
        toast.error(handleValidationError(error) || "Something went wrong");

      },
    },
    true,
  );

  const { remove: xpressPayoutBankDelete } = useDelete(
    `${apiEndpoints?.xpressPayoutBankDelete}/${selectedBankAccount?._id}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setIsDeleting(false)
          toast.success(data.message || "Account deleted successfully");
          setDeleteModalOpen(false);
          fetchXpressAddedBankAccount();
        }
      },
      onError: (error) => {
        console.error("Error deleting account:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsDeleting(false)
      },
    },
  );
  const handleBankAccountDelete = (account) => {
    setSelectedBankAccount(account);
    setDeleteModalOpen(true);
  };






  const validate = () => {
    const tempErrors = {}
    if (formData?.mobile.trim() === '') {
      tempErrors.mobile = "Mobile number is required";
    }
    else if (!phoneRegex.test(formData?.mobile)) {
      tempErrors.mobile = "Invalid mobile number";
    }

    if (formData.bankId.trim() === '') {
      tempErrors.bankId = "Account number is required";
    }

    if (formData?.amount.trim() === '') {
      tempErrors.amount = "Amount is required";
    }
    else if (parseFloat(formData?.amount) < 100) {
      tempErrors.amount = "Amount must be greater than 100";
    }
    else if (parseFloat(formData?.amount) > 10000) {
      tempErrors.amount = "Amount must be less than 10000";
    }
      else  if (!wallet || walletLoading) {
     tempErrors.amount = "Wallet balance unavailable. Please try again.";
   }
     else if (parseFloat(formData?.amount) > parseFloat(wallet?.mainWallet - wallet?.mainHoldAmount)) {
                tempErrors.amount ="Amount must be less than wallet balance";
               
            }
    if (formData?.purpose.trim() === '') {
      tempErrors.purpose = "Reason is required";
    }




    if (formData?.latitude === null || formData?.longitude === null) {
      toast.error("Location access is required for AepsPayout");
      tempErrors.location = "location is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }
  const { post: xpresspayoutInitiateTransaction } = usePost(apiEndpoints.xpresspayoutInitiateTransaction, {
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'Transfer successfully');
        const bankDetails = accounts.find((account) => account?._id === formData?.bankId);
        const status = res?.data?.status || "PENDING"
        setRecieptModalData({
          title: status === "PENDING" ? "Transfer Pending" : " Transfer Successful",
          // date: res?.data?.timestamp,
          subTitleLabel: "Amount",
          subTitleValue: formatToINR(formData?.amount),
          receiptData: {
            "Bank Name": bankDetails?.bank || "",
            "Account Holder Name": bankDetails?.accountHolderName || "",
            "Account No.": bankDetails?.accountNumber || "",
            "IFSC": bankDetails?.ifscCode || "",
            "Transaction Id": res?.data?.transactionId || "",
            status: status === "PENDING" ? "Transaction Pending" : "Transaction Successful"
          },
          isOpen: true
        });
        dispatch(fetchWallet());
        setFormData((prev) => ({
          ...prev,
          mobile: "",
          amount: "",
          bankId: "",
          purpose: "",
        }));
      }
      else {
        toast.error(res.message || 'Failed to transfer')
      }
      setIsTransferingMoney(false);
    },
    onError: (error) => {
      console.error('Failed to transfer:', error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsTransferingMoney(false);
    }
  });

  const handleTransfer = () => {
    if (validate()) {
      setIsTransferingMoney(true);
      xpresspayoutInitiateTransaction(formData)
    }
  };

  const handleAddAccount = () => {
    setIsModalOpen(true);
  };
  // Replace the single isLoading check with:
  const isLoading = isLoadingAccounts || isLoadingTransactions || walletLoading;

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="w-12 h-12 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-4 h-full">
            <div className="p-4 border-b border-slate-50 bg-slate-50/30 rounded-t-[1.5rem]">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
            <TableSkeleton rowCount={5} columnCount={7} className="border-none" />
          </div>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = React.memo(() => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div

        className="max-w-md mx-auto"
      >
        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-200 mb-6 border-2 border-indigo-100 border-dashed mx-auto">
          <UserPlus size={48} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Beneficiaries Added</h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Start by adding your first bank account to enable instant transfers.
        </p>
        <Button
          onClick={handleAddAccount}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-sm px-8 h-12 flex items-center gap-3 transition-all active:scale-95 mx-auto"
        >
          <UserPlus size={20} />
          Add Your First Beneficiary
        </Button>
      </div>
    </div>
  ));

  if (rejectRequest("xpress-payout1", profile?.requestedService)) return (<RejectedRequest service="xpress-payout" pipeline="xpress-payout1" />)

  if (!checkAssignedService("xpress-payout", "xpress-payout1", profile?.assignedServices))
    return (<NoPermission service="xpress-payout" pipeline="xpress-payout1" />);

  return (
    <PageLayout
      title="Xpress Transfer"
      subtitle="Execute instant money transfers to any bank account with real-time processing"
      actions={
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleAddAccount}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black px-6 h-10 flex items-center gap-2 transition-all active:scale-95 text-[11px] uppercase tracking-widest"
          >
            <UserPlus size={16} /> Add Beneficiary
          </Button>
        </div>
      }
      className="max-w-[1600px] mx-auto py-4"
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-8 text-left font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Transfer Form */}
            <motion.div
              {...containerEntrance}
              className="lg:col-span-4"
            >
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 relative overflow-hidden group h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Xpress Payout</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Instant Transfer Engine</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                    <Rocket size={22} fill="currentColor" className="opacity-80" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">

                    <Input
                      label="Customer Mobile"
                      icon={Smartphone}
                      placeholder="98XXXXXXXX"
                      value={formData.mobile}
                      onChange={(e) => {
                        setFormData({ ...formData, mobile: formatNumberInput(e.target.value, 10) });
                        if (errors.mobile) setErrors({ ...errors, mobile: null });
                      }}
                      error={errors.mobile}
                    />
                  </div>

                  <div className="space-y-2">

                    <Select
                      label={"Account"}
                      options={accounts?.map((acc) => ({
                        value: acc._id,
                        label: `${acc.accountHolderName} - ${acc.accountNumber?.slice(-4)}`,
                        ...acc,
                      }))}
                      placeholder="Select Account"
                      value={formData.bankId}
                      onChange={(value) => {
                        setFormData({ ...formData, bankId: value });
                        if (errors.bankId) setErrors({ ...errors, bankId: null });
                      }}
                      error={errors.bankId}
                      renderOption={(opt) => (
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-bold text-slate-900 text-[13px] tracking-tight">{opt.holder}</span>
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                            XXXX{(opt.accNo || 'xxxx').slice(-4)} • {opt.ifsc}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Transfer Amount"
                      icon={Banknote}
                      placeholder="0.00"

                      value={formData.amount}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: formatNumberInput(e.target.value, 8) });
                        if (errors.amount) setErrors({ ...errors, amount: null });
                      }}
                      error={errors.amount}
                    />
                  </div>

                  <div className="space-y-2">

                    <Input
                      label="Payout Reason"
                      icon={File}
                      placeholder="Reason..."
                      value={formData.purpose}
                      error={errors.purpose}
                      onChange={(e) => {
                        setFormData({ ...formData, purpose: e.target.value?.slice(0, 60) });
                        if (errors.purpose) setErrors(prev => ({ ...prev, purpose: '' }))
                      }}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      disabled={isTransferingMoney}
                      isLoading={isTransferingMoney}
                      onClick={handleTransfer}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-2xl font-black text-[13px] uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                      Transfer Funds
                      <ArrowRightLeft size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Accounts List */}
            <motion.div
              {...containerEntrance}
              className="lg:col-span-8 space-y-4"
            >
              <div className="flex items-center gap-4 px-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] leading-none">Active Beneficiaries</h3>
              </div>

              <DataTable
                hidePagination={true}
                columns={accountColumns}
                data={accounts}
                isLoading={isLoadingAccounts}
                showSearch={true}
                showheaderAction={true}
                columnVisibility={accountVisibility}
                setColumnVisibility={setAccountVisibility}
                fileName="Beneficiary_Accounts"
                searchPlaceholder="Search accounts..."
              />
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] leading-none">Recent Transactions</h3>
            </div>

            <DataTable
              columns={columns}
              data={transactions}
              isLoading={false}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              searchValue={searchQuery}
              fileName="XpressTransfer"
              searchPlaceholder="Search Transactions..."
              searchChange={(e) => { setSearchQuery(e.target.value) }}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPaginationChange={({ pageIndex, pageSize }) => {
                handlePageChange(pageIndex, pageSize);
              }}
            />
          </div>

          <ConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => { setDeleteModalOpen(false); setSelectedBankAccount(null); }}
            onConfirm={() => {
              setIsDeleting(true);
              xpressPayoutBankDelete();
            }}
            title="Remove Beneficiary"
            description="Are you sure you want to decouple this bank account? This action is irrevocable."
            confirmText={isDeleting ? "Processing..." : "Confirm Removal"}
            isDestructive={true}
          />

          {recieptModalData.isOpen && (

            <ReceiptModal
              title={recieptModalData.title}
              // date={recieptModalData.date}
              subTitleLabel={recieptModalData.subTitleLabel}
              subTitleValue={recieptModalData.subTitleValue}
              receiptData={recieptModalData.receiptData}
              onClose={() => {
                setRecieptModalData({ title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false });
                setFormData((prev) => ({
                  ...prev,
                  mobile: "",
                  amount: "",
                  bankId: "",
                  purpose: "",
                }));
                setErrors({});
              }}
            />
          )}


        </div>
      )}
      {isModalOpen && <AddBankAccountXpressTransfer
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); }}
        fetchXpressAddedBankAccount={fetchXpressAddedBankAccount}
      />}
    </PageLayout>
  );
}
