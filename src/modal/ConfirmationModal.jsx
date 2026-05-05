import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/ui/Button"
import { AlertCircleIcon } from "lucide-react";

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, description, children, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm"
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <AlertCircleIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                                    {children}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <Button 
                                    variant="outline" 
                                    onClick={onClose}
                                    className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
                                >
                                    {cancelText}
                                </Button>
                                <Button 
                                    onClick={() => {
                                        onConfirm()
                                        onClose()
                                    }}
                                    className={`
                                        text-white rounded-xl shadow-lg shadow-black/5
                                        ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                                    `}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
