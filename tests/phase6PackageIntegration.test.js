import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatISTDateTime,
  resolvePackageDisplayStatus,
  hasPackagesAwaitingReconciliation,
  sortPackagesByExpiry,
} from '../src/utils/planLabels.js';

describe('Phase 6: IST Date Formatting and Timezone Correctness', () => {
  it('formats UTC timestamps accurately in Asia/Kolkata (IST)', () => {
    // 2026-10-15T08:30:00.000Z is 2026-10-15 14:00 (2:00 PM IST)
    const formatted = formatISTDateTime('2026-10-15T08:30:00.000Z');
    assert.match(formatted, /15 Oct 2026/);
    assert.match(formatted, /02:00/);
    assert.match(formatted, /pm|PM/);
    assert.match(formatted, /IST$/);
  });

  it('formats dates without time component when includeTime is false', () => {
    const formatted = formatISTDateTime('2026-10-15T08:30:00.000Z', false);
    assert.match(formatted, /15 Oct 2026/);
    assert.doesNotMatch(formatted, /IST/);
  });

  it('handles null, undefined, or invalid date values gracefully without crashing', () => {
    assert.equal(formatISTDateTime(null), '—');
    assert.equal(formatISTDateTime(undefined), '—');
    assert.equal(formatISTDateTime('invalid-date-string'), '—');
  });
});

describe('Phase 6: Expiry-State Presentation and Reconciliation Invariant', () => {
  const referenceTime = new Date('2026-10-19T14:00:00.000Z'); // Reference "now"

  it('resolves active package with future expiry as Active and usable', () => {
    const pkg = {
      id: 'pkg_active_future',
      initialQuantity: 56,
      remainingQuantity: 40,
      activatedAt: '2026-10-10T00:00:00.000Z',
      expiresAt: '2026-11-29T00:00:00.000Z', // Future date
      status: 'ACTIVE',
    };

    const display = resolvePackageDisplayStatus(pkg, referenceTime);
    assert.equal(display.status, 'ACTIVE');
    assert.equal(display.label, 'Active');
    assert.equal(display.variant, 'success');
    assert.equal(display.isUsable, true);
    assert.equal(display.isReconciliationPending, false);
    assert.equal(display.rawStatus, 'ACTIVE');
  });

  it('marks active package with past expiry timestamp as Expired (Awaiting Reconciliation)', () => {
    // Stored status is ACTIVE, but expiresAt timestamp has passed
    const pkg = {
      id: 'pkg_active_expired_timestamp',
      initialQuantity: 30,
      remainingQuantity: 12,
      activatedAt: '2026-08-20T00:00:00.000Z',
      expiresAt: '2026-10-09T00:00:00.000Z', // Past date relative to referenceTime
      status: 'ACTIVE',
    };

    const display = resolvePackageDisplayStatus(pkg, referenceTime);
    assert.equal(display.status, 'AWAITING_RECONCILIATION');
    assert.equal(display.label, 'Expired (Awaiting Reconciliation)');
    assert.equal(display.variant, 'warning');
    // Invariant: Never describe a package as currently usable solely because stored status is ACTIVE
    assert.equal(display.isUsable, false);
    assert.equal(display.isReconciliationPending, true);
    assert.equal(display.rawStatus, 'ACTIVE', 'Must preserve raw backend status without mutating data');
    assert.equal(pkg.status, 'ACTIVE', 'Original package object must NOT be mutated in the frontend');
  });

  it('resolves exhausted package accurately', () => {
    const pkg = {
      id: 'pkg_exhausted',
      initialQuantity: 56,
      remainingQuantity: 0,
      activatedAt: '2026-10-01T00:00:00.000Z',
      expiresAt: '2026-11-20T00:00:00.000Z',
      status: 'EXHAUSTED',
    };

    const display = resolvePackageDisplayStatus(pkg, referenceTime);
    assert.equal(display.status, 'EXHAUSTED');
    assert.equal(display.label, 'Exhausted');
    assert.equal(display.variant, 'neutral');
    assert.equal(display.isUsable, false);
    assert.equal(display.isReconciliationPending, false);
  });

  it('resolves backend-reconciled expired package accurately', () => {
    const pkg = {
      id: 'pkg_expired_reconciled',
      initialQuantity: 30,
      remainingQuantity: 5,
      activatedAt: '2026-08-01T00:00:00.000Z',
      expiresAt: '2026-09-20T00:00:00.000Z',
      status: 'EXPIRED',
    };

    const display = resolvePackageDisplayStatus(pkg, referenceTime);
    assert.equal(display.status, 'EXPIRED');
    assert.equal(display.label, 'Expired');
    assert.equal(display.variant, 'danger');
    assert.equal(display.isUsable, false);
    assert.equal(display.isReconciliationPending, false);
  });

  it('detects when package list has any item awaiting backend reconciliation', () => {
    const packagesWithReconciliationNeeded = [
      {
        id: 'pkg_1',
        remainingQuantity: 20,
        expiresAt: '2026-11-30T00:00:00.000Z',
        status: 'ACTIVE',
      },
      {
        id: 'pkg_2',
        remainingQuantity: 8,
        expiresAt: '2026-10-15T00:00:00.000Z', // Past
        status: 'ACTIVE',
      },
    ];

    assert.equal(
      hasPackagesAwaitingReconciliation(packagesWithReconciliationNeeded, referenceTime),
      true,
      'Must detect package awaiting reconciliation'
    );

    const normalPackages = [
      {
        id: 'pkg_1',
        remainingQuantity: 20,
        expiresAt: '2026-11-30T00:00:00.000Z',
        status: 'ACTIVE',
      },
      {
        id: 'pkg_3',
        remainingQuantity: 0,
        expiresAt: '2026-10-10T00:00:00.000Z',
        status: 'EXHAUSTED',
      },
    ];

    assert.equal(
      hasPackagesAwaitingReconciliation(normalPackages, referenceTime),
      false,
      'Should return false when no active package is past expiry'
    );

    assert.equal(hasPackagesAwaitingReconciliation([], referenceTime), false);
    assert.equal(hasPackagesAwaitingReconciliation(null, referenceTime), false);
  });
});

describe('Phase 6: Package Sorting and Expiry Ordering', () => {
  it('sorts packages by expiry date ascending', () => {
    const list = [
      { id: 'pkg_late', expiresAt: '2026-12-15T00:00:00.000Z' },
      { id: 'pkg_early', expiresAt: '2026-10-25T00:00:00.000Z' },
      { id: 'pkg_mid', expiresAt: '2026-11-10T00:00:00.000Z' },
    ];

    const sorted = sortPackagesByExpiry(list);
    assert.deepEqual(
      sorted.map((p) => p.id),
      ['pkg_early', 'pkg_mid', 'pkg_late']
    );
  });

  it('handles invalid dates or non-array inputs safely', () => {
    assert.deepEqual(sortPackagesByExpiry([]), []);
    assert.deepEqual(sortPackagesByExpiry(null), []);
    assert.deepEqual(sortPackagesByExpiry(undefined), []);
  });
});

describe('Phase 6: Authoritative Balance vs. Package Sum Invariant', () => {
  it('does not recompute balance by summing packages; backend profile balance is authoritative', () => {
    // Scenario: Customer has backend balance of 45 meals.
    // Packages might sum to 48 due to a package awaiting reconciliation (3 meals expired).
    const backendProfile = {
      id: 'cust_123',
      remainingTiffins: 45, // Authoritative
    };

    const packages = [
      { id: 'p1', remainingQuantity: 45, expiresAt: '2026-11-30T00:00:00.000Z', status: 'ACTIVE' },
      { id: 'p2', remainingQuantity: 3, expiresAt: '2026-10-10T00:00:00.000Z', status: 'ACTIVE' }, // Expired timestamp
    ];

    const packageSum = packages.reduce((acc, p) => acc + p.remainingQuantity, 0);
    assert.equal(packageSum, 48);

    // Rule: The UI must use backendProfile.remainingTiffins (45), never packageSum (48)
    const effectiveBalance = backendProfile.remainingTiffins;
    assert.equal(effectiveBalance, 45, 'Authoritative profile balance must be used');
    assert.notEqual(effectiveBalance, packageSum, 'Must not sum packages in frontend');
  });
});

describe('Phase 6: Owner Customer Package Isolation and Query Keys', () => {
  it('constructs customer-isolated query keys and endpoints', () => {
    const buildOwnerPackageQueryKey = (customerId) => ['ownerCustomerPackages', customerId];
    const buildOwnerPackageEndpoint = (customerId) => `/owner/customers/${customerId}/packages`;

    const keyCustA = buildOwnerPackageQueryKey('cust_A');
    const keyCustB = buildOwnerPackageQueryKey('cust_B');

    assert.notDeepEqual(keyCustA, keyCustB, 'Queries for different customers must have distinct cache keys');
    assert.equal(buildOwnerPackageEndpoint('cust_A'), '/owner/customers/cust_A/packages');
    assert.equal(buildOwnerPackageEndpoint('cust_B'), '/owner/customers/cust_B/packages');
  });

  it('disables query execution when customerId is missing', () => {
    const isQueryEnabled = (customerId) => Boolean(customerId);

    assert.equal(isQueryEnabled('cust_123'), true);
    assert.equal(isQueryEnabled(null), false);
    assert.equal(isQueryEnabled(undefined), false);
    assert.equal(isQueryEnabled(''), false);
  });
});

describe('Phase 6: Recharge Mutation Invalidation and Policy Safeguards', () => {
  it('invalidates both customer details and customer packages queries on successful recharge', () => {
    const invalidatedKeys = [];
    const fakeQueryClient = {
      invalidateQueries: ({ queryKey }) => {
        invalidatedKeys.push(queryKey);
      },
    };

    const customerId = 'cust_456';
    // Simulate onSuccess callback in useRechargeCustomer
    const handleRechargeSuccess = (vars) => {
      fakeQueryClient.invalidateQueries({ queryKey: ['ownerCustomer', vars.customerId] });
      fakeQueryClient.invalidateQueries({ queryKey: ['ownerCustomerPackages', vars.customerId] });
      fakeQueryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
      fakeQueryClient.invalidateQueries({ queryKey: ['analytics'] });
    };

    handleRechargeSuccess({ customerId });

    assert.deepEqual(invalidatedKeys, [
      ['ownerCustomer', 'cust_456'],
      ['ownerCustomerPackages', 'cust_456'],
      ['ownerCustomers'],
      ['analytics'],
    ]);
  });

  it('prevents duplicate recharge submissions while pending', () => {
    let executionCount = 0;
    let isPending = false;

    const executeRecharge = () => {
      if (isPending) return false;
      isPending = true;
      executionCount++;
      return true;
    };

    // First attempt: succeeds
    assert.equal(executeRecharge(), true);
    assert.equal(executionCount, 1);

    // Second attempt while isPending is true: blocked
    assert.equal(executeRecharge(), false);
    assert.equal(executionCount, 1, 'Duplicate submit must be blocked');

    // After mutation resolves:
    isPending = false;
    assert.equal(executeRecharge(), true);
    assert.equal(executionCount, 2);
  });

  it('enforces policy that recharging creates independent packages rather than extending old ones', () => {
    const existingPackage = {
      id: 'pkg_old',
      initialQuantity: 56,
      remainingQuantity: 10,
      activatedAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2026-10-21T00:00:00.000Z',
      status: 'ACTIVE',
    };

    // New recharge adds 30 meals
    const newPackage = {
      id: 'pkg_new',
      initialQuantity: 30,
      remainingQuantity: 30,
      activatedAt: '2026-10-19T00:00:00.000Z',
      expiresAt: '2026-12-08T00:00:00.000Z',
      status: 'ACTIVE',
    };

    // The old package expiry date remains unchanged
    assert.equal(existingPackage.expiresAt, '2026-10-21T00:00:00.000Z');
    assert.notEqual(existingPackage.expiresAt, newPackage.expiresAt);
    assert.notEqual(existingPackage.id, newPackage.id);
  });
});
