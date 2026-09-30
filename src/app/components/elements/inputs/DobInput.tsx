import React from "react";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {ADULT_AGE_LIMIT, isAda, isDefined, isDobAdult, isDobOldEnoughForSite, isDobOldEnoughForSiteWithoutParentalConsent, isPhy, isTutorOrAbove, SITE_LOWER_AGE_LIMIT, SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT, UserFacingRoleWithArticle} from "../../../services";
import {currentYear, DateInput} from "./DateInput";
import {Immutable} from "immer";
import range from "lodash/range";
import { FormGroup, Label, FormFeedback } from "reactstrap";

interface DobInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    editingOtherUser?: boolean;
    requireOver13?: boolean;
}
export const DobInput = ({userToUpdate, setUserToUpdate, submissionAttempted, editingOtherUser, requireOver13}: DobInputProps) => {
    const requireAdultDob = isTutorOrAbove({ role: userToUpdate.role });
    const lowerAgeLimit = requireAdultDob ? ADULT_AGE_LIMIT
        : requireOver13 ? SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT
            : SITE_LOWER_AGE_LIMIT;
    const mostRecentYearToShow = currentYear - lowerAgeLimit;
    const isInvalid = submissionAttempted && !(isPhy && !isDefined(userToUpdate.dateOfBirth)) && (
        !isDobOldEnoughForSite(userToUpdate.dateOfBirth) || (isAda && !isDefined(userToUpdate.dateOfBirth)) ||
        (requireAdultDob && !isDobAdult(userToUpdate.dateOfBirth)) || (requireOver13 && !isDobOldEnoughForSiteWithoutParentalConsent(userToUpdate.dateOfBirth))
    );

    return <FormGroup className="form-group">
        <Label className="fw-bold" htmlFor="dob-input">Date of birth</Label>
        {isAda && !requireAdultDob && <p className="d-block input-description mb-2">
            {"We ask for your month and year of birth so we can give you the right experience for your age." +
                " Some features work differently for younger users."}
        </p>}
        <DateInput
            invalid={isInvalid}
            id="dob-input"
            name="date-of-birth"
            defaultValue={userToUpdate.dateOfBirth as unknown as string}
            // TODO: modify yearRange prop according to previously specified range
            yearRange={range(mostRecentYearToShow, 1899, -1)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate(Object.assign({}, userToUpdate, {dateOfBirth: event.target.valueAsDate}));
            }}
            disableDefaults
            aria-describedby="age-validation-message"
            labelSuffix=" of birth"
            hideDay={isAda}
        />
        <FormFeedback id="age-validation-message">
            {isDefined(userToUpdate.dateOfBirth)
                ? `${editingOtherUser ? "The user" : "You"} must be over ${lowerAgeLimit} years old to have
                ${userToUpdate.role ? UserFacingRoleWithArticle[userToUpdate.role] : "an"} account${requireOver13 ? " with an email address and password" : ""}.`
                : "Please enter a valid date of birth."
            }
        </FormFeedback>
    </FormGroup>;
};
