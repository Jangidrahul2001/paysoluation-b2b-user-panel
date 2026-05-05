import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { apiEndpoints } from '../api/apiEndpoints';
import { capitalize, handleValidationError } from '../utils/helperFunction';
import { toast } from 'sonner';

const TermsOfService = () => {
    const [termsData, setTermsData] = useState(null);

    const { refetch: fetchPolicy } = useFetch(
        `${apiEndpoints.fetchPolicy}?type=terms`,
        {
            onSuccess: (data) => {
                if (data.success) {
                    setTermsData(data.data);
                    console.log(data.data, "policy data");
                }
            },
            onError: (error) => {
                console.log("error in getting Policy data ", error);
                toast.error(handleValidationError(error) || "Something went wrong");
            },
        },
        true,
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-0">
            <div className="max-w-3xl mx-auto">
                <Link to="/signup" className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-8 hover:gap-3 transition-all">
                    <ChevronLeft size={20} />
                    Back to Signup
                </Link>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100"
                >
                    <h1 className="text-4xl font-black text-slate-900 mb-8 border-b pb-6">{capitalize(termsData?.policyHeading) || "Terms of Service"}</h1>

                    <div
                        className="space-y-8 text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: termsData?.content }}
                    />
                </m.div>
            </div>
        </div>
    );
};

export default TermsOfService;
