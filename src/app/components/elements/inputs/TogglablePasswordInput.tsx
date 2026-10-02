import {FormFeedback, Input, InputGroup, InputProps} from "reactstrap";
import React, {useState} from "react";
import { useTranslation } from "react-i18next";

interface TogglablePasswordInputProps extends InputProps {
    feedbackText?: string;
}

export const TogglablePasswordInput = (props: TogglablePasswordInputProps) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const {feedbackText, ...rest} = props;

    return <InputGroup>
        <Input
            {...rest}
            type={showPassword ? "text" : "password"}
        />
        <button type="button" tabIndex={-1} className="inline-form-input-btn" onClick={() => {setShowPassword(!showPassword);}}>
            {showPassword ? t("common:auth.passwordInput.hideButton") : t("common:auth.passwordInput.showButton")}
        </button>
        <FormFeedback>
            {feedbackText ?? t("common:auth.passwordInput.invalidFeedback")}
        </FormFeedback>
    </InputGroup>;
};
