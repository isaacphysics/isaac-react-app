import React, { useEffect, useRef, useState } from 'react';

import {LLMFreeTextQuestionValidationResponseDTO} from "../../../IsaacApiTypes";
import {Alert, Button, Card, Table} from "reactstrap";
import {siteSpecific} from "../../services/siteConstants";
import {Immutable} from "immer";
import { Link } from 'react-router-dom';
import { StyledCheckbox } from './inputs/StyledCheckbox';
import { logAction, selectors, useAppDispatch, useAppSelector } from '../../state';
import { NOT_FOUND } from '../../services';

const noFeedback = {disagree: false, partlyAgree: false, agree: false};

interface LLMFreeTextQuestionFeedbackViewProps {
    validationResponse: Immutable<LLMFreeTextQuestionValidationResponseDTO>;
    hasSubmitted: boolean;
    sentFeedback: boolean;
    setSentFeedback: (value: boolean) => void;
}
export default function LLMFreeTextQuestionFeedbackView({validationResponse, hasSubmitted, sentFeedback, setSentFeedback}: LLMFreeTextQuestionFeedbackViewProps) {
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

    return <div ref={feedbackPanelRef} className='llm-feedback question-component p-md-5'>
        <h2 className="mb-0">Do you agree with the LLM’s predicted marks?</h2>
        <p className="mb-0">1 in 3 times the predicted mark will be wrong. Find out more in our <Link to="/support/student/general" target="_blank">FAQs</Link></p>
        <div className="prediction my-4">
            <div className='d-flex'>
                <span className="icon-ai me-2"/>
                <strong>{`Prediction: ${validationResponse.marksAwarded} out of ${validationResponse.maxMarks} marks`}</strong>
            </div>
        </div>
        <div className="table-responsive card curved-table-wrapper mb-4">
            <Table size='sm' className="mb-0" bordered={false}>
                <thead>
                    <tr>
                        <th>{siteSpecific("Mark Scheme", "Mark scheme")}</th>
                        <th><span className='visually-hidden'>Predicted correct</span></th>
                    </tr>
                </thead>
                <tbody>
                    {validationResponse.markBreakdown?.map(mark => <tr key={mark.jsonField}>
                        <td className="w-100">{mark.shortDescription}</td>
                        <td>{
                            mark.marks > 0 ?
                                <><span className="visually-hidden">Predicted as awarded</span><span className='icon-feedback-tick' /></> :
                                <></>
                        }</td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
        {hasSubmitted && <>
            {!sentFeedback ? <div className="feedback-collection">
                <p className="mb-4">Before submitting another response, please say whether you agree with the predicted mark.</p>
                <ul className="no-bullet px-2 mb-4">
                    <li>
                        <StyledCheckbox
                            id="disagree"  label={<p>Disagree</p>} className='"mb-4'
                            checked={feedback.disagree} onChange={() => setFeedback({...noFeedback, disagree: !feedback.disagree})}
                        />
                    </li>
                    <li>
                        <StyledCheckbox
                            id="partlyAgree" label={<p>Partly agree</p>} className='"mb-4'
                            checked={feedback.partlyAgree} onChange={() => setFeedback({...noFeedback, partlyAgree: !feedback.partlyAgree})}
                        />
                    </li>
                    <li>
                        <StyledCheckbox
                            id="agree" label={<p>Agree</p>}
                            checked={feedback.agree} onChange={() => setFeedback({...noFeedback, agree: !feedback.agree})}
                        />
                    </li>
                </ul>
                <Button
                    color="primary" outline disabled={Object.values(feedback).every(a => !a)}
                    onClick={() => {
                        dispatch(logAction({type: "LLM_FREE_TEXT_QUESTION_FEEDBACK", events: {...validationResponse, pageId, userFeedback: feedback}}));
                        setSentFeedback(true);
                    }}
                >
                    Send feedback
                </Button>
            </div> :
            <div className="feedback-collection submitted">
                ✓ Feedback submitted
            </div>}
        </>}
    </div>;
}