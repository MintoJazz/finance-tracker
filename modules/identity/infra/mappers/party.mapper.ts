import { Party as PrismaParty } from "@/prisma/generated/prisma/client";
import { Party } from "../../core/schemas/party.schema";

export class PartyMapper {
  static toDomain(raw: PrismaParty): Party {
    const { managedByPartyId, ...partyData } = raw

    return { ...partyData };
  }
}
