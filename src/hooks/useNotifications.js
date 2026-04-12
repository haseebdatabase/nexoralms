import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useStudents } from './useStudents';

export const useNotifications = () => {
  const { tasks } = useTasks();
  const { students } = useStudents();

  const alerts = useMemo(() => {
    const generatedAlerts = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Academic Scans (Tasks)
    tasks.forEach(task => {
      if (task.status === 'pending' && task.deadline) {
        if (task.deadline < today) {
          generatedAlerts.push({
            id: `task-ov-${task.id}`,
            type: 'academic_overdue',
            severity: 'critical',
            title: `OVERDUE: ${task.type} for ${task.subject}`,
            message: `Task for ${task.studentName || 'Student'} passed its deadline (${task.deadline}).`,
            actionLink: '/tracker',
            createdAt: new Date().toISOString()
          });
        } else if (task.deadline === today) {
          generatedAlerts.push({
            id: `task-due-${task.id}`,
            type: 'academic_due',
            severity: 'warning',
            title: `DUE TODAY: ${task.type} for ${task.subject}`,
            message: `Task for ${task.studentName || 'Student'} must be completed by EOD.`,
            actionLink: '/tracker',
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    // 2. Financial Scans (Revenue)
    students.forEach(student => {
      student.feeDetails?.installments?.forEach((inst, idx) => {
        if (inst.status === 'pending_verification') {
          generatedAlerts.push({
            id: `fee-verify-${student.id}-${idx}`,
            type: 'finance_verification',
            severity: 'info',
            title: `Pending Receipt: ${student.name}`,
            message: `${student.name} submitted a receipt via ${inst.receipt?.paymentMethod || 'Portal'}. Awaiting your verification.`,
            actionLink: '/revenue',
            createdAt: inst.receipt?.submittedAt || new Date().toISOString()
          });
        } else if (inst.status === 'unpaid' && inst.dueDate) {
          if (inst.dueDate < today) {
            generatedAlerts.push({
              id: `fee-ov-${student.id}-${idx}`,
              type: 'finance_overdue',
              severity: 'critical',
              title: `FEE OVERDUE: ${student.name}`,
              message: `Installment #${idx + 1} for $${inst.amount} was due on ${inst.dueDate}.`,
              actionLink: '/revenue',
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    });

    // Sort by severity (critical > warning > info)
    const severityWeight = { critical: 3, warning: 2, info: 1 };
    return generatedAlerts.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  }, [tasks, students]);

  return { alerts, criticalCount: alerts.filter(a => a.severity === 'critical').length };
};
