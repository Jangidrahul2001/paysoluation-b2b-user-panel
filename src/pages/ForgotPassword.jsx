import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { motion } from 'framer-motion';
import { emailRegex, formatEmailInput, handleValidationError } from '../utils/helperFunction';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      const msg = "Email is required";
      setError(msg);
      toast.error(msg);
      return false;
    } else if (!emailRegex.test(email)) {
      const msg = "Please enter a valid email address";
      setError(msg);
      toast.error(msg);
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setEmail(formatEmailInput(e.target.value));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setTimeout(() => {
        toast.success("Reset link sent!", {
          description: `If an account exists for ${email}, you will receive instructions shortly.`
        });
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-indigo-600 mb-6 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tightest uppercase">Reset Access</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
          Follow the instructions sent to your registered secure email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          label="Verification Email"
        
          name="email"
          placeholder="Enter registered email"
          value={email}
          onChange={handleChange}
          error={error}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50/50"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full h-12 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all transition-duration-500"
        >
          Send Recovery Link
        </Button>
      </form>

      <div className="text-center pt-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Found your keys? </span>
        <Link to="/login" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">Log in</Link>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
