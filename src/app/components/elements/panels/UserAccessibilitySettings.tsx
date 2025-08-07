import React from "react";
import { AccessibilitySettings } from "../../../../IsaacAppTypes";
import { MyAccountTab } from "./MyAccountTab";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { siteSpecific } from "../../../services";

interface UserAccessibilitySettingsProps {
    accessibilitySettings: AccessibilitySettings;
    setAccessibilitySettings: (as: AccessibilitySettings | ((oldAS?: AccessibilitySettings) => AccessibilitySettings)) => void;
}

export const UserAccessibilitySettings = ({ accessibilitySettings, setAccessibilitySettings }: UserAccessibilitySettingsProps) => {
    return <MyAccountTab
        leftColumn={<>
            <h3>Accessibility settings</h3>
            <p>Here you can manage various accessibility features across the site.</p>
        </>}
        rightColumn={<>
            <>
                <b><StyledCheckbox checked={accessibilitySettings.REDUCED_MOTION ?? false}
                    onChange={e => {
                        setAccessibilitySettings((oldDs) => ({...oldDs, REDUCED_MOTION: e.target.checked}));
                    }}
                    color={siteSpecific("primary", "")}
                    label={<p>Prefer reduced motion</p>}
                    id={"reduced-motion"}
                /></b>
                <p>{`Enabling this will reduce motion effects on the platform. Browser preference will take priority over this setting.`}</p>
            </>
            <div className="section-divider" />
            <>
                <b><StyledCheckbox checked={accessibilitySettings.SHOW_INACCESSIBLE_WARNING ?? false}
                    onChange={e => {
                        setAccessibilitySettings((oldDs) => ({...oldDs, SHOW_INACCESSIBLE_WARNING: e.target.checked}));
                    }}
                    color={siteSpecific("primary", "")}
                    label={<p>Warn about inaccessible content</p>}
                    id={"show-inaccessible-tag"}
                /></b>
                <p>{`Enabling this will display warnings on certain content that may be inaccessible to assistive technologies.`}</p>
            </>
            <>
                <b><StyledCheckbox checked={accessibilitySettings.PREFER_MATHML ?? false}
                    onChange={e => {
                        setAccessibilitySettings((oldDs) => ({...oldDs, PREFER_MATHML: e.target.checked}));
                    }}
                    color={siteSpecific("primary", "")}
                    label={<p>Use MathML for accessible maths</p>}
                    id={"prefer-mathml"}
                /></b>
                <p>{`With this setting you can toggle between using alternative text or MathML for mathematical equations.`}</p>
            </>
        </>}
    />;
};
