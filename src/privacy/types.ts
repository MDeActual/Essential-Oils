export type DataClassification =
  | "public"
  | "internal"
  | "identity_reference"
  | "wellness_sensitive"
  | "audit_metadata";

export type ProcessingPurpose =
  | "account_management"
  | "personalized_guidance"
  | "safety_monitoring"
  | "product_improvement"
  | "legal_obligation";

export interface ConsentRecord {
  tenantId: string;
  subjectId: string;
  purpose: ProcessingPurpose;
  noticeVersion: string;
  grantedAt: Date;
  revokedAt?: Date;
}

export interface ProcessingRequest {
  tenantId: string;
  subjectId: string;
  purpose: ProcessingPurpose;
  classification: DataClassification;
}

export interface ProcessingDecision {
  allowed: boolean;
  reason:
    | "allowed"
    | "consent_required"
    | "consent_missing"
    | "consent_revoked"
    | "tenant_mismatch"
    | "subject_mismatch"
    | "purpose_not_permitted";
}

export interface ConsentRepository {
  findActiveConsent(input: {
    tenantId: string;
    subjectId: string;
    purpose: ProcessingPurpose;
  }): Promise<ConsentRecord | null>;
}
