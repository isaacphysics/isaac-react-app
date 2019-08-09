import React from "react";
import * as RS from "reactstrap";
import {SubjectInterests} from "../../../IsaacAppTypes";
import {TrueFalseRadioInput} from "./TrueFalseRadioInput";

interface StudyingCsInputProps {
    subjectInterests: SubjectInterests;
    setSubjectInterests: (user: SubjectInterests) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const StudyingCsInput = ({subjectInterests, setSubjectInterests, submissionAttempted, idPrefix="account"}: StudyingCsInputProps) => {
    return <div className="d-flex justify-content-between">
        <RS.Label htmlFor={`${idPrefix}-subject-interest-t`} className="form-required pr-3">
            Are you studying or preparing for Computer Science A&nbsp;level?
        </RS.Label>
        <TrueFalseRadioInput
            id={`${idPrefix}-subject-interest`} submissionAttempted={submissionAttempted}
            stateObject={subjectInterests} propertyName="CS_ALEVEL" setStateFunction={setSubjectInterests}
        />
    </div>;
};
