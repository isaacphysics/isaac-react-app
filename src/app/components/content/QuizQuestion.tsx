import React, {Suspense, useContext, useEffect} from "react";
import {useDispatch} from "react-redux";
import classnames from "classnames";
import {QUESTION_TYPES} from "../../services/questions";
import {submitQuizQuestionIfDirty} from "../../state/actions/quizzes";
import {isDefined} from "../../services/miscUtils";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {IsaacContent} from "./IsaacContent";
import * as ApiTypes from "../../../IsaacApiTypes";
import {QuizAttemptContext} from "../../../IsaacAppTypes";
import {Loading} from "../handlers/IsaacSpinner";

export const QuizQuestion = ({doc}: { doc: ApiTypes.QuestionDTO }) => {
    const dispatch = useDispatch();

    const {quizAttempt, questionNumbers} = useContext(QuizAttemptContext);

    useEffect((): (() => void) => {
        return () => {
            // Submit answer when unmounting if it is dirty
            if (isDefined(quizAttempt) && quizAttempt.completedDate === undefined) {
                dispatch(submitQuizQuestionIfDirty(quizAttempt.id as number, doc.id as string));
            }
        };
    }, [dispatch, doc.id, quizAttempt]);

    const validationResponse = doc?.bestAttempt;
    const validated = validationResponse?.correct !== undefined || (!validationResponse && isDefined(quizAttempt?.completedDate));
    const correct = validationResponse?.correct;
    const sigFigsError = (validationResponse?.explanation?.tags || []).includes("sig_figs");
    const noAnswer = validated && correct === undefined;

    const QuestionComponent = QUESTION_TYPES[doc.type || "default"];

    return <React.Fragment>
        <div className={
            classnames("question-component p-md-5", {"parsons-layout": ["isaacParsonsQuestion", "isaacReorderQuestion"].includes(doc.type as string)})
        }>
            {SITE_SUBJECT === SITE.CS && doc.id && <h3 className={"mb-3"}>Question {questionNumbers[doc.id]}</h3>}

            {/* TODO cloze drag and drop zones don't render if previewing a quiz */}
            <Suspense fallback={Loading}>
                <QuestionComponent questionId={doc.id as string} doc={doc} readonly={validated} {...{validationResponse}} />
            </Suspense>

            {/* CS Hints */}
            {SITE_SUBJECT === SITE.CS && <React.Fragment>
                <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />
            </React.Fragment>}

            {/* Validation Response */}
            {validated && <div className={`validation-response-panel p-2 mt-2 ${correct ? "correct" : ""}`}>
                <div className="pb-1">
                    <h1 className="m-0">{noAnswer ? "Not answered" : sigFigsError ? "Significant Figures" : correct ? "Correct!" : "Incorrect"}</h1>
                </div>
                {validationResponse && validationResponse.explanation && <div className="mb-1">
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
