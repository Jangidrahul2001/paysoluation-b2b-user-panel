import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Search, ShieldCheck, UserCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { apiEndpoints } from "../api/apiEndpoints";
import { useFetch } from "../hooks/useFetch";
import { handleValidationError } from "../utils/helperFunction";
import { toast } from "sonner";
import { PageLayout } from "../components/layout/PageLayout";
import { useDispatch, useSelector } from "react-redux";
import NoPermission from "./NoPermission";
import StatusBadge from "../components/ui/StatusBadge";
import ClickToCopy from "../components/ui/ClickToCopy";



export default function Users() {
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const dispatch = useDispatch();
  const { data: profile, error: profileError } = useSelector((state) => state.profile);



  const {
    data,
    error,
    refetch: refetchUsers,
  } = useFetch(
    `${apiEndpoints.fetchUser}?page=${pageIndex}&limit=${pageSize}&search=${search}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setUserList(data.data || []);
          setTotalRecords(data?.pagination?.total || 0);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log("error in fetching user data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    refetchUsers();
  }, [pageIndex, pageSize, search]);

  const handlePageChange = ({ pageIndex: newPage, pageSize: newSize }) => {
    setPageIndex(newPage);
    setPageSize(newSize);
    setIsLoading(true);
  };

  const columns = [
    {
      header: "SR.NO.",
      accessorKey: "index",
      center: true,
      className: "w-16",
      cell: ({ row, index }) => <span className="text-slate-500 font-bold">  {(pageIndex - 1) * pageSize + index + 1}</span>,
    },
    {
      header: "IDENTITY",
      accessorKey: "userName",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[13px] text-slate-900 whitespace-nowrap">
              {row.original.firstName} {row.original.lastName}
            </span>
            {row.original.kycStatus === "approved" && (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-emerald-50" />
            )}
          </div>
          <ClickToCopy text={row.original.userName}>
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors">
              ( {row.original.userName} )
            </span>
          </ClickToCopy>
        </div>
      ),
    },
    {
      header: "CONTACT INFO",
      accessorKey: "email",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 items-center">
          <span className="text-[12px] font-semibold text-slate-600 whitespace-nowrap">{row.original.email}</span>
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{row.original.phone}</span>
        </div>
      )
    },
    {
      header: "ROLE / PKG",
      accessorKey: "roleName",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 items-center whitespace-nowrap">
          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-slate-200 uppercase tracking-tighter w-fit whitespace-nowrap">
            {row.original.roleName}
          </span>
          <span className="text-[11px] font-bold text-indigo-500/80 px-1 italic whitespace-nowrap">
            {row.original.packageName || "---"}
          </span>
        </div>
      ),
    },
    {
      header: "STATUS",
      accessorKey: "isActive",
      center: true,
      cell: ({ row }) => <div className="flex justify-center">
        <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />
      </div>,
    },
  ];

  const actions = (
    <Link to="/users/add">
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm px-4 py-2 h-10 flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wider">
        <Plus size={18} /> Add New Member
      </Button>
    </Link>
  );
  if (profile?.roleName === "RETAILER") return (<NoPermission nonService={true} />);
  return (
    <PageLayout
      title="Users"
      subtitle="Manage all your registered users and their permissions"
      actions={actions}
      className="max-w-[1600px] mx-auto py-4"
    >

      <DataTable
        searchPlaceholder="Search by name, email or mobile..."
        searchChange={(e) => setSearch(e.target.value)}
        columns={columns}
        data={userList}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        totalRecords={totalRecords}
        pageSize={pageSize}
        searchValue={search}
        onPaginationChange={handlePageChange}
        fileName="Users_List"
      />
    </PageLayout>
  );
}
