import React, {ChangeEvent} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {isAda, validateUserGender} from "../../../services";
import classNames from "classnames";
import {Immutable} from "immer";
import {StyledDropdown} from "./DropdownInput";

interface GenderInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}
export const GenderInput = ({className, userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account", required}: GenderInputProps) => {
    return <RS.FormGroup className={className}>
        <RS.Label htmlFor={`${idPrefix}-gender-select`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>
            Gender
        </RS.Label>
        {isAda && <p className="d-block input-description mb-2">
            We conduct academic research, including&nbsp;
            <a href={"https://www.raspberrypi.org/blog/gender-balance-in-computing-big-picture/"} target={"_blank"}>
                research like this
            </a>
            &nbsp;on gender balance in computing. Answering this question helps inform our work.</p>}
        <StyledDropdown 
            id={`${idPrefix}-gender-select`}
            value={userToUpdate && userToUpdate.gender}
            invalid={submissionAttempted && required && !validateUserGender(userToUpdate)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, {gender: e.target.value}))
            }
        >
            <option value="UNKNOWN"></option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other gender identity</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </StyledDropdown>
    </RS.FormGroup>;
};
