import React from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {isDefined, isDobOldEnoughForSite, siteSpecific} from "../../../services";
import {currentYear, DateInput} from "./DateInput";
import {Immutable} from "immer";
import range from "lodash/range";
import { FormGroup, Label, FormFeedback } from "reactstrap";

interface DobInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    editingOtherUser?: boolean;
}
export const DobInput = ({userToUpdate, setUserToUpdate, submissionAttempted, editingOtherUser}: DobInputProps) => {
    return <FormGroup className="form-group">
        <Label className="fw-bold" htmlFor="dob-input">Date of birth</Label>
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
        <FormFeedback id="age-validation-message">
            {`${editingOtherUser ? "The user" : "You"} must be over ${siteSpecific("10", "13")} years old to create an account.`}
        </FormFeedback>
    </FormGroup>;
};
