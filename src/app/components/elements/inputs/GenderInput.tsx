import React, {ChangeEvent} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {Input} from "reactstrap";

interface GenderInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
}
export const GenderInput = ({userToUpdate, setUserToUpdate, submissionAttempted}: GenderInputProps) => {

    return <RS.FormGroup>
        <RS.Label htmlFor="gender-select" className="form-required">
            Gender
        </RS.Label>
        <Input type="select" name="select" id="gender-select" value={userToUpdate && userToUpdate.gender}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, {gender: e.target.value}))
            }
        >
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other gender identity</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </Input>
    </RS.FormGroup>
};
