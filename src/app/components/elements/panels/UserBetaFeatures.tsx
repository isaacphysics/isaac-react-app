import React from "react";
import { DisplaySettings, UserConsent } from "../../../../IsaacAppTypes";
import { SITE_TITLE, isAda, isPhy, isStaff, isUnder13, siteSpecific } from "../../../services";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { MyAccountTab } from "./MyAccountTab";
import { Link } from "react-router-dom";
import { WithLinkableSetting } from "../WithLinkableSetting";
import { selectors, useAppSelector } from "../../../state";
import { Trans, useTranslation } from "react-i18next";

interface RevisionModeInputProps {
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}
interface UserBetaFeaturesProps extends RevisionModeInputProps{
    consentSettings: UserConsent;
    setConsentSettings: (cs: UserConsent | ((oldUC?: UserConsent) => UserConsent)) => void;
}

export const RevisionModeInput = ({displaySettings, setDisplaySettings}: RevisionModeInputProps) => {
    const { t } = useTranslation();
    return <StyledCheckbox checked={displaySettings.HIDE_QUESTION_ATTEMPTS ?? false}
        onChange={e => {
            setDisplaySettings((oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e.target.checked}));
        }}
        color={siteSpecific("primary", "")}
        label={<p>{t("common:account.betaFeatures.hideAttemptsLabel")}</p>}
        id={"hide-previous-q-attempts"}
        aria-describedby="revision-helptext"
        removeVerticalOffset
    />;
};

export const UserBetaFeatures = ({ displaySettings, setDisplaySettings, consentSettings, setConsentSettings }: UserBetaFeaturesProps) => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);

    return <MyAccountTab
        leftColumn={<>
            <h2 className="h3">{t("common:account.betaFeatures.title")}</h2>
            <p>{t("common:account.betaFeatures.description", { siteTitle: SITE_TITLE })}</p>
        </>}
        rightColumn={<>
            <div className="pt-2"/>
            <WithLinkableSetting id={"hide-previous-q-attempts-feature"}>
                <b><RevisionModeInput {...{displaySettings, setDisplaySettings}}/></b>
                <p id="revision-helptext">{t("site:account.betaFeatures.hideAttemptsHelp")}</p>
            </WithLinkableSetting>

            {isPhy && <WithLinkableSetting id={"show-chem-text-entry"}>
                <StyledCheckbox checked={displaySettings.CHEM_TEXT_ENTRY ?? false}
                    onChange={e => {
                        setDisplaySettings((oldDs) => ({...oldDs, CHEM_TEXT_ENTRY: e.target.checked}));
                    }}
                    label={<p><b>{t("common:account.betaFeatures.chemEntryLabel")}</b></p>}
                    id={"show-chem-text-entry-checkbox"}
                    removeVerticalOffset
                    aria-describedby="chem-text-entry-helptext"
                />
                <p id="chem-text-entry-helptext"><Trans i18nKey="common:account.betaFeatures.chemEntryHelp" components={{ guidanceLink: <Link to="/pages/chemistry_text_entry" target="_blank" /> }} /></p>
            </WithLinkableSetting>}

            {/* Enabled for staff on Isaac so they can test questions, but not being pursued further for now (these questions should not be published) */}
            {(isStaff(user) || (isAda && !isUnder13(user))) && <>
                <div className="pt-2"/>
                <WithLinkableSetting id={"consent-to-openai-marking-feature"}>
                    <StyledCheckbox checked={consentSettings.OPENAI ?? false}
                        onChange={e => {
                            setConsentSettings((oldCS) => ({...oldCS, OPENAI: e.target.checked}));
                        }}
                        label={<p><b>{t("common:account.betaFeatures.openAiConsentLabel")}</b></p>}
                        id={"consent-to-openai-marking"}
                        removeVerticalOffset
                        aria-describedby="llm-helptext"
                    />
                    <p id="llm-helptext"> 
                        {t("common:account.betaFeatures.openAiHelp")}
                        {isAda && <><Trans i18nKey="ada:account.betaFeatures.openAiFaq" components={{ faqLink: <Link to="/support/student/general#llm_questions" target="_blank" /> }} /></>}
                    </p>
                </WithLinkableSetting>
            </>}
        </>}
    />;
};
