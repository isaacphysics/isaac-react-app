import React from "react";
import { DisplaySettings, UserConsent } from "../../../../IsaacAppTypes";
import { SITE_TITLE, isAda, isPhy, isStaff, siteSpecific } from "../../../services";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { MyAccountTab } from "./MyAccountTab";
import { Link } from "react-router-dom";
import { WithLinkableSetting } from "../WithLinkableSetting";
import { selectors, useAppSelector } from "../../../state";
import { useTranslation } from 'react-i18next'

interface RevisionModeInputProps {
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}
interface UserBetaFeaturesProps extends RevisionModeInputProps{
    consentSettings: UserConsent;
    setConsentSettings: (cs: UserConsent | ((oldUC?: UserConsent) => UserConsent)) => void;
}

export const RevisionModeInput = ({displaySettings, setDisplaySettings}: RevisionModeInputProps) => {
    const { t } = useTranslation()
    return <StyledCheckbox checked={displaySettings.HIDE_QUESTION_ATTEMPTS ?? false}
        onChange={e => {
            setDisplaySettings((oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e.target.checked}));
        }}
        color={siteSpecific("primary", "")}
        label={<p>{t('hidePreviousQuestionAttempts', 'Hide previous question attempts')}</p>}
        id={"hide-previous-q-attempts"}
        aria-describedby="revision-helptext"
        removeVerticalOffset
    />;
};

export const UserBetaFeatures = ({ displaySettings, setDisplaySettings, consentSettings, setConsentSettings }: UserBetaFeaturesProps) => {
    const { t } = useTranslation()
    const user = useAppSelector(selectors.user.orNull);

    return <MyAccountTab
        leftColumn={<>
            <h3>{t('betaFeatures', 'Beta Features')}</h3>
            <p>{t('hereYouCanOptinToBetaFeaturesOfTheSite_titlePlatform', 'Here you can opt-in to beta features of the {{SITE_TITLE}} platform.', { SITE_TITLE })}</p>
        </>}
        rightColumn={<>
            <div className="pt-2"/>
            <WithLinkableSetting id={"hide-previous-q-attempts-feature"}>
                <b><RevisionModeInput {...{displaySettings, setDisplaySettings}}/></b>
                <p id="revision-helptext">{t('thisFeatureLetsYouAnswerQuestionsValItsUsefulIfYouAreReviewingATopicBeforeATestOrExam', 'This feature lets you answer questions {{val}} It\'s useful if you are reviewing a topic before a test or exam.', { val: siteSpecific("that you have answered before, without seeing your old answer.", "again, even if you've answered them before.") })}</p>
            </WithLinkableSetting>

            {(isPhy || isStaff(user)) && <WithLinkableSetting id={"show-chem-text-entry"}>
                <StyledCheckbox checked={displaySettings.CHEM_TEXT_ENTRY ?? false}
                    onChange={e => {
                        setDisplaySettings((oldDs) => ({...oldDs, CHEM_TEXT_ENTRY: e.target.checked}));
                    }}
                    label={<p><b>{t('enableTextEntryForChemistryQuestions', 'Enable text entry for chemistry questions')}</b></p>}
                    id={"show-chem-text-entry-checkbox"}
                    removeVerticalOffset
                    aria-describedby="chem-text-entry-helptext"
                />
                <p id="chem-text-entry-helptext">{t('thisFeatureAllowsYouToEnterTextbasedAnswersForChemistryQuestionsAsAnAlternativeToTheGraphicalEditorSeeOur', 'This feature allows you to enter text-based answers for chemistry questions, as an alternative to the graphical editor. See our')} <Link to="/pages/chemistry_text_entry" target="_blank">{t('guidanceOnUsingThisFeature', 'guidance on using this feature')}</Link>.</p>
            </WithLinkableSetting>}

            {/* Enabled for staff on Isaac so they can test questions, but not being pursued further for now (these questions should not be published) */}
            {(isStaff(user) || isAda) && <>
                <div className="pt-2"/>
                <WithLinkableSetting id={"consent-to-openai-marking-feature"}>
                    <StyledCheckbox checked={consentSettings.OPENAI ?? false}
                        onChange={e => {
                            setConsentSettings((oldCS) => ({...oldCS, OPENAI: e.target.checked}));
                        }}
                        label={<p><b>{t('consentToSendingFreetextAnswersToOpenaiForMarking', 'Consent to sending free-text answers to OpenAI for marking')}</b></p>}
                        id={"consent-to-openai-marking"}
                        removeVerticalOffset
                        aria-describedby="llm-helptext"
                    />
                    <p id="llm-helptext"> 
                        {t('weUseALargeLanguageModelLlmToMarkFreetextQuestionsOnTheSiteWeOnlySendYourAnswerToOpenaiWeDoNotSendAnyPersonalData', 'We use a large language model (LLM) to mark free-text questions on the site. We only send your answer to OpenAI, we do not send any personal data.')}
                        {isAda && <>{` `}{t('forMoreInformationReadOur', 'For more information, read our')} <Link to="/support/student/general" target="_blank">{t('faqs', 'FAQs')}</Link>.</>}
                    </p>
                </WithLinkableSetting>
            </>}
        </>}
    />;
};
