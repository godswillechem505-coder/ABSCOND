import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AcademicSession,
  Campus,
  ContactMessage,
  Document,
  FeeStructure,
  Payment,
  Programme,
  Semester,
  Student,
  User,
  initModels,
} from '../src/models/index.js';
import { sequelize } from '../src/config/database.js';

test('Admin Dashboard Stats Calculation', async (t) => {
  initModels();
  await sequelize.sync({ force: false });

  await t.test('queries student, document, staff, message, and semester counts successfully', async () => {
    const now = new Date();
    const [
      totalStudents,
      activeStudents,
      pendingDocuments,
      totalStaff,
      unreadContactMessages,
      openRegistrationWindows,
    ] = await Promise.all([
      Student.count(),
      Student.count({ where: { status: 'active' } }),
      Document.count({ where: { status: 'pending' } }),
      User.count({ where: { role: ['staff', 'admin', 'super_admin'] } }),
      ContactMessage.count({ where: { status: 'new' } }),
      Semester.count({
        where: {
          registrationOpensAt: { [sequelize.Sequelize.Op.lte]: now },
          registrationClosesAt: { [sequelize.Sequelize.Op.gte]: now },
        },
      }),
    ]);

    assert.equal(typeof totalStudents, 'number');
    assert.equal(typeof activeStudents, 'number');
    assert.equal(typeof pendingDocuments, 'number');
    assert.equal(typeof totalStaff, 'number');
    assert.equal(typeof unreadContactMessages, 'number');
    assert.equal(typeof openRegistrationWindows, 'number');
  });
});
