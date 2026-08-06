import {
  ConsentRepository,
  ProcessingDecision,
  ProcessingRequest,
} from "./types";

const CONSENT_REQUIRED_PURPOSES = new Set([
  "personalized_guidance",
  "safety_monitoring",
  "product_improvement",
]);

export class PurposeLimitationService {
  constructor(private readonly consentRepository: ConsentRepository) {}

  async authorize(request: ProcessingRequest): Promise<ProcessingDecision> {
    if (!CONSENT_REQUIRED_PURPOSES.has(request.purpose)) {
      return { allowed: true, reason: "allowed" };
    }

    const consent = await this.consentRepository.findActiveConsent({
      tenantId: request.tenantId,
      subjectId: request.subjectId,
      purpose: request.purpose,
    });

    if (!consent) {
      return { allowed: false, reason: "consent_missing" };
    }

    if (consent.tenantId !== request.tenantId) {
      return { allowed: false, reason: "tenant_mismatch" };
    }

    if (consent.subjectId !== request.subjectId) {
      return { allowed: false, reason: "subject_mismatch" };
    }

    if (consent.purpose !== request.purpose) {
      return { allowed: false, reason: "purpose_not_permitted" };
    }

    if (consent.revokedAt) {
      return { allowed: false, reason: "consent_revoked" };
    }

    return { allowed: true, reason: "allowed" };
  }
}
