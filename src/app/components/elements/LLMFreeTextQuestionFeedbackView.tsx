import React from 'react';

import {QuestionValidationResponseDTO, LLMFreeTextQuestionValidationResponseDTO} from "../../../IsaacApiTypes";
import {Alert, Table} from "reactstrap";
import {siteSpecific} from "../../services/siteConstants";
import {Immutable} from "immer";


export default function LLMFreeTextQuestionFeedbackView({validationResponse}: {validationResponse: Immutable<QuestionValidationResponseDTO>}) {
    const feedback = validationResponse as Immutable<LLMFreeTextQuestionValidationResponseDTO>;
    return <div className='question-component p-md-5'>
        <h2>Do you agree with the LLM’s predicted marks?</h2>
        <Alert color="turquoise-blue" className="text-dark">
            <strong>{`Prediction: ${feedback.marksAwarded} out of ${feedback.maxMarks} marks`}</strong>
        </Alert>
        <Table>
            <thead>
                <tr>
                    <th colSpan={2}>{siteSpecific("Mark Scheme", "Mark scheme")}</th>
                </tr>
            </thead>
            <tbody>
                {feedback.markBreakdown?.map(mark => <tr key={mark.jsonField}>
                    <td className="w-100">{mark.shortDescription}</td>
                    <td>{mark.marks > 0 ? "✅" : " "}</td>
                </tr>)}
            </tbody>
        </Table>
    </div>;
}