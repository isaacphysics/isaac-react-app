import React from "react";
import { DisplaySettings } from "../../../../IsaacAppTypes";
import { MyAccountTab } from "./MyAccountTab";
import { Alert, Label } from "reactstrap";
import { LightnessTheme, lightnessThemes, useLightnessTheme } from "../../../services/theme";
import classNames from "classnames";
import { Link } from "react-router-dom";

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
            <Alert color="warning" className="mt-4">
                Please note that dark mode is a new and extensive feature and, as such, certain areas of the site may not yet be fully optimised for this theme. 
                We also cannot guarantee e.g. AA accessibility compliance for dark mode at this time.
                <br/><br/>
                If you encounter any issues, particularly regarding legibility, please report them to us via the <Link to="/contact?subject=Dark%20mode%20issue">contact form</Link> for further investigation. Please include a link to the page containing the issue if possible.
            </Alert>
        </>}
    />;
};
