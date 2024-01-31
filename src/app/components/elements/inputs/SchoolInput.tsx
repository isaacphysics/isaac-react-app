import React, {useCallback, useEffect, useState} from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {isAda, schoolNameWithPostcode, validateUserSchool} from "../../../services";
import throttle from "lodash/throttle";
import classNames from "classnames";
import {Immutable} from "immer";
import {useLazyGetSchoolByUrnQuery, useLazySearchSchoolsQuery} from "../../../state";
import {FormFeedback, Label} from "reactstrap";

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

const schoolSearch = (searchFn: (school : string) => Promise<School[]>) => (schoolSearchText: string, setAsyncSelectOptionsCallback: (options: {value: string | School, label: string | undefined}[]) => void) => {
    searchFn(schoolSearchText).then((schools) => {
        setAsyncSelectOptionsCallback(schools.map((item) => ({value: item, label: schoolNameWithPostcode(item)})));
    }).catch((response) => {
        console.error("Error searching for schools. ", response);
    });
};
// Must define this debounced function _outside_ the component to ensure it doesn't get overwritten each rerender!
const throttledSchoolSearch = (searchFn: (school : string) => Promise<School[]>) => throttle(schoolSearch(searchFn), 450, {trailing: true, leading: true});

export const SchoolInput = ({userToUpdate, setUserToUpdate, submissionAttempted, className, idPrefix="school", disableInput, required}: SchoolInputProps) => {
    let [selectedSchoolObject, setSelectedSchoolObject] = useState<School | null>();

    const [searchSchools] = useLazySearchSchoolsQuery();
    const searchSchoolsFn = useCallback(throttledSchoolSearch((school: string) => {
        return searchSchools(school).then(({data, error}) => {
            if (data && data.length > 0) {
                return data;
            }
            throw error;
        })
    }), [searchSchools]);

    const [getSchoolByUrn] = useLazyGetSchoolByUrnQuery();
    // Get school associated with urn
    function fetchSchool(urn: string) {
        if (urn !== "") {
            getSchoolByUrn(urn).then(({data}) => {
                if (data && data.length > 0) {
                    setSelectedSchoolObject(data[0]);
                }
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
    return <RS.FormGroup className={`school mb-4 ${className} `}>
        <Label className={classNames("font-weight-bold", (required ? "form-required" : "form-optional"))}>School</Label>
        {isAda && <p className="d-block input-description">This helps us personalise the platform for you.</p>}
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
                loadOptions={searchSchoolsFn}
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
            >
                <FormFeedback>
                    Please specify your school association.
                </FormFeedback>
            </RS.CustomInput>
        </div>}
    </RS.FormGroup>
};
