# Phyto.ai Trust & Privacy Foundation

## Product promise

Phyto.ai treats privacy as a product capability, not a hidden legal document.

Our user-facing standard is:

1. **We tell you what we collect.**
2. **We explain why we need it.**
3. **You can review, export, correct, or delete your information.**
4. **We do not use wellness information for a new purpose without a valid basis and clear notice.**
5. **If we do not need information, we should not collect it.**

## Plain-language messaging

### What Phyto.ai may know

Phyto.ai may store the account details and wellness information that a user deliberately provides to support requested features. The product must identify each data category and its purpose before collection.

### Why information is used

Information is used only for the purpose shown to the user, such as managing an account, remembering user preferences, providing requested personalized guidance, or improving the product when the user has agreed to that purpose.

### How AI uses information

When an AI-assisted feature uses user information, the interface must explain:

- what information is sent to the feature;
- why it is needed;
- whether the result is stored;
- how the user can withdraw permission;
- that Phyto.ai provides wellness information and is not a substitute for diagnosis, treatment, or emergency care.

### User controls

The Trust Center will provide clear paths to:

- review permissions and consent;
- withdraw optional consent;
- request an export;
- request deletion;
- understand retention and legal-hold exceptions;
- review important privacy and security events associated with the account.

## Engineering rules

- Processing that requires consent fails closed when matching active consent is absent.
- Tenant and subject identity come from trusted application context, not caller-supplied identifiers alone.
- Consent is specific to a purpose and notice version.
- Revoked consent cannot authorize future processing.
- Audit events exclude bearer tokens, credentials, unnecessary wellness text, and protected product logic.
- No repository or user-facing text may claim regulatory certification or clinical effectiveness without verified evidence and appropriate review.

## Scope of this first slice

This first implementation establishes domain contracts, purpose-limitation authorization, negative tests, and the user-facing messaging standard. Persistent consent records, retention execution, export, deletion, legal hold, Azure deployment, and the Trust Center interface remain subsequent bounded slices under EU-PHY-019.
