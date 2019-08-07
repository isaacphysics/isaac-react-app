import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {School, ValidationUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";

interface SchoolInputProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
}
export const SchoolInput = ({userToUpdate, setUserToUpdate}: SchoolInputProps) => {
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

    return <RS.FormGroup className="school">
        <RS.Label htmlFor="school-input">School</RS.Label>
        <RS.Input
            className="school-input" type="text" name="school" placeholder="Type a UK school name..." autoComplete="isaac-off"
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
                <li key={item.urn} onClick={() => { setUserSchool(item) }}>
                    {item.name + ", " + item.postcode}
                </li>
            )}
        </ul>}
        {!userToUpdate.schoolId && <RS.Input
            type="text" name="school-other" placeholder="...or enter a non-UK school."
            className="school-other-input mt-2" maxLength={255}
            defaultValue={userToUpdate.schoolOther}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, { schoolOther: e.target.value }))
            }
        />}
    </RS.FormGroup>
};
