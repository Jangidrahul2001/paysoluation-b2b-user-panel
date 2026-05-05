import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Receipt, Smartphone, Signal, Check, History } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { formatToINR } from "../utils/helperFunction";

export default function ReceiptModal({ title, date = new Date().toLocaleString("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}), subTitleLabel = "", subTitleValue = "", receiptData, onClose }) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          // Remove height restrictions temporarily for PDF generation
          const miniStatementContainer = element.querySelector('.mini-statement-container');
          const originalMaxHeight = miniStatementContainer?.style.maxHeight;
          const originalOverflow = miniStatementContainer?.style.overflow;

          if (miniStatementContainer) {
            miniStatementContainer.style.maxHeight = 'none';
            miniStatementContainer.style.overflow = 'visible';
          }

          await new Promise((resolve) => setTimeout(resolve, 500));

          const dataUrl = await toPng(element, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
            width: element.scrollWidth,
            height: element.scrollHeight,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left',
            },
            filter: (node) => {
              if (node.hasAttribute && (
                node.hasAttribute("data-html2canvas-ignore") ||
                node.getAttribute("data-html2canvas-ignore") === "true"
              )) {
                return false;
              }
              return true;
            },
          });

          // Restore original styles
          if (miniStatementContainer) {
            miniStatementContainer.style.maxHeight = originalMaxHeight || '';
            miniStatementContainer.style.overflow = originalOverflow || '';
          }

          const pdf = new jsPDF("p", "mm", "a4");
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const margin = 15;
          const contentWidth = pdfWidth - (margin * 2);
          const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

          // Check if content fits on one page
          if (contentHeight <= pdfHeight - (margin * 2)) {
            const y = (pdfHeight - contentHeight) / 2;
            pdf.addImage(dataUrl, "PNG", margin, y > margin ? y : margin, contentWidth, contentHeight);
          } else {
            // Content is too tall, fit to page height
            const scaledHeight = pdfHeight - (margin * 2);
            const scaledWidth = (imgProps.width * scaledHeight) / imgProps.height;
            const x = (pdfWidth - scaledWidth) / 2;
            pdf.addImage(dataUrl, "PNG", x > margin ? x : margin, margin, scaledWidth, scaledHeight);
          }

          pdf.save(`Receipt_${receiptData?.id || Date.now()}.pdf`);
        } catch (error) {
          console.error("PDF Generation Error:", error);
          throw error;
        } finally {
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-600/50 backdrop-blur-xs receipt-overlay"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[400px] my-auto">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-md"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              id="receipt-card-content"
              className="relative z-10 w-full drop-shadow-2xl rounded-t-3xl"
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
                    {title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-indigo-100 text-xs sm:text-sm font-semibold mt-1 opacity-90"
                  >
                    {date}
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
                      {subTitleLabel}
                    </p>
                    <p className="text-4xl sm:text-5xl font-black tracking-tighter drop-shadow-sm">
                      {subTitleValue}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Decorative Separator */}
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
                <div className="space-y-2 sm:space-y-3">
                  {Object.keys(receiptData || {}).map((key, index) => (
                    <React.Fragment key={index}>
                      {Array.isArray(receiptData?.[key]) && key === "miniStatement" ? (
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <History size={16} />
                            Mini Statement
                          </h4>
                          <div className="space-y-2 mini-statement-container max-h-48 overflow-y-auto">
                            {receiptData[key].map((transaction, txnIndex) => (
                              <div
                                key={txnIndex}
                                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-xs border border-slate-100"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-slate-700 mb-1">
                                    {transaction.date}
                                  </p>
                                  <p className="text-slate-500 text-xs mb-1">
                                    Type: {transaction.txnType}
                                  </p>
                                  <p className="text-slate-400 text-xs break-words">
                                    {transaction.narration}
                                  </p>
                                </div>
                                <div className="text-right ml-3">
                                  <p
                                    className={`${transaction.txnType === "Dr"
                                      ? "text-red-600"
                                      : "text-green-600"
                                      } font-bold text-sm`}
                                  >
                                    {transaction.txnType === "Dr" ? "- " : "+ "}
                                    {formatToINR(transaction.amount)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) :
                        key === "Status" || key === "status" ? (
                          <div className="flex justify-between items-center group py-1">
                            <span className="text-xs sm:text-sm font-medium text-slate-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`text-xs sm:text-sm font-bold ${receiptData[key] === "Transaction Successful" ? "text-green-600" : receiptData[key] === "Transaction Pending" ? "text-yellow-600" : "text-red-600"} font-mono break-all  text-right ml-4`}>
                              {receiptData[key]}
                            </span>
                          </div>
                        ) :
                          (
                            <div className="flex justify-between items-center group py-1">
                              <span className="text-xs sm:text-sm font-medium text-slate-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono break-all text-right ml-4">
                                {receiptData[key]}
                              </span>
                            </div>
                          )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Download Button */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
                  <button
                    onClick={downloadReceipt}
                    disabled={isDownloading}
                    className="w-full py-4 bg-[#7065e0] hover:bg-[#5f54cc] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl active:scale-[0.98] transition-all font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/20"
                    data-html2canvas-ignore="true"
                  >
                    <Download size={18} className="text-white" />
                    {isDownloading ? "Generating PDF..." : "Download Receipt PDF"}
                  </button>
                  <div className="text-center mt-3 sm:mt-4">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                      Powered by B2B Panel
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Edge */}
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
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
