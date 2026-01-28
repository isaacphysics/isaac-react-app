import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { useState } from "react";

export const YOUTUBE_COOKIE = "youtubeCookiesAccepted";
export const ANVIL_COOKIE = "anvilCookiesAccepted";
export const DESMOS_COOKIE = "desmosCookiesAccepted";
export const GEOGEBRA_COOKIE = "geogebraCookiesAccepted";
export const EMAIL_VERIFICATION_WARNINGS_DISABLED = "emailVerificationWarningsDisabled";

const isCookieSet = (name: string) => {
    return Cookies.get(name) === "1";
};

const setCookie = (name: string) => {
    Cookies.set(name, "1", { expires: 720 /* days*/, sameSite: "strict" });
};

export type InterstitialCookieState = {
    youtubeCookieAccepted: boolean;
    anvilCookieAccepted: boolean;
    desmosCookieAccepted: boolean;
    geogebraCookieAccepted: boolean;
} | null;

export const interstitialCookieSlice = createSlice({
    name: 'interstitialCookie',
    initialState: null as InterstitialCookieState,
    reducers: {
        setDefault: () => ({
            youtubeCookieAccepted: isCookieSet(YOUTUBE_COOKIE), 
            anvilCookieAccepted: isCookieSet(ANVIL_COOKIE), 
            desmosCookieAccepted: isCookieSet(DESMOS_COOKIE), 
            geogebraCookieAccepted: isCookieSet(GEOGEBRA_COOKIE)
        }),
        acceptYoutubeCookies: (state) => {
            if (state) state.youtubeCookieAccepted = true;
            setCookie(YOUTUBE_COOKIE);
        },
        acceptAnvilCookies: (state) => {
            if (state) state.anvilCookieAccepted = true;
            setCookie(ANVIL_COOKIE);
        },
        acceptDesmosCookies: (state) => {
            if (state) state.desmosCookieAccepted = true;
            setCookie(DESMOS_COOKIE);
        },
        acceptGeogebraCookies: (state) => {
            if (state) state.geogebraCookieAccepted = true;
            setCookie(GEOGEBRA_COOKIE);
        },
    },
});

export const useCookie = (cookie: string) => {
    const [cookieState, setCookieState] = useState(isCookieSet(cookie));
    const [hasModified, setHasModified] = useState(false);
    const acceptCookie = () => {
        setCookie(cookie);
        setCookieState(true);
        setHasModified(true);
    };

    const removeCookie = () => {
        Cookies.remove(cookie);
        setCookieState(false);
        setHasModified(true);
    };

    return [cookieState, acceptCookie, removeCookie, hasModified] as const;
};
