import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
console.log('jsPDF export:', !!jsPDF);
console.log('autoTable export:', typeof autoTable);
console.log('autoTable on jsPDF instance:', typeof (new jsPDF()).autoTable);
