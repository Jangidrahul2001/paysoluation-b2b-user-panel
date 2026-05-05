import React from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { PageLayout } from "../components/layout/PageLayout";
import { ShieldAlert, Home, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const AddNewAccount = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="Settlement Setup"
      subtitle="Complete your profile to proceed with transactions"
      showBackButton={true}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 min-h-[calc(100vh-150px)] -mt-8 sm:-mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="w-full max-w-[340px] sm:max-w-lg relative flex items-center justify-center p-2"
        >
          {/* Lottie Container with Glass Design */}
          <div className="relative w-full backdrop-blur-sm rounded-[3rem] overflow-hidden flex items-center justify-center p-0 group">

            <DotLottieReact
              src="/Sign-up.json"
              loop
              autoplay
              className="w-full h-auto min-h-[250px] object-contain relative z-10 transition-transform duration-700 group-hover:scale-105"
              style={{ willChange: 'transform' }}
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
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight">
              Account <span className="text-rose-500">Required</span>
            </h2>
            <p className="text-slate-500 text-[11px] sm:text-sm font-bold max-w-[280px] sm:max-w-sm mx-auto leading-relaxed uppercase tracking-wider opacity-70">
              Your account lacks the necessary settlement bank details.
              Please add a bank account to enable AEPS transactions.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-4">
            <Button
              className="w-full sm:w-auto h-12 sm:h-14 px-10 gap-3 rounded-2xl bg-[#7065e0] hover:bg-[#5f54cc] text-white text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
              onClick={() => navigate('/account-whitelist')}
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Settlement Account
            </Button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default AddNewAccount;
