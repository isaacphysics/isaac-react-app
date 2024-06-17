import React from "react";

import { Alert } from "reactstrap";
import { ACCOUNT_TAB } from "../../services";
import { Link } from "react-router-dom";
import { selectors, useAppSelector } from "../../state";

const generalInfoCopy = <>
    <h2>Free text questions are marked by a large language model (LLM)</h2>
    <p>
        In our 2024 study, we found that the LLM marks agreed with the marks computer science teachers gave 66% of the time.
        This means that the marks you receive will not always be accurate. For more information, read our FAQs.
    </p>
    <p>
        We only send your answer to OpenAI, we do not send any personal data;
        you can withdraw your consent at any time in your <Link to={`/account#${ACCOUNT_TAB[ACCOUNT_TAB.betafeatures]}`}>account settings</Link>.
    </p>
</>;

export function LLMFreeTextQuestionInfoBanner() {
    const pageQuestions = useAppSelector(selectors.questions.getQuestions) || [];
    const pageContainsFreeTextQuestion = pageQuestions.some(q => q.type === "isaacLLMFreeTextQuestion");
    
    if (!pageContainsFreeTextQuestion) {
        return null;
    }

    return <div className="d-print-none">
        <Alert color="info">
            {generalInfoCopy}
        </Alert>
    </div>;
}
