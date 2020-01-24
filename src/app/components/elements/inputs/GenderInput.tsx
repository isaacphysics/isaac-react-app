import React, {ChangeEvent} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {Input} from "reactstrap";
import {validateUserGender} from "../../../services/validation";

interface GenderInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const GenderInput = ({userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account"}: GenderInputProps) => {
    return <RS.FormGroup className="my-1">
        <RS.Label htmlFor={`${idPrefix}-gender-select`} className="form-required">
            Gender
        </RS.Label>
        <Input
            type="select" name="select" id={`${idPrefix}-gender-select`}
            value={userToUpdate && userToUpdate.gender}
            invalid={submissionAttempted && !validateUserGender(userToUpdate)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, {gender: e.target.value}))
            }
        >
            <option value={undefined}></option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other gender identity</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </Input>
    </RS.FormGroup>
};
