import React from "react";
import * as RS from "reactstrap";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {isDefined, isDobOldEnoughForSite, isDobOverTen, isDobOverThirteen, siteSpecific} from "../../../services";
import {DateInput} from "./DateInput";

interface DobInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
    editingOtherUser?: boolean;
}
export const DobInput = ({userToUpdate, setUserToUpdate, submissionAttempted, editingOtherUser}: DobInputProps) => {
    return <RS.FormGroup>
        <RS.Label htmlFor="dob-input">Date of birth</RS.Label>
        <DateInput
            invalid={isDefined(userToUpdate.dateOfBirth) && !isDobOldEnoughForSite(userToUpdate.dateOfBirth)}
            id="dob-input"
            name="date-of-birth"
            defaultValue={userToUpdate.dateOfBirth as unknown as string}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate(Object.assign({}, userToUpdate, {dateOfBirth: event.target.valueAsDate}))
            }}
            disableDefaults
            aria-describedby="age-validation-message"
            labelSuffix=" of birth"
        />
        <RS.FormFeedback id="age-validation-message">
            {`${editingOtherUser ? "The user" : "You"} must be over ${siteSpecific("10", "13")} years old to create an account.`}
        </RS.FormFeedback>
    </RS.FormGroup>
};
