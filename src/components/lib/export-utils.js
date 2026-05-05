import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { showActionToast } from "../ui/action-toast";

/**
 * Exports data to PDF using jspdf and jspdf-autotable
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions ({ header: string, accessorKey: string })
 * @param {string} title - Title of the PDF document
 */
export const exportToPDF = (data, columns, title = "Export") => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Filter out columns that shouldn't be in export (like actions)
    const exportColumns = columns.filter(col => col.header !== "ACTIONS" && col.id !== "actions");
    
    const tableHeaders = exportColumns.map(col => col.header);
    const tableData = data.map(row => 
      exportColumns.map(col => {
          const val = row[col.accessorKey];
          return val !== undefined && val !== null ? String(val) : "";
      })
    );

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }, // Dark slate
      styles: { fontSize: 8 }
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_export.pdf`);
    showActionToast("PDF has been saved to your device", "pdf");
  } catch (error) {
    console.error("PDF Export Error:", error);
    toast.error("Failed to generate PDF");
  }
};

/**
 * Exports data to Excel
 * @param {Array} data - Array of objects
 * @param {string} fileName - Name of the output file
 */
export const exportToExcel = (data, fileName = "export") => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, `${fileName}.xlsx`);
    showActionToast("Excel file saved successfully", "excel");
  } catch (error) {
    console.error("Excel Export Error:", error);
    toast.error("Failed to generate Excel file");
  }
};

/**
 * Copies data to clipboard as TSV
 * @param {Array} data - Array of objects
 */
export const copyToClipboard = (data) => {
  try {
    if (!data || data.length === 0) {
        toast.info("No data to copy");
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    const tsv = [
        headers.join("\t"),
        ...data.map(row => headers.map(fieldName => row[fieldName]).join("\t"))
    ].join("\n");

    // Secure Context (HTTPS/Localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tsv).then(() => {
             showActionToast("Table data copied to clipboard", "copy");
        }).catch(error => {
             console.error("Async Copy Error:", error);
             fallbackCopy(tsv);
        });
    } else {
        // Fallback for HTTP/insecure contexts
        fallbackCopy(tsv);
    }
  } catch (error) {
      console.error("Copy Error:", error);
      toast.error("Failed to copy data");
  }
};

const fallbackCopy = (text) => {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Ensure textarea is not visible but part of DOM
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if(successful) {
            showActionToast("Table data copied to clipboard", "copy");
        } else {
             toast.error("Clipboard access denied");
        }
    } catch (error) {
        console.error("Fallback Copy Error:", error);
        toast.error("Failed to copy data");
    }
};
