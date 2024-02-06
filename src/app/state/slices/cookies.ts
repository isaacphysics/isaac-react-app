import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export const YOUTUBE_COOKIE = "youtubeCookiesAccepted";
export const ANVIL_COOKIE = "anvilCookiesAccepted";

const isCookieSet = (name: string) => {
    return Cookies.get(name) === "1";
};

const setCookie = (name: string) => {
    Cookies.set(name, "1", { expires: 720 /* days*/, sameSite: "strict" });
};

export type InterstitialCookieState = {
    youtubeCookieAccepted: boolean;
    anvilCookieAccepted: boolean;
} | null;

export const interstitialCookieSlice = createSlice({
    name: 'interstitialCookie',
    initialState: null as InterstitialCookieState,
    reducers: {
        setDefault: () => ({youtubeCookieAccepted: isCookieSet(YOUTUBE_COOKIE), anvilCookieAccepted: isCookieSet(ANVIL_COOKIE)}),
        acceptYoutubeCookies: (state) => {
            if (state) state.youtubeCookieAccepted = true;
            setCookie(YOUTUBE_COOKIE);
        },
        acceptAnvilCookies: (state) => {
            if (state) state.anvilCookieAccepted = true;
            setCookie(ANVIL_COOKIE);
        },
    },
});