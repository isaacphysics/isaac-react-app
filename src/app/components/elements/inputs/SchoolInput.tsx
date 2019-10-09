import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import CreatableSelect from 'react-select/creatable';
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {api} from "../../../services/api";
import {validateUserSchool} from "../../../services/validation";

interface SchoolInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate?: (user: any) => void;
    submissionAttempted: boolean;
    className?: string;
    idPrefix?: string;
}
const NOT_APPLICABLE = "N/A";
export const SchoolInput = ({userToUpdate, setUserToUpdate, submissionAttempted, className, idPrefix="school"}: SchoolInputProps) => {
    let [schoolQueryText, setSchoolQueryText] = useState<string | null>(null);
    let [schoolSearchResults, setSchoolSearchResults] = useState<School[]>();
    let [selectedSchoolObject, setSelectedSchoolObject] = useState<School | null>();
    let [schoolOptions, setSchoolOptions] = useState<any[]>();
    let [schoolBoxEmpty, setSchoolBoxEmpty] = useState();

    function searchSchool(e?: Event) {
        if (e) {
            e.preventDefault();
        }
        if (schoolQueryText) {
            api.schools.search(schoolQueryText).then(({data}) => {
                setSchoolSearchResults(data);
            }).catch((response) => {
                console.error("Error searching for schools. ", response);
            });
        } else {
            setSchoolSearchResults([]);
        }
    }

    useEffect(() => {
        let temp: any = [];
        schoolSearchResults && schoolSearchResults.length > 0 && schoolSearchResults.map((item: any) => (temp.push({value: item, label: item.name + ", " + item.postcode})));
        setSchoolOptions(temp);
    }, [schoolSearchResults]);

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
        if (selectedSchoolObject == null) {
            setSchoolBoxEmpty(true);
        }
    }, [userToUpdate]);

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {
            searchSchool();
        }, 800);
        return () => {
            clearTimeout(timer.current);
        }
    }, [schoolQueryText]);

    function renderInput(queryValue: any) {
        setSchoolQueryText(queryValue);
    }

    function setUserSchool(school: any) {
        console.log(school);
        if (setUserToUpdate) {
            if (school.urn) {
                setUserToUpdate(Object.assign({}, userToUpdate, {schoolId: school && school.urn, schoolOther: undefined}));
                setSchoolQueryText(null);
                setSelectedSchoolObject(school);
                setSchoolSearchResults([]);
            } else if (school) {
                setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: school, schoolId: undefined}));
                setSchoolQueryText(null);
                setSelectedSchoolObject(school);
                setSchoolSearchResults([]);
            }
        }
    }

    function handleSetSchool(newValue: any) {
        if (newValue == null) {
            setSchoolBoxEmpty(true);
            setSchoolQueryText("trains");
            setSelectedSchoolObject(undefined);
        } else if (newValue && newValue.value) {
            setSchoolBoxEmpty(false);
            setUserSchool(newValue.value);
        } else if (newValue) {
            setSchoolBoxEmpty(false);
            setUserSchool(newValue);
        }
    }

    const schoolValue = (
        schoolQueryText ?
            schoolQueryText :
            (selectedSchoolObject && selectedSchoolObject.urn ?
                {value: selectedSchoolObject.urn, label: selectedSchoolObject.name + ", " + selectedSchoolObject.postcode} :
                {value: "manually entered school", label: userToUpdate.schoolOther})
    );

    return <RS.FormGroup className={`school ${className}`}>
        <RS.Label htmlFor="school-input" className="form-required">School</RS.Label>
        {userToUpdate.schoolOther !== NOT_APPLICABLE && <React.Fragment>
            <CreatableSelect isClearable id="school-input" placeholder={"Type your school name"} value={schoolValue}
                onInputChange={renderInput} onChange={handleSetSchool} options={schoolOptions}/>
        </React.Fragment>}

        {schoolBoxEmpty && <div className="d-flex">
            <RS.CustomInput
                type="checkbox" id={`${idPrefix}-not-associated-with-school`}
                checked={userToUpdate.schoolOther === NOT_APPLICABLE}
                invalid={submissionAttempted && !validateUserSchool(userToUpdate)}
                disabled={!setUserToUpdate}
                onChange={(e => {
                    if (setUserToUpdate) {
                        setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: e.target.checked ? NOT_APPLICABLE : "", schoolId: e.target.checked && undefined}));
                    }
                })}
            />
            <RS.Label htmlFor={`${idPrefix}-not-associated-with-school`}>
                Not associated with a school
            </RS.Label>
        </div>}

        <RS.FormFeedback id="school-input">
            Please specify your school association
        </RS.FormFeedback>
    </RS.FormGroup>
};
