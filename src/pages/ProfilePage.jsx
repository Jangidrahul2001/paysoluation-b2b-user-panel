import React, { useState } from "react";
import { m } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Briefcase,
  Camera,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/Button";
import ChangePassword from "../modal/ChangePassword";
import { ServiceLabel } from "../utils/helperFunction";


export default function Profile() {
  const { data: profile, loading } = useSelector((state) => state.profile);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);


  const handleChangePassword = () => {
    setIsChangePasswordOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans py-4 max-w-[1400px] mx-auto min-h-screen px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account information
          </p>
        </div>
        <Button
          onClick={handleChangePassword}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 font-semibold flex items-center gap-2"
        >
          <Key className="w-4 h-4" />
          Change Password
        </Button>
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-[2rem] p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm">
              <img
                src={`https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=fff&color=6366f1&size=200`}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <div className="flex items-center gap-2 text-white/90">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              <div className="flex items-center gap-2 text-white/90">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">
                {profile.roleName || "User"}
              </span>
            </div>
          </div>
        </div>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Full Name</p>
              <p className="text-base font-bold text-slate-800">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Email</p>
              <p className="text-base font-bold text-slate-800">
                {profile.email}
              </p>
            </div>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Phone</p>
              <p className="text-base font-bold text-slate-800">
                {profile.phone}
              </p>
            </div>
          </div>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Assigned Services
            </h3>
            <p className="text-xs text-slate-500">
              Services available to your account
            </p>
          </div>
        </div>
 <div className="flex flex-wrap gap-2">
  {profile?.assignedServices && profile?.assignedServices?.length > 0 ? (
    profile?.assignedServices?.map((service, index) => (
      <m.div
        key={service.serviceId || index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 + index * 0.05 }}
        className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-200 hover:shadow-md transition-shadow"
      >
        <div className="font-semibold mb-1">
          {ServiceLabel(service.name) }
        </div>
        <ul className="text-xs text-orange-600 list-disc list-inside">
          {service.pipelineCodes?.map((code, codeIndex) => (
            <li key={codeIndex}>{code}</li>
          ))}
        </ul>
      </m.div>
    ))
  ) : (
    <span className="text-sm text-slate-500">
      No services assigned yet
    </span>
  )}
</div>



      </m.div>

      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
