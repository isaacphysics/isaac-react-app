import React, {Suspense, useContext, useMemo} from "react";
import {MultiPartQuestionContext} from "../../../../../IsaacAppTypes";
import {QUESTION_TYPES} from "../../../../services";
import {IsaacSpinner} from "../../../handlers/IsaacSpinner";
import ReactDOM from "react-dom";

export const InlineQuestion = ({id, questionId, marks, rootElement}: {id: string; questionId: string; marks: number, rootElement?: HTMLElement}) => {
    const multiPartQuestionContext = useContext(MultiPartQuestionContext);
    const validationResponse = useMemo(() => multiPartQuestionContext?.getQuestionValidation(questionId), [questionId, multiPartQuestionContext?.getQuestionValidation]);
    const doc = useMemo(() => multiPartQuestionContext?.getQuestionDoc(questionId), [questionId, multiPartQuestionContext?.getQuestionDoc]);

    // Select QuestionComponent from the question part's document type (or default)
    const QuestionComponent = QUESTION_TYPES[doc?.type ?? "default"];

    const inlineQuestionTarget = rootElement?.querySelector(`div[id='${id}']`);
    if (multiPartQuestionContext && inlineQuestionTarget) {
        return ReactDOM.createPortal(
            <Suspense fallback={<IsaacSpinner />}>
                <QuestionComponent questionId={questionId} doc={doc} validationResponse={validationResponse} />
            </Suspense>,
            inlineQuestionTarget
        );
    }
    return null;
};
