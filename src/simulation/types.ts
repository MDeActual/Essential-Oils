/**
 * types.ts — Simulation Layer Type Definitions
 *
 * Defines the canonical TypeScript types and enums for the Phyto.ai synthetic
 * simulation environment. These types implement the Contributor Record entity
 * defined in docs/DOMAIN_MODEL.md and enforce the isolation constraints
 * mandated by LOCK-003.
 *
 * SIMULATION SAFETY NOTICE (LOCK-003): Synthetic simulation records must
 * never be mixed into production analytics without explicit isolation flags.
 * All synthetic records carry data_origin: synthetic_simulation and
 * exclusion_status: excluded. Only real_contributor records are
 * analytics-eligible.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Origin classification for a Contributor Record.
 *
 * This field is required on every record and governs analytics eligibility
 * (LOCK-003). Only records with DataOrigin.RealContributor are permitted in
 * production analytics. Synthetic records must always carry
 * DataOrigin.SyntheticSimulation.
 */
export enum DataOrigin {
  /** Record originates from a real platform user. Analytics-eligible when also included. */
  RealContributor = "real_contributor",
  /** Record was synthetically generated for testing or preview workflows.
   *  Must NEVER flow to production analytics (LOCK-003). */
  SyntheticSimulation = "synthetic_simulation",
}

/**
 * Exclusion status for a Contributor Record.
 *
 * Determines whether a record may be used in production analytics scoring.
 * Records are excluded when adherence falls below the threshold or when
 * data_origin is synthetic_simulation (LOCK-003).
 */
export enum ExclusionStatus {
  /** Record meets all eligibility criteria and may be used in analytics. */
  Included = "included",
  /** Record must not be used in analytics scoring. See exclusion_reason. */
  Excluded = "excluded",
}

/**
 * Reason a Contributor Record was excluded from analytics.
 * Required when exclusion_status is Excluded.
 */
export enum ExclusionReason {
  /** User adherence fell below the required threshold (< 50%). */
  AdherenceBelowThreshold = "adherence_below_threshold",
  /** Record originates from the synthetic simulation environment (LOCK-003). */
  SyntheticData = "synthetic_data",
  /** Record was manually flagged for exclusion by a platform operator. */
  ManualExclusion = "manual_exclusion",
  /** Record is incomplete — one or more required fields are missing. */
  IncompleteRecord = "incomplete_record",
}

// ---------------------------------------------------------------------------
// Contributor Record
// ---------------------------------------------------------------------------

/**
 * Represents a user's participation data used for population-level analytics
 * and protocol evolution signals.
 *
 * This type directly implements the Contributor Record entity in
 * docs/DOMAIN_MODEL.md, including the LOCK-003 integrity constraints.
 *
 * MOAT NOTICE (M-004): The analytics signal model that derives protocol
 * evolution signals from contributor records is proprietary and must NOT be
 * implemented in this module. This type describes the record shape only.
 */
export interface ContributorRecord {
  /** Unique canonical record identifier. */
  recordId: string;
  /** Reference to the User Profile (anonymized for analytics). */
  userId: string;
  /** Reference to the associated Protocol. */
  protocolId: string;
  /**
   * Origin classification.
   * Required by LOCK-003: must be present on every record.
   */
  dataOrigin: DataOrigin;
  /**
   * Whether this record is included in or excluded from analytics scoring.
   * Required by LOCK-003: must be present on every record.
   */
  exclusionStatus: ExclusionStatus;
  /**
   * Reason for exclusion when exclusion_status is Excluded.
   * Required when exclusionStatus is ExclusionStatus.Excluded.
   */
  exclusionReason?: ExclusionReason;
  /**
   * User adherence score as a percentage (0–100).
   * Records with adherence_score < ADHERENCE_EXCLUSION_THRESHOLD must be excluded (LOCK-003).
   */
  adherenceScore: number;
  /** Challenge completion rate as a percentage (0–100). */
  challengeCompletionRate: number;
  /** Qualitative notes on participant outcome. Optional. */
  outcomeNotes?: string;
  /** ISO 8601 timestamp when this record was created. */
  recordedAt: string;
}

// ---------------------------------------------------------------------------
// Synthetic Contributor Record
// ---------------------------------------------------------------------------

/**
 * A Contributor Record that is guaranteed to carry synthetic isolation flags.
 *
 * This branded sub-type is the exclusive output of the simulation generator
 * functions. It enforces that:
 * - dataOrigin is always DataOrigin.SyntheticSimulation
 * - exclusionStatus is always ExclusionStatus.Excluded
 * - exclusionReason includes ExclusionReason.SyntheticData
 *
 * These constraints ensure the record can never silently pass through
 * filterAnalyticsEligible() into production evidence paths.
 */
export interface SyntheticContributorRecord extends ContributorRecord {
  readonly dataOrigin: DataOrigin.SyntheticSimulation;
  readonly exclusionStatus: ExclusionStatus.Excluded;
  readonly exclusionReason: ExclusionReason.SyntheticData;
}

// ---------------------------------------------------------------------------
// Simulation Context
// ---------------------------------------------------------------------------

/**
 * Describes the context in which a simulation batch was generated.
 *
 * SimulationContext is attached to every batch produced by the simulation
 * layer and provides the metadata needed to trace, audit, and isolate
 * synthetic data from production pathways.
 */
export interface SimulationContext {
  /** Human-readable label for this simulation run (e.g., "protocol-v1-preview"). */
  simulationId: string;
  /** ISO 8601 timestamp when this simulation run was initiated. */
  createdAt: string;
  /**
   * The protocol identifier being simulated.
   * Corresponds to a Protocol.protocolId in the protocol layer.
   */
  targetProtocolId: string;
  /** Number of synthetic contributor records requested for this batch. */
  batchSize: number;
  /**
   * Explicit isolation flag.
   * Must be true for any batch produced by this module.
   * Consuming layers must verify this flag before accepting any batch.
   */
  isSyntheticIsolated: true;
}

// ---------------------------------------------------------------------------
// Simulation Batch
// ---------------------------------------------------------------------------

/**
 * A complete simulation output: context metadata plus the generated records.
 *
 * All records in a SimulationBatch are guaranteed to carry synthetic
 * isolation markers. The isSyntheticIsolated flag on the context provides
 * an additional runtime guard for consuming layers.
 */
export interface SimulationBatch {
  /** Metadata describing this simulation run. */
  context: SimulationContext;
  /** Synthetic contributor records produced in this batch. */
  records: SyntheticContributorRecord[];
}

// ---------------------------------------------------------------------------
// Generator Options
// ---------------------------------------------------------------------------

/**
 * Options for configuring synthetic record generation.
 * All generated records will carry mandatory synthetic isolation flags
 * regardless of these options.
 */
export interface SyntheticRecordOptions {
  /** The protocol ID to associate with generated records. */
  protocolId: string;
  /**
   * Optional adherence score override (0–100).
   * When omitted, the generator uses a deterministic default.
   * When provided with a value below ADHERENCE_EXCLUSION_THRESHOLD, the
   * record will also carry ExclusionReason.AdherenceBelowThreshold in its
   * outcomeNotes (the primary exclusion reason remains SyntheticData).
   */
  adherenceScore?: number;
  /** Optional challenge completion rate override (0–100). */
  challengeCompletionRate?: number;
  /** Optional outcome notes. */
  outcomeNotes?: string;
}

// ---------------------------------------------------------------------------
// Validation Types
// ---------------------------------------------------------------------------

/** Structured validation error returned by the simulation validation layer. */
export interface SimulationValidationError {
  /** The record identifier that failed validation, if applicable. */
  recordId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of a contributor record validation operation. */
export interface ContributorRecordValidationResult {
  valid: boolean;
  errors: SimulationValidationError[];
}

/** Result of asserting synthetic isolation on a batch. */
export interface SyntheticIsolationResult {
  /** True only when every record in the batch is confirmed synthetic-safe. */
  isolated: boolean;
  /** Records that failed the isolation check, if any. */
  violations: SimulationValidationError[];
}
