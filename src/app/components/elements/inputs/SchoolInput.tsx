import React, {useEffect, useState} from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {api} from "../../../services/api";
import {validateUserSchool} from "../../../services/validation";
import {schoolNameWithPostcode} from "../../../services/user";
import {throttle} from "lodash";
import classNames from "classnames";

interface SchoolInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate?: (user: any) => void;
    submissionAttempted: boolean;
    className?: string;
    idPrefix?: string;
    disableInput?: boolean;
    required: boolean;
}
const NOT_APPLICABLE = "N/A";


const getSchoolPromise = (schoolSearchText: string) =>
    new Promise(resolve => {
        resolve(api.schools.search(schoolSearchText).then(({data}) => {
            let temp: any = [];
            data && data.length > 0 && data.map((item) => (temp.push({value: item, label: schoolNameWithPostcode(item)})));
            return temp;
        }).catch((response) => {
            console.error("Error searching for schools. ", response);
        }));
    });
// Must define this throttle function _outside_ the component to ensure it doesn't get overwritten each rerender!
const throttledSchoolSearch = throttle(getSchoolPromise, 450);

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
        if (setUserToUpdate) {
            if (school.urn) {
                setUserToUpdate(Object.assign({}, userToUpdate, {schoolId: school.urn, schoolOther: undefined}));
                setSelectedSchoolObject(school);
            } else if (school) {
                setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: school, schoolId: undefined}));
                setSelectedSchoolObject(school);
            }
        }
    }

    // Called when school input box option selected
    function handleSetSchool(newValue: any) {
        if (newValue == null) {
            setSelectedSchoolObject(undefined);
            userToUpdate.schoolOther = undefined;
        } else if (newValue && newValue.value) {
            setUserSchool(newValue.value);
        } else if (newValue) {
            setUserSchool(newValue);
        }
    }

    const schoolValue = (
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
                disabled={!setUserToUpdate}
                onChange={(e => {
                    if (setUserToUpdate) {
                        setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: e.target.checked ? NOT_APPLICABLE : undefined, schoolId: e.target.checked && undefined}));
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
