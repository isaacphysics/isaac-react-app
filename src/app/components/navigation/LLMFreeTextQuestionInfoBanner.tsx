import React from "react";

import {Button, Col, Row} from "reactstrap";
import {ACCOUNT_TAB, isAda, isLoggedIn, KEY, persistence, useNavigation, useUserConsent} from "../../services";
import {Link, useLocation} from "react-router-dom";
import {PotentialUser} from "../../../IsaacAppTypes";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {useLinkableSetting} from "../../services/linkableSetting";
import {selectors, useAppSelector, useUpdateCurrentMutation} from "../../state";

const locationOfFAQEntry = "/support/student/general#llm_questions";

interface InfoBannerProps {
    doc: ContentBaseDTO;
}

function LoggedOutCopy({doc}: InfoBannerProps) {
    const location = useLocation();
    const navigation = useNavigation(doc);

    function setAfterAuthPath() {
        persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search + location.hash);
    }

    return <>
        <h4>{isAda && <i className="icon icon-inline-sm icon-lock me-1"/>} You must be logged in to answer this question</h4>
        <p>
            We use a large language model (LLM) to mark free-text questions like this one.
            The model typically returns a predicted mark in under 10 seconds, along with the mark scheme.
            This gives you a low-stakes way to practise exam-style questions as well as an insight into how LLMs work, and their accuracy.
        </p>
        <p>
            The only data we send to the LLM is your answer; we do not send any personal data.
        </p>
        {isAda && <p>
            You can read more in our <Link to={locationOfFAQEntry} target="_blank">FAQs</Link>.
        </p>}
        <Row className="align-items-center mt-4">
            <Col div className="col-12 col-sm-auto me-auto">
                <Link to="/login" onClick={setAfterAuthPath} className="btn btn-solid me-2 w-100 w-sm-auto">
                    Log in
                </Link>
                <Link to="/register" onClick={setAfterAuthPath} className="btn btn-keyline bg-white w-100 w-sm-auto mt-2 mt-sm-0">
                    Sign up
                </Link>
            </Col>
            {navigation.nextItem && <Col className="col-auto mt-4 mt-md-0">
                <Link to={{pathname: navigation.nextItem.to, search: navigation.search}}>Skip question</Link> <strong>&gt;</strong>
            </Col>}
        </Row>
    </>;
}

function OpenAIConsentCopy({doc}: InfoBannerProps) {
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
        <h4>Do you consent to sending your answers to OpenAI for marking?</h4>
        <p>
            We use a large language model (LLM) to mark free-text questions like this one.
            The model typically returns a predicted mark in under 10 seconds; however the marks you receive may not be accurate.
            {isAda && ` See our ${<Link to={locationOfFAQEntry} target="_blank">FAQs</Link>} for more information.`}
        </p>
        <p>
            We only send your answer to OpenAI, we do not send any personal data.
            OpenAI will not train their models using data you submit;
            you may wish to read OpenAI’s <a href="https://openai.com/policies/eu-privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a> before accepting.
        </p>
        <p>
            You can withdraw your consent at any time in your <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`}>account settings</Link>.
        </p>
        <div className="mt-4">
            <Button color="solid" className="me-2 w-100 w-sm-auto" onClick={provideConsent}>
                Consent
            </Button>
            {navigation.nextItem && <Button tag={Link} color="keyline" className="bg-white w-100 w-sm-auto mt-2 mt-sm-0" to={{pathname: navigation.nextItem.to, search: navigation.search}}>
                Skip question
            </Button>}
        </div>
    </>;
}

function GeneralInfoCopy(_props: InfoBannerProps) {
    const {setLinkedSetting} = useLinkableSetting();

    return <>
        <h4>Free text questions are marked by a large language model (LLM)</h4>
        <p>
            In our 2024 study, we found that the LLM marks agreed with the marks computer science teachers gave 66% of the time.
            This means that the marks you receive will not always be accurate.
            {isAda && <>{` `}For more information, read our {<Link to={locationOfFAQEntry} target="_blank">FAQs</Link>}. </>}
        </p>
        <p>
            Do not include personal data in your answer as we send your answer to OpenAI.
            We only send your answer, we do not send any personal data with it.
            You can withdraw your consent at any time in your <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`} onClick={() => setLinkedSetting("consent-to-openai-marking-feature")}>account settings</Link>.
        </p>
    </>;
}

export function LLMFreeTextQuestionInfoBanner({doc}: InfoBannerProps) {
    const user = useAppSelector(selectors.user.orNull);
    const userConsent = useUserConsent();

    let CopyToDisplay;
    if (!isLoggedIn(user)) {
        CopyToDisplay = LoggedOutCopy;
    } else if (!userConsent?.openAIConsent) {
        CopyToDisplay = OpenAIConsentCopy;
    } else {
        CopyToDisplay = GeneralInfoCopy;
    }

    return <div className="d-print-none llm-info-banner mt-2" data-bs-theme="neutral">
        <CopyToDisplay doc={doc} />
    </div>;
}
