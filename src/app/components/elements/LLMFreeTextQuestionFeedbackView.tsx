import React, {useEffect, useRef, useState} from 'react';
import {LLMFreeTextQuestionValidationResponseDTO} from "../../../IsaacApiTypes";
import {Button, Table} from "reactstrap";
import {Immutable} from "immer";
import {Link} from 'react-router-dom';
import {StyledCheckbox} from './inputs/StyledCheckbox';
import {logAction, selectors, useAppDispatch, useAppSelector} from '../../state';
import {isAda, NOT_FOUND, siteSpecific} from '../../services';
import classNames from 'classnames';
import { Trans, useTranslation } from "react-i18next";

const noFeedback = {disagree: false, partlyAgree: false, agree: false};

interface LLMFreeTextQuestionFeedbackViewProps {
    validationResponse: Immutable<LLMFreeTextQuestionValidationResponseDTO>;
    maxMarks: number;
    hasSubmitted: boolean;
    sentFeedback: boolean;
    setSentFeedback: (value: boolean) => void;
}
export default function LLMFreeTextQuestionFeedbackView({validationResponse, maxMarks, hasSubmitted, sentFeedback, setSentFeedback}: LLMFreeTextQuestionFeedbackViewProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const page = useAppSelector(selectors.doc.get);
    const pageId = page && page !== NOT_FOUND && page.id || undefined;
    const [feedback, setFeedback] = useState(noFeedback);

    const feedbackPanelRef = useRef<HTMLDivElement>(null);
    useEffect(function scrollValidationResponseIntoView() {
        if (feedbackPanelRef.current && hasSubmitted) { // Don't scroll for loaded previous attempts
            feedbackPanelRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [hasSubmitted]);

    return <div ref={feedbackPanelRef} className={classNames("llm-feedback question-component", siteSpecific("p-xl-7 p-5", "p-md-7"))}>
        <span className="h4 mb-0">{t("common:freeTextBuilder.llmFeedback.title")}</span>
        <p className="mb-0">
            {t("common:freeTextBuilder.llmFeedback.accuracyNote")} 
            {isAda && <><Trans
                i18nKey="ada:freeTextBuilder.llmFeedback.faqInfo"
                components={{
                    faqLink: <Link to="/support/student/general" target="_blank" />,
                }}
            /></>}
        </p>
        <div className="prediction my-4">
            <div className='d-flex'>
                <span className="icon icon-ai mt-1 me-2"/>
                <strong>{t("common:freeTextBuilder.llmFeedback.prediction", { predictedMarks: validationResponse.marks, maxMarks })}</strong>
            </div>
        </div>
        <div className="card table-responsive llm-mark-table-wrapper mb-4 rounded-2">
            <Table size='sm' className="mb-0" bordered={false} borderless={isAda}>
                <thead>
                    <tr>
                        <th>{t("common:freeTextBuilder.llmFeedback.markScheme")}</th>
                        <th><span className='visually-hidden'>{t("common:freeTextBuilder.llmFeedback.predictedCorrect")}</span></th>
                    </tr>
                </thead>
                <tbody>
                    {validationResponse.markBreakdown?.map(mark => <tr key={mark.jsonField}>
                        <td className="w-100">{mark.shortDescription}</td>
                        <td>
                            {mark.marks > 0 && <>
                                <span className="visually-hidden">{t("common:freeTextBuilder.llmFeedback.predictedAwarded")}</span>
                                <span className={siteSpecific("icon-inline icon-correct", "icon icon-feedback-tick icon-sm")} />
                            </>}
                        </td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
        {hasSubmitted && <>
            {!sentFeedback
                ? <div className="feedback-collection">
                    <p className="mb-4">{t("common:freeTextBuilder.llmFeedback.feedbackPrompt")}</p>
                    <ul className="no-bullet px-2 mb-4">
                        <li>
                            <StyledCheckbox
                                id="disagree" label={<p>{t("common:freeTextBuilder.llmFeedback.disagree")}</p>}
                                checked={feedback.disagree} onChange={() => setFeedback({...noFeedback, disagree: !feedback.disagree})}
                            />
                        </li>
                        <li>
                            <StyledCheckbox
                                id="partlyAgree" label={<p>{t("common:freeTextBuilder.llmFeedback.partlyAgree")}</p>}
                                checked={feedback.partlyAgree} onChange={() => setFeedback({...noFeedback, partlyAgree: !feedback.partlyAgree})}
                            />
                        </li>
                        <li>
                            <StyledCheckbox
                                id="agree" label={<p>{t("common:freeTextBuilder.llmFeedback.agree")}</p>}
                                checked={feedback.agree} onChange={() => setFeedback({...noFeedback, agree: !feedback.agree})}
                            />
                        </li>
                    </ul>
                    <Button
                        color="keyline" disabled={Object.values(feedback).every(a => !a)}
                        onClick={() => {
                            dispatch(logAction({type: "LLM_FREE_TEXT_QUESTION_FEEDBACK", events: {...validationResponse, pageId, userFeedback: feedback}}));
                            setSentFeedback(true);
                        }}
                    >
                        {t("common:freeTextBuilder.llmFeedback.submitButton")}
                    </Button>
                </div>
                : <div className="feedback-collection submitted">
                    <span className="icon-feedback-sent-tick" /> {t("common:freeTextBuilder.llmFeedback.submitted")}
                </div>
            }
        </>}
    </div>;
}
