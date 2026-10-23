import { PrismaClient, Role, CollegeStatus, HostelType, BedStatus, StudentStatus, AllocationStatus, SessionType, AttendanceStatus, MealType, LaundryBookingStatus, AreaType, CleaningStatus, ChargeStatus, PaymentMethod, FineStatus, AppealStatus, ComplaintCategory, Urgency, ComplaintStatus, LeaveType, LeaveStatus, FacilityType, TargetAudience, NoticePriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HostelHub Seed...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.facilityBooking.deleteMany();
  await prisma.facilityStaff.deleteMany();
  await prisma.cafeteriaMenuItem.deleteMany();
  await prisma.facilityHours.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.hostelRule.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.complaintEvent.deleteMany();
  await prisma.complaintMessage.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.fineAppeal.deleteMany();
  await prisma.fine.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.studentCharge.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.cleaningAssignment.deleteMany();
  await prisma.cleaningTask.deleteMany();
  await prisma.laundryBooking.deleteMany();
  await prisma.laundrySlot.deleteMany();
  await prisma.messMenu.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.roomAllocation.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.block.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.verificationReview.deleteMany();
  await prisma.wardenInvitation.deleteMany();
  await prisma.wardenAssignment.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.collegeMembership.deleteMany();
  await prisma.collegeDocument.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Platform Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hostelhub.com',
      passwordHash,
      role: Role.PLATFORM_ADMIN,
      fullName: 'Dr. Rajesh Sharma',
      phone: '+91 98765 00001',
    },
  });

  // 2. Approved College 1: Apex Institute of Technology
  const collegeApex = await prisma.college.create({
    data: {
      name: 'Apex Institute of Technology',
      code: 'AIT-TECH',
      officialEmail: 'hostels@apextech.edu',
      website: 'https://apextech.edu',
      address: 'Electronic City Phase 1, Hosur Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      phone: '+91 80 2852 0001',
      representativeName: 'Prof. Anirudh Kulkarni',
      representativeRole: 'Dean of Student Welfare',
      representativeContact: '+91 98765 11111',
      status: CollegeStatus.APPROVED,
      verificationNotes: 'Accredited Tier-1 Engineering Institute with verified land and infrastructure records.',
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: admin.id,
      collegeId: collegeApex.id,
      role: Role.PLATFORM_ADMIN,
      isApproved: true,
      approvedAt: new Date(),
      approvedById: admin.id,
    },
  });

  // Approved College 2: National Metropolitan University
  const collegeNMU = await prisma.college.create({
    data: {
      name: 'National Metropolitan University',
      code: 'NMU-METRO',
      officialEmail: 'hosteloffice@nmu.edu',
      website: 'https://nmu.edu',
      address: 'University Circle, Ganeshkhind Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411007',
      phone: '+91 20 2569 0002',
      representativeName: 'Dr. Malati Phadke',
      representativeRole: 'Chief Warden',
      representativeContact: '+91 98765 22222',
      status: CollegeStatus.APPROVED,
      verificationNotes: 'State university recognized by UGC with full residential facilities.',
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  // Pending College 3 (for Admin verification testing)
  const collegeHorizon = await prisma.college.create({
    data: {
      name: 'Horizon Global University',
      code: 'HGU-GLOBAL',
      officialEmail: 'registrar@horizonglobal.edu',
      website: 'https://horizonglobal.edu',
      address: 'Gachibowli Tech Corridor',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      phone: '+91 40 6677 8899',
      representativeName: 'Dr. K. S. Reddy',
      representativeRole: 'Hostel Director',
      representativeContact: '+91 98765 33333',
      status: CollegeStatus.PENDING_VERIFICATION,
      verificationNotes: null,
    },
  });

  await prisma.collegeDocument.create({
    data: {
      collegeId: collegeHorizon.id,
      documentType: 'UGC_RECOGNITION_CERTIFICATE',
      fileUrl: '/uploads/documents/hgu_ugc_cert.pdf',
      fileName: 'HGU_UGC_Approval_2025.pdf',
    },
  });

  // 3. Hostels for Apex
  const apexBoysHostel = await prisma.hostel.create({
    data: {
      collegeId: collegeApex.id,
      name: 'Cauvery Boys Hostel',
      type: HostelType.BOYS,
      totalFloors: 3,
      description: 'Modern 3-storey residential hostel for male undergraduate and postgraduate engineering students.',
    },
  });

  const apexGirlsHostel = await prisma.hostel.create({
    data: {
      collegeId: collegeApex.id,
      name: 'Ganga Girls Hostel',
      type: HostelType.GIRLS,
      totalFloors: 3,
      description: 'Secure, modern residential facility for female students with 24/7 security and biometric gates.',
    },
  });

  // Hostels for NMU
  const nmuBoysHostel = await prisma.hostel.create({
    data: {
      collegeId: collegeNMU.id,
      name: 'Shivaji Boys Hostel',
      type: HostelType.BOYS,
      totalFloors: 4,
      description: 'Central campus residential block with attached dining and reading halls.',
    },
  });

  const nmuGirlsHostel = await prisma.hostel.create({
    data: {
      collegeId: collegeNMU.id,
      name: 'Savitribai Girls Hostel',
      type: HostelType.GIRLS,
      totalFloors: 4,
      description: 'Campus hostel near academic blocks with solar water heaters and study lounges.',
    },
  });

  // 4. Wardens
  const wardenBoysUser = await prisma.user.create({
    data: {
      email: 'warden.boys@apextech.edu',
      passwordHash,
      role: Role.WARDEN,
      fullName: 'Suresh Kumar',
      phone: '+91 98765 44401',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: wardenBoysUser.id,
      collegeId: collegeApex.id,
      role: Role.WARDEN,
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  await prisma.wardenAssignment.create({
    data: {
      userId: wardenBoysUser.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      isPrimary: true,
    },
  });

  const wardenGirlsUser = await prisma.user.create({
    data: {
      email: 'warden.girls@apextech.edu',
      passwordHash,
      role: Role.WARDEN,
      fullName: 'Sunita Verma',
      phone: '+91 98765 44402',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: wardenGirlsUser.id,
      collegeId: collegeApex.id,
      role: Role.WARDEN,
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  await prisma.wardenAssignment.create({
    data: {
      userId: wardenGirlsUser.id,
      hostelId: apexGirlsHostel.id,
      collegeId: collegeApex.id,
      isPrimary: true,
    },
  });

  const wardenNmuUser = await prisma.user.create({
    data: {
      email: 'warden.nmu@nmu.edu',
      passwordHash,
      role: Role.WARDEN,
      fullName: 'Vikram Deshmukh',
      phone: '+91 98765 44403',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: wardenNmuUser.id,
      collegeId: collegeNMU.id,
      role: Role.WARDEN,
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  await prisma.wardenAssignment.create({
    data: {
      userId: wardenNmuUser.id,
      hostelId: nmuBoysHostel.id,
      collegeId: collegeNMU.id,
      isPrimary: true,
    },
  });

  // 5. Blocks, Rooms & Beds for Apex Boys Hostel
  const blockA = await prisma.block.create({
    data: {
      hostelId: apexBoysHostel.id,
      name: 'Block A (Wing 1)',
      code: 'BLK-A',
    },
  });

  const blockB = await prisma.block.create({
    data: {
      hostelId: apexBoysHostel.id,
      name: 'Block B (Wing 2)',
      code: 'BLK-B',
    },
  });

  // Create 6 rooms in Block A, each with 2 beds
  const room101 = await prisma.room.create({
    data: {
      blockId: blockA.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      roomNumber: '101',
      floor: 1,
      roomType: 'DOUBLE',
      capacity: 2,
    },
  });

  const bed101_1 = await prisma.bed.create({
    data: { roomId: room101.id, bedNumber: '101-A', status: BedStatus.OCCUPIED },
  });

  const bed101_2 = await prisma.bed.create({
    data: { roomId: room101.id, bedNumber: '101-B', status: BedStatus.OCCUPIED },
  });

  const room102 = await prisma.room.create({
    data: {
      blockId: blockA.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      roomNumber: '102',
      floor: 1,
      roomType: 'DOUBLE',
      capacity: 2,
    },
  });

  const bed102_1 = await prisma.bed.create({
    data: { roomId: room102.id, bedNumber: '102-A', status: BedStatus.AVAILABLE },
  });

  const bed102_2 = await prisma.bed.create({
    data: { roomId: room102.id, bedNumber: '102-B', status: BedStatus.AVAILABLE },
  });

  const room201 = await prisma.room.create({
    data: {
      blockId: blockA.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      roomNumber: '201',
      floor: 2,
      roomType: 'DOUBLE',
      capacity: 2,
    },
  });

  await prisma.bed.create({ data: { roomId: room201.id, bedNumber: '201-A', status: BedStatus.AVAILABLE } });
  await prisma.bed.create({ data: { roomId: room201.id, bedNumber: '201-B', status: BedStatus.MAINTENANCE } });

  // Girls Hostel Rooms
  const blockGirlsA = await prisma.block.create({
    data: {
      hostelId: apexGirlsHostel.id,
      name: 'Main Block',
      code: 'G-MAIN',
    },
  });

  const roomG101 = await prisma.room.create({
    data: {
      blockId: blockGirlsA.id,
      hostelId: apexGirlsHostel.id,
      collegeId: collegeApex.id,
      roomNumber: 'G-101',
      floor: 1,
      roomType: 'DOUBLE',
      capacity: 2,
    },
  });

  const bedG101_1 = await prisma.bed.create({
    data: { roomId: roomG101.id, bedNumber: 'G101-A', status: BedStatus.OCCUPIED },
  });

  const bedG101_2 = await prisma.bed.create({
    data: { roomId: roomG101.id, bedNumber: 'G101-B', status: BedStatus.AVAILABLE },
  });

  // 6. Students
  // Student 1: Aarav Patel (Boys Hostel, Approved, Room 101-A)
  const userAarav = await prisma.user.create({
    data: {
      email: 'student.aarav@apextech.edu',
      passwordHash,
      role: Role.STUDENT,
      fullName: 'Aarav Patel',
      phone: '+91 98765 55001',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: userAarav.id,
      collegeId: collegeApex.id,
      role: Role.STUDENT,
      isApproved: true,
      approvedAt: new Date(),
      approvedById: wardenBoysUser.id,
    },
  });

  const studentAarav = await prisma.studentProfile.create({
    data: {
      userId: userAarav.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      rollNumber: 'AIT-2023-CS-042',
      course: 'B.Tech Computer Science & Engineering',
      year: 3,
      emergencyContact: '+91 98200 12345 (Father)',
      status: StudentStatus.APPROVED,
      approvedAt: new Date(),
      approvedById: wardenBoysUser.id,
    },
  });

  await prisma.roomAllocation.create({
    data: {
      studentId: studentAarav.id,
      bedId: bed101_1.id,
      roomId: room101.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      status: AllocationStatus.ACTIVE,
      allocatedById: wardenBoysUser.id,
    },
  });

  // Student 2: Rohan Gupta (Roommate in Room 101, Bed 101-B)
  const userRohan = await prisma.user.create({
    data: {
      email: 'student.rohan@apextech.edu',
      passwordHash,
      role: Role.STUDENT,
      fullName: 'Rohan Gupta',
      phone: '+91 98765 55002',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: userRohan.id,
      collegeId: collegeApex.id,
      role: Role.STUDENT,
      isApproved: true,
      approvedAt: new Date(),
      approvedById: wardenBoysUser.id,
    },
  });

  const studentRohan = await prisma.studentProfile.create({
    data: {
      userId: userRohan.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      rollNumber: 'AIT-2023-CS-088',
      course: 'B.Tech Computer Science & Engineering',
      year: 3,
      emergencyContact: '+91 98200 54321 (Mother)',
      status: StudentStatus.APPROVED,
      approvedAt: new Date(),
      approvedById: wardenBoysUser.id,
    },
  });

  await prisma.roomAllocation.create({
    data: {
      studentId: studentRohan.id,
      bedId: bed101_2.id,
      roomId: room101.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      status: AllocationStatus.ACTIVE,
      allocatedById: wardenBoysUser.id,
    },
  });

  // Student 3: Ananya Sharma (Girls Hostel, Approved)
  const userAnanya = await prisma.user.create({
    data: {
      email: 'student.ananya@apextech.edu',
      passwordHash,
      role: Role.STUDENT,
      fullName: 'Ananya Sharma',
      phone: '+91 98765 55003',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: userAnanya.id,
      collegeId: collegeApex.id,
      role: Role.STUDENT,
      isApproved: true,
      approvedAt: new Date(),
      approvedById: wardenGirlsUser.id,
    },
  });

  const studentAnanya = await prisma.studentProfile.create({
    data: {
      userId: userAnanya.id,
      collegeId: collegeApex.id,
      hostelId: apexGirlsHostel.id,
      rollNumber: 'AIT-2023-EC-015',
      course: 'B.Tech Electronics & Communication',
      year: 2,
      emergencyContact: '+91 98200 98765 (Guardian)',
      status: StudentStatus.APPROVED,
      approvedAt: new Date(),
      approvedById: wardenGirlsUser.id,
    },
  });

  await prisma.roomAllocation.create({
    data: {
      studentId: studentAnanya.id,
      bedId: bedG101_1.id,
      roomId: roomG101.id,
      hostelId: apexGirlsHostel.id,
      collegeId: collegeApex.id,
      status: AllocationStatus.ACTIVE,
      allocatedById: wardenGirlsUser.id,
    },
  });

  // Student 4: Priya Nair (Pending Warden Approval for registration demo)
  const userPriya = await prisma.user.create({
    data: {
      email: 'student.priya@apextech.edu',
      passwordHash,
      role: Role.STUDENT,
      fullName: 'Priya Nair',
      phone: '+91 98765 55004',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: userPriya.id,
      collegeId: collegeApex.id,
      role: Role.STUDENT,
      isApproved: false,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userPriya.id,
      collegeId: collegeApex.id,
      hostelId: apexGirlsHostel.id,
      rollNumber: 'AIT-2024-CS-101',
      course: 'B.Tech Computer Science & Engineering',
      year: 1,
      emergencyContact: '+91 98200 67890 (Father)',
      status: StudentStatus.PENDING_APPROVAL,
    },
  });

  // Student 5 for NMU: Neha Kulkarni
  const userNeha = await prisma.user.create({
    data: {
      email: 'student.neha@nmu.edu',
      passwordHash,
      role: Role.STUDENT,
      fullName: 'Neha Kulkarni',
      phone: '+91 98765 55005',
    },
  });

  await prisma.collegeMembership.create({
    data: {
      userId: userNeha.id,
      collegeId: collegeNMU.id,
      role: Role.STUDENT,
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: userNeha.id,
      collegeId: collegeNMU.id,
      hostelId: nmuGirlsHostel.id,
      rollNumber: 'NMU-2023-ME-019',
      course: 'B.Tech Mechanical Engineering',
      year: 2,
      emergencyContact: '+91 98200 44556 (Parent)',
      status: StudentStatus.APPROVED,
      approvedAt: new Date(),
    },
  });

  // 7. Attendance Sessions & Records
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const sessionYesterday = await prisma.attendanceSession.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      date: yesterday,
      sessionType: SessionType.NIGHT,
      conductedById: wardenBoysUser.id,
    },
  });

  await prisma.attendanceRecord.createMany({
    data: [
      { sessionId: sessionYesterday.id, studentId: studentAarav.id, status: AttendanceStatus.PRESENT, remarks: 'Present at roll call' },
      { sessionId: sessionYesterday.id, studentId: studentRohan.id, status: AttendanceStatus.PRESENT, remarks: 'Present at roll call' },
    ],
  });

  const sessionToday = await prisma.attendanceSession.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      date: today,
      sessionType: SessionType.EVENING,
      conductedById: wardenBoysUser.id,
    },
  });

  await prisma.attendanceRecord.createMany({
    data: [
      { sessionId: sessionToday.id, studentId: studentAarav.id, status: AttendanceStatus.PRESENT, remarks: 'Present' },
      { sessionId: sessionToday.id, studentId: studentRohan.id, status: AttendanceStatus.LATE, remarks: 'Late by 15 mins (lab work)' },
    ],
  });

  // 8. Mess Menus (Weekly Menu for Apex Boys Hostel)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const menuData = [
    { meal: MealType.BREAKFAST, start: '07:30', end: '09:30', title: 'South Indian Combo', items: 'Idli, Medu Vada, Sambar, Coconut Chutney, Tea, Coffee, Boiled Eggs / Banana' },
    { meal: MealType.LUNCH, start: '12:30', end: '14:30', title: 'North Indian Thali', items: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Curd, Green Salad, Gulab Jamun' },
    { meal: MealType.SNACKS, start: '17:00', end: '18:15', title: 'Evening High Tea', items: 'Aloo Samosa with Mint Chutney, Masala Chai, Filter Coffee, Bourbon Biscuits' },
    { meal: MealType.DINNER, start: '19:45', end: '21:45', title: 'Special Dinner Buffet', items: 'Kadai Chicken / Malai Kofta, Dal Makhani, Steamed Basmati Rice, Butter Naan, Ice Cream' },
  ];

  for (const day of days) {
    for (const m of menuData) {
      await prisma.messMenu.create({
        data: {
          hostelId: apexBoysHostel.id,
          collegeId: collegeApex.id,
          dayOfWeek: day,
          mealType: m.meal,
          startTime: m.start,
          endTime: m.end,
          title: `${day} ${m.title}`,
          items: m.items,
          isSpecial: day === 'Sunday' && m.meal === MealType.DINNER,
        },
      });
    }
  }

  // 9. Laundry Slots & Bookings
  const slot1 = await prisma.laundrySlot.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      dayOfWeek: 'Monday',
      startTime: '08:00',
      endTime: '11:00',
      maxCapacity: 15,
      currentBookings: 3,
    },
  });

  const slot2 = await prisma.laundrySlot.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      dayOfWeek: 'Wednesday',
      startTime: '14:00',
      endTime: '17:00',
      maxCapacity: 15,
      currentBookings: 1,
    },
  });

  const slot3 = await prisma.laundrySlot.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      dayOfWeek: 'Saturday',
      startTime: '09:00',
      endTime: '13:00',
      maxCapacity: 25,
      currentBookings: 5,
    },
  });

  await prisma.laundryBooking.create({
    data: {
      slotId: slot1.id,
      studentId: studentAarav.id,
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      bookingDate: today,
      status: LaundryBookingStatus.COLLECTED,
    },
  });

  // 10. Cleaning & Housekeeping
  const taskDaily = await prisma.cleaningTask.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      title: 'Daily Student Room Deep Sweep & Mop',
      areaType: AreaType.ROOM,
      frequency: 'DAILY',
      scheduledTime: '10:30 AM - 12:30 PM',
      description: 'Dusting, floor wet-mopping, emptying waste bin, and sanitize door handles.',
    },
  });

  const taskWashroom = await prisma.cleaningTask.create({
    data: {
      hostelId: apexBoysHostel.id,
      collegeId: collegeApex.id,
      title: 'Common Washroom & Restroom Sanitation',
      areaType: AreaType.WASHROOM,
      frequency: 'DAILY',
      scheduledTime: '06:00 AM & 03:00 PM',
      description: 'Antiseptic scrubbing of stalls, basins, and mirrors.',
    },
  });

  await prisma.cleaningAssignment.create({
    data: {
      taskId: taskDaily.id,
      roomId: room101.id,
      scheduledDate: today,
      status: CleaningStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  await prisma.cleaningAssignment.create({
    data: {
      taskId: taskDaily.id,
      roomId: room102.id,
      scheduledDate: today,
      status: CleaningStatus.PENDING,
    },
  });

  // 11. Fees & Finance
  const catAccommodation = await prisma.feeCategory.create({
    data: {
      collegeId: collegeApex.id,
      name: 'Hostel Accommodation (Semester 5)',
      description: 'Twin-sharing room with high-speed Wi-Fi, electricity and water utilities.',
      isMandatory: true,
    },
  });

  const catMess = await prisma.feeCategory.create({
    data: {
      collegeId: collegeApex.id,
      name: 'Mess Catering Charges (Semester 5)',
      description: 'Full boarding: 4 meals daily (Breakfast, Lunch, Snacks, Dinner).',
      isMandatory: true,
    },
  });

  const catCaution = await prisma.feeCategory.create({
    data: {
      collegeId: collegeApex.id,
      name: 'Hostel Caution & Damage Deposit',
      description: 'Refundable security deposit at end of course.',
      isMandatory: false,
    },
  });

  await prisma.feeStructure.create({
    data: {
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      categoryId: catAccommodation.id,
      amount: 45000,
      billingCycle: 'SEMESTER',
    },
  });

  // Student Charge 1: Paid by Aarav
  const chargeAarav1 = await prisma.studentCharge.create({
    data: {
      studentId: studentAarav.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      categoryId: catAccommodation.id,
      amount: 45000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: ChargeStatus.PAID,
      description: 'Hostel room fee Semester 5',
      createdById: wardenBoysUser.id,
    },
  });

  await prisma.payment.create({
    data: {
      chargeId: chargeAarav1.id,
      studentId: studentAarav.id,
      collegeId: collegeApex.id,
      amount: 45000,
      paymentMethod: PaymentMethod.ONLINE,
      transactionReference: 'TXN-AIT-2026-99201',
      isVerified: true,
      receiptNumber: 'REC-2026-0041',
    },
  });

  // Student Charge 2: Pending Mess for Aarav
  await prisma.studentCharge.create({
    data: {
      studentId: studentAarav.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      categoryId: catMess.id,
      amount: 28000,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: ChargeStatus.PENDING,
      description: 'Semester 5 4-meal plan catering charge',
      createdById: wardenBoysUser.id,
    },
  });

  // 12. Fines & Appeals
  const fineLate = await prisma.fine.create({
    data: {
      studentId: studentAarav.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      reason: 'Late return after 10:00 PM curfew without approved pass on 18th Oct',
      amount: 250,
      status: FineStatus.APPEALED,
      issuedById: wardenBoysUser.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.fineAppeal.create({
    data: {
      fineId: fineLate.id,
      studentId: studentAarav.id,
      reason: 'I was in the CSE Robotics lab working on the Smart India Hackathon final project with Dr. K. S. Rao until 10:15 PM. Lab log signed copy attached.',
      status: AppealStatus.PENDING,
    },
  });

  // 13. Complaints & SLA Engine
  const complaint1 = await prisma.complaint.create({
    data: {
      ticketNumber: 'COMP-2026-0101',
      studentId: studentAarav.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      category: ComplaintCategory.ELECTRICAL,
      title: 'Ceiling Fan Making Loud Grinding Noise in Room 101',
      description: 'The ceiling fan bearing has deteriorated, making sleep impossible at high speed. Requesting urgent repair or replacement.',
      urgency: Urgency.MEDIUM,
      status: ComplaintStatus.IN_PROGRESS,
      slaDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.complaintMessage.create({
    data: {
      complaintId: complaint1.id,
      senderId: userAarav.id,
      message: 'Sir, the noise started 2 days ago and is vibrating the ceiling hook. Please send maintenance.',
      isInternalNote: false,
    },
  });

  await prisma.complaintMessage.create({
    data: {
      complaintId: complaint1.id,
      senderId: wardenBoysUser.id,
      message: 'Acknowledged. Electrician Mr. Manjunath has been assigned ticket COMP-0101 for tomorrow morning at 10 AM.',
      isInternalNote: false,
    },
  });

  await prisma.complaintMessage.create({
    data: {
      complaintId: complaint1.id,
      senderId: wardenBoysUser.id,
      message: 'Internal Note: 3 spare fans received in inventory. If bearing damaged, replace entire unit.',
      isInternalNote: true,
    },
  });

  await prisma.complaintEvent.create({
    data: {
      complaintId: complaint1.id,
      actorId: userAarav.id,
      action: 'TICKET_CREATED',
      notes: 'Initial ticket submitted with Medium urgency.',
    },
  });

  await prisma.complaintEvent.create({
    data: {
      complaintId: complaint1.id,
      actorId: wardenBoysUser.id,
      action: 'STATUS_CHANGED',
      notes: 'Status updated from SUBMITTED to IN_PROGRESS. Assigned electrician.',
    },
  });

  // 14. Leave Requests & Digital QR Pass
  const leaveStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const leaveEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

  await prisma.leaveRequest.create({
    data: {
      studentId: studentAarav.id,
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      leaveType: LeaveType.HOME_VISIT,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: 'Attending elder sister wedding ceremony in Mysuru.',
      destination: '124, Gokulam 3rd Stage, Mysuru, Karnataka',
      contactNumber: '+91 98765 55001',
      emergencyContact: '+91 98200 12345 (Father)',
      status: LeaveStatus.APPROVED,
      passCode: 'PASS-AIT-99014',
      approvedById: wardenBoysUser.id,
      approvedAt: new Date(),
      wardenRemarks: 'Approved. Carry college ID and ensure return before 09:30 PM Sunday.',
      qrToken: 'LEAVE_TOKEN_SECURE_AARAV_MYSURU_2026',
    },
  });

  // 15. Hostel Rules
  await prisma.hostelRule.createMany({
    data: [
      {
        collegeId: collegeApex.id,
        hostelId: apexBoysHostel.id,
        category: 'Curfew & Gate Timings',
        title: 'Hostel Main Gate Timings',
        description: 'Hostel gates open at 06:00 AM and lock strictly at 10:00 PM. Any late entry requires prior approved digital leave pass or emergency authorization.',
        penaltyDetails: 'First violation: INR 250 fine; Repeated violation: Parent notification and disciplinary committee review.',
        version: 1,
      },
      {
        collegeId: collegeApex.id,
        hostelId: apexBoysHostel.id,
        category: 'Visitor Policy',
        title: 'Visitor & Day-Scholar Restrictions',
        description: 'Outside visitors and day-scholars are only permitted in the Visitors Lounge between 04:30 PM - 07:00 PM. No unauthorized guests are permitted inside residential rooms.',
        penaltyDetails: 'INR 1,000 fine and expulsion from hostel residence.',
        version: 1,
      },
      {
        collegeId: collegeApex.id,
        hostelId: apexBoysHostel.id,
        category: 'Quiet Hours',
        title: 'Study & Silence Hours',
        description: 'Quiet hours must be observed from 11:00 PM to 06:00 AM daily. Loud music, shouting, or corridor gatherings are strictly prohibited.',
        penaltyDetails: 'Written warning and forfeiture of sound equipment.',
        version: 1,
      },
    ],
  });

  // 16. Facilities: Cafeteria, Gym, Sports
  const cafeteria = await prisma.facility.create({
    data: {
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      type: FacilityType.CAFETERIA,
      name: 'The Campus Bite Food Court',
      location: 'Ground Floor, Central Amenities Block',
      capacity: 120,
      description: 'Hygienic multi-cuisine cafe serving freshly brewed coffees, wraps, rolls, fruit bowls, and midnight snacks.',
    },
  });

  await prisma.facilityHours.createMany({
    data: [
      { facilityId: cafeteria.id, dayOfWeek: 'Weekdays', openTime: '08:00 AM', closeTime: '11:30 PM' },
      { facilityId: cafeteria.id, dayOfWeek: 'Weekends', openTime: '09:00 AM', closeTime: '12:00 Midnight' },
    ],
  });

  await prisma.cafeteriaMenuItem.createMany({
    data: [
      { facilityId: cafeteria.id, name: 'Cold Coffee with Ice Cream', category: 'Beverages', price: 65, isAvailable: true },
      { facilityId: cafeteria.id, name: 'Paneer Tikka Roll', category: 'Snacks', price: 90, isAvailable: true },
      { facilityId: cafeteria.id, name: 'Grilled Cheese Sandwich', category: 'Snacks', price: 60, isAvailable: true },
      { facilityId: cafeteria.id, name: 'Veg Hakka Noodles', category: 'Meals', price: 85, isAvailable: true },
      { facilityId: cafeteria.id, name: 'Fresh Watermelon Juice', category: 'Beverages', price: 45, isAvailable: true },
    ],
  });

  const gym = await prisma.facility.create({
    data: {
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      type: FacilityType.GYM,
      name: 'Apex Fitness & Conditioning Center',
      location: '1st Floor, Sports Pavilion',
      capacity: 40,
      description: 'Fully air-conditioned fitness club equipped with Olympic barbells, power racks, treadmills, ellipticals, and rubberized dumbbells.',
    },
  });

  await prisma.facilityHours.createMany({
    data: [
      { facilityId: gym.id, dayOfWeek: 'Morning Slot', openTime: '06:00 AM', closeTime: '09:30 AM' },
      { facilityId: gym.id, dayOfWeek: 'Evening Slot', openTime: '05:00 PM', closeTime: '09:30 PM' },
    ],
  });

  await prisma.facilityStaff.create({
    data: {
      facilityId: gym.id,
      name: 'Coach Vikram Rathore',
      role: 'Certified Strength & Conditioning Specialist',
      contact: '+91 98888 77766',
      specialization: 'Hypertrophy, Postural Alignment & Athletic Conditioning',
      timing: '06:00 AM - 09:00 AM & 05:30 PM - 09:00 PM',
    },
  });

  const sports = await prisma.facility.create({
    data: {
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      type: FacilityType.SPORTS_COMPLEX,
      name: 'Apex Indoor & Outdoor Sports Arena',
      location: 'Adjacent to Hostel Lawn',
      capacity: 80,
      description: 'Floodlit badminton synthetic courts, floodlit basketball court, table tennis hall, and carrom lounge.',
    },
  });

  await prisma.facilityHours.createMany({
    data: [
      { facilityId: sports.id, dayOfWeek: 'All Days', openTime: '06:00 AM', closeTime: '10:00 PM' },
    ],
  });

  // 17. Notices
  await prisma.notice.create({
    data: {
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      targetAudience: TargetAudience.ALL,
      title: 'Scheduled Water Tank Cleaning & Maintenance Notice',
      content: 'Please be informed that overhead solar water tanks for Block A & B will undergo scheduled chlorination on Saturday from 10:00 AM to 01:00 PM. Water supply will resume at 01:30 PM. Please store essential water beforehand.',
      priority: NoticePriority.HIGH,
      publishedById: wardenBoysUser.id,
    },
  });

  await prisma.notice.create({
    data: {
      collegeId: collegeApex.id,
      hostelId: apexBoysHostel.id,
      targetAudience: TargetAudience.STUDENTS_ONLY,
      title: 'Diwali Festival Break Outstation Leave Applications Open',
      content: 'Students intending to travel home for the upcoming Diwali holidays must submit their digital leave applications on HostelHub by 28th October to ensure advance gate pass clearance.',
      priority: NoticePriority.NORMAL,
      publishedById: wardenBoysUser.id,
    },
  });

  // 18. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userAarav.id,
        title: 'Leave Request Approved',
        message: 'Your leave application for Mysuru from Oct 25 - Oct 27 has been approved. Digital QR pass is ready.',
        type: NotificationType.SUCCESS,
        link: '/student/leave',
      },
      {
        userId: userAarav.id,
        title: 'Complaint Status Update',
        message: 'Your electrical maintenance ticket COMP-2026-0101 is now IN_PROGRESS.',
        type: NotificationType.INFO,
        link: '/student/complaints',
      },
      {
        userId: wardenBoysUser.id,
        title: 'New Student Application',
        message: 'Priya Nair has applied for hostel accommodation at Apex Institute.',
        type: NotificationType.WARNING,
        link: '/warden/students',
      },
    ],
  });

  // 19. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        collegeId: collegeApex.id,
        actorId: admin.id,
        actorRole: Role.PLATFORM_ADMIN,
        action: 'APPROVE_COLLEGE',
        entityType: 'College',
        entityId: collegeApex.id,
        details: 'Verified AICTE/UGC documents and approved college registration.',
      },
      {
        collegeId: collegeApex.id,
        actorId: wardenBoysUser.id,
        actorRole: Role.WARDEN,
        action: 'APPROVE_STUDENT',
        entityType: 'StudentProfile',
        entityId: studentAarav.id,
        details: 'Verified enrollment number AIT-2023-CS-042 and allocated room 101-A.',
      },
      {
        collegeId: collegeApex.id,
        actorId: wardenBoysUser.id,
        actorRole: Role.WARDEN,
        action: 'ALLOCATE_ROOM',
        entityType: 'RoomAllocation',
        entityId: bed101_1.id,
        details: 'Assigned bed 101-A to Aarav Patel.',
      },
    ],
  });

  console.log('✅ HostelHub Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
