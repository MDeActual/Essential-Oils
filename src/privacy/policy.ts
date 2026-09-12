export type DataPurpose =
  | 'protocol_delivery'
  | 'outcome_tracking'
  | 'safety_monitoring'
  | 'subject_export'
  | 'subject_deletion'
  | 'deidentified_analytics';

export type DataClassification =
  | 'identity_reference'
  | 'wellness_sensitive'
  | 'protocol'
  | 'outcome'
  | 'consent'
  | 'audit_metadata';

export interface TrustedSubjectContext {
  tenantId: string;
  subjectId: string;
}

export interface ConsentGrant {
  tenantId: string;
  subjectId: string;
  purpose: DataPurpose;
  noticeVersion: string;
  grantedAt: Date;
  revokedAt: Date | null;
  expiresAt: Date | null;
}

export interface LegalHold {
  tenantId: string;
  subjectId: string;
  active: boolean;
  startsAt: Date;
  endsAt: Date | null;
}

export interface RetentionRule {
  classification: DataClassification;
  retentionDays: number;
}

export type PrivacyDecisionCode =
  | 'allowed'
  | 'tenant_mismatch'
  | 'subject_mismatch'
  | 'consent_missing'
  | 'consent_revoked'
  | 'consent_expired'
  | 'legal_hold_active'
  | 'retention_active'
  | 'retention_expired';

export interface PrivacyDecision {
  allowed: boolean;
  code: PrivacyDecisionCode;
}

function sameBoundary(
  trusted: TrustedSubjectContext,
  tenantId: string,
  subjectId: string
): PrivacyDecision | null {
  if (tenantId !== trusted.tenantId) {
    return { allowed: false, code: 'tenant_mismatch' };
  }
  if (subjectId !== trusted.subjectId) {
    return { allowed: false, code: 'subject_mismatch' };
  }
  return null;
}

export function authorizePurpose(input: {
  trusted: TrustedSubjectContext;
  purpose: DataPurpose;
  consent: ConsentGrant | null;
  now: Date;
}): PrivacyDecision {
  const { trusted, purpose, consent, now } = input;
  if (!consent) return { allowed: false, code: 'consent_missing' };

  const boundaryFailure = sameBoundary(
    trusted,
    consent.tenantId,
    consent.subjectId
  );
  if (boundaryFailure) return boundaryFailure;
  if (consent.purpose !== purpose) {
    return { allowed: false, code: 'consent_missing' };
  }
  if (consent.revokedAt && consent.revokedAt.getTime() <= now.getTime()) {
    return { allowed: false, code: 'consent_revoked' };
  }
  if (consent.expiresAt && consent.expiresAt.getTime() <= now.getTime()) {
    return { allowed: false, code: 'consent_expired' };
  }

  return { allowed: true, code: 'allowed' };
}

export function authorizeDeletion(input: {
  trusted: TrustedSubjectContext;
  targetTenantId: string;
  targetSubjectId: string;
  legalHold: LegalHold | null;
  now: Date;
}): PrivacyDecision {
  const boundaryFailure = sameBoundary(
    input.trusted,
    input.targetTenantId,
    input.targetSubjectId
  );
  if (boundaryFailure) return boundaryFailure;

  const hold = input.legalHold;
  if (
    hold &&
    hold.active &&
    hold.tenantId === input.trusted.tenantId &&
    hold.subjectId === input.trusted.subjectId &&
    hold.startsAt.getTime() <= input.now.getTime() &&
    (!hold.endsAt || hold.endsAt.getTime() > input.now.getTime())
  ) {
    return { allowed: false, code: 'legal_hold_active' };
  }

  return { allowed: true, code: 'allowed' };
}

export function evaluateRetention(input: {
  createdAt: Date;
  now: Date;
  rule: RetentionRule;
}): PrivacyDecision {
  if (!Number.isInteger(input.rule.retentionDays) || input.rule.retentionDays < 0) {
    throw new Error('retentionDays must be a non-negative integer');
  }

  const expiresAt = new Date(input.createdAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + input.rule.retentionDays);

  return input.now.getTime() >= expiresAt.getTime()
    ? { allowed: true, code: 'retention_expired' }
    : { allowed: false, code: 'retention_active' };
}
