import React, {useEffect} from "react";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {deregisterQuestion, registerQuestion} from "../redux/actions";
import {connect} from "react-redux";

const stateToProps = null;
const dispatchToProps = {registerQuestion, deregisterQuestion};

const IsaacQuestionTabsContainer = (props: any) => {
    const {doc: {id, type}, registerQuestion, deregisterQuestion} = props;

    useEffect((): any => {
        registerQuestion({id: id});
        return function cleanup(id: string) {
            deregisterQuestion(id);
        }
    }, [id]);

    // switch question answer area on type
    return (
        <div>
            <hr />
            // hints
            <IsaacMultiChoiceQuestion {...props}/>
            // incorrect OR correct panel
            // answer response
            // submission button
            <hr />
        </div>
    );
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsContainer);
