// prisma/seed.ts

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  Gender,
  Semester,
  DayOfWeek,
  AttendanceStatus,
} from "@prisma/client/index.js";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding university database...");

  // ═══════════════════════════════════════════
  // 1. ADMIN
  // ═══════════════════════════════════════════
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@university.com" },
    update: {},
    create: {
      email: "admin@university.com",
      name: "System Admin",
      password: adminPassword,
      role: Role.ADMIN,
      adminProfile: { create: {} },
    },
  });
  console.log("✅ Admin:", adminUser.email);

  // ═══════════════════════════════════════════
  // 2. DEPARTMENTS
  // ═══════════════════════════════════════════
  const csDept = await prisma.department.upsert({
    where: { code: "CS" },
    update: {},
    create: {
      name: "Computer Science",
      code: "CS",
      faculty: "Faculty of Science",
    },
  });

  const engDept = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {},
    create: {
      name: "English",
      code: "ENG",
      faculty: "Faculty of Arts",
    },
  });

  const mathDept = await prisma.department.upsert({
    where: { code: "MTH" },
    update: {},
    create: {
      name: "Mathematics",
      code: "MTH",
      faculty: "Faculty of Science",
    },
  });
  console.log("✅ Departments created");

  // ═══════════════════════════════════════════
  // 3. COURSES (with levels)
  // ═══════════════════════════════════════════
  const cs101 = await prisma.course.upsert({
    where: { code: "CS101" },
    update: {},
    create: {
      code: "CS101",
      name: "Introduction to Programming",
      description: "Fundamentals of programming using Python",
      creditHours: 3,
      level: 100,
      departmentId: csDept.id,
    },
  });

  const cs102 = await prisma.course.upsert({
    where: { code: "CS102" },
    update: {},
    create: {
      code: "CS102",
      name: "Computer Fundamentals",
      description: "Hardware, software, and basic computing concepts",
      creditHours: 2,
      level: 100,
      departmentId: csDept.id,
    },
  });

  const cs201 = await prisma.course.upsert({
    where: { code: "CS201" },
    update: {},
    create: {
      code: "CS201",
      name: "Data Structures & Algorithms",
      description: "Arrays, linked lists, trees, sorting and searching",
      creditHours: 4,
      level: 200,
      departmentId: csDept.id,
    },
  });

  const cs202 = await prisma.course.upsert({
    where: { code: "CS202" },
    update: {},
    create: {
      code: "CS202",
      name: "Object Oriented Programming",
      description: "OOP principles using Java",
      creditHours: 3,
      level: 200,
      departmentId: csDept.id,
    },
  });

  const cs301 = await prisma.course.upsert({
    where: { code: "CS301" },
    update: {},
    create: {
      code: "CS301",
      name: "Database Systems",
      description: "Relational databases, SQL, and normalization",
      creditHours: 3,
      level: 300,
      departmentId: csDept.id,
    },
  });

  const cs302 = await prisma.course.upsert({
    where: { code: "CS302" },
    update: {},
    create: {
      code: "CS302",
      name: "Software Engineering",
      description: "SDLC, agile methodologies, and project management",
      creditHours: 3,
      level: 300,
      departmentId: csDept.id,
    },
  });

  const eng101 = await prisma.course.upsert({
    where: { code: "ENG101" },
    update: {},
    create: {
      code: "ENG101",
      name: "Communication Skills",
      description: "Academic writing and presentation skills",
      creditHours: 2,
      level: 100,
      departmentId: engDept.id,
    },
  });

  const eng201 = await prisma.course.upsert({
    where: { code: "ENG201" },
    update: {},
    create: {
      code: "ENG201",
      name: "Technical Writing",
      description: "Professional and technical document preparation",
      creditHours: 2,
      level: 200,
      departmentId: engDept.id,
    },
  });

  const mth101 = await prisma.course.upsert({
    where: { code: "MTH101" },
    update: {},
    create: {
      code: "MTH101",
      name: "Calculus I",
      description: "Limits, derivatives, and integrals",
      creditHours: 3,
      level: 100,
      departmentId: mathDept.id,
    },
  });

  const mth201 = await prisma.course.upsert({
    where: { code: "MTH201" },
    update: {},
    create: {
      code: "MTH201",
      name: "Linear Algebra",
      description: "Vectors, matrices, and linear transformations",
      creditHours: 3,
      level: 200,
      departmentId: mathDept.id,
    },
  });

  const mth301 = await prisma.course.upsert({
    where: { code: "MTH301" },
    update: {},
    create: {
      code: "MTH301",
      name: "Numerical Methods",
      description: "Computational methods for solving mathematical problems",
      creditHours: 3,
      level: 300,
      departmentId: mathDept.id,
    },
  });
  console.log("✅ Courses created (Level 100, 200, 300)");

  // ═══════════════════════════════════════════
  // 4. TEACHERS
  // ═══════════════════════════════════════════
  const teacherPassword = await bcrypt.hash("teacher123", 12);

  const teacher1User = await prisma.user.upsert({
    where: { email: "prof.kamga@university.com" },
    update: {},
    create: {
      email: "prof.kamga@university.com",
      name: "Prof. Emmanuel Kamga",
      password: teacherPassword,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          employeeId: "TCH-2025-001",
          firstName: "Emmanuel",
          lastName: "Kamga",
          gender: Gender.MALE,
          department: "Computer Science",
          title: "Professor",
          salaryBase: 650000,
          hireDate: new Date("2018-09-01"),
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacher2User = await prisma.user.upsert({
    where: { email: "dr.nkembe@university.com" },
    update: {},
    create: {
      email: "dr.nkembe@university.com",
      name: "Dr. Grace Nkembe",
      password: teacherPassword,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          employeeId: "TCH-2025-002",
          firstName: "Grace",
          lastName: "Nkembe",
          gender: Gender.FEMALE,
          department: "English",
          title: "Dr.",
          salaryBase: 500000,
          hireDate: new Date("2020-01-15"),
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacher3User = await prisma.user.upsert({
    where: { email: "mr.fon@university.com" },
    update: {},
    create: {
      email: "mr.fon@university.com",
      name: "Mr. Peter Fon",
      password: teacherPassword,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          employeeId: "TCH-2025-003",
          firstName: "Peter",
          lastName: "Fon",
          gender: Gender.MALE,
          department: "Mathematics",
          title: "Lecturer",
          salaryBase: 450000,
          hireDate: new Date("2022-09-01"),
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacher4User = await prisma.user.upsert({
    where: { email: "dr.etame@university.com" },
    update: {},
    create: {
      email: "dr.etame@university.com",
      name: "Dr. Samuel Etame",
      password: teacherPassword,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          employeeId: "TCH-2025-004",
          firstName: "Samuel",
          lastName: "Etame",
          gender: Gender.MALE,
          department: "Computer Science",
          title: "Dr.",
          salaryBase: 550000,
          hireDate: new Date("2019-03-01"),
        },
      },
    },
    include: { teacherProfile: true },
  });
  console.log("✅ Teachers created");

  // ═══════════════════════════════════════════
  // 5. COURSE ASSIGNMENTS
  // ═══════════════════════════════════════════
  const academicYear = "2024-2025";
  const currentSemester = Semester.SECOND;

  // Prof. Kamga: CS101, CS201, CS302
  const assign_cs101 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: cs101.id,
        teacherId: teacher1User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: cs101.id,
      teacherId: teacher1User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_cs201 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: cs201.id,
        teacherId: teacher1User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: cs201.id,
      teacherId: teacher1User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_cs302 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: cs302.id,
        teacherId: teacher1User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: cs302.id,
      teacherId: teacher1User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  // Dr. Nkembe: ENG101, ENG201
  const assign_eng101 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: eng101.id,
        teacherId: teacher2User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: eng101.id,
      teacherId: teacher2User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_eng201 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: eng201.id,
        teacherId: teacher2User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: eng201.id,
      teacherId: teacher2User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  // Mr. Fon: MTH101, MTH201, MTH301
  const assign_mth101 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: mth101.id,
        teacherId: teacher3User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: mth101.id,
      teacherId: teacher3User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_mth201 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: mth201.id,
        teacherId: teacher3User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: mth201.id,
      teacherId: teacher3User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_mth301 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: mth301.id,
        teacherId: teacher3User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: mth301.id,
      teacherId: teacher3User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  // Dr. Etame: CS102, CS202, CS301
  const assign_cs102 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: cs102.id,
        teacherId: teacher4User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: cs102.id,
      teacherId: teacher4User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_cs202 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: cs202.id,
        teacherId: teacher4User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: cs202.id,
      teacherId: teacher4User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });

  const assign_cs301 = await prisma.courseAssignment.upsert({
    where: {
      courseId_teacherId_academicYear_semester: {
        courseId: cs301.id,
        teacherId: teacher4User.teacherProfile!.id,
        academicYear,
        semester: currentSemester,
      },
    },
    update: {},
    create: {
      courseId: cs301.id,
      teacherId: teacher4User.teacherProfile!.id,
      academicYear,
      semester: currentSemester,
    },
  });
  console.log("✅ Course assignments created");

  // ═══════════════════════════════════════════
  // 6. ROOMS
  // ═══════════════════════════════════════════
  const hallA = await prisma.room.upsert({
    where: { name: "Hall A" },
    update: {},
    create: {
      name: "Hall A",
      building: "Main Building",
      capacity: 200,
      type: "Lecture Hall",
    },
  });

  const hallB = await prisma.room.upsert({
    where: { name: "Hall B" },
    update: {},
    create: {
      name: "Hall B",
      building: "Main Building",
      capacity: 150,
      type: "Lecture Hall",
    },
  });

  const lab1 = await prisma.room.upsert({
    where: { name: "Computer Lab 1" },
    update: {},
    create: {
      name: "Computer Lab 1",
      building: "Science Block",
      capacity: 60,
      type: "Lab",
    },
  });

  const lab2 = await prisma.room.upsert({
    where: { name: "Computer Lab 2" },
    update: {},
    create: {
      name: "Computer Lab 2",
      building: "Science Block",
      capacity: 50,
      type: "Lab",
    },
  });

  const room201 = await prisma.room.upsert({
    where: { name: "Room 201" },
    update: {},
    create: {
      name: "Room 201",
      building: "Arts Block",
      capacity: 80,
      type: "Seminar Room",
    },
  });

  const room301 = await prisma.room.upsert({
    where: { name: "Room 301" },
    update: {},
    create: {
      name: "Room 301",
      building: "Science Block",
      capacity: 100,
      type: "Classroom",
    },
  });
  console.log("✅ Rooms created");

  // ═══════════════════════════════════════════
  // 7. TIME SLOTS
  // ═══════════════════════════════════════════
  const slot1 = await prisma.timeSlot.upsert({
    where: { startTime_endTime: { startTime: "08:00", endTime: "10:00" } },
    update: {},
    create: { startTime: "08:00", endTime: "10:00", label: "Period 1" },
  });

  const slot2 = await prisma.timeSlot.upsert({
    where: { startTime_endTime: { startTime: "10:15", endTime: "12:15" } },
    update: {},
    create: { startTime: "10:15", endTime: "12:15", label: "Period 2" },
  });

  const slot3 = await prisma.timeSlot.upsert({
    where: { startTime_endTime: { startTime: "13:00", endTime: "15:00" } },
    update: {},
    create: { startTime: "13:00", endTime: "15:00", label: "Period 3" },
  });

  const slot4 = await prisma.timeSlot.upsert({
    where: { startTime_endTime: { startTime: "15:15", endTime: "17:15" } },
    update: {},
    create: { startTime: "15:15", endTime: "17:15", label: "Period 4" },
  });
  console.log("✅ Time slots created");

  // ═══════════════════════════════════════════
  // 8. TIMETABLE ENTRIES
  // ═══════════════════════════════════════════

  const timetableData = [
    // ── LEVEL 100 ──
    // CS101 - Mon P1, Wed P1
    {
      courseAssignmentId: assign_cs101.id,
      dayOfWeek: DayOfWeek.MONDAY,
      timeSlotId: slot1.id,
      roomId: hallA.id,
    },
    {
      courseAssignmentId: assign_cs101.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      timeSlotId: slot1.id,
      roomId: hallA.id,
    },
    // CS102 - Tue P2, Thu P2
    {
      courseAssignmentId: assign_cs102.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      timeSlotId: slot2.id,
      roomId: lab1.id,
    },
    {
      courseAssignmentId: assign_cs102.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      timeSlotId: slot2.id,
      roomId: lab1.id,
    },
    // ENG101 - Tue P1, Fri P1
    {
      courseAssignmentId: assign_eng101.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      timeSlotId: slot1.id,
      roomId: room201.id,
    },
    {
      courseAssignmentId: assign_eng101.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      timeSlotId: slot1.id,
      roomId: room201.id,
    },
    // MTH101 - Mon P2, Thu P1
    {
      courseAssignmentId: assign_mth101.id,
      dayOfWeek: DayOfWeek.MONDAY,
      timeSlotId: slot2.id,
      roomId: hallB.id,
    },
    {
      courseAssignmentId: assign_mth101.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      timeSlotId: slot1.id,
      roomId: hallB.id,
    },

    // ── LEVEL 200 ──
    // CS201 - Mon P3, Wed P3
    {
      courseAssignmentId: assign_cs201.id,
      dayOfWeek: DayOfWeek.MONDAY,
      timeSlotId: slot3.id,
      roomId: lab1.id,
    },
    {
      courseAssignmentId: assign_cs201.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      timeSlotId: slot3.id,
      roomId: lab1.id,
    },
    // CS202 - Tue P3, Thu P3
    {
      courseAssignmentId: assign_cs202.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      timeSlotId: slot3.id,
      roomId: lab2.id,
    },
    {
      courseAssignmentId: assign_cs202.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      timeSlotId: slot3.id,
      roomId: lab2.id,
    },
    // ENG201 - Wed P2, Fri P2
    {
      courseAssignmentId: assign_eng201.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      timeSlotId: slot2.id,
      roomId: room201.id,
    },
    {
      courseAssignmentId: assign_eng201.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      timeSlotId: slot2.id,
      roomId: room201.id,
    },
    // MTH201 - Tue P4, Fri P3
    {
      courseAssignmentId: assign_mth201.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      timeSlotId: slot4.id,
      roomId: room301.id,
    },
    {
      courseAssignmentId: assign_mth201.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      timeSlotId: slot3.id,
      roomId: room301.id,
    },

    // ── LEVEL 300 ──
    // CS301 - Mon P4, Wed P4
    {
      courseAssignmentId: assign_cs301.id,
      dayOfWeek: DayOfWeek.MONDAY,
      timeSlotId: slot4.id,
      roomId: lab2.id,
    },
    {
      courseAssignmentId: assign_cs301.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      timeSlotId: slot4.id,
      roomId: lab2.id,
    },
    // CS302 - Thu P4, Fri P4
    {
      courseAssignmentId: assign_cs302.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      timeSlotId: slot4.id,
      roomId: lab1.id,
    },
    {
      courseAssignmentId: assign_cs302.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      timeSlotId: slot4.id,
      roomId: lab1.id,
    },
    // MTH301 - Wed P2, Thu P4 — NOTE: Thu P4 already taken by CS302 in lab1, so use room301
    {
      courseAssignmentId: assign_mth301.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      timeSlotId: slot2.id,
      roomId: room301.id,
    },
    {
      courseAssignmentId: assign_mth301.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      timeSlotId: slot3.id,
      roomId: hallA.id,
    },
  ];

  for (const entry of timetableData) {
    // Use the courseAssignment+day+timeSlot unique to upsert
    const existing = await prisma.timetableEntry.findUnique({
      where: {
        courseAssignmentId_dayOfWeek_timeSlotId: {
          courseAssignmentId: entry.courseAssignmentId,
          dayOfWeek: entry.dayOfWeek,
          timeSlotId: entry.timeSlotId,
        },
      },
    });
    if (!existing) {
      await prisma.timetableEntry.create({
        data: {
          ...entry,
          academicYear,
          semester: currentSemester,
        },
      });
    }
  }
  console.log("✅ Timetable entries created");

  // ═══════════════════════════════════════════
  // 9. PARENTS
  // ═══════════════════════════════════════════
  const parentPassword = await bcrypt.hash("parent123", 12);

  const parent1User = await prisma.user.upsert({
    where: { email: "marie.nguema@email.com" },
    update: {},
    create: {
      email: "marie.nguema@email.com",
      name: "Marie Nguema",
      password: parentPassword,
      role: Role.PARENT,
      parentProfile: {
        create: {
          firstName: "Marie",
          lastName: "Nguema",
          phone: "677000001",
          email: "marie.nguema@email.com",
          occupation: "Engineer",
          address: "Yaoundé, Cameroon",
        },
      },
    },
    include: { parentProfile: true },
  });

  const parent2User = await prisma.user.upsert({
    where: { email: "paul.tabi@email.com" },
    update: {},
    create: {
      email: "paul.tabi@email.com",
      name: "Paul Tabi",
      password: parentPassword,
      role: Role.PARENT,
      parentProfile: {
        create: {
          firstName: "Paul",
          lastName: "Tabi",
          phone: "677000002",
          email: "paul.tabi@email.com",
          occupation: "Doctor",
          address: "Douala, Cameroon",
        },
      },
    },
    include: { parentProfile: true },
  });
  console.log("✅ Parents created");

  // ═══════════════════════════════════════════
  // 10. STUDENTS
  // ═══════════════════════════════════════════
  const studentPassword = await bcrypt.hash("student123", 12);

  const studentsData = [
    // Level 100 students
    {
      matricNo: "UNI/CS/2024/001",
      firstName: "Alice",
      lastName: "Nguema",
      dateOfBirth: new Date("2005-03-15"),
      gender: Gender.FEMALE,
      departmentId: csDept.id,
      level: 100,
      parentId: parent1User.parentProfile!.id,
      phone: "690000001",
      address: "Yaoundé",
      email: "alice@university.com",
    },
    {
      matricNo: "UNI/CS/2024/002",
      firstName: "Bob",
      lastName: "Tabi",
      dateOfBirth: new Date("2004-11-22"),
      gender: Gender.MALE,
      departmentId: csDept.id,
      level: 100,
      parentId: parent2User.parentProfile!.id,
      phone: "690000002",
      address: "Douala",
      email: "bob@university.com",
    },
    // Level 200 students
    {
      matricNo: "UNI/CS/2023/001",
      firstName: "Clara",
      lastName: "Mbeki",
      dateOfBirth: new Date("2003-07-10"),
      gender: Gender.FEMALE,
      departmentId: csDept.id,
      level: 200,
      parentId: parent1User.parentProfile!.id,
      address: "Yaoundé",
      email: "clara@university.com",
    },
    {
      matricNo: "UNI/ENG/2023/001",
      firstName: "David",
      lastName: "Foncha",
      dateOfBirth: new Date("2003-01-05"),
      gender: Gender.MALE,
      departmentId: engDept.id,
      level: 200,
      parentId: parent2User.parentProfile!.id,
      address: "Bamenda",
      email: "david@university.com",
    },
    // Level 300 students
    {
      matricNo: "UNI/CS/2022/001",
      firstName: "Eva",
      lastName: "Biya",
      dateOfBirth: new Date("2002-09-18"),
      gender: Gender.FEMALE,
      departmentId: csDept.id,
      level: 300,
      address: "Yaoundé",
      email: "eva@university.com",
    },
    {
      matricNo: "UNI/MTH/2022/001",
      firstName: "Frank",
      lastName: "Ondoa",
      dateOfBirth: new Date("2002-04-12"),
      gender: Gender.MALE,
      departmentId: mathDept.id,
      level: 300,
      address: "Buea",
      email: "frank@university.com",
    },
  ];

  const createdStudents: Record<string, string> = {};

  for (const data of studentsData) {
    const { email, ...studentFields } = data;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `${data.firstName} ${data.lastName}`,
        password: studentPassword,
        role: Role.STUDENT,
        studentProfile: {
          create: studentFields,
        },
      },
      include: { studentProfile: true },
    });

    if (user.studentProfile) {
      createdStudents[email] = user.studentProfile.id;
    }
  }
  console.log("✅ Students created");

  // ═══════════════════════════════════════════
  // 11. COURSE ENROLLMENTS
  //     Students take their level courses + some cross-level/cross-dept
  // ═══════════════════════════════════════════

  const enrollmentMap = [
    // Alice (CS, Level 100): CS101, CS102, ENG101, MTH101
    { email: "alice@university.com", assignmentId: assign_cs101.id },
    { email: "alice@university.com", assignmentId: assign_cs102.id },
    { email: "alice@university.com", assignmentId: assign_eng101.id },
    { email: "alice@university.com", assignmentId: assign_mth101.id },

    // Bob (CS, Level 100): CS101, CS102, ENG101, MTH101
    { email: "bob@university.com", assignmentId: assign_cs101.id },
    { email: "bob@university.com", assignmentId: assign_cs102.id },
    { email: "bob@university.com", assignmentId: assign_eng101.id },
    { email: "bob@university.com", assignmentId: assign_mth101.id },

    // Clara (CS, Level 200): CS201, CS202, ENG201, MTH201
    { email: "clara@university.com", assignmentId: assign_cs201.id },
    { email: "clara@university.com", assignmentId: assign_cs202.id },
    { email: "clara@university.com", assignmentId: assign_eng201.id },
    { email: "clara@university.com", assignmentId: assign_mth201.id },

    // David (ENG, Level 200): ENG201, CS201, MTH201 (cross-dept courses)
    { email: "david@university.com", assignmentId: assign_eng201.id },
    { email: "david@university.com", assignmentId: assign_cs201.id },
    { email: "david@university.com", assignmentId: assign_mth201.id },

    // Eva (CS, Level 300): CS301, CS302, MTH301
    { email: "eva@university.com", assignmentId: assign_cs301.id },
    { email: "eva@university.com", assignmentId: assign_cs302.id },
    { email: "eva@university.com", assignmentId: assign_mth301.id },

    // Frank (MTH, Level 300): MTH301, CS301, CS302 (cross-dept)
    { email: "frank@university.com", assignmentId: assign_mth301.id },
    { email: "frank@university.com", assignmentId: assign_cs301.id },
    { email: "frank@university.com", assignmentId: assign_cs302.id },
  ];

  for (const enrollment of enrollmentMap) {
    const studentId = createdStudents[enrollment.email];
    if (!studentId) continue;

    await prisma.courseEnrollment.upsert({
      where: {
        studentId_courseAssignmentId: {
          studentId,
          courseAssignmentId: enrollment.assignmentId,
        },
      },
      update: {},
      create: {
        studentId,
        courseAssignmentId: enrollment.assignmentId,
        enrollmentStatus: "ENROLLED",
      },
    });
  }
  console.log("✅ Course enrollments created");

  // ═══════════════════════════════════════════
  // 12. ATTENDANCE
  // ═══════════════════════════════════════════
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = new Date(yesterday.toISOString().split("T")[0]);

  // Attendance for CS101 (yesterday)
  const cs101Students = enrollmentMap
    .filter((e) => e.assignmentId === assign_cs101.id)
    .map((e) => createdStudents[e.email])
    .filter(Boolean);

  const statusCycle: AttendanceStatus[] = [
    "PRESENT",
    "LATE",
    "PRESENT",
    "ABSENT",
  ];
  for (let i = 0; i < cs101Students.length; i++) {
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_courseAssignmentId_date: {
          studentId: cs101Students[i],
          courseAssignmentId: assign_cs101.id,
          date: yesterdayDate,
        },
      },
    });
    if (!existing) {
      await prisma.attendance.create({
        data: {
          studentId: cs101Students[i],
          courseAssignmentId: assign_cs101.id,
          date: yesterdayDate,
          status: statusCycle[i % statusCycle.length],
        },
      });
    }
  }

  // Attendance for CS301 (yesterday)
  const cs301Students = enrollmentMap
    .filter((e) => e.assignmentId === assign_cs301.id)
    .map((e) => createdStudents[e.email])
    .filter(Boolean);

  for (let i = 0; i < cs301Students.length; i++) {
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_courseAssignmentId_date: {
          studentId: cs301Students[i],
          courseAssignmentId: assign_cs301.id,
          date: yesterdayDate,
        },
      },
    });
    if (!existing) {
      await prisma.attendance.create({
        data: {
          studentId: cs301Students[i],
          courseAssignmentId: assign_cs301.id,
          date: yesterdayDate,
          status: statusCycle[i % statusCycle.length],
        },
      });
    }
  }
  console.log("✅ Attendance records created");

  // ═══════════════════════════════════════════
  // 13. FEE PAYMENTS
  // ═══════════════════════════════════════════
  const allStudents = await prisma.student.findMany();
  for (const student of allStudents) {
    const existingTuition = await prisma.feePayment.findFirst({
      where: {
        studentId: student.id,
        feeType: "Tuition",
        academicYear,
        semester: currentSemester,
      },
    });
    if (!existingTuition) {
      await prisma.feePayment.create({
        data: {
          studentId: student.id,
          amount: 250000,
          paidAmount: 0,
          dueDate: new Date("2025-03-31"),
          feeType: "Tuition",
          semester: currentSemester,
          academicYear,
          status: "PENDING",
        },
      });
    }

    const existingReg = await prisma.feePayment.findFirst({
      where: {
        studentId: student.id,
        feeType: "Registration",
        academicYear,
      },
    });
    if (!existingReg) {
      await prisma.feePayment.create({
        data: {
          studentId: student.id,
          amount: 50000,
          paidAmount: 50000,
          dueDate: new Date("2024-09-15"),
          paymentDate: new Date("2024-09-10"),
          feeType: "Registration",
          academicYear,
          status: "PAID",
          method: "CASH",
          receiptNumber: `REC-${student.matricNo.replace(/\//g, "-")}-REG`,
        },
      });
    }
  }
  console.log("✅ Fee payments created");

  // ═══════════════════════════════════════════
  // 14. SALARY PAYMENTS
  // ═══════════════════════════════════════════
  const allTeachers = await prisma.teacher.findMany();
  for (const teacher of allTeachers) {
    for (const month of ["2025-01", "2025-02"]) {
      const existing = await prisma.salaryPayment.findUnique({
        where: {
          teacherId_monthYear: {
            teacherId: teacher.id,
            monthYear: month,
          },
        },
      });
      if (!existing) {
        await prisma.salaryPayment.create({
          data: {
            teacherId: teacher.id,
            amount: teacher.salaryBase || 400000,
            paymentDate:
              month === "2025-01" ? new Date("2025-01-31") : new Date(),
            monthYear: month,
            status: month === "2025-01" ? "PAID" : "PENDING",
          },
        });
      }
    }
  }
  console.log("✅ Salary payments created");

  // ═══════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════
  console.log("");
  console.log("🎉 University seeding complete!");
  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("📋 LOGIN CREDENTIALS");
  console.log("═══════════════════════════════════════════════════");
  console.log("  Admin:    admin@university.com            / admin123");
  console.log("");
  console.log("  Teachers:");
  console.log(
    "    prof.kamga@university.com    / teacher123  → CS101, CS201, CS302",
  );
  console.log(
    "    dr.nkembe@university.com     / teacher123  → ENG101, ENG201",
  );
  console.log(
    "    mr.fon@university.com        / teacher123  → MTH101, MTH201, MTH301",
  );
  console.log(
    "    dr.etame@university.com      / teacher123  → CS102, CS202, CS301",
  );
  console.log("");
  console.log("  Students:");
  console.log(
    "    alice@university.com   / student123  → L100 CS  (4 courses)",
  );
  console.log(
    "    bob@university.com     / student123  → L100 CS  (4 courses)",
  );
  console.log(
    "    clara@university.com   / student123  → L200 CS  (4 courses)",
  );
  console.log(
    "    david@university.com   / student123  → L200 ENG (3 courses)",
  );
  console.log(
    "    eva@university.com     / student123  → L300 CS  (3 courses)",
  );
  console.log(
    "    frank@university.com   / student123  → L300 MTH (3 courses)",
  );
  console.log("");
  console.log("  Parents:");
  console.log("    marie.nguema@email.com / parent123");
  console.log("    paul.tabi@email.com    / parent123");
  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("📅 TIMETABLE OVERVIEW");
  console.log("═══════════════════════════════════════════════════");
  console.log("  Time Slots:");
  console.log(
    "    P1: 08:00-10:00 | P2: 10:15-12:15 | P3: 13:00-15:00 | P4: 15:15-17:15",
  );
  console.log("");
  console.log("  Level 100:");
  console.log("    CS101  → Mon P1 (Hall A),   Wed P1 (Hall A)");
  console.log("    CS102  → Tue P2 (Lab 1),    Thu P2 (Lab 1)");
  console.log("    ENG101 → Tue P1 (Room 201), Fri P1 (Room 201)");
  console.log("    MTH101 → Mon P2 (Hall B),   Thu P1 (Hall B)");
  console.log("");
  console.log("  Level 200:");
  console.log("    CS201  → Mon P3 (Lab 1),    Wed P3 (Lab 1)");
  console.log("    CS202  → Tue P3 (Lab 2),    Thu P3 (Lab 2)");
  console.log("    ENG201 → Wed P2 (Room 201), Fri P2 (Room 201)");
  console.log("    MTH201 → Tue P4 (Room 301), Fri P3 (Room 301)");
  console.log("");
  console.log("  Level 300:");
  console.log("    CS301  → Mon P4 (Lab 2),    Wed P4 (Lab 2)");
  console.log("    CS302  → Thu P4 (Lab 1),    Fri P4 (Lab 1)");
  console.log("    MTH301 → Wed P2 (Room 301), Fri P3 (Hall A)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
