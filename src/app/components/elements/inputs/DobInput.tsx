import React from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {isDefined, isDobOldEnoughForSite, siteSpecific} from "../../../services";
import {currentYear, DateInput} from "./DateInput";
import {Immutable} from "immer";
import range from "lodash/range";
import { FormGroup, Label, FormFeedback } from "reactstrap";
import { useTranslation } from 'react-i18next'

interface DobInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    editingOtherUser?: boolean;
}
export const DobInput = ({userToUpdate, setUserToUpdate, submissionAttempted, editingOtherUser}: DobInputProps) => {
    const { t } = useTranslation()
    return <FormGroup className="form-group">
        <Label className="fw-bold" htmlFor="dob-input">{t('dateOfBirth', 'Date of birth')}</Label>
        <DateInput
            invalid={isDefined(userToUpdate.dateOfBirth) && !isDobOldEnoughForSite(userToUpdate.dateOfBirth)}
            id="dob-input"
            name="date-of-birth"
            defaultValue={userToUpdate.dateOfBirth as unknown as string}
            // TODO: modify yearRange prop according to previously specified range
            yearRange={range(currentYear - siteSpecific(10, 13), 1899, -1)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate(Object.assign({}, userToUpdate, {dateOfBirth: event.target.valueAsDate}));
            }}
            disableDefaults
            aria-describedby="age-validation-message"
            labelSuffix=" of birth"
        />
        <FormFeedback id="age-validation-message">
            {t('valMustBeOverVal2YearsOldToCreateAnAccount', '{{val}} must be over {{val2}} years old to create an account.', { val: editingOtherUser ? "The user" : "You", val2: siteSpecific("10", "13") })}
        </FormFeedback>
    </FormGroup>;
};
