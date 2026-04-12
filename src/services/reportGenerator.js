import { jsPDF } from 'jspdf';
import autoTablePlugin from 'jspdf-autotable';

const applyAutoTable = (doc, options) => {
  try {
    if (typeof autoTablePlugin === 'function') {
      autoTablePlugin(doc, options);
    } else if (autoTablePlugin && typeof autoTablePlugin.default === 'function') {
      autoTablePlugin.default(doc, options);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(options);
    } else {
      throw new Error(`AutoTable not found. Plugin type: ${typeof autoTablePlugin}`);
    }
  } catch (err) {
    console.error("AutoTable Error:", err);
    doc.setTextColor(255, 0, 0);
    doc.text(`TABLE RENDER ERROR: ${err.message}`, 15, options.startY || 50);
    
    // Create a mock lastAutoTable so the rest of the document doesn't crash
    if (!doc.lastAutoTable) {
      doc.lastAutoTable = { finalY: (options.startY || 50) + 20 };
    }
  }
};

const getFinalY = (doc, fallback) => {
  if (doc.lastAutoTable && doc.lastAutoTable.finalY) return doc.lastAutoTable.finalY;
  if (doc.autoTable && doc.autoTable.previous && doc.autoTable.previous.finalY) return doc.autoTable.previous.finalY;
  return fallback;
};

export const generateStudentReport = (student, tasks = []) => {
  const doc = new jsPDF();
  const cyan = [6, 182, 212]; // #06b6d4
  const dark = [2, 6, 23];    // #020617

  // --- Header ---
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Fake Logo Icon (Mortarboard style)
  doc.setDrawColor(...cyan);
  doc.setLineWidth(1);
  doc.strokeRect(10, 10, 15, 15);
  doc.setFillColor(...cyan);
  doc.text('H/M', 11, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HM nexora', 30, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(...cyan);
  doc.text('OFFICIAL ACADEMIC SOLUTION', 30, 27);

  // --- Student Info Section ---
  doc.setTextColor(...dark);
  doc.setFontSize(16);
  doc.text('ACADEMIC PROGRESS REPORT', 10, 55);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(10, 58, 200, 58);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${student.name}`, 10, 70);
  doc.text(`VU ID: ${student.vuId}`, 10, 77);
  doc.text(`Contact: ${student.contactPrimary || 'N/A'}`, 10, 84);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 140, 70);

  // --- Tasks Table ---
  applyAutoTable(doc, {
    startY: 95,
    head: [['Subject', 'Activity Type', 'Deadline', 'Status']],
    body: tasks.map(t => [
      t.subject, 
      t.type, 
      new Date(t.deadline).toLocaleDateString(), 
      t.status.toUpperCase()
    ]),
    headStyles: { fillStyle: 'F', fillColor: cyan, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // --- Financial Summary ---
  const finalY = getFinalY(doc, 130) + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Overview', 10, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Agreed Fee: $${student.feeTotal || 0}`, 10, finalY + 10);
  
  const paid = student.feeDetails?.installments?.filter(i => i.status === 'paid').reduce((a, b) => a + parseFloat(b.amount), 0) || 0;
  const pending = (student.feeTotal || 0) - paid;

  doc.text(`Collected Revenue: $${paid}`, 10, finalY + 17);
  doc.setTextColor(200, 0, 0);
  doc.text(`Outstanding Balance: $${pending}`, 10, finalY + 24);

  // --- Footer ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.text("by It's Mughal - Elite Handler Edition", 10, pageHeight - 15);
  
  doc.setTextColor(...cyan);
  doc.setFont('helvetica', 'bold');
  doc.text('www.hmnexora.tech', 160, pageHeight - 15);

  doc.save(`ProgressReport_${student.vuId}.pdf`);
};

export const generateInvoice = (student, installment) => {
  const doc = new jsPDF();
  const cyan = [6, 182, 212];
  
  // Similar branding but focused on a single payment
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('OFFICIAL INVOICE', 10, 20);
  doc.setFontSize(10);
  doc.text('HM nexora - Academic Solutions', 150, 20);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Student: ${student.name}`, 10, 50);
  doc.text(`VU ID: ${student.vuId}`, 10, 57);
  
  applyAutoTable(doc, {
    startY: 70,
    head: [['Description', 'Amount', 'Status', 'Date']],
    body: [[
      `Installment Payment`, 
      `$${installment.amount}`, 
      installment.status.toUpperCase(), 
      installment.paidAt ? new Date(installment.paidAt).toLocaleDateString() : 'PENDING'
    ]],
    headStyles: { fillColor: cyan },
  });

  doc.text('Thank you for choosing HM nexora.', 10, getFinalY(doc, 100) + 20);
  doc.save(`Invoice_${student.vuId}_${new Date().getTime()}.pdf`);
};

export const generateVoucher = (student, installment, index) => {
  const doc = new jsPDF();
  const cyan = [6, 182, 212]; // #06b6d4
  const dark = [2, 6, 23];    // #020617

  // --- Background Design ---
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 60, 'F');
  
  // Header Logo/Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('HM nexora', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(...cyan);
  doc.text('OFFICIAL PAYMENT VOUCHER - ADMISSIONS & FINANCE', 20, 40);
  doc.text('ELITE ACADEMIC HANDLER EDITION', 20, 45);

  // Voucher Details Box
  doc.setDrawColor(...cyan);
  doc.setLineWidth(0.5);
  doc.roundedRect(120, 15, 75, 30, 3, 3, 'S');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('VOUCHER NO:', 125, 25);
  doc.setFontSize(12);
  doc.text(`HM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, 125, 32);
  doc.setFontSize(8);
  doc.text('DATE:', 125, 40);
  doc.text(new Date().toLocaleDateString(), 145, 40);

  // --- Student & Payment Section ---
  doc.setTextColor(...dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT INFORMATION', 20, 75);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 78, 190, 78);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student.name}`, 25, 90);
  doc.text(`VU ID: ${student.vuId}`, 25, 98);
  doc.text(`Installment No: #${index + 1}`, 25, 106);

  // --- Payment Table ---
  applyAutoTable(doc, {
    startY: 115,
    margin: { left: 20, right: 20 },
    head: [['Description', 'Amount (USD)', 'Status']],
    body: [[
      `Monthly Installment Payment (Cycle #${index + 1})`, 
      `$${installment.amount}`, 
      installment.status.toUpperCase()
    ]],
    headStyles: { fillColor: cyan, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 8 },
  });

  // --- Instructions & Bank Details ---
  const finalY = getFinalY(doc, 150) + 15;
  
  doc.setFillColor(245, 250, 255);
  doc.rect(20, finalY, 170, 50, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cyan);
  doc.setFontSize(10);
  doc.text('OFFICIAL PAYMENT INSTRUCTIONS:', 25, finalY + 10);
  
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('1. Transfer the exact amount to any of the following accounts:', 25, finalY + 20);
  
  // The provided payment details
  doc.setFont('helvetica', 'bold');
  doc.text('Account Number: 03037180123', 30, finalY + 28);
  doc.text('Account Name: haseeb ullah', 30, finalY + 34);
  doc.text('Available via: JazzCash | EasyPaisa | SadaPay', 30, finalY + 40);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('*Please share a screenshot of the transfer receipt with your handler once completed.', 25, finalY + 46);

  // --- Verification Area ---
  doc.setDrawColor(230, 230, 230);
  doc.line(30, finalY + 80, 80, finalY + 80);
  doc.text('Handler Signature', 35, finalY + 85);
  
  doc.line(130, finalY + 80, 180, finalY + 80);
  doc.text('Student Signature', 135, finalY + 85);

  // --- Footer ---
  try {
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.text("It's Mughal - Nexora LMS Elite Handler Signature", 20, pageHeight - 15);
    
    doc.setTextColor(...cyan);
    doc.setFont('helvetica', 'bold');
    doc.text('www.hmnexora.tech', 160, pageHeight - 15);

    doc.save(`Voucher_${student.vuId}_Inst${index + 1}.pdf`);
  } catch (err) {
    console.error("CRITICAL PDF RENDER ERROR:", err);
    throw err;
  }
};
