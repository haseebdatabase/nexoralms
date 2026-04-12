import { generateVoucher } from './src/services/reportGenerator.js';
const student = { name: "Test User", vuId: "BC123", contactPrimary: "123", feeTotal: 100, feeDetails: { installments: []} };
const installment = { amount: 50, status: "pending"};
try {
  generateVoucher(student, installment, 0);
  console.log("Success");
} catch (e) {
  console.error("Error generating voucher:", e);
}
