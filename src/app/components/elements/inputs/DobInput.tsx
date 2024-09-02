import React from "react";
import * as RS from "reactstrap";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {isDefined, isDobOldEnoughForSite, siteSpecific} from "../../../services";
import {currentYear, DateInput} from "./DateInput";
import {Immutable} from "immer";
import range from "lodash/range";

interface DobInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    editingOtherUser?: boolean;
}
export const DobInput = ({userToUpdate, setUserToUpdate, submissionAttempted, editingOtherUser}: DobInputProps) => {
    return <RS.FormGroup className="form-group">
        <RS.Label className="fw-bold" htmlFor="dob-input">Date of birth</RS.Label>
        <DateInput
            invalid={isDefined(userToUpdate.dateOfBirth) && !isDobOldEnoughForSite(userToUpdate.dateOfBirth)}
            id="dob-input"
            name="date-of-birth"
            defaultValue={userToUpdate.dateOfBirth as unknown as string}
            // TODO: modify yearRange prop according to previously specified range
            yearRange={range(currentYear - siteSpecific(10, 13), 1899, -1)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate(Object.assign({}, userToUpdate, {dateOfBirth: event.target.valueAsDate}));
            }}
            disableDefaults
            aria-describedby="age-validation-message"
            labelSuffix=" of birth"
        />
        <RS.FormFeedback id="age-validation-message">
            {`${editingOtherUser ? "The user" : "You"} must be over ${siteSpecific("10", "13")} years old to create an account.`}
        </RS.FormFeedback>
    </RS.FormGroup>;
};
