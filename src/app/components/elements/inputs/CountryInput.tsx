import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {FormGroup, Label} from "reactstrap";
import classNames from "classnames";
import React, {ChangeEvent} from "react";
import {useGetCountriesQuery, useGetPriorityCountriesQuery,} from "../../../state";
import {isPhy} from "../../../services";
import {StyledDropdown} from "./DropdownInput";

interface CountryInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    countryCodeValid: boolean;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
    showBackfillNotice?: boolean; // warning text that we may have backfilled the country field from school/school email address
}

export const CountryInput = ({className, userToUpdate, setUserToUpdate, countryCodeValid, submissionAttempted, idPrefix="account", required, showBackfillNotice=true}: CountryInputProps) => {
    const {data: allCountryOptions} = useGetCountriesQuery();
    const {data: priorityCountryOptions} = useGetPriorityCountriesQuery();

    return <FormGroup className={className}>
        <Label htmlFor={`${idPrefix}-country-select`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>Country</Label>
        <p className="d-block input-description mb-2">
            {(isPhy && showBackfillNotice) ? "This helps us measure our reach and impact. If you did not select a country" +
                " when you registered, we may have suggested one from your school or school email address."
                : "This helps us personalise the platform for you."}
        </p>
        <StyledDropdown
            id={`${idPrefix}-country-select`}
            value={userToUpdate && userToUpdate.countryCode}
            invalid={submissionAttempted && required && !countryCodeValid}
            feedback="Please select your country."
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {countryCode: e.target.value} : {countryCode: null}))
            }
        >
            {priorityCountryOptions && Object.entries(priorityCountryOptions).map(
                ([countryCode, countryDisplayName]) => {
                    return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>;
                }
            )}
            <option /> {/* Empty option for spacing */}
            {allCountryOptions && Object.entries(allCountryOptions).map(
                ([countryCode, countryDisplayName]) => {
                    return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>;
                }
            )}
        </StyledDropdown>
    </FormGroup>;
};
