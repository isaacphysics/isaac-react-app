import {Form, FormFeedback, FormGroup, Input, InputGroup, InputGroupAddon, Label} from "reactstrap";
import React, {useState} from "react";
import {passwordDebounce} from "../../../services";
import {Immutable} from "immer";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";

interface TogglablePasswordInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    passwordValid: boolean;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}

export const TogglablePasswordInput = ({userToUpdate, setUserToUpdate, submissionAttempted, passwordValid, required, idPrefix="account"}: TogglablePasswordInputProps) => {

    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    return <FormGroup>
        <Label className={"font-weight-bold"}>Password</Label>
        <p className="d-block">Your password must be at least 8 characters.</p>
        <InputGroup>
            <Input
                value={userToUpdate.password ? userToUpdate.password : undefined}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {password: e.target.value} : {password: null}))
                    passwordDebounce(e.target.value, setPasswordFeedback);
                }}
                type={showPassword ? "text" : "password"}
                invalid={required && submissionAttempted && !passwordValid}
            />
            <InputGroupAddon addonType="append">
                <button type="button" className="inline-form-input-btn" onClick={() => {setShowPassword(!showPassword)}}>
                    {showPassword ? "Hide" : "Show"}
                </button>
            </InputGroupAddon>
            <FormFeedback>
                Please enter a valid password.
            </FormFeedback>
        </InputGroup>
        {passwordFeedback &&
            <span className='float-right small mt-1'>
                <strong>Password strength: </strong>
                <span id="password-strength-feedback">
                    {passwordFeedback.feedbackText}
                </span>
            </span>
        }
    </FormGroup>
}
