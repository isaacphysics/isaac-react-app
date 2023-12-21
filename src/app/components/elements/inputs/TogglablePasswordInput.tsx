import {FormFeedback, Input, InputGroup, InputGroupAddon, InputProps} from "reactstrap";
import React, {useState} from "react";

export const TogglablePasswordInput = (props: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return <InputGroup>
        <Input
            {...props}
            type={showPassword ? "text" : "password"}
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
};