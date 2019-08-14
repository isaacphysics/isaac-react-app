import React from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";

interface GenderInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
}
export const GenderInput = ({userToUpdate, setUserToUpdate, submissionAttempted}: GenderInputProps) => {
    return <RS.FormGroup>
        <fieldset>
            <legend className="form-required">Gender</legend>
            <RS.Row>
                <RS.Col size={6} lg={4}>
                    <RS.CustomInput
                        id="gender-female" type="radio" name="gender" label="Female"
                        defaultChecked={userToUpdate.gender === 'FEMALE'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUserToUpdate(Object.assign({}, userToUpdate, {gender: 'FEMALE'}))
                        }} />
                </RS.Col>
                <RS.Col size={6} lg={4}>
                    <RS.CustomInput
                        id="gender-male" type="radio" name="gender" label="Male"
                        defaultChecked={userToUpdate.gender === 'MALE'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUserToUpdate(Object.assign({}, userToUpdate, {gender: 'MALE'}))
                        }} />
                </RS.Col>
                <RS.Col size={6} lg={4}>
                    <RS.CustomInput
                        id="gender-other" type="radio" name="gender" label="Other"
                        defaultChecked={userToUpdate.gender === 'OTHER'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUserToUpdate(Object.assign({}, userToUpdate, {gender: 'OTHER'}));
                        }} />
                </RS.Col>
            </RS.Row>
        </fieldset>
    </RS.FormGroup>

};
