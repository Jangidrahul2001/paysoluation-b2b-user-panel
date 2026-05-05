import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  MessageSquare,
  History,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  Plus,
  ArrowRight,
  HeartHandshake,
  Filter,
  Eye,
  Info
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { DataTable } from "../components/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../components/ui/dropdown-menu";
import { useFetch } from "../hooks/useFetch";
import {
  formatDate,
  handleValidationError,
} from "../utils/helperFunction";
import { apiEndpoints } from "../api/apiEndpoints";
import { usePost } from "../hooks/usePost";
import { toast } from "sonner";
import { TicketDetailsModal } from "../modal/TicketDetailsModal";
import { PageLayout } from "../components/layout/PageLayout";
import { BentoCard } from "../components/ui/BentoCard";
import StatusBadge from "../components/ui/StatusBadge";
import { cn } from "../lib/utils";
import { ActionButtons } from "../components/ui/ActionButton";

const StatCard = ({ label, value, color, bg, icon: Icon }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={cn(
      "p-5 rounded-3xl flex items-center gap-4 border border-white/10 shadow-sm relative overflow-hidden group transition-all duration-300",
      bg
    )}
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={80} />
    </div>
    <div
      className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 relative z-10",
        color
      )}
    >
      <Icon size={20} />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
        {value || 0}
      </h4>
    </div>
  </motion.div>
);

export default function SupportTicket() {
  const [formData, setFormData] = useState({
    serviceId: "",
    transactionId: "",
    supportDetails: "",
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [supportTicketsStats, setSupportTicketsStats] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const handleOpenModal = (ticket) => {
    setSelectedTicketId(ticket?._id);
    setIsModalOpen(true);
  };

  const [serviceList, setServiceList] = useState([]);
  const [errors, setErrors] = useState({});

  const { refetch: fetchTicketStats } = useFetch(
    `${apiEndpoints.fetchTicketStats}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setSupportTicketsStats(data?.data);
        }
      },
      onError: (error) => {
        console.log("error in fetching tickets", error);
        toast.error(handleValidationError(error) || "Failed to fetch stats");
      },
    },
    true,
  );

  const { refetch: fetchServiceList } = useFetch(
    `${apiEndpoints.allServiceList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const tempService = data?.data?.map((service) => ({
            ...service,
            label: service.label,
            value: service._id,
          }));
          setServiceList(tempService);
        }
      },
      onError: (error) => {
        console.log("error in fetching services data", error);
      },
    },
    true,
  );

  const { refetch: fetchTickets } = useFetch(
    `${apiEndpoints.fetchMySupportTickets}?status=${statusFilter === "all" ? "" : statusFilter}&page=${pageIndex + 1}&limit=${pageSize}&search=${search}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTickets(data?.data || []);
          setTotalRecords(data?.pagination?.total || 0);
        }
        setIsLoadingTickets(false);
      },
      onError: (error) => {
        console.log("error in fetching tickets", error);
        toast.error(handleValidationError(error) || "Failed to fetch tickets");
        setIsLoadingTickets(false);
      },
    },
    false,
  );

  useEffect(() => {
    setIsLoadingTickets(true);
    fetchTickets();
  }, [statusFilter, pageIndex, pageSize, search]);

  const handlePageChange = ({ pageIndex: newPageIndex, pageSize: newPageSize }) => {
    setPageIndex(newPageIndex - 1);
    setPageSize(newPageSize);
  };

  const { post: createSupportTicket } = usePost(
    apiEndpoints.createSupportTicket,
    {
      onSuccess: (res) => {
        toast.success(res.message || "Support ticket created successfully");
        setFormData({
          serviceId: "",
          transactionId: "",
          supportDetails: "",
        });
        fetchTicketStats();
        fetchTickets();
      },
      onError: (error) => {
        console.error("Failed to add support ticket:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
  );

  const handleSubmit = () => {
    if (!formData.serviceId) {
      setErrors({ ...errors, serviceId: "Service is required" });
      return;
    }
    if (!formData.supportDetails.trim()) {
      setErrors({ ...errors, supportDetails: "Message is required" });
      return;
    }

    setErrors({});
    createSupportTicket(formData);
  };

  const tableColumns = [
    {
      header: "SR NO.",
      id: "srNo",
      center: true,
      className: "w-20",
      cell: ({ row, index }) => (
        <span className="text-[13px] font-semibold text-slate-600 font-sans tracking-tight">
          {pageIndex * pageSize + index + 1}
        </span>
      ),
    },
    {
      header: "TRANSACTION ID",
      accessorKey: "transactionId",
      cell: ({ row }) => (
        <span className="text-[13px] font-black text-[#7065e0] tracking-tight uppercase">
          {row.original.transactionId || "N/A"}
        </span>
      ),
    },
    {
      header: "SERVICE",
      accessorKey: "serviceName",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">
            {row.original.serviceName}
          </span>
        </div>
      ),
    },
    {
      header: "DATE",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-slate-500 whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      header: "STATUS",
      accessorKey: "status",
      center: true,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: "VIEW",
      id: "actions",
      center: true,
      cell: ({ row }) => 
        (
          <ActionButtons
            onView={() => handleOpenModal(row.original)}
            viewTitle='View Details'
          />

        )

      
    },
  ];

  const extraFilters = [
    {
      options: [
        { label: 'All Tickets', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Open', value: 'open' },
      ],
      value: statusFilter,
      onChange: (val) => setStatusFilter(val),
      placeholder: "Filter Status"
    }
  ];

  return (
    <PageLayout
      title="Support Center"
      subtitle="Having trouble with a transaction? Create a ticket for swift resolution."
      className="max-w-[1600px] mx-auto py-6"
    >
      <div className="space-y-8 px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Active Requests"
            value={supportTicketsStats.pending}
            bg="bg-gradient-to-tr from-white/90 to-amber-50/50"
            color="bg-amber-500"
            icon={Clock}
          />
          <StatCard
            label="Resolved Tickets"
            value={supportTicketsStats.resolved}
            bg="bg-gradient-to-tr from-white/90 to-emerald-50/50"
            color="bg-emerald-500"
            icon={CheckCircle2}
          />
          <StatCard
            label="Overall Tickets"
            value={supportTicketsStats.total}
            bg="bg-gradient-to-tr from-white/90 to-indigo-50/50"
            color="bg-indigo-600"
            icon={History}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Ticket Create Form */}
          <div className="xl:col-span-4">
            <BentoCard className="p-8 bg-white">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">New Support Ticket</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Submit a help request</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Problem Area</label>
                    <Select
                      error={errors.serviceId}
                      options={serviceList}
                      placeholder="Select Service / Category"
                      value={formData.serviceId}
                      onChange={(value) => {
                        setFormData({ ...formData, serviceId: value });
                        if (errors.serviceId) setErrors({ ...errors, serviceId: "" });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference ID (Skip if N/A)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#7065e0] transition-colors">
                        <Hash size={14} />
                      </div>
                      <input
                        type="text"
                        placeholder="TXN12345678"
                        className="w-full h-11 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-[#7065e0]/40 block pl-10 pr-4 transition-all outline-none"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Description</label>
                    <textarea
                      rows="4"
                      placeholder="Describe what went wrong in detail..."
                      className={cn(
                        "w-full bg-slate-50 border text-slate-800 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-[#7065e0]/40 block p-4 transition-all outline-none resize-none",
                        errors.supportDetails ? "border-rose-400" : "border-slate-200"
                      )}
                      value={formData.supportDetails}
                      onChange={(e) => {
                        setFormData({ ...formData, supportDetails: e.target.value });
                        if (errors.supportDetails) setErrors({ ...errors, supportDetails: "" });
                      }}
                    />
                    {errors.supportDetails && (
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-1 pl-1">
                        <AlertCircle size={10} /> {errors.supportDetails}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-14 bg-[#7065e0] hover:bg-[#5f54cc] text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group transition-all"
                >
                  Create Ticket
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-50" />
                </Button>
              </div>
            </BentoCard>
          </div>

          {/* Ticket Activity Logs Table */}
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center gap-3 px-1 mb-2">
              <div className="h-6 w-1.5 bg-[#7065e0] rounded-full" />
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Activity Hub</h2>
            </div>
            <DataTable
              columns={tableColumns}
              data={tickets}
              isLoading={isLoadingTickets}
              searchValue={search}
              searchChange={(e) => setSearch(e.target.value)}
              searchPlaceholder="Search by ID or service..."
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPaginationChange={handlePageChange}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              extraFilter={extraFilters}
              fileName="Support_Tickets"
            />
          </div>
        </div>
      </div>
      <TicketDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticketId={selectedTicketId}
      />
    </PageLayout>
  );
}
