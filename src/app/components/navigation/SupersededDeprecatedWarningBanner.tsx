import React from "react";
import * as RS from "reactstrap";
import {ContentDTO, IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {RenderNothing} from "../elements/RenderNothing";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {selectors} from "../../state/selectors";
import {isStudent, isTeacher} from "../../services/user";
import {goToSupersededByQuestion} from "../../state/actions";

export function SupersededDeprecatedWarningBanner({doc}: {doc: ContentDTO}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    const supersededBy = doc.type === "isaacQuestionPage" ? (doc as IsaacQuestionPageDTO).supersededBy : undefined;

    // If doc.deprecated or supersededBy is falsey, render nothing
    if (!doc.deprecated && !supersededBy) {
        return RenderNothing;
    }

    const contentType = doc.type === "isaacQuestionPage" ? "question" : "page";

    const teacherMessage = isTeacher(user) && <React.Fragment>
        <span id="superseded-help" className="icon-help" />
        <RS.UncontrolledTooltip placement="bottom" target="superseded-help">
            <div className="text-left">
                {supersededBy && <>
                    We periodically update questions into new formats.<br />
                    If this question appears on one of your gameboards, you may want to update the gameboard.<br />
                    You can find help for this at Help and support &gt; Teacher Support &gt; Assigning Work.<br /><br />
                    Students will not see this message, but will see a smaller note at the bottom of the page.{doc.deprecated && <br/>}
                </>}
                {doc.deprecated && <>
                    As this {contentType} is unsupported, we do not recommend using it with your students.
                </>}
            </div>
        </RS.UncontrolledTooltip>
    </React.Fragment>;

    // First check if question is deprecated, if so amalgamate deprecated and superseded messages
    return <RS.Alert color="warning">
        {isTeacher(user) && <strong>
            Teacher note: {" "}
        </strong>}
        {doc.deprecated ? <>
            This {contentType} is no longer supported, and may contain errors. {" "}
            {supersededBy && <>
                It has been replaced by {" "} <RS.Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                    this question
                </RS.Button>.
            </>} {teacherMessage}
        </> :
        // If question is superseded but not deprecated
        (supersededBy && !isStudent(user) ? <>
                This question has been replaced by {" "}
            <RS.Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                this question
            </RS.Button>. {teacherMessage}
        </> :
        // If neither deprecated or superseded, render nothing (although this should happen at the top of the component anyway)
        RenderNothing)}
    </RS.Alert>;
}
