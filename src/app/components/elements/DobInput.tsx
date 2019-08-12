import React from "react";
import * as RS from "reactstrap";
import {ValidationUser} from "../../../IsaacAppTypes";
import {isDobOverThirteen} from "../../services/validation";
import {DateInput} from "./DateInput";

interface DobInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
}
export const DobInput = ({userToUpdate, setUserToUpdate, submissionAttempted}: DobInputProps) => {
    return <RS.FormGroup>
        <RS.Label htmlFor="dob-input">Date of Birth</RS.Label>
        <DateInput
            invalid={(!isDobOverThirteen(userToUpdate.dateOfBirth) && !!userToUpdate.dateOfBirth) || undefined}
            id="dob-input"
            name="date-of-birth"
            defaultValue={userToUpdate.dateOfBirth as unknown as string}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate(Object.assign({}, userToUpdate, {dateOfBirth: event.target.valueAsDate}))
            }}
            aria-describedby="age-validation-message"
            labelSuffix=" of birth"
        />
        <RS.FormFeedback id="age-validation-message">
            You must be over 13 years old
        </RS.FormFeedback>
    </RS.FormGroup>
};
