// src/lib/i18n.ts
import {
    register,
    init,
    getLocaleFromNavigator,
    locale as $locale,
} from "svelte-i18n"

export const LOCALES = {
    en: {
        label: "English",
    },
    de: {
        label: "Deutsch",
    },
    jp: {
        label: "日本語",
    },
} as const

export type AppLocale = keyof typeof LOCALES
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as AppLocale[]

// register lazy-loaded bundles
for (const locale of SUPPORTED_LOCALES) {
    register(locale, () => import(`../locales/${locale}/common.json`))
}

// helpers

function isValidLocale(value: string | null): value is AppLocale {
    return value !== null && value in LOCALES
}

function getLocaleFromUrl(): AppLocale | null {
    const value = new URLSearchParams(window.location.search).get("lang")
    return isValidLocale(value) ? value : null
}

function updateUrl(lang: AppLocale): void {
    const url = new URL(window.location.href)
    url.searchParams.set("lang", lang)
    window.history.replaceState({}, "", url.toString())
}

// initialise library
const initialLocale =
    getLocaleFromUrl() ??
    (isValidLocale(getLocaleFromNavigator())
        ? (getLocaleFromNavigator() as AppLocale)
        : null) ??
    "en"

init({
    fallbackLocale: "en",
    initialLocale,
})

// public API
export function setAppLocale(lang: AppLocale): void {
    $locale.set(lang)
    updateUrl(lang)

    try {
        localStorage.setItem("locale", lang)
    } catch {
        // ignore
    }

    if (typeof document !== "undefined") {
        document.documentElement.lang = lang
    }
}
