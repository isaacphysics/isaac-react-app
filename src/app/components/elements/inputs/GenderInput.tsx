import React, {ChangeEvent} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {siteSpecific, validateUserGender} from "../../../services";
import classNames from "classnames";
import {Immutable} from "immer";
import {StyledDropdown} from "./DropdownInput";
import { FormGroup, Label } from "reactstrap";

interface GenderInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}
export const GenderInput = ({className, userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account", required}: GenderInputProps) => {
    return <FormGroup className={className}>
        <Label htmlFor={`${idPrefix}-gender-select`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>
            Gender
        </Label>
        <p className="d-block input-description mb-2">
            We conduct academic research, including
            {siteSpecific(
                <>{" "}research on gender balance in STEM</>,
                <>
                    &nbsp;
                    <a href={"https://www.raspberrypi.org/blog/gender-balance-in-computing-big-picture/"} target={"_blank"}>research like this</a>&nbsp;
                    on gender balance in computing
                </>
            )}
            . Answering this question helps inform our work.
        </p>
        <StyledDropdown 
            id={`${idPrefix}-gender-select`}
            value={userToUpdate && userToUpdate.gender || "UNKNOWN"}
            invalid={submissionAttempted && required && !validateUserGender(userToUpdate)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, {gender: e.target.value}))
            }
        >
            <option value="UNKNOWN" disabled hidden></option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other gender identity</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </StyledDropdown>
    </FormGroup>;
};
