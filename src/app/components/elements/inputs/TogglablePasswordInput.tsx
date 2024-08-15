import {FormFeedback, Input, InputGroup, InputProps} from "reactstrap";
import React, {useState} from "react";

interface TogglablePasswordInputProps extends InputProps {
    feedbackText?: string;
}

export const TogglablePasswordInput = (props: TogglablePasswordInputProps) => {
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
            {props.feedbackText ?? "Please enter a valid password."}
        </FormFeedback>
    </InputGroup>
};
