/// <reference types="vite/client" />
// Translation setup.
//
// * English (the source language) is bundled: `common` plus this site's file. `@i18n/en-site` is a Vite
//   alias to en/ada.json or en/sci.json depending on the build, so neither site ships the other's text.
// * Other languages are separate files, fetched only when that language is active.
// * Namespaces: `common`, and `site` = this build's own file (so `t("site:…")` gives Ada wording on Ada
//   and Isaac wording on Isaac). `ada:` / `sci:` also work, for text inside a one-site branch.
// * Language: ?lng=cy (remembered in localStorage) or the remembered choice; English otherwise. Changing
//   language means reloading the page, so text translated at module level never goes stale. That relies on
//   initI18n() finishing before the app's modules are imported: see src/index-*.tsx.

import i18next, { type BackendModule, type ResourceKey } from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./app/locales/en/common.json";
import enSite from "@i18n/en-site";
import { KEY, persistence } from "./app/services/localStorage";

const SITE_NS = ISAAC_SITE; // "ada" | "sci"

// One lazily loaded chunk per non-English locale file
const lazyLocales = import.meta.glob<{ default: ResourceKey }>(["./app/locales/*/*.json", "!./app/locales/en/*.json"]);

const lazyBackend: BackendModule = {
    type: "backend",
    init() {},
    read(language, namespace, callback) {
        const file = namespace === "site" ? SITE_NS : namespace;
        const load = lazyLocales[`./app/locales/${language}/${file}.json`];
        if (!load) {
            callback(null, {}); // nothing translated yet: English fallback
            return;
        }
        load().then((m) => callback(null, m.default), (e: Error) => callback(e, null));
    },
};

// ?lng=cy wins and is remembered; otherwise the remembered choice; otherwise English. (Unsupported values are
// ignored by i18next's supportedLngs.) The browser's own language isn't used yet: with nothing translated,
// switching Welsh-browser users automatically would only confuse them.
function detectLanguage(): string {
    const fromQuery = new URLSearchParams(window.location.search).get("lng");
    if (fromQuery) persistence.save(KEY.LANGUAGE, fromQuery);
    return fromQuery ?? persistence.load(KEY.LANGUAGE) ?? "en";
}

export async function initI18n(): Promise<typeof i18next> {
    await i18next
        .use(lazyBackend)
        .use(initReactI18next)
        .init({
            lng: detectLanguage(),
            fallbackLng: "en",
            supportedLngs: ["en", "cy"],
            ns: ["common", "site", SITE_NS],
            defaultNS: "common",
            resources: { en: { common: enCommon, site: enSite, [SITE_NS]: enSite } },
            partialBundledLanguages: true, // English is bundled; other languages come from the backend
            returnEmptyString: false,      // an empty translation falls back to English
            interpolation: { escapeValue: false }, // React escapes already; otherwise O'Brien shows as O&#39;Brien
            react: { useSuspense: false },
        });
    document.documentElement.lang = i18next.resolvedLanguage ?? "en";
    return i18next;
}

export default i18next;
