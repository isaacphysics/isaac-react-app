import React from "react";
import {IsaacQuestionProps, MultiPartQuestionContext, ValidatedChoice} from "../../../IsaacAppTypes";
import {
    ChoiceDTO,
    IsaacMultiPartQuestionDTO,
    MultiPartChoiceDTO,
    MultiPartValidationResponseDTO
} from "../../../IsaacApiTypes";
import {useCurrentQuestionAttempt} from "../../services";
import {useCallback} from "react";
import {Immutable} from "immer";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

const IsaacMultiPartQuestion = ({doc, questionId, readonly, validationResponse}: IsaacQuestionProps<IsaacMultiPartQuestionDTO, MultiPartValidationResponseDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<MultiPartChoiceDTO>(questionId);
    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?

    const singlePartCurrentAttempt = useCallback((id: string) => {
        return currentAttempt?.choices?.find(c => c.id === id);
    }, [currentAttempt]);
    const dispatchSinglePartCurrentAttempt = useCallback((id: string, attempt: Immutable<ChoiceDTO | ValidatedChoice<ChoiceDTO>>) => {
        dispatchSetCurrentAttempt({type: "multiPartChoice", choices: [...currentAttempt?.choices?.filter(c => c.id !== id) ?? [], {...attempt, id}]});
    }, [currentAttempt, dispatchSetCurrentAttempt]);
    const getQuestionValidation = useCallback((id: string) => {
        return validationResponse?.validationResponses?.find(vr => vr.questionId === id);
    }, [validationResponse]);
    const getQuestionDoc = useCallback((id: string) => {
        return doc?.parts?.find(p => p.id === id);
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