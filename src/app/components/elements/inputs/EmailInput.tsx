import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import {isAda} from "../../../services";
import { useTranslation } from 'react-i18next'

interface EmailInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    emailIsValid: boolean;
    required: boolean;
}

export const EmailInput = ({className, userToUpdate, setUserToUpdate, emailIsValid, submissionAttempted, required}: EmailInputProps) => {
    const { t } = useTranslation()
    return <FormGroup className={`form-group ${className}`}>
        <Label className={classNames("fw-bold", (required ? "form-required" : "form-optional"))} htmlFor="email-input">
            {t('emailAddress', 'Email address')}
        </Label>
        {isAda &&
                <p className="d-block input-description">
                    {(userToUpdate.role !== "STUDENT") && (userToUpdate.role !== "TUTOR") ?
                        t('thisWillBeVisibleToYourStudentsWeRecommendUsingYourSchoolEmailAddress', 'This will be visible to your students. We recommend using your school email address.')
                        :
                        t('thisWillBeTheEmailAddressYouUseToLogIn', 'This will be the email address you use to log in.')
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
            {t('pleaseEnterAValidEmailAddress2', 'Please enter a valid email address.')}
        </FormFeedback>
    </FormGroup>;
};
