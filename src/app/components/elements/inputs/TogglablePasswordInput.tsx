import {FormFeedback, Input, InputGroup, InputProps} from "reactstrap";
import React, {useState} from "react";
import { useTranslation } from 'react-i18next'

interface TogglablePasswordInputProps extends InputProps {
    feedbackText?: string;
}

export const TogglablePasswordInput = (props: TogglablePasswordInputProps) => {
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false);

    const {feedbackText, ...rest} = props;

    return <InputGroup>
        <Input
            {...rest}
            type={showPassword ? "text" : "password"}
        />
        <button type="button" tabIndex={-1} className="inline-form-input-btn" onClick={() => {setShowPassword(!showPassword);}}>
            {showPassword ? "Hide" : "Show"}
        </button>
        <FormFeedback>
            {feedbackText ?? t('pleaseEnterAValidPassword', 'Please enter a valid password.')}
        </FormFeedback>
    </InputGroup>;
};
