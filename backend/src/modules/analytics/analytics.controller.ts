import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { BedStatus, StudentStatus, ComplaintStatus, LeaveStatus, ChargeStatus, Role } from '@prisma/client';

export async function getWardenDashboardAnalytics(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;
  const collegeId = req.collegeId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  // 1. Bed Occupancy
  const beds = await prisma.bed.findMany({
    where: { room: { hostelId } },
    select: { status: true },
  });

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === BedStatus.OCCUPIED).length;
  const availableBeds = beds.filter((b) => b.status === BedStatus.AVAILABLE).length;
  const maintenanceBeds = beds.filter((b) => b.status === BedStatus.MAINTENANCE || b.status === BedStatus.BLOCKED).length;
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // 2. Pending Actions
  const pendingApprovals = await prisma.studentProfile.count({
    where: { hostelId, status: StudentStatus.PENDING_APPROVAL },
  });

  const openComplaints = await prisma.complaint.count({
    where: {
      hostelId,
      status: { in: [ComplaintStatus.SUBMITTED, ComplaintStatus.ACKNOWLEDGED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.REOPENED] },
    },
  });

  const now = new Date();
  const overdueComplaints = await prisma.complaint.count({
    where: {
      hostelId,
      status: { in: [ComplaintStatus.SUBMITTED, ComplaintStatus.ACKNOWLEDGED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.REOPENED] },
      slaDeadline: { lt: now },
    },
  });

  const pendingLeaves = await prisma.leaveRequest.count({
    where: { hostelId, status: LeaveStatus.PENDING },
  });

  // 3. Finance Metrics
  const charges = await prisma.studentCharge.findMany({
    where: { hostelId },
    select: { amount: true, status: true },
  });

  const totalBilled = charges.reduce((sum, c) => sum + c.amount, 0);
  const totalCollected = charges.filter((c) => c.status === ChargeStatus.PAID).reduce((sum, c) => sum + c.amount, 0);
  const totalOutstanding = totalBilled - totalCollected;

  // 4. Complaints by Category
  const complaints = await prisma.complaint.findMany({
    where: { hostelId },
    select: { category: true, urgency: true, status: true },
  });

  const complaintsByCategory: Record<string, number> = {};
  complaints.forEach((c) => {
    complaintsByCategory[c.category] = (complaintsByCategory[c.category] || 0) + 1;
  });

  const complaintsChartData = Object.entries(complaintsByCategory).map(([category, count]) => ({
    category,
    count,
  }));

  // 5. Attendance Trend (Last 7 Sessions)
  const sessions = await prisma.attendanceSession.findMany({
    where: { hostelId },
    include: { records: true },
    orderBy: { date: 'desc' },
    take: 7,
  });

  const attendanceTrend = sessions.reverse().map((s) => {
    const total = s.records.length;
    const present = s.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    return {
      date: s.date.toISOString().split('T')[0],
      sessionType: s.sessionType,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      totalStudents: total,
    };
  });

  res.json({
    success: true,
    data: {
      summary: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        occupancyPercentage,
        pendingApprovals,
        openComplaints,
        overdueComplaints,
        pendingLeaves,
        totalBilled,
        totalCollected,
        totalOutstanding,
      },
      charts: {
        complaintsByCategory: complaintsChartData,
        attendanceTrend,
        occupancyBreakdown: [
          { name: 'Occupied', value: occupiedBeds },
          { name: 'Available', value: availableBeds },
          { name: 'Maintenance', value: maintenanceBeds },
        ],
      },
    },
  });
}

export async function getAdminPlatformAnalytics(req: Request, res: Response): Promise<void> {
  const [totalColleges, approvedColleges, pendingColleges, rejectedColleges] = await Promise.all([
    prisma.college.count(),
    prisma.college.count({ where: { status: 'APPROVED' } }),
    prisma.college.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.college.count({ where: { status: 'REJECTED' } }),
  ]);

  const [totalHostels, totalStudents, totalWardens, totalComplaints] = await Promise.all([
    prisma.hostel.count(),
    prisma.studentProfile.count(),
    prisma.wardenAssignment.count(),
    prisma.complaint.count(),
  ]);

  const recentReviews = await prisma.verificationReview.findMany({
    include: {
      college: { select: { name: true, code: true, city: true } },
      reviewedBy: { select: { fullName: true } },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 10,
  });

  res.json({
    success: true,
    data: {
      colleges: {
        total: totalColleges,
        approved: approvedColleges,
        pending: pendingColleges,
        rejected: rejectedColleges,
      },
      totals: {
        hostels: totalHostels,
        students: totalStudents,
        wardens: totalWardens,
        complaints: totalComplaints,
      },
      recentReviews,
    },
  });
}
