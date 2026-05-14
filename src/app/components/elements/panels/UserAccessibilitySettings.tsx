import React from "react";
import { AccessibilitySettings } from "../../../../IsaacAppTypes";
import { MyAccountTab } from "./MyAccountTab";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { isTeacherOrAbove, siteSpecific } from "../../../services";
import { useAppSelector } from "../../../state";
import { WithLinkableSetting } from "../WithLinkableSetting";
import { useTranslation } from 'react-i18next'

interface UserAccessibilitySettingsProps {
    accessibilitySettings: AccessibilitySettings;
    setAccessibilitySettings: (as: AccessibilitySettings | ((oldAS?: AccessibilitySettings) => AccessibilitySettings)) => void;
}

export const UserAccessibilitySettings = ({ accessibilitySettings, setAccessibilitySettings }: UserAccessibilitySettingsProps) => {
    const { t } = useTranslation()
    const user = useAppSelector(state => state?.user);

    return <MyAccountTab
        leftColumn={<>
            <h3>{t('accessibilitySettings', 'Accessibility settings')}</h3>
            <p>{t('hereYouCanManageVariousAccessibilityFeaturesAcrossTheSite', 'Here you can manage various accessibility features across the site.')}</p>
        </>}
        rightColumn={<>
            <div className="pt-2"/>
            <WithLinkableSetting id={"reduced-motion-feature"}>
                <b><StyledCheckbox checked={accessibilitySettings.REDUCED_MOTION ?? false}
                    onChange={e => {
                        setAccessibilitySettings((oldDs) => ({...oldDs, REDUCED_MOTION: e.target.checked}));
                    }}
                    color={siteSpecific("primary", "")}
                    label={<p>{t('preferReducedMotion', 'Prefer reduced motion')}</p>}
                    id={"reduced-motion"}
                    aria-describedby="reduced-motion-helptext"
                    removeVerticalOffset
                /></b>
                <p>{t('enablingThisWillReduceMotionEffectsOnThePlatformBrowserPreferenceWillTakePriorityOverThisSetting', 'Enabling this will reduce motion effects on the platform. Browser preference will take priority over this setting.')}</p>
            </WithLinkableSetting>
            <div className="pt-2"/>
            <WithLinkableSetting id={"prefer-mathml-feature"}>
                <b><StyledCheckbox 
                    checked={accessibilitySettings.SHOW_INACCESSIBLE_WARNING ?? isTeacherOrAbove(user)}
                    onChange={e => {
                        setAccessibilitySettings((oldDs) => ({...oldDs, SHOW_INACCESSIBLE_WARNING: e.target.checked}));
                    }}
                    color={siteSpecific("primary", "")}
                    label={<p>{t('warnAboutInaccessibleContent', 'Warn about inaccessible content')}</p>}
                    id={"show-inaccessible-tag"}
                    aria-describedby="show-inaccessible-helptext"
                    removeVerticalOffset
                /></b>
                <p id="show-inaccessible-helptext">{t('enablingThisWillDisplayWarningsOnCertainContentThatMayBeInaccessibleToAssistiveTechnologies', 'Enabling this will display warnings on certain content that may be inaccessible to assistive technologies.')}</p>
            </WithLinkableSetting>
            <div className="section-divider" />
            <div className="pt-2"/>
            <WithLinkableSetting id={"prefer-mathml-feature"}>
                <b><StyledCheckbox checked={accessibilitySettings.PREFER_MATHML ?? false}
                    onChange={e => {
                        setAccessibilitySettings((oldDs) => ({...oldDs, PREFER_MATHML: e.target.checked}));
                    }}
                    color={siteSpecific("primary", "")}
                    label={<p>{t('useMathmlForAccessibleMaths', 'Use MathML for accessible maths')}</p>}
                    id={"prefer-mathml"}
                    aria-describedby="mathml-helptext"
                    removeVerticalOffset
                /></b>
                <p id="mathml-helptext">{t('withThisSettingYouCanToggleBetweenUsingAlternativeTextOrMathmlForMathematicalEquations', 'With this setting you can toggle between using alternative text or MathML for mathematical equations.')}</p>
            </WithLinkableSetting>
        </>}
    />;
};
