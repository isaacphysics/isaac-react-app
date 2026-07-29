import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export const YOUTUBE_COOKIE = "youtubeCookiesAccepted";
export const ANVIL_COOKIE = "anvilCookiesAccepted";
export const DESMOS_COOKIE = "desmosCookiesAccepted";
export const GEOGEBRA_COOKIE = "geogebraCookiesAccepted";
export const DISABLE_EMAIL_VERIFICATION_WARNING_COOKIE = "disableEmailVerificationWarningCookiesAccepted";

const isCookieSet = (name: string) => {
    return Cookies.get(name) === "1";
};

const setCookie = (name: string) => {
    Cookies.set(name, "1", { expires: 720 /* days*/, sameSite: "strict" });
};

export type CookieConsentState = {
    youtubeCookiesAccepted: boolean;
    anvilCookiesAccepted: boolean;
    desmosCookiesAccepted: boolean;
    geogebraCookiesAccepted: boolean;
    disableEmailVerificationWarningCookiesAccepted: boolean;
} | null;

export const cookieConsentSlice = createSlice({
    name: 'cookieConsent',
    initialState: {
        youtubeCookiesAccepted: isCookieSet(YOUTUBE_COOKIE), 
        anvilCookiesAccepted: isCookieSet(ANVIL_COOKIE), 
        desmosCookiesAccepted: isCookieSet(DESMOS_COOKIE), 
        geogebraCookiesAccepted: isCookieSet(GEOGEBRA_COOKIE),
        disableEmailVerificationWarningCookiesAccepted: isCookieSet(DISABLE_EMAIL_VERIFICATION_WARNING_COOKIE)
    } as CookieConsentState,
    reducers: {
        acceptCookie: (state, action: {payload: keyof NonNullable<CookieConsentState>}) => {
            if (state) state[action.payload] = true;
            setCookie(action.payload);
        },
        removeCookie: (state, action: {payload: keyof NonNullable<CookieConsentState>}) => {
            if (state) state[action.payload] = false;
            Cookies.remove(action.payload);
        },
    },
});
