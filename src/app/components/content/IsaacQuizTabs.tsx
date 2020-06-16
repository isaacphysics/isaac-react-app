import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {deregisterQuestion, registerQuestion} from "../../state/actions";
import * as ApiTypes from "../../../IsaacApiTypes";
import classnames from "classnames";
import {QUESTION_TYPES} from "../../services/questions";

export const IsaacQuizTabs = ({doc}: {doc: ApiTypes.IsaacQuestionBaseDTO}) => {
    const dispatch = useDispatch();

    useEffect((): (() => void) => {
        dispatch(registerQuestion(doc));
        return () => dispatch(deregisterQuestion(doc.id as string));
    }, [dispatch, doc.id]);

    const QuestionComponent = QUESTION_TYPES.get(doc.type || "default");

    return <React.Fragment>
        <div className={
            classnames({"question-component p-md-5": true, "parsons-layout": doc.type === 'isaacParsonsQuestion'})
        }>
            {/* @ts-ignore as TypeScript is struggling to infer common type for questions */}
            <QuestionComponent questionId={doc.id as string} doc={doc} />
        </div>
    </React.Fragment>;
};
