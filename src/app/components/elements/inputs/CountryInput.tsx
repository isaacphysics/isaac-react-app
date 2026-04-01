import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import {FormGroup, Label} from "reactstrap";
import classNames from "classnames";
import React, {ChangeEvent} from "react";
import {useGetCountriesQuery, useGetPriorityCountriesQuery,} from "../../../state";
import {siteSpecific} from "../../../services";
import {StyledDropdown} from "./DropdownInput";

interface CountryInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    countryCodeValid: boolean;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
    textOverride?: string;
}

export const CountryInput = ({className, userToUpdate, setUserToUpdate, countryCodeValid, submissionAttempted, idPrefix="account", required, textOverride}: CountryInputProps) => {
    const {data: allCountryOptions} = useGetCountriesQuery();
    const {data: priorityCountryOptions} = useGetPriorityCountriesQuery();

    return <FormGroup className={className}>
        <Label htmlFor={`${idPrefix}-country-select`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>Country</Label>
        <p className="d-block input-description mb-2">
            {textOverride || siteSpecific("This helps us to measure our reach and impact.", "This helps us personalise the platform for you.")}
        </p>
        <StyledDropdown
            id={`${idPrefix}-country-select`}
            value={(userToUpdate && userToUpdate.countryCode) || undefined}
            defaultValue={"blank"}
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
            <option value={"blank"} /> {/* Empty option for spacing */}
            {allCountryOptions && Object.entries(allCountryOptions).map(
                ([countryCode, countryDisplayName]) => {
                    return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>;
                }
            )}
        </StyledDropdown>
    </FormGroup>;
};
