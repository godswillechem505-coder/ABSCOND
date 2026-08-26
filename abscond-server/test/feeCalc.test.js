import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure calculation logic matching Fee Controller
 */
function calculateFeeBalance(structures = [], payments = []) {
  const totalBilled = structures.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const totalPaid = payments
    .filter((p) => p.status === 'verified' || p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  return {
    totalBilled,
    totalPaid,
    outstanding,
    hasHold: totalBilled > 0 && outstanding > 0,
    status: outstanding === 0 ? 'paid_in_full' : totalPaid > 0 ? 'partial' : 'unpaid',
  };
}

test('Fee Balance & Hold Calculation', async (t) => {
  await t.test('detects fully paid status when payments equal or exceed billed amount', () => {
    const structures = [{ totalAmount: 150000 }];
    const payments = [{ amount: 150000, status: 'verified' }];

    const calc = calculateFeeBalance(structures, payments);
    assert.equal(calc.totalBilled, 150000);
    assert.equal(calc.totalPaid, 150000);
    assert.equal(calc.outstanding, 0);
    assert.equal(calc.hasHold, false);
    assert.equal(calc.status, 'paid_in_full');
  });

  await t.test('detects partial payment and activates fee hold', () => {
    const structures = [{ totalAmount: 185000 }];
    const payments = [{ amount: 100000, status: 'verified' }];

    const calc = calculateFeeBalance(structures, payments);
    assert.equal(calc.totalBilled, 185000);
    assert.equal(calc.totalPaid, 100000);
    assert.equal(calc.outstanding, 85000);
    assert.equal(calc.hasHold, true);
    assert.equal(calc.status, 'partial');
  });

  await t.test('ignores pending or failed payment attempts in total paid calculation', () => {
    const structures = [{ totalAmount: 100000 }];
    const payments = [
      { amount: 50000, status: 'pending' },
      { amount: 50000, status: 'failed' },
    ];

    const calc = calculateFeeBalance(structures, payments);
    assert.equal(calc.totalPaid, 0);
    assert.equal(calc.outstanding, 100000);
    assert.equal(calc.hasHold, true);
    assert.equal(calc.status, 'unpaid');
  });
});
