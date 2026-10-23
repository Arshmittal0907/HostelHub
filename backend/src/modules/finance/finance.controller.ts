import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { ChargeStatus, PaymentMethod, FineStatus, AppealStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  isMandatory: z.boolean().default(true),
});

const createChargeSchema = z.object({
  studentId: z.string().uuid(),
  hostelId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  dueDate: z.string(), // ISO date
  description: z.string().optional(),
});

const makePaymentSchema = z.object({
  chargeId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['ONLINE', 'CASH', 'CHEQUE', 'BANK_TRANSFER']).default('ONLINE'),
  transactionReference: z.string().optional(),
});

const issueFineSchema = z.object({
  studentId: z.string().uuid(),
  hostelId: z.string().uuid(),
  reason: z.string().min(5),
  amount: z.number().positive(),
  dueDate: z.string(),
});

const appealFineSchema = z.object({
  fineId: z.string().uuid(),
  reason: z.string().min(10),
});

const reviewAppealSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
});

export async function listFeeCategories(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;
  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const categories = await prisma.feeCategory.findMany({
    where: { collegeId },
    include: { structures: true },
  });

  res.json({ success: true, count: categories.length, data: categories });
}

export async function createFeeCategory(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;
  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const data = createCategorySchema.parse(req.body);

  const category = await prisma.feeCategory.create({
    data: {
      collegeId,
      name: data.name,
      description: data.description,
      isMandatory: data.isMandatory,
    },
  });

  res.status(201).json({ success: true, message: 'Fee category created.', data: category });
}

export async function createStudentCharge(req: Request, res: Response): Promise<void> {
  const data = createChargeSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const charge = await prisma.studentCharge.create({
    data: {
      studentId: data.studentId,
      collegeId,
      hostelId: data.hostelId,
      categoryId: data.categoryId,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      description: data.description,
      createdById: req.user!.id,
      status: ChargeStatus.PENDING,
    },
    include: {
      category: true,
      student: { include: { user: { select: { fullName: true } } } },
    },
  });

  await logAuditEvent(req, 'CREATE_STUDENT_CHARGE', 'StudentCharge', charge.id, {
    studentId: data.studentId,
    amount: data.amount,
    category: charge.category.name,
  });

  res.status(201).json({ success: true, message: 'Fee charge created for student.', data: charge });
}

export async function recordPayment(req: Request, res: Response): Promise<void> {
  const data = makePaymentSchema.parse(req.body);

  const charge = await prisma.studentCharge.findUnique({
    where: { id: data.chargeId },
    include: { student: true },
  });

  if (!charge) {
    res.status(404).json({ success: false, message: 'Fee charge record not found.' });
    return;
  }

  if (charge.status === ChargeStatus.PAID) {
    res.status(400).json({ success: false, message: 'This charge has already been paid in full.' });
    return;
  }

  // Student ownership check
  if (req.user!.role === Role.STUDENT && req.user!.id !== charge.student.userId) {
    res.status(403).json({ success: false, message: 'Access denied. You cannot pay another student charges.' });
    return;
  }

  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const txnRef = data.transactionReference || `TXN-ONL-${Date.now()}`;

  const payment = await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.create({
      data: {
        chargeId: charge.id,
        studentId: charge.studentId,
        collegeId: charge.collegeId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as PaymentMethod,
        transactionReference: txnRef,
        receiptNumber,
        isVerified: true,
      },
    });

    await tx.studentCharge.update({
      where: { id: charge.id },
      data: { status: ChargeStatus.PAID },
    });

    await tx.notification.create({
      data: {
        userId: charge.student.userId,
        title: 'Payment Successful',
        message: `Payment of ₹${data.amount} received. Receipt Number: ${receiptNumber}`,
        type: 'SUCCESS',
        link: '/student/fees',
      },
    });

    return pay;
  });

  await logAuditEvent(req, 'RECORD_PAYMENT', 'Payment', payment.id, {
    chargeId: charge.id,
    amount: data.amount,
    receiptNumber,
  });

  res.status(201).json({
    success: true,
    message: 'Payment verified and recorded successfully. Receipt issued.',
    data: payment,
  });
}

export async function getStudentFees(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can view my fees.' });
    return;
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const charges = await prisma.studentCharge.findMany({
    where: { studentId: student.id },
    include: {
      category: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const fines = await prisma.fine.findMany({
    where: { studentId: student.id },
    include: {
      appeals: true,
      issuedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = charges.filter((c) => c.status === ChargeStatus.PAID).reduce((sum, c) => sum + c.amount, 0);
  const totalPending = totalCharges - totalPaid;

  res.json({
    success: true,
    summary: {
      totalCharges,
      totalPaid,
      totalPending,
      finesCount: fines.length,
    },
    charges,
    fines,
  });
}

export async function listHostelFinance(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const charges = await prisma.studentCharge.findMany({
    where: { hostelId },
    include: {
      category: true,
      student: { include: { user: { select: { fullName: true, email: true } } } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const fines = await prisma.fine.findMany({
    where: { hostelId },
    include: {
      student: { include: { user: { select: { fullName: true, email: true } } } },
      appeals: true,
      issuedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, charges, fines });
}

export async function issueFine(req: Request, res: Response): Promise<void> {
  const data = issueFineSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const fine = await prisma.fine.create({
    data: {
      studentId: data.studentId,
      collegeId,
      hostelId: data.hostelId,
      reason: data.reason,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      issuedById: req.user!.id,
      status: FineStatus.ISSUED,
    },
    include: {
      student: { include: { user: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: fine.student.userId,
      title: 'Disciplinary Fine Issued',
      message: `Fine of ₹${data.amount} issued for '${data.reason}'. You may submit an appeal within 7 days.`,
      type: 'ALERT',
      link: '/student/rules-fines',
    },
  });

  await logAuditEvent(req, 'ISSUE_FINE', 'Fine', fine.id, {
    studentId: data.studentId,
    amount: data.amount,
    reason: data.reason,
  });

  res.status(201).json({ success: true, message: 'Fine issued to student.', data: fine });
}

export async function appealFine(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can appeal fines.' });
    return;
  }

  const { fineId, reason } = appealFineSchema.parse(req.body);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const fine = await prisma.fine.findUnique({
    where: { id: fineId },
  });

  if (!fine || fine.studentId !== student.id) {
    res.status(404).json({ success: false, message: 'Fine not found or does not belong to you.' });
    return;
  }

  const appeal = await prisma.$transaction(async (tx) => {
    const app = await tx.fineAppeal.create({
      data: {
        fineId,
        studentId: student.id,
        reason,
        status: AppealStatus.PENDING,
      },
    });

    await tx.fine.update({
      where: { id: fineId },
      data: { status: FineStatus.APPEALED },
    });

    return app;
  });

  res.status(201).json({
    success: true,
    message: 'Fine appeal submitted to Warden for review.',
    data: appeal,
  });
}

export async function reviewAppeal(req: Request, res: Response): Promise<void> {
  const appealId = String(req.params.appealId);
  const { decision, comments } = reviewAppealSchema.parse(req.body);

  const appeal = await prisma.fineAppeal.findUnique({
    where: { id: appealId },
    include: { fine: true, student: { include: { user: true } } },
  });

  if (!appeal) {
    res.status(404).json({ success: false, message: 'Appeal not found.' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.fineAppeal.update({
      where: { id: appealId },
      data: {
        status: decision === 'APPROVED' ? AppealStatus.APPROVED : AppealStatus.REJECTED,
        reviewedById: req.user!.id,
        reviewedAt: new Date(),
        reviewerComments: comments,
      },
    });

    if (decision === 'APPROVED') {
      await tx.fine.update({
        where: { id: appeal.fineId },
        data: { status: FineStatus.WAIVED },
      });
    }

    await tx.notification.create({
      data: {
        userId: appeal.student.userId,
        title: `Fine Appeal ${decision}`,
        message: decision === 'APPROVED'
          ? 'Your fine appeal was APPROVED. The fine amount has been WAIVED.'
          : `Your fine appeal was REJECTED: ${comments || 'Warden decision upheld.'}`,
        type: decision === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        link: '/student/rules-fines',
      },
    });
  });

  res.json({ success: true, message: `Appeal review recorded as ${decision}.` });
}
