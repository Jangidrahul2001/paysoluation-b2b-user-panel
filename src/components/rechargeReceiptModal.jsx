import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Receipt, Smartphone, Signal, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";



export default function ReceiptModal({ receiptData, onClose }) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    if (receiptData) {
      // Load confetti from CDN since we can't install locally in this environment
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
      script.async = true;
      script.onload = () => {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          zIndex: 9999, // Ensure it's above everything
        };

        function fire(particleRatio, opts) {
          window.confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [receiptData]);

  const downloadReceipt = async () => {
    if (isDownloading) return;

    const element = document.getElementById("receipt-card-content");
    if (!element) {
      toast.error("Receipt element not found");
      return;
    }

    toast.promise(
      async () => {
        setIsDownloading(true);
        try {
          // Wait a bit for animations to settle
          await new Promise((resolve) => setTimeout(resolve, 300));

          const dataUrl = await toPng(element, {
            quality: 1,
            pixelRatio: 3, // High quality capture
            backgroundColor: "#ffffff",
            filter: (node) => {
              // Hide elements that shouldn't be in the PDF
              if (node.hasAttribute && (
                node.hasAttribute("data-html2canvas-ignore") || 
                node.getAttribute("data-html2canvas-ignore") === "true"
              )) {
                return false;
              }
              return true;
            },
          });

          const pdf = new jsPDF("p", "mm", "a4");
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          
          // Margin and content size calculation
          const margin = 20;
          const contentWidth = pdfWidth - (margin * 2);
          const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

          // Center the content on the page
          const x = margin;
          const y = (pdf.internal.pageSize.getHeight() - contentHeight) / 2;

          pdf.addImage(dataUrl, "PNG", x, y > margin ? y : margin, contentWidth, contentHeight);
          pdf.save(`Receipt_${receiptData?.id || "Transaction"}.pdf`);
        } catch (error) {
          console.error("PDF Generation Error:", error);
          throw error;
        } finally {
          // Cooldown to prevent multiple downloads 
          setTimeout(() => setIsDownloading(false), 2000);
        }
      },
      {
        loading: "Generating Receipt PDF...",
        success: "Receipt Downloaded Successfully",
        error: (err) => `Failed to generate PDF: ${err.message || "Unknown error"}`,
      }
    );
  };


  return createPortal(
    <AnimatePresence>
      {receiptData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs receipt-overlay overflow-y-auto"
        >
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[400px] my-auto">
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-md"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                id="receipt-card-content"
                className="w-full drop-shadow-2xl rounded-t-3xl relative"
              >
                <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600/10 rounded-full blur-xl -ml-4 sm:-ml-5 -mb-4 sm:-mb-5" />

                  <div className="relative z-10 text-center flex flex-col items-center pt-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{
                        scale: 1,
                        boxShadow: [
                          "0 0 0 0px rgba(255, 255, 255, 0.3)",
                          "0 0 0 20px rgba(255, 255, 255, 0)",
                        ],
                      }}
                      transition={{
                        scale: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.1,
                        },
                        boxShadow: { repeat: Infinity, duration: 2 },
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 sm:mb-6 ring-4 ring-white/30 shadow-2xl"
                    >
                      <Check
                        size={32}
                        strokeWidth={5}
                        className="text-white drop-shadow-lg sm:w-10 sm:h-10"
                      />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm"
                    >
                      Payment Success!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-indigo-100 text-xs sm:text-sm font-semibold mt-1 opacity-90"
                    >
                      {receiptData.date}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="mt-6 sm:mt-8 mb-2"
                    >
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                        Total Amount
                      </p>
                      <p className="text-4xl sm:text-5xl font-black tracking-tighter drop-shadow-sm">
                        ₹{receiptData.amount}
                      </p>
                    </motion.div>
                  </div>
                </div>

                <div className="relative h-6 w-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-white"
                    style={{
                      maskImage:
                        "radial-gradient(circle at 0 50%, transparent 12px, black 12.5px), radial-gradient(circle at 100% 50%, transparent 12px, black 12.5px)",
                      WebkitMaskImage:
                        "radial-gradient(circle at 0 50%, transparent 12px, black 12.5px), radial-gradient(circle at 100% 50%, transparent 12px, black 12.5px)",
                      maskComposite: "intersect",
                      WebkitMaskComposite: "destination-in",
                    }}
                  >
                    <div className="absolute top-1/2 left-4 right-4 sm:left-6 sm:right-6 border-t-2 border-dashed border-slate-200"></div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 md:p-8 pt-4">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="p-1.5 sm:p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors"
                          data-html2canvas-ignore="true"
                        >
                          <Receipt size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-500">
                          Transaction ID
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono break-all">
                        {receiptData.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="p-1.5 sm:p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors"
                          data-html2canvas-ignore="true"
                        >
                          <Smartphone size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-500">
                          Mobile Number
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        +91 {receiptData.number}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="p-1.5 sm:p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors"
                          data-html2canvas-ignore="true"
                        >
                          <Signal size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-500">
                          Operator
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {receiptData.operator}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
                    <button
                      onClick={downloadReceipt}
                      disabled={isDownloading}
                      className="w-full py-4 bg-[#7065e0] hover:bg-[#5f54cc] text-white rounded-2xl active:scale-[0.98] transition-all font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                      data-html2canvas-ignore
                    >
                      <Download size={18} className="text-white" /> 
                      Download Receipt PDF
                    </button>
                    <div className="text-center mt-3 sm:mt-4">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                        Powered by B2B Panel
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative h-5 w-full -mt-0.5 overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 10px 20px, transparent 10px, white 10.5px)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "left bottom",
                      backgroundRepeat: "repeat-x",
                    }}
                  />
                </div>
              </motion.div>
            </div>

        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

}
