import React from "react";

import { Alert, Button } from "reactstrap";
import { ACCOUNT_TAB, isLoggedIn, KEY, persistence, useUserConsent } from "../../services";
import { Link, useLocation } from "react-router-dom";
import { selectors, updateCurrentUser, useAppDispatch, useAppSelector } from "../../state";
import { Spacer } from "../elements/Spacer";
import { PotentialUser } from "../../../IsaacAppTypes";

const locationOfFAQEntry = "/support/student/general";

function LoggedOutCopy() {
    const location = useLocation();
    function setAfterAuthPath() {
        persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search + location.hash);
    }

    return <>
        <h2>🔒 You must be logged in to answer this question</h2>
        <p>
            We use a large language model (LLM) to mark free-text questions like this one.
            The model typically returns a predicted mark in under 10 seconds, along with the mark scheme.
            This gives you a low-stakes way to practise exam-style questions as well as an insight into how LLMs work, and their accuracy.
        </p>
        <p>
            The only data we send to the LLM is your answer; we do not send any personal data.
        </p>
        <p>
            You can read more in our <Link to={locationOfFAQEntry} target="_blank">FAQs</Link>.
        </p>
        <div className="d-flex align-items-center">
            <Link to="/login" onClick={setAfterAuthPath} className="btn btn-primary mr-2">Log in</Link>
            <Link to="/register" onClick={setAfterAuthPath} className="btn btn-outline-primary bg-cultured-grey">Sign up</Link>
            <Spacer />
            <Link to="/">Skip question</Link> <strong>&gt;</strong>
        </div>
    </>;
}

function OpenAIConsentCopy() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    function provideConsent() {
        dispatch(updateCurrentUser({...user, password: null}, {CONSENT: {OPENAI: true}}, undefined, null, user as PotentialUser, false));
    }

    return <>
        <h2>Do you consent to sending your answers to OpenAI for marking?</h2>
        <p>
            We use a large language model (LLM) to mark free-text questions like this one.
            The model typically returns a predicted mark in under 10 seconds; however the marks you receive may not be accurate.
            See our <Link to={locationOfFAQEntry} target="_blank">FAQs</Link> for more information.
        </p>
        <p>
            We only send your answer to OpenAI, we do not send any personal data.
            OpenAI will not train their models using data you submit;
            you may wish to read OpenAI’s <a href="https://openai.com/policies/eu-privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a> before accepting.
        </p>
        <p>
            You can withdraw your consent at any time in your <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`}>account settings</Link>.
        </p>
        <div>
            <Button color="primary" className="mr-2" onClick={provideConsent}>Consent</Button>
            <Button color="outline-primary" className="bg-cultured-grey">Skip question</Button>
        </div>
    </>;
}

function GeneralInfoCopy() {
    return <>
        <h2>Free text questions are marked by a large language model (LLM)</h2>
        <p>
            In our 2024 study, we found that the LLM marks agreed with the marks computer science teachers gave 66% of the time.
            This means that the marks you receive will not always be accurate. For more information, read our <Link to={locationOfFAQEntry} target="_blank">FAQs</Link>.
        </p>
        <p>
            We only send your answer to OpenAI, we do not send any personal data;
            you can withdraw your consent at any time in your <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`}>account settings</Link>.
        </p>
    </>;
}

export function LLMFreeTextQuestionInfoBanner() {
    const pageQuestions = useAppSelector(selectors.questions.getQuestions) || [];
    const pageContainsFreeTextQuestion = pageQuestions.some(q => q.type === "isaacLLMFreeTextQuestion");
    const user = useAppSelector(selectors.user.orNull);
    const userConsent = useUserConsent();

    // Early exit if there are no free text questions on the page
    if (!pageContainsFreeTextQuestion) {
        return null;
    }

    let CopyToDisplay;
    if (!isLoggedIn(user)) {
        CopyToDisplay = LoggedOutCopy;
    } else if (!userConsent?.openAIConsent) {
        CopyToDisplay = OpenAIConsentCopy;
    } else {
        CopyToDisplay = GeneralInfoCopy;
    }

    return <div className="d-print-none">
        <Alert color="info">
            <CopyToDisplay />
        </Alert>
    </div>;
}
