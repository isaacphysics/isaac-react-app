import React, {ChangeEvent} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {Input} from "reactstrap";
import {validateUserGender} from "../../../services";
import classNames from "classnames";
import {Immutable} from "immer";

interface GenderInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}
export const GenderInput = ({userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account", required}: GenderInputProps) => {
    return <RS.FormGroup className="my-1">
        <RS.Label htmlFor={`${idPrefix}-gender-select`} className={classNames({"form-optional": !required}, "font-weight-bold")}>
            Gender
        </RS.Label>
        <p className="d-block">We conduct academic research, including research like this on gender balance in computing. Answering this question helps inform our work.</p>
        <Input
            type="select" name="select" id={`${idPrefix}-gender-select`}
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
        </Input>
    </RS.FormGroup>
};
