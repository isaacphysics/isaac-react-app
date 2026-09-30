// Initialise i18next for tests with the English strings, synchronously, so components render real text.
// Mirrors the namespaces in src/i18n.ts (which uses import.meta.glob, so can't run under Jest).
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import common from "../app/locales/en/common.json";
import site from "./i18nSiteLocale";

void i18next.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    ns: ["common", "site", ISAAC_SITE],
    defaultNS: "common",
    resources: { en: { common, site, [ISAAC_SITE]: site } },
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initAsync: false,
});
