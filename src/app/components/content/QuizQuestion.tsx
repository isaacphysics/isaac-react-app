import React, {useContext, useEffect} from "react";
import {useDispatch} from "react-redux";
import classnames from "classnames";

import * as ApiTypes from "../../../IsaacApiTypes";
import {QUESTION_TYPES} from "../../services/questions";
import {submitQuizQuestionIfDirty} from "../../state/actions/quizzes";
import {isDefined} from "../../services/miscUtils";

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

    const QuestionComponent = QUESTION_TYPES.get(doc.type || "default");

    return <React.Fragment>
        <div className={
            classnames({"question-component p-md-5": true, "parsons-layout": doc.type === 'isaacParsonsQuestion'})
        }>
            {/* @ts-ignore as TypeScript is struggling to infer common type for questions */}
            <QuestionComponent questionId={doc.id as string} doc={doc}/>
        </div>
    </React.Fragment>;
}
