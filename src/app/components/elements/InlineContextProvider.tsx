import React, { useRef } from "react";
import { InlineContext } from "../../../IsaacAppTypes";

interface InlineContextProviderProps {
    docId?: string;
    children: React.ReactNode;
}

const InlineContextProvider = (props: InlineContextProviderProps) => {
    const questionPartIdMap = useRef<Record<string, {questionId: string; type: string;}>>({}).current;
    const [feedbackIndex, setFeedbackIndex] = React.useState<number | undefined>(undefined);
    const [modifiedQuestionIds, setModifiedQuestionIds] = React.useState<string[]>([]);
    const [isModifiedSinceLastSubmission, setIsModifiedSinceLastSubmission] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [focusSelection, setFocusSelection] = React.useState(false);
    const canShowWarningToast = useRef(true).current; 
    // above is a ref because multiple questions are submitted during the same render cycle; this value needs to update during this time, which setState doesn't guarantee.

    return <InlineContext.Provider value={{ 
        docId: props.docId, elementToQuestionMap: questionPartIdMap, modifiedQuestionIds, setModifiedQuestionIds, isModifiedSinceLastSubmission,
        canShowWarningToast, setIsModifiedSinceLastSubmission, feedbackIndex, setFeedbackIndex, submitting, setSubmitting, focusSelection, setFocusSelection }}
    >
        {props.children}
    </InlineContext.Provider>;
};

export default InlineContextProvider;