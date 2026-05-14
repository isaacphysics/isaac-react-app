import React, {ChangeEvent} from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {siteSpecific, validateUserGender} from "../../../services";
import classNames from "classnames";
import {Immutable} from "immer";
import {StyledDropdown} from "./DropdownInput";
import { FormGroup, Label } from "reactstrap";
import { useTranslation } from 'react-i18next'

interface GenderInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}
export const GenderInput = ({className, userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account", required}: GenderInputProps) => {
    const { t } = useTranslation()
    return <FormGroup className={className}>
        <Label htmlFor={`${idPrefix}-gender-select`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>
            {t('gender', 'Gender')}
        </Label>
        <p className="d-block input-description mb-2">
            {t('weConductAcademicResearchIncluding', 'We conduct academic research, including')}{" "}
            {siteSpecific(
                <>{t('researchOnGenderBalanceInStem', 'research on gender balance in STEM')}</>,
                <>
                    <a href={"https://www.raspberrypi.org/blog/gender-balance-in-computing-big-picture/"} target={"_blank"}>{t('researchLikeThis', 'research like this')}</a>{" "}
                    {t('onGenderBalanceInComputing', 'on gender balance in computing')}
                </>
            )}
            {t('answeringThisQuestionHelpsInformOurWork', '. Answering this question helps inform our work.')}
        </p>
        <StyledDropdown 
            id={`${idPrefix}-gender-select`}
            value={userToUpdate && userToUpdate.gender || "UNKNOWN"}
            invalid={submissionAttempted && required && !validateUserGender(userToUpdate)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, {gender: e.target.value}))
            }
        >
            <option value="UNKNOWN" disabled hidden></option>
            <option value="FEMALE">{t('female3', 'Female')}</option>
            <option value="MALE">{t('male2', 'Male')}</option>
            <option value="OTHER">{t('otherGenderIdentity', 'Other gender identity')}</option>
            <option value="PREFER_NOT_TO_SAY">{t('preferNotToSay2', 'Prefer not to say')}</option>
        </StyledDropdown>
    </FormGroup>;
};
