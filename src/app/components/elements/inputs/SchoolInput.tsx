import React, {useCallback, useEffect, useState} from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {isPhy, schoolNameWithPostcode, siteSpecific, validateUserSchool} from "../../../services";
import throttle from "lodash/throttle";
import classNames from "classnames";
import {Immutable} from "immer";
import {useLazyGetSchoolByUrnQuery, useLazySearchSchoolsQuery} from "../../../state";
import {FormFeedback, FormGroup, Label} from "reactstrap";
import { components, ControlProps, InputProps, SingleValueProps, ValueContainerProps } from "react-select";
import { StyledCheckbox } from "./StyledCheckbox";

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

const customComponents = {
    IndicatorSeparator: () => null, 
    DropdownIndicator: () => null, 
    ValueContainer: ((props: ValueContainerProps) => <components.ValueContainer {...props} className="form-select border-0 ps-3" />) as () => React.JSX.Element, 
    Control: ((props: ControlProps) => <components.Control {...props} className="form-control p-0 rounded" />) as () => React.JSX.Element, 
    SingleValue: ((props: SingleValueProps) => <components.SingleValue {...props} className="ms-1" />) as () => React.JSX.Element, 
    Input: ((props: InputProps) => <components.Input {...props} className="ms-1" />) as () => React.JSX.Element };

export const SchoolInput = ({userToUpdate, setUserToUpdate, submissionAttempted, className, idPrefix="school", disableInput, required}: SchoolInputProps) => {
    const [selectedSchoolObject, setSelectedSchoolObject] = useState<School | null>();

    const [searchSchools] = useLazySearchSchoolsQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const searchSchoolsFn = useCallback(throttledSchoolSearch(async (school: string) => {
        const { data, error } = await searchSchools(school);
        if (data && data.length > 0) {
            return data;
        }
        throw error;
    }), [searchSchools]);

    const [getSchoolByUrn] = useLazyGetSchoolByUrnQuery();
    // Get school associated with urn
    function fetchSchool(urn: string) {
        if (urn !== "") {
            if (selectedSchoolObject?.urn !== urn) {
                getSchoolByUrn(urn).then(({data}) => {
                    if (data && data.length > 0) {
                        setSelectedSchoolObject(data[0]);
                    }
                });
            }
        } else {
            setSelectedSchoolObject(null);
        }
    }

    useEffect(() => {
        fetchSchool(userToUpdate.schoolId || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userToUpdate]);

    // Set schoolId or schoolOther
    function setUserSchool(school: any) {
        const {schoolId: _schoolId, schoolOther: _schoolOther, ...userWithoutSchoolInfo} = userToUpdate;
        if (school.urn) {
            setUserToUpdate?.({...userWithoutSchoolInfo, schoolId: school.urn});
            setSelectedSchoolObject(school);
        } else if (school) {
            setUserToUpdate?.({...userWithoutSchoolInfo, schoolOther: school});
            setSelectedSchoolObject(school);
        }
    }

    // Called when school input box option selected
    function handleSetSchool(newValue: {value: School | string} | null) {
        const {schoolId: _schoolId, schoolOther: _schoolOther, ...userWithoutSchoolInfo} = userToUpdate;
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

    const randomNumber = Math.random();

    const isInvalid = submissionAttempted && required && !validateUserSchool(userToUpdate);
    return <FormGroup className={`school mb-4 ${className} `}>
        <Label htmlFor={`school-input-${randomNumber}`} className={classNames("fw-bold", (required ? "form-required" : "form-optional"))}>School</Label>
        <p className="d-block input-description">
            {siteSpecific("This helps us promote events near you.", "This helps us measure our reach and impact.")}
        </p>
        {userToUpdate.schoolOther !== NOT_APPLICABLE && <React.Fragment>
            <AsyncCreatableSelect
                isClearable
                isDisabled={disableInput}
                inputId={`school-input-${randomNumber}`}
                placeholder={"Type your school name"}
                value={schoolValue}
                components={customComponents}
                className={classNames("basic-multi-select", {"react-select-error": isInvalid})}
                classNamePrefix="select"
                onChange={handleSetSchool}
                loadOptions={searchSchoolsFn}
                filterOption={() => true}
                formatCreateLabel={(input) => `Use "${input}" as your school name`}
            />
        </React.Fragment>}

        {((userToUpdate.schoolOther == undefined && !(selectedSchoolObject && selectedSchoolObject.name)) || userToUpdate.schoolOther == NOT_APPLICABLE) && <div className="d-flex flex-column mt-2 align-content-center">
            <StyledCheckbox
                type="checkbox" id={`${idPrefix}-not-associated-with-school`}
                checked={userToUpdate.schoolOther === NOT_APPLICABLE}
                color="solid"
                invalid={isInvalid}
                disabled={disableInput || !setUserToUpdate}
                onChange={(e => {
                    const {schoolId: _schoolId, schoolOther: _schoolOther, ...userWithoutSchoolInfo} = userToUpdate;
                    if (e.target.checked) {
                        setUserToUpdate?.({...userWithoutSchoolInfo, schoolOther: NOT_APPLICABLE});
                    } else {
                        setUserToUpdate?.(userWithoutSchoolInfo);
                    }
                })}
                label={<span>Not associated with a {siteSpecific("","UK ")}school</span>} 
            >
            </StyledCheckbox>
            <FormFeedback>
                Please specify your school association.
            </FormFeedback>
        </div>}
    </FormGroup>;
};
