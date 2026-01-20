// src/ui/state/UIViewProfile.ts
import { ViewVisibility } from "./ViewVisibility.js"
import { ViewCapabilities } from "./ViewCapabilities.js"
import { InputConfig } from "./InputConfig.js"

export interface UIViewProfile {
    visibility: ViewVisibility
    capabilities: ViewCapabilities
    input: InputConfig
}
