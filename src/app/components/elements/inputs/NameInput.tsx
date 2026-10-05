import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React, {ChangeEvent} from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface NameInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    nameValid: boolean;
    submissionAttempted: boolean;
    required: boolean;
}

export const FamilyNameInput = ({className, userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    const { t } = useTranslation();
    return <FormGroup className={`form-group ${className}`}>
        <Label htmlFor="family-name-input" className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>{t("common:form.lastNameLabel")}</Label>
        <Input
            id="family-name-input"
            type="text"
            name="last-name"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {familyName: e.target.value} : {familyName: null}))
            }
            invalid={submissionAttempted && !nameValid}
            defaultValue={userToUpdate.familyName}
            aria-describedby="familyNameValidationMessage"
        />
        <FormFeedback id="familyNameValidationMessage">
            {t("common:account.nameInput.invalidNameMessage")}
        </FormFeedback>
    </FormGroup>;
};

export const GivenNameInput = ({className, userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    const { t } = useTranslation();
    return <FormGroup className={`form-group ${className}`}>
        <Label className={classNames("fw-bold", (required ? "form-required" : "form-optional"))} htmlFor="given-name-input">
            {t("common:form.firstNameLabel")}
        </Label>
        <Input
            id="given-name-input"
            name="givenName"
            type="text"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {givenName: e.target.value} : {givenName: null}))
            }
            invalid={submissionAttempted && !nameValid}
            defaultValue={userToUpdate.givenName}
            aria-describedby="givenNameValidationMessage"
        />
        <FormFeedback id="givenNameValidationMessage">
            {t("common:account.nameInput.invalidNameMessage")}
        </FormFeedback>
    </FormGroup>;
};
