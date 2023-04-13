import React, {useEffect, useState} from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {api, schoolNameWithPostcode, validateUserSchool} from "../../../services";
import throttle from "lodash/throttle";
import classNames from "classnames";
import {Immutable} from "immer";

interface SchoolInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate?: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    className?: string;
    idPrefix?: string;
    disableInput?: boolean;
    required: boolean;
}
const NOT_APPLICABLE = "N/A";

const schoolSearch = (schoolSearchText: string, setAsyncSelectOptionsCallback: (options: {value: string | School, label: string | undefined}[]) => void) => {
    api.schools.search(schoolSearchText).then(({data}) => {
        setAsyncSelectOptionsCallback(data && data.length > 0 ? data.map((item) => ({value: item, label: schoolNameWithPostcode(item)})) : []);
    }).catch((response) => {
        console.error("Error searching for schools. ", response);
    });
};
// Must define this debounced function _outside_ the component to ensure it doesn't get overwritten each rerender!
const throttledSchoolSearch = throttle(schoolSearch, 450, {trailing: true, leading: true});

export const SchoolInput = ({userToUpdate, setUserToUpdate, submissionAttempted, className, idPrefix="school", disableInput, required}: SchoolInputProps) => {
    let [selectedSchoolObject, setSelectedSchoolObject] = useState<School | null>();

    // Get school associated with urn
    function fetchSchool(urn: string) {
        if (urn != "") {
            api.schools.getByUrn(urn).then(({data}) => {
                setSelectedSchoolObject(data[0]);
            });
        } else {
            setSelectedSchoolObject(null);
        }
    }

    useEffect(() => {
        fetchSchool(userToUpdate.schoolId || "");
    }, [userToUpdate]);

    // Set schoolId or schoolOther
    function setUserSchool(school: any) {
        const {schoolId, schoolOther, ...userWithoutSchoolInfo} = userToUpdate;
        if (school.urn) {
            setUserToUpdate?.({...userWithoutSchoolInfo, schoolId: school.urn});
            setSelectedSchoolObject(school);
        } else if (school) {
            setUserToUpdate?.({...userWithoutSchoolInfo, schoolOther: school});
            setSelectedSchoolObject(school);
        }
    }

    // Called when school input box option selected
    function handleSetSchool(newValue: {value: string | School} | null) {
        const {schoolId, schoolOther, ...userWithoutSchoolInfo} = userToUpdate;
        if (newValue == null) {
            setSelectedSchoolObject(undefined);
            setUserToUpdate?.(userWithoutSchoolInfo);
        } else if (newValue && newValue.value) {
            setUserSchool(newValue.value);
        } else if (newValue) {
            setUserSchool(newValue);
        }
    }

    const schoolValue: {value: string | School, label: string | undefined} | undefined = (
        (selectedSchoolObject && selectedSchoolObject.urn ?
            {value: selectedSchoolObject.urn, label: schoolNameWithPostcode(selectedSchoolObject)} :
            (userToUpdate.schoolOther ?
                {value: "manually entered school", label: userToUpdate.schoolOther} :
                undefined))
    );

    let randomNumber = Math.random();

    const isInvalid = submissionAttempted && required && !validateUserSchool(userToUpdate);
    return <RS.FormGroup className={`school ${className}`}>
        <RS.Label htmlFor={`school-input-${randomNumber}`} className={classNames({"form-required": required})}>School</RS.Label>
        {userToUpdate.schoolOther !== NOT_APPLICABLE && <React.Fragment>
            <AsyncCreatableSelect
                isClearable
                isDisabled={disableInput}
                inputId={`school-input-${randomNumber}`}
                placeholder={"Type your school name"}
                value={schoolValue}
                className={(isInvalid ? "react-select-error " : "") + "basic-multi-select"}
                classNamePrefix="select"
                onChange={handleSetSchool}
                loadOptions={throttledSchoolSearch}
                filterOption={() => true}
                formatCreateLabel={(input) => <span>Use &quot;{input}&quot; as your school name</span>}
            />
        </React.Fragment>}

        {((userToUpdate.schoolOther == undefined && !(selectedSchoolObject && selectedSchoolObject.name)) || userToUpdate.schoolOther == NOT_APPLICABLE) && <div className="d-flex mt-2">
            <RS.CustomInput
                type="checkbox" id={`${idPrefix}-not-associated-with-school`}
                checked={userToUpdate.schoolOther === NOT_APPLICABLE}
                invalid={isInvalid}
                disabled={disableInput || !setUserToUpdate}
                onChange={(e => {
                    const {schoolId, schoolOther, ...userWithoutSchoolInfo} = userToUpdate;
                    if (e.target.checked) {
                        setUserToUpdate?.({...userWithoutSchoolInfo, schoolOther: NOT_APPLICABLE});
                    } else {
                        setUserToUpdate?.(userWithoutSchoolInfo);
                    }
                })}
                label="Not associated with a school"
            />
        </div>}

        <div className="invalid-school">
            {submissionAttempted && required && !validateUserSchool(userToUpdate) ? "Please specify your school association" : null}
        </div>
    </RS.FormGroup>
};
