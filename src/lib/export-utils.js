import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

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
    toast.success("PDF downloaded successfully");
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
    toast.success("Excel downloaded successfully");
  } catch (error) {
    console.error("Excel Export Error:", error);
    toast.error("Failed to generate Excel file");
  }
};

/**
 * Copies data to clipboard as TSV with a concise fallback for non-secure contexts
 * @param {Array|string} data - Array of objects or a simple string
 * @param {string} msg - Success message
 */
export const copyToClipboard = async (data, msg = "Data copied to clipboard") => {
  const text = Array.isArray(data) 
    ? [Object.keys(data[0]).join("\t"), ...data.map(r => Object.values(r).join("\t"))].join("\n")
    : data;

  try {
    await navigator.clipboard.writeText(text);
    toast.success(msg);
  } catch (err) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toast.success(msg);
  }
};
