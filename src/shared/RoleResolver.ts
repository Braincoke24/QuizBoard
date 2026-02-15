// src/shared/RoleResolver.ts
import { GAMEMASTER_PROFILE } from "../ui/shared/profiles/GameMasterProfile.js"
import { PLAYER_PROFILE } from "../ui/shared/profiles/PlayerProfile.js"
import { SPECTATOR_PROFILE } from "../ui/shared/profiles/SpectatorProfile.js"
import { UIViewProfile } from "../ui/shared/view/UIViewProfile.js"
import { RoleId } from "../ui/shared/view/UIViewProfile.js"

/**
 * Resolves a role string (e.g. from URL params) into a UIViewProfile.
 */
export class RoleResolver {
    private static readonly profileMap = {
        gamemaster: GAMEMASTER_PROFILE,
        player: PLAYER_PROFILE,
        spectator: SPECTATOR_PROFILE,
    } as const

    public static resolve(roleParam?: string | null): UIViewProfile {
        const role: RoleId =
            roleParam && roleParam in RoleResolver.profileMap
                ? (roleParam as RoleId)
                : "spectator"

        return RoleResolver.profileMap[role]
    }

    public static isValidRole(roleParam: string): boolean {
        return roleParam in RoleResolver.profileMap
    }
}
