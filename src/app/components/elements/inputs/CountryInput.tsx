import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import classNames from "classnames";
import {FormFeedback, Input, Label} from "reactstrap";
import React, {ChangeEvent} from "react";
import {
    useGetCountriesQuery,
    useGetPriorityCountriesQuery,
} from "../../../state";
import {isNull} from "lodash";

interface CountryInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}

export const CountryInput = ({userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account", required}: CountryInputProps) => {
    const {data: allCountryOptions} = useGetCountriesQuery();
    const {data: priorityCountryOptions} = useGetPriorityCountriesQuery();

    return <RS.FormGroup className="my-1">
        <Label className={"font-weight-bold"}>Country</Label>
        <p className="d-block">This helps us personalise the platform for you.</p>
        <Input
            type="select" name="select" id={`${idPrefix}-country-select`}
            value={userToUpdate && userToUpdate.countryCode}
            invalid={submissionAttempted && required && userToUpdate.countryCode == null}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {countryCode: e.target.value} : {countryCode: null}))
            }
        >
            {priorityCountryOptions && Object.entries(priorityCountryOptions).map(
                ([countryCode, countryDisplayName]) => {
                    return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>
                }
            )}
            <option /> {/* Empty option for spacing */}
            {allCountryOptions && Object.entries(allCountryOptions).map(
                ([countryCode, countryDisplayName]) => {
                    return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>
                }
            )}
        </Input>
        <FormFeedback>
            Please select a country.
        </FormFeedback>
    </RS.FormGroup>
};