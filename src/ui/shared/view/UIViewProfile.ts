// src/ui/shared/view/UIViewProfile.ts
import { ViewVisibility } from "./ViewVisibility.js"
import { ViewCapabilities } from "./ViewCapabilities.js"

export interface UIViewProfile {
    visibility: ViewVisibility
    capabilities: ViewCapabilities
    displayName: string
}
