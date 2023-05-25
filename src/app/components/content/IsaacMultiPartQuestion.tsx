import React from "react";
import {IsaacQuestionProps, MultiPartQuestionContext, ValidatedChoice} from "../../../IsaacAppTypes";
import {
    ChoiceDTO,
    IsaacMultiPartQuestionDTO,
    MultiPartAnswerDTO,
    MultiPartValidationResponseDTO
} from "../../../IsaacApiTypes";
import {useCurrentQuestionAttempt} from "../../services";
import {useCallback} from "react";
import {Immutable} from "immer";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

const IsaacMultiPartQuestion = ({doc, questionId, readonly, validationResponse}: IsaacQuestionProps<IsaacMultiPartQuestionDTO, MultiPartValidationResponseDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<MultiPartAnswerDTO>(questionId);
    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?

    const singlePartCurrentAttempt = useCallback((index: number) => {
        return currentAttempt?.answers[index.toString()]; // TODO might need safer access logic
    }, [currentAttempt]);
    const dispatchSinglePartCurrentAttempt = useCallback((index: number, attempt: Immutable<ChoiceDTO | ValidatedChoice<ChoiceDTO>>) => {
        dispatchSetCurrentAttempt({type: "multiPartAnswer", answers: {...currentAttempt?.answers, [index]: attempt}});
    }, [currentAttempt, dispatchSetCurrentAttempt]);
    const getQuestionValidation = useCallback((index: number) => {
        return validationResponse?.validationResponses?.[index];
    }, [validationResponse]);
    // We still need this because symbolic and numeric questions require symbols and units to be specified for each part
    const getQuestionDoc = useCallback((index: number) => {
        return doc?.parts?.[index];
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