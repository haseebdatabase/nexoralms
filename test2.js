import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
const doc = new jsPDF();
autoTable(doc, {
  head: [['Name', 'Email']],
  body: [['David', 'david@example.com']],
});
console.log('lastAutoTable:', !!doc.lastAutoTable);
