// src/ui/shared/view/UIViewProfile.ts
import { ViewVisibility } from "./ViewVisibility.js"
import { ViewCapabilities } from "./ViewCapabilities.js"
import { InputConfig } from "./InputConfig.js"
import { ViewMode } from "./ViewMode.js"

export interface UIViewProfile {
    visibility: ViewVisibility
    capabilities: ViewCapabilities
    input: InputConfig
    mode: ViewMode
}
