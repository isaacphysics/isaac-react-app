import React, {useContext, useEffect} from "react";
import {useDispatch} from "react-redux";
import classnames from "classnames";

import * as ApiTypes from "../../../IsaacApiTypes";
import {QUESTION_TYPES} from "../../services/questions";
import {submitQuizQuestionIfDirty} from "../../state/actions/quizzes";
import {isDefined} from "../../services/miscUtils";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {IsaacContent} from "./IsaacContent";

export const QuizAttemptContext = React.createContext<{quizAttemptId: number | null}>({quizAttemptId: null});

export const QuizQuestion = ({doc}: { doc: ApiTypes.IsaacQuestionBaseDTO }) => {
    const dispatch = useDispatch();

    const {quizAttemptId} = useContext(QuizAttemptContext);

    useEffect((): (() => void) => {
        return () => {
            // Submit answer when unmounting if it is dirty
            if (isDefined(quizAttemptId)) {
                dispatch(submitQuizQuestionIfDirty(quizAttemptId, doc.id as string));
            }
        };
    }, [dispatch, doc.id, quizAttemptId]);

    const validationResponse = doc?.bestAttempt;
    const validated = validationResponse?.correct !== undefined;
    const correct = validationResponse?.correct;
    const sigFigsError = (validationResponse?.explanation?.tags || []).includes("sig_figs");

    const QuestionComponent = QUESTION_TYPES.get(doc.type || "default");

    return <React.Fragment>
        <div className={
            classnames({"question-component p-md-5": true, "parsons-layout": doc.type === 'isaacParsonsQuestion'})
        }>
            {/* @ts-ignore as TypeScript is struggling to infer common type for questions */}
            <QuestionComponent questionId={doc.id as string} doc={doc} validationResponse={validationResponse} readonly={validated} />

            {/* CS Hints */}
            {SITE_SUBJECT === SITE.CS && <React.Fragment>
                <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />
            </React.Fragment>}

            {/* Validation Response */}
            {validationResponse && validated && <div className={`validation-response-panel p-3 mt-3 ${correct ? "correct" : ""}`}>
                <div className="pb-1">
                    <h1 className="m-0">{sigFigsError ? "Significant Figures" : correct ? "Correct!" : "Incorrect"}</h1>
                </div>
                {validationResponse.explanation && <div className="mb-2">
                    <IsaacContent doc={validationResponse.explanation} />
                </div>}
            </div>}

            {/* Physics Hints */}
            {SITE_SUBJECT === SITE.PHY && <div className={correct ? "mt-5" : ""}>
                <IsaacTabbedHints questionPartId={doc.id as string} hints={doc.hints}/>
            </div>}
        </div>
    </React.Fragment>;
}
