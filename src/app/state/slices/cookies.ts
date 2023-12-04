import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export const YOUTUBE_COOKIE = "youtubeCookiesAccepted";
export const ANVIL_COOKIE = "anvilCookiesAccepted";

const isCookieSet = (name: string) => {
    return Cookies.get(name) === "1";
};

const setCookie = (name: string) => {
    Cookies.set(name, "1", { expires: 720 /* days*/ });
};

export const interstitialCookieSlice = createSlice({
    name: 'interstitialCookie',
    initialState: {
        youtubeCookieAccepted: isCookieSet(YOUTUBE_COOKIE),
        anvilCookieAccepted: isCookieSet(ANVIL_COOKIE),
    },
    reducers: {
        acceptYoutubeCookies: (state) => {
            state.youtubeCookieAccepted = true;
            setCookie(YOUTUBE_COOKIE);
        },
        acceptAnvilCookies: (state) => {
            state.anvilCookieAccepted = true;
        },
    },
});