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
    const [countryOptions, setCountryOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        async function fetchCountryOptions() {
            const data = await api.countries.getCountries();
            setCountryOptions(data.data);
        }

        fetchCountryOptions()
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
            <option />
            {
                Object.entries(countryOptions).map(
                    ([countryCode, countryDisplayName]) => {
                        return <option key={countryCode} value={countryCode}>{countryDisplayName}</option>
                    }
                )
            }
        </Input>
    </RS.FormGroup>
};