// src/ui/shared/view/UIViewProfile.ts
import { ViewVisibility } from "./ViewVisibility.js"
import { ViewCapabilities } from "./ViewCapabilities.js"

export const ROLE_IDS = ["gamemaster", "player", "spectator"] as const

export type RoleId = (typeof ROLE_IDS)[number]

export interface UIViewProfile {
    visibility: ViewVisibility
    capabilities: ViewCapabilities
    id: RoleId
}
