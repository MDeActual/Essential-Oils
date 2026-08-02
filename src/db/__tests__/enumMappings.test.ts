import { $Enums } from "../../generated/prisma";
import { DataOrigin, ExclusionReason, ExclusionStatus } from "../../analytics/types";
import { BlendSafetyStatus } from "../../blend/types";
import { ApplicationMethod } from "../../ontology/types";
import {
  ChallengeCompletionStatus,
  ChallengeType,
  ProtocolStatus,
} from "../../protocol/types";
import {
  domainApplicationMethodToPrisma,
  domainBlendSafetyStatusToPrisma,
  domainChallengeCompletionStatusToPrisma,
  domainChallengeTypeToPrisma,
  domainDataOriginToPrisma,
  domainExclusionReasonToPrisma,
  domainExclusionStatusToPrisma,
  domainProtocolStatusToPrisma,
  prismaApplicationMethodToDomain,
  prismaBlendSafetyStatusToDomain,
  prismaChallengeCompletionStatusToDomain,
  prismaChallengeTypeToDomain,
  prismaDataOriginToDomain,
  prismaExclusionReasonToDomain,
  prismaExclusionStatusToDomain,
  prismaProtocolStatusToDomain,
} from "../mappers";

describe("Prisma mapped enum contracts", () => {
  it("uses generated Prisma enum constants at the client boundary", () => {
    expect($Enums.DataOrigin.REAL_CONTRIBUTOR).toBe("REAL_CONTRIBUTOR");
    expect($Enums.DataOrigin.SYNTHETIC_SIMULATION).toBe("SYNTHETIC_SIMULATION");
    expect($Enums.ExclusionStatus.INCLUDED).toBe("INCLUDED");
    expect($Enums.ExclusionStatus.EXCLUDED).toBe("EXCLUDED");
    expect($Enums.ExclusionReason.ADHERENCE_BELOW_THRESHOLD).toBe(
      "ADHERENCE_BELOW_THRESHOLD"
    );
    expect($Enums.ExclusionReason.SYNTHETIC_DATA).toBe("SYNTHETIC_DATA");
    expect($Enums.ProtocolStatus.DRAFT).toBe("DRAFT");
    expect($Enums.ProtocolStatus.ACTIVE).toBe("ACTIVE");
    expect($Enums.ChallengeType.ADHERENCE).toBe("ADHERENCE");
    expect($Enums.ChallengeCompletionStatus.PENDING).toBe("PENDING");
    expect($Enums.ApplicationMethod.TOPICAL).toBe("TOPICAL");
    expect($Enums.BlendSafetyStatus.VALIDATED).toBe("VALIDATED");
  });

  it("round-trips analytics enums", () => {
    expect(
      prismaDataOriginToDomain(domainDataOriginToPrisma(DataOrigin.RealContributor))
    ).toBe(DataOrigin.RealContributor);
    expect(
      prismaDataOriginToDomain(
        domainDataOriginToPrisma(DataOrigin.SyntheticSimulation)
      )
    ).toBe(DataOrigin.SyntheticSimulation);
    expect(
      prismaExclusionStatusToDomain(
        domainExclusionStatusToPrisma(ExclusionStatus.Included)
      )
    ).toBe(ExclusionStatus.Included);
    expect(
      prismaExclusionStatusToDomain(
        domainExclusionStatusToPrisma(ExclusionStatus.Excluded)
      )
    ).toBe(ExclusionStatus.Excluded);
    expect(
      prismaExclusionReasonToDomain(
        domainExclusionReasonToPrisma(ExclusionReason.AdherenceBelowThreshold)
      )
    ).toBe(ExclusionReason.AdherenceBelowThreshold);
    expect(
      prismaExclusionReasonToDomain(
        domainExclusionReasonToPrisma(ExclusionReason.SyntheticData)
      )
    ).toBe(ExclusionReason.SyntheticData);
    expect(domainExclusionReasonToPrisma(undefined)).toBeNull();
    expect(prismaExclusionReasonToDomain(null)).toBeUndefined();
  });

  it("round-trips protocol and blend enums", () => {
    expect(
      prismaProtocolStatusToDomain(
        domainProtocolStatusToPrisma(ProtocolStatus.Active)
      )
    ).toBe(ProtocolStatus.Active);
    expect(
      prismaChallengeTypeToDomain(
        domainChallengeTypeToPrisma(ChallengeType.Educational)
      )
    ).toBe(ChallengeType.Educational);
    expect(
      prismaChallengeCompletionStatusToDomain(
        domainChallengeCompletionStatusToPrisma(
          ChallengeCompletionStatus.Completed
        )
      )
    ).toBe(ChallengeCompletionStatus.Completed);
    expect(
      prismaApplicationMethodToDomain(
        domainApplicationMethodToPrisma(ApplicationMethod.Aromatic)
      )
    ).toBe(ApplicationMethod.Aromatic);
    expect(
      prismaBlendSafetyStatusToDomain(
        domainBlendSafetyStatusToPrisma(BlendSafetyStatus.Rejected)
      )
    ).toBe(BlendSafetyStatus.Rejected);
  });
});
