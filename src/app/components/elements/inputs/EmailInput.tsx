import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import {isAda} from "../../../services";
import { useTranslation } from "react-i18next";

interface EmailInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    emailIsValid: boolean;
    required: boolean;
}

export const EmailInput = ({className, userToUpdate, setUserToUpdate, emailIsValid, submissionAttempted, required}: EmailInputProps) => {
    const { t } = useTranslation();
    return <FormGroup className={`form-group ${className}`}>
        <Label className={classNames("fw-bold", (required ? "form-required" : "form-optional"))} htmlFor="email-input">
            {t("common:auth.emailInput.label")}
        </Label>
        {isAda &&
                <p className="d-block input-description">
                    {(userToUpdate.role !== "STUDENT") && (userToUpdate.role !== "TUTOR") ?
                        t("ada:auth.emailInput.teacherHint")
                        :
                        t("ada:auth.emailInput.studentHint")
                    }
                </p>
        }
        <Input
            id="email-input"
            type="text"
            name="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {email: e.target.value} : {email: null}))
            }
            invalid={submissionAttempted && !emailIsValid}
            defaultValue={userToUpdate.email}
            aria-describedby="emailValidationMessage"
        />
        <FormFeedback id="emailValidationMessage">
            {t("common:auth.emailInput.validationError")}
        </FormFeedback>
    </FormGroup>;
};
