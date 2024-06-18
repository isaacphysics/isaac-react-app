import React, { useState } from 'react';

import {LLMFreeTextQuestionValidationResponseDTO} from "../../../IsaacApiTypes";
import {Alert, Button, Table} from "reactstrap";
import {siteSpecific} from "../../services/siteConstants";
import {Immutable} from "immer";
import { Link } from 'react-router-dom';
import { StyledCheckbox } from './inputs/StyledCheckbox';
import { logAction, selectors, useAppDispatch, useAppSelector } from '../../state';
import { NOT_FOUND } from '../../services';

const noFeedback = {disagree: false, partlyAgree: false, agree: false};

export default function LLMFreeTextQuestionFeedbackView({validationResponse}: {validationResponse: Immutable<LLMFreeTextQuestionValidationResponseDTO>}) {
    const dispatch = useAppDispatch();
    const page = useAppSelector(selectors.doc.get);
    const pageId = page && page !== NOT_FOUND && page.id || undefined;
    const [feedback, setFeedback] = useState(noFeedback);
    const [feedbackSent, setFeedbackSent] = useState(false);

    return <div className='question-component p-md-5'>
        <h2>Do you agree with the LLM’s predicted marks?</h2>
        <p>1 in 3 times the predicted mark will be wrong. Find out more in our <Link to="/support/student/general" target="_blank">FAQs</Link></p>
        <Alert color="info">
            <strong>{`Prediction: ${validationResponse.marksAwarded} out of ${validationResponse.maxMarks} marks`}</strong>
        </Alert>
        <Table>
            <thead>
                <tr>
                    <th colSpan={2}>{siteSpecific("Mark Scheme", "Mark scheme")}</th>
                </tr>
            </thead>
            <tbody>
                {validationResponse.markBreakdown?.map(mark => <tr key={mark.jsonField}>
                    <td className="w-100">{mark.shortDescription}</td>
                    <td>{mark.marks > 0 ? "✅" : " "}</td>
                </tr>)}
            </tbody>
        </Table>
        {!feedbackSent && <div>
            <p>Before submitting another response, please say whether you agree with the predicted mark.</p>
            <div>
                <StyledCheckbox
                    id="disagree"  label={<p>Disagree</p>}
                    checked={feedback.disagree} onChange={() => setFeedback({...noFeedback, disagree: !feedback.disagree})}
                />
                <StyledCheckbox
                    id="partlyAgree" label={<p>Partly agree</p>}
                    checked={feedback.partlyAgree} onChange={() => setFeedback({...noFeedback, partlyAgree: !feedback.partlyAgree})}
                />
                <StyledCheckbox
                    id="agree" label={<p>Agree</p>}
                    checked={feedback.agree} onChange={() => setFeedback({...noFeedback, agree: !feedback.agree})}
                />
            </div>
            <Button
                color="primary" outline disabled={Object.values(feedback).every(a => !a)}
                onClick={() => {
                    dispatch(logAction({type: "LLM_FREE_TEXT_QUESTION_FEEDBACK", events: {...validationResponse, pageId, userFeedback: feedback}}));
                    setFeedbackSent(true);
                }}
            >
                Send feedback
            </Button>
        </div>}
    </div>;
}