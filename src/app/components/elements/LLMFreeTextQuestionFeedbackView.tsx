import React, {useEffect, useRef, useState} from 'react';
import {LLMFreeTextQuestionValidationResponseDTO} from "../../../IsaacApiTypes";
import {Button, Table} from "reactstrap";
import {Immutable} from "immer";
import {Link} from 'react-router-dom';
import {StyledCheckbox} from './inputs/StyledCheckbox';
import {logAction, selectors, useAppDispatch, useAppSelector} from '../../state';
import {isAda, NOT_FOUND, siteSpecific} from '../../services';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next'

const noFeedback = {disagree: false, partlyAgree: false, agree: false};

interface LLMFreeTextQuestionFeedbackViewProps {
    validationResponse: Immutable<LLMFreeTextQuestionValidationResponseDTO>;
    maxMarks: number;
    hasSubmitted: boolean;
    sentFeedback: boolean;
    setSentFeedback: (value: boolean) => void;
}
export default function LLMFreeTextQuestionFeedbackView({validationResponse, maxMarks, hasSubmitted, sentFeedback, setSentFeedback}: LLMFreeTextQuestionFeedbackViewProps) {
    const { t } = useTranslation()
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
        <h4 className="mb-0">{t('llm.doYouAgree', 'Do you agree with the LLM’s predicted marks?')}</h4>
        <p className="mb-0">
            {t('llm.predictedOftenWrong', '1 in 3 times the predicted mark will be wrong.')} 
            {isAda && <Trans i18nKey={"llm.findOutMore"}>
                {` `}Find out more in our <Link to="/support/student/general" target="_blank">FAQs</Link>.
            </Trans>}
        </p>
        <div className="prediction my-4">
            <div className='d-flex'>
                <span className="icon icon-ai mt-1 me-2"/>
                <strong>{t('llm.predictionMarksOutOfMaxmarksMarks', 'Prediction: {{marks}} out of {{maxMarks}} marks', { marks: validationResponse.marks, maxMarks })}</strong>
            </div>
        </div>
        <div className="card table-responsive llm-mark-table-wrapper mb-4 rounded-2">
            <Table size='sm' className="mb-0" bordered={false} borderless={isAda}>
                <thead>
                    <tr>
                        <th>{t('markScheme', 'Mark scheme')}</th>
                        <th><span className='visually-hidden'>{t('predictedCorrect', 'Predicted correct')}</span></th>
                    </tr>
                </thead>
                <tbody>
                    {validationResponse.markBreakdown?.map(mark => <tr key={mark.jsonField}>
                        <td className="w-100">{mark.shortDescription}</td>
                        <td>
                            {mark.marks > 0 && <>
                                <span className="visually-hidden">{t('predictedAsAwarded', 'Predicted as awarded')}</span>
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
                    <p className="mb-4">{t('llm.beforeSubmittingAnotherResponsePleaseSayWhetherYouAgreeWithThePredictedMark', 'Before submitting another response, please say whether you agree with the predicted mark.')}</p>
                    <ul className="no-bullet px-2 mb-4">
                        <li>
                            <StyledCheckbox
                                id="disagree" label={<p>{t('disagree', 'Disagree')}</p>}
                                checked={feedback.disagree} onChange={() => setFeedback({...noFeedback, disagree: !feedback.disagree})}
                            />
                        </li>
                        <li>
                            <StyledCheckbox
                                id="partlyAgree" label={<p>{t('partlyAgree', 'Partly agree')}</p>}
                                checked={feedback.partlyAgree} onChange={() => setFeedback({...noFeedback, partlyAgree: !feedback.partlyAgree})}
                            />
                        </li>
                        <li>
                            <StyledCheckbox
                                id="agree" label={<p>{t('agree', 'Agree')}</p>}
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
                        {t('sendFeedback', 'Send feedback')}
                    </Button>
                </div>
                : <div className="feedback-collection submitted">
                    <span className="icon-feedback-sent-tick" />{" "}
                    {t('llm.feedbackSubmitted', 'Feedback submitted')}
                </div>
            }
        </>}
    </div>;
}
