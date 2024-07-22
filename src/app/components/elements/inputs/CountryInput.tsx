import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {FormFeedback, Label} from "reactstrap";
import classNames from "classnames";
import React, {ChangeEvent} from "react";
import {useGetCountriesQuery, useGetPriorityCountriesQuery,} from "../../../state";
import {isAda} from "../../../services";
import {StyledDropdown} from "./DropdownInput";

interface CountryInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    countryCodeValid: boolean;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}

export const CountryInput = ({className, userToUpdate, setUserToUpdate, countryCodeValid, submissionAttempted, idPrefix="account", required}: CountryInputProps) => {
    const {data: allCountryOptions} = useGetCountriesQuery();
    const {data: priorityCountryOptions} = useGetPriorityCountriesQuery();

    return <RS.FormGroup className={className}>
        <Label htmlFor={`${idPrefix}-country-select`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>Country</Label>
        {isAda && <p className="d-block input-description mb-2">This helps us personalise the platform for you.</p>}
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
    </RS.FormGroup>;
};