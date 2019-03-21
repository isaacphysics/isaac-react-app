import React from "react";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";

export const IsaacQuestionTabs = (props: any) => {
    const {doc: {type}} = props;
    // register question
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
