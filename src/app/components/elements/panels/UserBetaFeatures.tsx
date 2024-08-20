import React from "react";
import { DisplaySettings, UserConsent } from "../../../../IsaacAppTypes";
import { SITE_TITLE, isAda, siteSpecific } from "../../../services";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { MyAccountTab } from "./MyAccountTab";
import { Link } from "react-router-dom";

interface RevisionModeInputProps {
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}
interface UserBetaFeaturesProps extends RevisionModeInputProps{
    consentSettings: UserConsent;
    setConsentSettings: (cs: UserConsent | ((oldUC?: UserConsent) => UserConsent)) => void;
}

export const RevisionModeInput = ({displaySettings, setDisplaySettings}: RevisionModeInputProps) => {
    return <StyledCheckbox checked={displaySettings.HIDE_QUESTION_ATTEMPTS ?? false}
        onChange={e => {
            setDisplaySettings((oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e.target.checked}));
        }} 
        label={<p className="pt-0">Hide previous question attempts</p>}
        id={"hide-previous-q-attempts"}
    />;
};

export const UserBetaFeatures = ({ displaySettings, setDisplaySettings, consentSettings, setConsentSettings }: UserBetaFeaturesProps) => {
    return <MyAccountTab
        leftColumn={<>
            <h3>Beta Features</h3>
            <p>Here you can opt-in to beta features of the {SITE_TITLE} platform.</p>
        </>}
        rightColumn={<>
            <>
                <b><RevisionModeInput {...{displaySettings, setDisplaySettings}}/></b>
                <p>{`This feature lets you answer questions ${siteSpecific("that you have answered before, without seeing your old answer.", "again, even if you've answered them before.")} It's useful if you are reviewing a topic before a test or exam.`}</p>
            </>
            {isAda && <>
                <StyledCheckbox checked={consentSettings.OPENAI ?? false}
                    onChange={e => {
                        setConsentSettings((oldCS) => ({...oldCS, OPENAI: e.target.checked}));
                    }}
                    label={<p><b>Consent to sending free-text answers to OpenAI for marking</b></p>}
                    id={"consent-to-openai-marking"}
                />
                <p>
                    We use a large language model (LLM) to mark free-text questions on the site.
                    We only send your answer to OpenAI, we do not send any personal data.
                    For more information, read our <Link to="/support/student/general" target="_blank">FAQs</Link>.
                </p>
            </>}
        </>}
    />;
};
