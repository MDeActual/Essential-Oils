import {
  authorizeDeletion,
  authorizePurpose,
  evaluateRetention,
  type ConsentGrant,
  type LegalHold,
  type TrustedSubjectContext
} from '../policy';

const trusted: TrustedSubjectContext = {
  tenantId: 'tenant-a',
  subjectId: 'subject-1'
};
const now = new Date('2026-08-05T22:00:00.000Z');

function consent(overrides: Partial<ConsentGrant> = {}): ConsentGrant {
  return {
    tenantId: trusted.tenantId,
    subjectId: trusted.subjectId,
    purpose: 'outcome_tracking',
    noticeVersion: 'privacy-v1',
    grantedAt: new Date('2026-08-01T00:00:00.000Z'),
    revokedAt: null,
    expiresAt: null,
    ...overrides
  };
}

describe('authorizePurpose', () => {
  test('allows an active consent bound to the trusted tenant and subject', () => {
    expect(
      authorizePurpose({
        trusted,
        purpose: 'outcome_tracking',
        consent: consent(),
        now
      })
    ).toEqual({ allowed: true, code: 'allowed' });
  });

  test.each([
    [null, 'consent_missing'],
    [consent({ revokedAt: now }), 'consent_revoked'],
    [consent({ expiresAt: now }), 'consent_expired'],
    [consent({ tenantId: 'tenant-b' }), 'tenant_mismatch'],
    [consent({ subjectId: 'subject-2' }), 'subject_mismatch'],
    [consent({ purpose: 'protocol_delivery' }), 'consent_missing']
  ] as const)('fails closed for invalid consent %#', (grant, code) => {
    expect(
      authorizePurpose({
        trusted,
        purpose: 'outcome_tracking',
        consent: grant,
        now
      })
    ).toEqual({ allowed: false, code });
  });
});

describe('authorizeDeletion', () => {
  test('blocks deletion during an active legal hold', () => {
    const legalHold: LegalHold = {
      tenantId: trusted.tenantId,
      subjectId: trusted.subjectId,
      active: true,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: null
    };

    expect(
      authorizeDeletion({
        trusted,
        targetTenantId: trusted.tenantId,
        targetSubjectId: trusted.subjectId,
        legalHold,
        now
      })
    ).toEqual({ allowed: false, code: 'legal_hold_active' });
  });

  test('rejects cross-tenant deletion before evaluating a hold', () => {
    expect(
      authorizeDeletion({
        trusted,
        targetTenantId: 'tenant-b',
        targetSubjectId: trusted.subjectId,
        legalHold: null,
        now
      })
    ).toEqual({ allowed: false, code: 'tenant_mismatch' });
  });

  test('allows an in-scope deletion when no active hold applies', () => {
    expect(
      authorizeDeletion({
        trusted,
        targetTenantId: trusted.tenantId,
        targetSubjectId: trusted.subjectId,
        legalHold: null,
        now
      })
    ).toEqual({ allowed: true, code: 'allowed' });
  });
});

describe('evaluateRetention', () => {
  test('marks records eligible only after the configured retention period', () => {
    expect(
      evaluateRetention({
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        now: new Date('2026-08-03T23:59:59.000Z'),
        rule: { classification: 'audit_metadata', retentionDays: 3 }
      })
    ).toEqual({ allowed: false, code: 'retention_active' });

    expect(
      evaluateRetention({
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        now: new Date('2026-08-04T00:00:00.000Z'),
        rule: { classification: 'audit_metadata', retentionDays: 3 }
      })
    ).toEqual({ allowed: true, code: 'retention_expired' });
  });

  test('rejects invalid retention rules', () => {
    expect(() =>
      evaluateRetention({
        createdAt: now,
        now,
        rule: { classification: 'wellness_sensitive', retentionDays: -1 }
      })
    ).toThrow('retentionDays must be a non-negative integer');
  });
});
