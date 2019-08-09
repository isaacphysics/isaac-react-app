import React from "react";
import * as RS from "reactstrap";
import {SubjectInterest} from "../../../IsaacAppTypes";
import {TrueFalseRadioInput} from "./TrueFalseRadioInput";

interface StudyingCsInputProps {
    subjectInterest: SubjectInterest;
    setSubjectInterest: (user: SubjectInterest) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const StudyingCsInput = ({subjectInterest, setSubjectInterest, submissionAttempted, idPrefix="account"}: StudyingCsInputProps) => {
    return <div className="d-flex">
        <RS.Label htmlFor={`${idPrefix}-subject-interest-t`} className="form-required">
            Are you studying or preparing for Computer Science A level?
        </RS.Label>
        <TrueFalseRadioInput
            id={`${idPrefix}-subject-interest`} submissionAttempted={submissionAttempted}
            stateObject={subjectInterest} propertyName="CS_ALEVEL" setStateFunction={setSubjectInterest}
        />
    </div>;
};
