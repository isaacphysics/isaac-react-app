import { selectors, useAppSelector } from "../state";

export type LightnessThemeValue = "light" | "dark";

export interface LightnessTheme {
    value: LightnessThemeValue;
    displayName: string;
}

export const lightnessThemes: Record<LightnessThemeValue, LightnessTheme> = {
    light: {value: "light", displayName: "Light"},
    dark: {value: "dark", displayName: "Dark"},
};

export const useLightnessTheme = () => {
    const userPreferences = useAppSelector(selectors.user.preferences);
    const lightnessTheme = userPreferences?.DISPLAY_SETTING?.DARK_MODE
        ? lightnessThemes.dark
        : lightnessThemes.light;

    return lightnessTheme;
};
