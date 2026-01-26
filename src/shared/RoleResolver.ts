// src/shared/RoleResolver.ts
import { GAMEMASTER_PROFILE } from "../ui/shared/profiles/GameMasterProfile.js"
import { PLAYER_PROFILE } from "../ui/shared/profiles/PlayerProfile.js"
import { SPECTATOR_PROFILE } from "../ui/shared/profiles/SpectatorProfile.js"
import { UIViewProfile } from "../ui/shared/view/UIViewProfile.js"

/**
 * Resolves a role string (e.g. from URL params) into a UIViewProfile.
 */
export class RoleResolver {
    private static readonly profileMap = {
        "game-master": GAMEMASTER_PROFILE,
        "player": PLAYER_PROFILE,
        "spectator": SPECTATOR_PROFILE
    } as const

    public static resolve(roleParam?: string | null): UIViewProfile {
        type Role = keyof typeof RoleResolver.profileMap

        const role: Role =
            roleParam && roleParam in RoleResolver.profileMap
                ? roleParam as Role
                : "spectator"

        return RoleResolver.profileMap[role]
    }
}
