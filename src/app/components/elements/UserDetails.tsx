import {CardBody, Col, CustomInput, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {School, UserExamPreferences, ValidationUser} from "../../../IsaacAppTypes";
import {validateDob, validateEmail} from "../../services/validation";
import {EXAM_BOARD} from "../../services/constants";
import React, {ChangeEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {api} from "../../services/api";

interface UserDetailsProps {
    examPreferences: UserExamPreferences | null;
    setExamPreferences: (e: any) => void;
    myUser: ValidationUser;
    setMyUser: (user: any) => void;
    isEmailValid: boolean;
    setIsEmailValid: (isEmailValid: boolean) => void;
    isDobValid: boolean;
    setIsDobValid: (isDobValid: boolean) => void;
}

export const UserDetails = ({myUser, setMyUser, isEmailValid, setIsEmailValid, isDobValid, setIsDobValid, examPreferences, setExamPreferences}: UserDetailsProps) => {
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

    function setUserSchool(school: any) {
        setMyUser(Object.assign(myUser, {schoolId: school.urn}));
        setSchoolQueryText(null);
        setSelectedSchoolObject(school);
        setSchoolSearchResults([]);
    }

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {
            searchSchool();
        }, 800);
        return () => {
            clearTimeout(timer.current);
        }
    }, [schoolQueryText]);

    useEffect(() => {
        fetchSchool(myUser.schoolId || "");
    }, [myUser]);

    return <CardBody>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="first-name-input" className="form-required">First Name</Label>
                    <Input
                        id="first-name-input" type="text" name="givenName"
                        defaultValue={myUser.givenName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setMyUser(Object.assign(myUser, {givenName: e.target.value}))
                        }}
                        required
                    />
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="last-name-input" className="form-required">Last Name</Label>
                    <Input
                        id="last-name-input" type="text" name="last-name"
                        defaultValue={myUser.familyName}
                        onChange={(e:  React.ChangeEvent<HTMLInputElement>) => {
                            setMyUser(Object.assign(myUser, {familyName: e.target.value}))
                        }}
                        required
                    />
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="email-input" className="form-required">Email</Label>
                    <Input
                        invalid={!isEmailValid} id="email-input" type="email"
                        name="email" defaultValue={myUser.email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const email = event.target.value;
                            setIsEmailValid(validateEmail(email));
                            setMyUser(Object.assign(myUser, {email}))
                        }}
                        aria-describedby="emailValidationMessage" required
                    />
                    <FormFeedback id="emailValidationMessage">
                        {(!isEmailValid) ? "Enter a valid email address" : null}
                    </FormFeedback>
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="dob-input">Date of Birth</Label>
                    <Input
                        invalid={!isDobValid}
                        id="dob-input"
                        type="date"
                        name="date-of-birth"
                        defaultValue={myUser.dateOfBirth}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const dateOfBirth = event.target.value;
                            setIsDobValid(validateDob(dateOfBirth));
                            setMyUser(Object.assign(myUser, {dateOfBirth: new Date(dateOfBirth)}))
                        }}
                        aria-describedby="ageValidationMessage"
                    />
                    {!isDobValid && <FormFeedback id="ageValidationMessage">
                        You must be over 13 years old
                    </FormFeedback>}
                </FormGroup>
            </Col>
        </Row>

        <Row>
            <Col xs={6} md={3}>
                <FormGroup>
                    <Label htmlFor="dob-input">Gender</Label>
                    <Row>
                        <Col size={6} lg={2}>
                            <CustomInput
                                id="gender-female" type="radio"
                                name="gender" label="Female"
                                defaultChecked={myUser.gender === 'FEMALE'}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setMyUser(Object.assign(myUser, {gender: 'FEMALE'}))
                                    }
                                }/>
                        </Col>

                        <Col size={6} lg={2}>
                            <CustomInput
                                id="gender-male" type="radio"
                                name="gender" label="Male"
                                defaultChecked={myUser.gender === 'MALE'}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setMyUser(Object.assign(myUser, {gender: 'MALE'}))
                                    }
                                }/>
                        </Col>


                        <Col size={6} lg={2}>
                            <CustomInput
                                id="gender-other" type="radio"
                                name="gender" label="Other"
                                defaultChecked={myUser.gender === 'OTHER'}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setMyUser(Object.assign(myUser, {gender: 'OTHER'}))
                                    }
                                }/>
                        </Col>
                    </Row>
                </FormGroup>
            </Col>

            <Col xs={6} md={3} className="align-self-center text-center">
                <FormGroup>
                    <Label className="d-inline-block pr-2" for="examBoardSelect">Exam Board</Label>
                    <Input
                        className="w-auto d-inline-block pl-1 pr-0"
                        type="select"
                        name="select"
                        id="examBoardSelect"
                        value={
                            (examPreferences && examPreferences[EXAM_BOARD.OCR] && EXAM_BOARD.OCR) ||
                            // (examPreferences && examPreferences[EXAM_BOARD.AQA] && [EXAM_BOARD.AQA]) ||
                            EXAM_BOARD.AQA
                        }
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setExamPreferences(
                                event.target.value == EXAM_BOARD.AQA ?
                                    {[EXAM_BOARD.AQA]: true, [EXAM_BOARD.OCR]: false} :
                                    {[EXAM_BOARD.AQA]: false, [EXAM_BOARD.OCR]: true}
                            )
                        }
                    >
                        <option></option>
                        <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                        <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
                    </Input>
                </FormGroup>
            </Col>

            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="school-input">School</Label>
                    <Input
                        id="school-input" type="text" name="school" placeholder="UK School"
                        value={
                            schoolQueryText !== null ?
                                schoolQueryText :
                                ((selectedSchoolObject && selectedSchoolObject.name) || "")
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSchoolQueryText(e.target.value)}
                    />
                    {schoolSearchResults && schoolSearchResults.length > 0 && <ul id="school-search-results">
                        {schoolSearchResults.map((item: any) => <li key={item.urn} onClick={() => { setUserSchool(item) }}>{item.name}</li>)}
                    </ul>}
                    <Input
                        id="school-other-input" type="text" name="school-other" placeholder="Other School" className="mt-2"
                        defaultValue={myUser.schoolOther} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMyUser(Object.assign(myUser, { schoolOther: e.target.value }))}
                    />
                </FormGroup>
            </Col>
        </Row>
        {/*<Row>*/}
        {/*    <Col md={6}>*/}
        {/*        <FormGroup>*/}
        {/*            <Label htmlFor="linked-accounts">Linked Accounts</Label>*/}
        {/*            <Row>Placeholder</Row> /!* TODO add linked account control *!/*/}
        {/*        </FormGroup>*/}
        {/*    </Col>*/}
        {/*</Row>*/}
    </CardBody>
};
