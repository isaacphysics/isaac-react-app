import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import * as RS from "reactstrap";
import classNames from "classnames";
import {Input} from "reactstrap";
import {api} from "../../../services";
import React, {ChangeEvent, useEffect, useState} from "react";

interface CountryInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}

export const CountryInput = ({userToUpdate, setUserToUpdate, submissionAttempted, idPrefix="account", required}: CountryInputProps) => {
    const [allCountryOptions, setAllCountryOptions] = useState<Record<string, string>>({});
    const [priorityCountryOptions, setPriorityCountryOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        async function fetchAllCountryOptions() {
            const data = await api.countries.getCountries();
            setAllCountryOptions(data.data);
        }

        async function fetchPriorityCountryOptions() {
            const data = await api.countries.getPriorityCountries();
            setPriorityCountryOptions(data.data);
        }

        fetchAllCountryOptions()
        fetchPriorityCountryOptions()
    }, [])

    return <RS.FormGroup className="my-1">
        <RS.Label htmlFor={`${idPrefix}-country-select`} className={classNames({"form-required": required})}>
            Country
        </RS.Label>
        <Input
            type="select" name="select" id={`${idPrefix}-country-select`}
            value={userToUpdate && userToUpdate.countryCode}
            invalid={submissionAttempted && required}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {countryCode: e.target.value} : {countryCode: null}))
            }
        >
            {
                Object.entries(priorityCountryOptions).map(
                    ([countryCode, countryDisplayName]) => {
                        return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>
                    }
                )
            }
            <option />
            {
                Object.entries(allCountryOptions).map(
                    ([countryCode, countryDisplayName]) => {
                        return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>
                    }
                )
            }
        </Input>
    </RS.FormGroup>
};