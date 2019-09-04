import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../../IsaacAppTypes";
import {api} from "../../../services/api";
import {validateUserSchool} from "../../../services/validation";

interface SchoolInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
    className?: string;
    idPrefix?: string;
}
const NOT_APPLICABLE = "N/A";
export const SchoolInput = ({userToUpdate, setUserToUpdate, submissionAttempted, className, idPrefix="school"}: SchoolInputProps) => {
    let [schoolQueryText, setSchoolQueryText] = useState<string | null>(null);
    let [schoolSearchResults, setSchoolSearchResults] = useState<School[]>();
    let [selectedSchoolObject, setSelectedSchoolObject] = useState<School | null>();

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

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {
            searchSchool();
        }, 800);
        return () => {
            clearTimeout(timer.current);
        }
    }, [schoolQueryText]);

    function setUserSchool(school: any) {
        setUserToUpdate(Object.assign({}, userToUpdate, {schoolId: school && school.urn}));
        setSchoolQueryText(null);
        setSelectedSchoolObject(school);
        setSchoolSearchResults([]);
    }

    const schoolSpecified = (
        userToUpdate.schoolId !== undefined ||
        (userToUpdate.schoolOther !== undefined && userToUpdate.schoolOther !== "" && userToUpdate.schoolOther !== NOT_APPLICABLE)
    );

    return <RS.FormGroup className={`school ${className}`}>
        <RS.Label htmlFor="school-input" className="form-required">School</RS.Label>
        {userToUpdate.schoolOther !== NOT_APPLICABLE && <React.Fragment>
            <RS.Input
                id="school-input" type="text" name="school" placeholder="Type a UK school name..." autoComplete="isaac-off"
                invalid={submissionAttempted && !validateUserSchool(userToUpdate)}
                value={
                    schoolQueryText !== null ?
                        schoolQueryText :
                        (selectedSchoolObject && (selectedSchoolObject.name + ", " + selectedSchoolObject.postcode) || "")
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const queryValue = e.target.value;
                    setSchoolQueryText(queryValue);
                    if (queryValue === "") {
                        setUserSchool(undefined);
                    }
                }}
            />
            {schoolSearchResults && schoolSearchResults.length > 0 && <ul className="school-search-results">
                {schoolSearchResults.map((item: any) =>
                    <li key={item.urn} onClick={() => {
                        setUserSchool(item)
                    }}>
                        {item.name + ", " + item.postcode}
                    </li>
                )}
            </ul>}
            {!userToUpdate.schoolId && <RS.Input
                type="text" name="school-other" placeholder="...or enter a non-UK school."
                id="school-other-input" className="my-2" maxLength={255}
                value={userToUpdate.schoolOther || ""}
                invalid={submissionAttempted && !validateUserSchool(userToUpdate)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: e.target.value}))
                }
            />}
        </React.Fragment>}

        {!schoolSpecified && <div className="d-flex">
            <RS.CustomInput
                type="checkbox" id={`${idPrefix}-not-associated-with-school`}
                checked={userToUpdate.schoolOther === NOT_APPLICABLE}
                invalid={submissionAttempted && !validateUserSchool(userToUpdate)}
                onChange={(e => {
                    setUserToUpdate(Object.assign({}, userToUpdate, {schoolOther: e.target.checked ? NOT_APPLICABLE : ""}));
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
