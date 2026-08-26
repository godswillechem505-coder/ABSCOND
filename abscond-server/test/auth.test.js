import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { STAFF_ROLES, USER_ROLES, PERMISSIONS, hasPermission } from '../src/config/permissions.js';

test('Auth & RBAC Permissions', async (t) => {
  await t.test('verifies password hashing and comparison with bcrypt', async () => {
    const password = 'StudentSecurePassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const isMatch = await bcrypt.compare(password, hash);
    assert.equal(isMatch, true);

    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.equal(wrongMatch, false);
  });

  await t.test('super admin possesses all permissions', () => {
    const superAdminUser = { role: USER_ROLES.SUPER_ADMIN };
    assert.equal(hasPermission(superAdminUser, PERMISSIONS.MANAGE_RESULTS), true);
    assert.equal(hasPermission(superAdminUser, PERMISSIONS.MANAGE_FEES), true);
    assert.equal(hasPermission(superAdminUser, PERMISSIONS.MANAGE_STAFF), true);
  });

  await t.test('bursary staff has fee write permission but cannot enter academic results', () => {
    const bursaryUser = { role: USER_ROLES.STAFF, staffRole: STAFF_ROLES.BURSARY };
    assert.equal(hasPermission(bursaryUser, PERMISSIONS.MANAGE_FEES), true);
    assert.equal(hasPermission(bursaryUser, PERMISSIONS.MANAGE_RESULTS), false);
    assert.equal(hasPermission(bursaryUser, PERMISSIONS.MANAGE_STAFF), false);
  });

  await t.test('academic affairs staff has results write permission but cannot manage fees', () => {
    const academicUser = { role: USER_ROLES.STAFF, staffRole: STAFF_ROLES.ACADEMIC_AFFAIRS };
    assert.equal(hasPermission(academicUser, PERMISSIONS.MANAGE_RESULTS), true);
    assert.equal(hasPermission(academicUser, PERMISSIONS.MANAGE_FEES), false);
  });

  await t.test('students only have student scope and no admin permissions', () => {
    const studentUser = { role: USER_ROLES.STUDENT };
    assert.equal(hasPermission(studentUser, PERMISSIONS.MANAGE_RESULTS), false);
    assert.equal(hasPermission(studentUser, PERMISSIONS.MANAGE_FEES), false);
  });
});
