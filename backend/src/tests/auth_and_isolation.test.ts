import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('HostelHub API Integration & Security Tests', () => {
  let adminToken: string;
  let apexWardenToken: string;
  let nmuWardenToken: string;
  let studentToken: string;
  let apexCollegeId: string;
  let nmuCollegeId: string;
  let apexHostelId: string;
  let aaravStudentId: string;

  beforeAll(async () => {
    // 1. Admin login
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hostelhub.com', password: 'Password@123' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.token;

    // 2. Apex Warden login (College A)
    const apexWardenRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'warden.boys@apextech.edu', password: 'Password@123' });
    expect(apexWardenRes.status).toBe(200);
    apexWardenToken = apexWardenRes.body.token;
    apexCollegeId = apexWardenRes.body.user.college.id;
    apexHostelId = apexWardenRes.body.user.hostel.id;

    // 3. NMU Warden login (College B)
    const nmuWardenRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'warden.nmu@nmu.edu', password: 'Password@123' });
    expect(nmuWardenRes.status).toBe(200);
    nmuWardenToken = nmuWardenRes.body.token;
    nmuCollegeId = nmuWardenRes.body.user.college.id;

    // 4. Student login (Aarav Patel)
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student.aarav@apextech.edu', password: 'Password@123' });
    expect(studentRes.status).toBe(200);
    studentToken = studentRes.body.token;
    aaravStudentId = studentRes.body.user.studentProfile.id;
  });

  it('Health Check: Should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('Authentication: Public directory of approved colleges is accessible without token', async () => {
    const res = await request(app).get('/api/v1/colleges');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('Role-Based Authorization: Student cannot access Warden-only endpoints', async () => {
    const res = await request(app)
      .post('/api/v1/rooms/allocate')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ studentId: aaravStudentId, bedId: '00000000-0000-0000-0000-000000000000' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden.*Role 'STUDENT'/);
  });

  it('Multi-College Data Isolation: Warden from College B cannot access College A data', async () => {
    // NMU Warden attempts to list Apex College rooms by passing Apex's collegeId
    const res = await request(app)
      .get(`/api/v1/rooms?collegeId=${apexCollegeId}&hostelId=${apexHostelId}`)
      .set('Authorization', `Bearer ${nmuWardenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Cross-college data access is strictly forbidden/);
  });

  it('Student Ownership Isolation: Student can view own room but cannot access admin verification', async () => {
    const roomRes = await request(app)
      .get('/api/v1/rooms/my-room')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(roomRes.status).toBe(200);
    expect(roomRes.body.allocated).toBe(true);
    expect(roomRes.body.data.roomNumber).toBe('101');

    const adminCollegesRes = await request(app)
      .get('/api/v1/colleges/admin/all')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(adminCollegesRes.status).toBe(403);
  });

  it('Leave Pass Public Verification: Verification endpoint validates approved pass code', async () => {
    const res = await request(app).get('/api/v1/leave/verify/PASS-AIT-99014');
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.data.studentName).toBe('Aarav Patel');
    expect(res.body.data.destination).toMatch(/Mysuru/);
  });

  it('Smart Room Allocation: Duplicate bed allocation to already occupied bed is rejected', async () => {
    // Fetch rooms to find bed 101-A which is already OCCUPIED by Aarav
    const roomsRes = await request(app)
      .get(`/api/v1/rooms?hostelId=${apexHostelId}`)
      .set('Authorization', `Bearer ${apexWardenToken}`);

    expect(roomsRes.status).toBe(200);
    const room101 = roomsRes.body.data.find((r: any) => r.roomNumber === '101');
    const occupiedBed = room101.beds.find((b: any) => b.status === 'OCCUPIED');

    // Attempt to allocate this already occupied bed
    const allocRes = await request(app)
      .post('/api/v1/rooms/allocate')
      .set('Authorization', `Bearer ${apexWardenToken}`)
      .send({
        studentId: aaravStudentId,
        bedId: occupiedBed.id,
      });

    expect(allocRes.status).toBe(400);
    expect(allocRes.body.message).toMatch(/is not available.*Double allocation prevented|already has an active room allocation/);
  });
});
