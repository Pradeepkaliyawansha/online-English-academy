import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Function to export data to PDF using jsPDF
export const exportToPDF = (data, filename, columns, title = 'Report') => {
  const doc = new jsPDF();
  
  // Add the title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Create the table
  doc.autoTable({
    startY: 40,
    head: [columns.map(col => col.charAt(0).toUpperCase() + col.slice(1))],
    body: data.map(item => columns.map(col => item[col])),
    theme: 'striped',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 3,
      fontSize: 10
    },
    margin: { top: 40 }
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

// Function to export data to CSV
export const exportToCSV = (data, filename) => {
  // Create CSV header from first object keys
  const headers = Object.keys(data[0]);
  
  // Create CSV rows from data
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      // Handle values that contain commas by wrapping in quotes
      const value = row[header];
      return `"${value}"`;
    });
    csvContent += values.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
