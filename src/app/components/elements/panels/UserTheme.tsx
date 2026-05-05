import React from "react";
import { DisplaySettings } from "../../../../IsaacAppTypes";
import { MyAccountTab } from "./MyAccountTab";
import { Label } from "reactstrap";
import { LightnessTheme, lightnessThemes, useLightnessTheme } from "../../../services/theme";
import classNames from "classnames";

interface UserThemeProps {
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

interface ThemeSelectorProps {
    theme: LightnessTheme;
    isCurrentTheme: boolean;
    onChange: () => void;
}

const ThemeSelector = ({theme, isCurrentTheme, onChange}: ThemeSelectorProps) => {
    return <button type={isCurrentTheme ? "button" : "submit"} className={classNames("d-flex flex-column gap-2 theme-preview", { "active": isCurrentTheme })} onClick={() => !isCurrentTheme && onChange()}>
        <img id={theme.value} src={theme.value === "light" ? "/assets/phy/theming/theme-preview-light.svg" : "/assets/phy/theming/theme-preview-dark.svg"} alt={theme.displayName} />
        <Label for={theme.value}>{theme.displayName}</Label>
    </button>;
};

export const UserTheme = ({setDisplaySettings}: UserThemeProps) => {
    const currentTheme = useLightnessTheme();

    return <MyAccountTab
        leftColumn={<>
            <h3>Theme</h3>
        </>}
        rightColumn={<>
            <span>Here you can select your preferred site theme.</span>
            <div className="d-flex gap-4 mt-4">
                {Object.values(lightnessThemes).map((theme) => <ThemeSelector 
                    key={theme.value}
                    theme={theme}
                    isCurrentTheme={theme.value === currentTheme.value}
                    onChange={() => setDisplaySettings?.(prev => ({...prev, DARK_MODE: theme.value === "dark"}))}
                />)}
            </div>
        </>}
    />;
};
