import React from "react";
import {IsaacQuestionProps, MultiPartQuestionContext, ValidatedChoice} from "../../../IsaacAppTypes";
import {
    ChoiceDTO,
    IsaacMultiPartQuestionDTO,
    MultiPartAnswerDTO,
    MultiPartValidationResponseDTO
} from "../../../IsaacApiTypes";
import {isDefined, useCurrentQuestionAttempt} from "../../services";
import {useCallback} from "react";
import {Immutable} from "immer";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

const IsaacMultiPartQuestion = ({doc, questionId, readonly, validationResponse}: IsaacQuestionProps<IsaacMultiPartQuestionDTO, MultiPartValidationResponseDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<MultiPartAnswerDTO>(questionId);
    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?

    const getSubQuestionIndex = useCallback((questionId: string): number => {
        const index = doc.parts?.findIndex(p => p.id === questionId);
        if (!isDefined(index)) {
            throw `Error - IsaacMultiPartQuestion is malformed, sub-question id ${questionId} does not exist in the question part list`;
        }
        return index;
    }, [doc]);

    const singlePartCurrentAttempt = useCallback((questionId: string) => {
        return currentAttempt?.answers[getSubQuestionIndex(questionId).toString()]; // TODO might need safer access logic
    }, [currentAttempt]);
    const dispatchSinglePartCurrentAttempt = useCallback((questionId: string, attempt: Immutable<ChoiceDTO | ValidatedChoice<ChoiceDTO>>) => {
        dispatchSetCurrentAttempt({type: "multiPartAnswer", answers: {...currentAttempt?.answers, [getSubQuestionIndex(questionId)]: attempt}});
    }, [currentAttempt, dispatchSetCurrentAttempt]);
    const getQuestionValidation = useCallback((questionId: string) => {
        return validationResponse?.validationResponses?.[getSubQuestionIndex(questionId)];
    }, [validationResponse]);
    // We still need this because symbolic and numeric questions require symbols and units to be specified for each part
    const getQuestionDoc = useCallback((questionId: string) => {
        return doc?.parts?.[getSubQuestionIndex(questionId)];
    }, [doc]);

    return <div className="question-content multi-part-question" id={cssFriendlyQuestionPartId}>
        <MultiPartQuestionContext.Provider value={{questionPartId: cssFriendlyQuestionPartId, singlePartCurrentAttempt, dispatchSinglePartCurrentAttempt, getQuestionValidation, getQuestionDoc, readonly: readonly ?? false}}>
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </MultiPartQuestionContext.Provider>
    </div>;
};
export default IsaacMultiPartQuestion;