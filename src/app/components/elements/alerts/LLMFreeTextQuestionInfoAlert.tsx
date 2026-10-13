import React from "react";

import {Button, Col, Row} from "reactstrap";
import {ACCOUNT_TAB, isAda, isLoggedIn, isUnder13, KEY, persistence, useNavigation, useUserConsent} from "../../../services";
import {Link, useLocation} from "react-router-dom";
import {PotentialUser} from "../../../../IsaacAppTypes";
import {ContentBaseDTO} from "../../../../IsaacApiTypes";
import {useLinkableSetting} from "../../../services/linkableSetting";
import {selectors, useAppSelector, useUpdateCurrentMutation} from "../../../state";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../TransAnchor";

const locationOfFAQEntry = "/support/student/general#llm_questions";

interface InfoBannerProps {
    doc: ContentBaseDTO;
}

function LoggedOutCopy({doc}: InfoBannerProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigation = useNavigation(doc);

    function setAfterAuthPath() {
        persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search + location.hash);
    }

    return <>
        <div className="h4">{isAda && <i className="icon icon-inline-sm icon-lock me-1"/>} {t("common:freeTextBuilder.infoAlert.loggedOutTitle")}</div>
        <p>
            {t("common:freeTextBuilder.infoAlert.loggedOutDescription")}
        </p>
        <p>
            {t("common:freeTextBuilder.infoAlert.loggedOutDataPrivacy")}
        </p>
        {isAda && <p>
            <Trans
                i18nKey="ada:freeTextBuilder.infoAlert.loggedOutFaq"
                components={{
                    faqLink: <Link to={locationOfFAQEntry} target="_blank" />,
                }}
            />
        </p>}
        <Row className="align-items-center mt-4">
            <Col div className="col-12 col-sm-auto me-auto">
                <Link to="/login" onClick={setAfterAuthPath} className="btn btn-solid me-2 w-100 w-sm-auto">
                    {t("common:freeTextBuilder.infoAlert.loginButton")}
                </Link>
                <Link to="/register" onClick={setAfterAuthPath} className="btn btn-keyline bg-white w-100 w-sm-auto mt-2 mt-sm-0">
                    {t("common:freeTextBuilder.infoAlert.signupButton")}
                </Link>
            </Col>
            {navigation.nextItem && <Col className="col-auto mt-4 mt-md-0">
                <Link to={{pathname: navigation.nextItem.to, search: navigation.search}}>{t("common:freeTextBuilder.infoAlert.skipQuestion")}</Link> <strong>&gt;</strong>
            </Col>}
        </Row>
    </>;
}

function OpenAIUnder13Copy({doc}: InfoBannerProps) {
    const navigation = useNavigation(doc);

    return <>
        <h4>We cannot collect your consent</h4>
        <p>
            We use a large language model (LLM) to mark free-text questions like this one.
            This requires your consent to send your answer to OpenAI for marking.
            Because you are under 13, we cannot collect your consent for this under the GDPR law.
        </p>
        <p>
            You can still read the question, but we will not be able to mark your answer.
        </p>
        {navigation.nextItem && <Button tag={Link} color="keyline" className="bg-white w-100 w-sm-auto mt-2 mt-sm-0" to={{pathname: navigation.nextItem.to, search: navigation.search}}>
            Skip question
        </Button>}
    </>;
};

function OpenAIConsentCopy({doc}: InfoBannerProps) {
    const { t } = useTranslation();
    const navigation = useNavigation(doc);
    const user = useAppSelector(selectors.user.orNull);

    const [updateCurrentUser] = useUpdateCurrentMutation();

    async function provideConsent() {
        await updateCurrentUser({
            currentUser: user as PotentialUser,
            updatedUser: {...user, password: null},
            userPreferences: {CONSENT: {OPENAI: true}},
            registeredUserContexts: undefined,
            passwordCurrent: null,
            redirect: false
        });
    }

    return <>
        <div className="h4">{t("common:freeTextBuilder.infoAlert.consentTitle")}</div>
        <p>
            {t("common:freeTextBuilder.infoAlert.consentDescription")}
            {isAda && <> <Trans
                i18nKey="ada:freeTextBuilder.infoAlert.consentFaq"
                components={{
                    faqLink: <Link to={locationOfFAQEntry} target="_blank" />,
                }}
            /></>}
        </p>
        <p>
            <Trans
                i18nKey="common:freeTextBuilder.infoAlert.consentPrivacy"
                components={{
                    privacyPolicyLink: <TransAnchor href="https://openai.com/policies/eu-privacy-policy" target="_blank" rel="noopener noreferrer" />,
                }}
            />
        </p>
        <p>
            <Trans
                i18nKey="common:freeTextBuilder.infoAlert.consentWithdraw"
                components={{
                    accountSettingsLink: <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`} />,
                }}
            />
        </p>
        <div className="mt-4">
            <Button color="solid" className="me-2 w-100 w-sm-auto" onClick={provideConsent}>
                {t("common:freeTextBuilder.infoAlert.consentButton")}
            </Button>
            {navigation.nextItem && <Button tag={Link} color="keyline" className="bg-white w-100 w-sm-auto mt-2 mt-sm-0" to={{pathname: navigation.nextItem.to, search: navigation.search}}>
                {t("common:freeTextBuilder.infoAlert.skipQuestion")}
            </Button>}
        </div>
    </>;
}

function GeneralInfoCopy(_props: InfoBannerProps) {
    const { t } = useTranslation();
    const {setLinkedSetting} = useLinkableSetting();

    return <>
        <div className="h4">{t("common:freeTextBuilder.infoAlert.generalTitle")}</div>
        <p>
            {t("common:freeTextBuilder.infoAlert.generalAccuracy")}
            {isAda && <><Trans
                i18nKey="ada:freeTextBuilder.infoAlert.generalFaq"
                components={{
                    faqLink: <Link to={locationOfFAQEntry} target="_blank" />,
                }}
            /> </>}
        </p>
        <p>
            <Trans
                i18nKey="common:freeTextBuilder.infoAlert.generalDataPrivacy"
                components={{
                    accountSettingsLink: <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`} onClick={() => setLinkedSetting("consent-to-openai-marking-feature")} />,
                }}
            />
        </p>
    </>;
}

export function LLMFreeTextQuestionInfoAlert({doc}: InfoBannerProps) {
    const user = useAppSelector(selectors.user.orNull);
    const userConsent = useUserConsent();

    let CopyToDisplay;
    if (!isLoggedIn(user)) {
        CopyToDisplay = LoggedOutCopy;
    } else if (isUnder13(user)) {
        CopyToDisplay = OpenAIUnder13Copy;
    } else if (!userConsent?.openAIConsent) {
        CopyToDisplay = OpenAIConsentCopy;
    } else {
        CopyToDisplay = GeneralInfoCopy;
    }

    return <div className="d-print-none llm-info-banner mt-2" data-bs-theme="neutral">
        <CopyToDisplay doc={doc} />
    </div>;
}
