import React, {useEffect, useState} from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {api} from "../../../services/api";
import {validateUserSchool} from "../../../services/validation";
import {throttle} from "lodash";

interface SchoolInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate?: (user: any) => void;
    submissionAttempted: boolean;
    className?: string;
    idPrefix?: string;
    disableInput?: boolean;
}
const NOT_APPLICABLE = "N/A";


const getSchoolPromise = (schoolSearchText: string) =>
    new Promise(resolve => {
        resolve(api.schools.search(schoolSearchText).then(({data}) => {
            let temp: any = [];
            data && data.length > 0 && data.map((item: any) => (temp.push({value: item, label: item.name + ", " + item.postcode})));
            return temp;
        }).catch((response) => {
            console.error("Error searching for schools. ", response);
        }));
    });
// Must define this throttle function _outside_ the component to ensure it doesn't get overwritten each rerender!
const throttledSchoolSearch = throttle(getSchoolPromise, 450);

export const SchoolInput = ({userToUpdate, setUserToUpdate, submissionAttempted, className, idPrefix="school", disableInput}: SchoolInputProps) => {
    let [schoolQueryText, setSchoolQueryText] = useState<string | null>(null);
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

    // Called as user types
    function renderInput(queryValue: any) {
        setSchoolQueryText(queryValue);
    }

    // Set schoolId or schoolOther
    function setUserSchool(school: any) {
        if (setUserToUpdate) {
            if (school.urn) {
                setUserToUpdate(Object.assign({}, userToUpdate, {schoolId: school.urn, schoolOther: undefined}));
                setSchoolQueryText(null);
                setSelectedSchoolObject(school);
            } else if (school) {
                setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: school, schoolId: undefined}));
                setSchoolQueryText(null);
                setSelectedSchoolObject(school);
            }
        }
    }

    // Called when school input box option selected
    function handleSetSchool(newValue: any) {
        if (newValue == null) {
            setSchoolQueryText(null);
            setSelectedSchoolObject(undefined);
            userToUpdate.schoolOther = undefined;
        } else if (newValue && newValue.value) {
            setUserSchool(newValue.value);
        } else if (newValue) {
            setUserSchool(newValue);
        }
    }

    const schoolValue = (
        schoolQueryText ?
            schoolQueryText :
            (selectedSchoolObject && selectedSchoolObject.urn ?
                {value: selectedSchoolObject.urn, label: selectedSchoolObject.name + ", " + selectedSchoolObject.postcode} :
                (userToUpdate.schoolOther ?
                    {value: "manually entered school", label: userToUpdate.schoolOther} :
                    undefined))
    );

    let randomNumber = Math.random();

    return <RS.FormGroup className={`school ${className}`}>
        <RS.Label htmlFor={`school-input-${randomNumber}`} className="form-required">School</RS.Label>
        {userToUpdate.schoolOther !== NOT_APPLICABLE && <React.Fragment>
            <AsyncCreatableSelect
                isClearable
                isDisabled={disableInput}
                inputId={`school-input-${randomNumber}`}
                placeholder={"Type your school name"}
                value={schoolValue}
                className={(submissionAttempted && !validateUserSchool(userToUpdate) ? "error " : "") + "basic-multi-select"}
                classNamePrefix="select"
                onInputChange={renderInput}
                onChange={handleSetSchool}
                loadOptions={throttledSchoolSearch}
                filterOption={() => true}
                formatCreateLabel={(input) => <span>Use &quot;{input}&quot; as your school name</span>}
                autoComplete="new-password"
            />
        </React.Fragment>}

        {((userToUpdate.schoolOther == undefined && !(selectedSchoolObject && selectedSchoolObject.name)) || userToUpdate.schoolOther == NOT_APPLICABLE) && <div className="d-flex">
            <RS.CustomInput
                type="checkbox" id={`${idPrefix}-not-associated-with-school`}
                checked={userToUpdate.schoolOther === NOT_APPLICABLE}
                invalid={submissionAttempted && !validateUserSchool(userToUpdate)}
                disabled={!setUserToUpdate}
                onChange={(e => {
                    if (setUserToUpdate) {
                        setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: e.target.checked ? NOT_APPLICABLE : undefined, schoolId: e.target.checked && undefined}));
                    }
                })}
            />
            <RS.Label htmlFor={`${idPrefix}-not-associated-with-school`}>
                Not associated with a school
            </RS.Label>
        </div>}

        <div id={`school-input-${randomNumber}`} className="invalid-school">
            {submissionAttempted && !validateUserSchool(userToUpdate) ? "Please specify your school association" : null}
        </div>
    </RS.FormGroup>
};
