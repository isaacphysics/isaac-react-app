import {FormFeedback, Input, InputGroup, InputProps} from "reactstrap";
import React, {useState} from "react";

export const TogglablePasswordInput = (props: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return <InputGroup>
        <Input
            {...props}
            type={showPassword ? "text" : "password"}
        />
        <button type="button" className="inline-form-input-btn" onClick={() => {setShowPassword(!showPassword)}}>
            {showPassword ? "Hide" : "Show"}
        </button>
        <FormFeedback>
            Please enter a valid password.
        </FormFeedback>
    </InputGroup>
};