import React from 'react';
import { Clock, Fingerprint, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageLayout } from '../../components/layout/PageLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/profileSlice';
import { checkAssignedService, rejectRequest } from '../../utils/helperFunction';
import NoPermission from '../NoPermission';
import RejectedRequest from '../RejectedRequest';

const Aeps2Pending = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.profile);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleCheckStatus = () => {
    dispatch(fetchProfile());
  };

    if (loading || !profile) {
      return null; 
  }
   if (rejectRequest("aeps2", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps2" />)
    if (!checkAssignedService("aeps", "aeps2", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps2"  />)

  return (
    <PageLayout
      title="AEPS Activation"
      subtitle="Track your AEPS service activation status"
      showBackButton={true}
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <Card className="p-8 md:p-12 text-center border-none shadow-sm bg-white">
          {/* Status Icon */}
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Activation Under Review</h2>
          <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm mx-auto">
            Your AEPS activation request is being processed. Our team is verifying your documents and biometric data.
          </p>

          <div className="flex flex-col items-center gap-4 py-6 border-y border-slate-50 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Status</span>
              <StatusBadge status="PENDING" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              Estimated Time: 24 - 48 Working Hours
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px] h-11 font-bold rounded-xl flex gap-2"
              onClick={handleCheckStatus}
              isLoading={loading}
            >
              {!loading && <RefreshCw className="w-4 h-4" />}
              {loading ? "Checking..." : "Refresh Status"}
            </Button>
            
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 min-w-[160px] h-11 font-bold rounded-xl flex gap-2"
              onClick={handleGoToDashboard}
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </div>
        </Card>

        {/* Info Note */}
        <div className="bg-indigo-50/50 rounded-[1.5rem] p-6 border border-indigo-100/50 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">NPCI Verification</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We are currently at the final stage of NPCI data synchronisation. Once approved, you will be able to perform cash withdrawals and balance enquiries.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Aeps2Pending;

