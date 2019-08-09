import {CardBody, Col, CustomInput, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {UserExamPreferences, ValidationUser} from "../../../IsaacAppTypes";
import {EXAM_BOARD} from "../../services/constants";
import React, {ChangeEvent} from "react";
import {DateInput} from "./DateInput";
import {isDobOverThirteen, validateEmail} from "../../services/validation";
import {SchoolInput} from "./SchoolInput";
import {DobInput} from "./DobInput";

interface UserDetailsProps {
    examPreferences: UserExamPreferences;
    setExamPreferences: (e: any) => void;
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    attemptedAccountUpdate: boolean;
}

export const UserDetails = (props: UserDetailsProps) => {
    const {userToUpdate, setUserToUpdate, examPreferences, setExamPreferences, attemptedAccountUpdate} = props;

    return <CardBody className="pt-0">
        <Row>
            <Col>
                <span className="d-block pb-0 text-right text-muted required-before">
                    Required
                </span>
            </Col>
        </Row>

        <Row>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="first-name-input" className="form-required">First Name</Label>
                    <Input
                        id="first-name-input" type="text" name="givenName" maxLength={255}
                        defaultValue={userToUpdate.givenName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUserToUpdate(Object.assign({}, userToUpdate, {givenName: e.target.value}))
                        }}
                        required
                    />
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="last-name-input" className="form-required">Last Name</Label>
                    <Input
                        id="last-name-input" type="text" name="last-name" maxLength={255}
                        defaultValue={userToUpdate.familyName}
                        onChange={(e:  React.ChangeEvent<HTMLInputElement>) => {
                            setUserToUpdate(Object.assign({}, userToUpdate, {familyName: e.target.value}))
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
                        invalid={!validateEmail(userToUpdate.email)} id="email-input" type="email"
                        name="email" defaultValue={userToUpdate.email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setUserToUpdate(Object.assign({}, userToUpdate, {email: event.target.value}))
                        }}
                        aria-describedby="emailValidationMessage" required
                    />
                    <FormFeedback id="emailValidationMessage">
                        {(!validateEmail(userToUpdate.email)) ? "Enter a valid email address" : null}
                    </FormFeedback>
                </FormGroup>
            </Col>
            <Col md={6}>
                <DobInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={attemptedAccountUpdate} />
            </Col>
        </Row>

        <Row>
            <Col xs={6} md={3}>
                <FormGroup>
                    <fieldset>
                        <legend>Gender</legend>
                        <Row>
                            <Col size={6} lg={4}>
                                <CustomInput
                                    id="gender-female" type="radio"
                                    name="gender" label="Female"
                                    defaultChecked={userToUpdate.gender === 'FEMALE'}
                                    onChange={
                                        (e: React.ChangeEvent<HTMLInputElement>) => {
                                            setUserToUpdate(Object.assign({}, userToUpdate, {gender: 'FEMALE'}))
                                        }
                                    }/>
                            </Col>
                            <Col size={6} lg={4}>
                                <CustomInput
                                    id="gender-male" type="radio"
                                    name="gender" label="Male"
                                    defaultChecked={userToUpdate.gender === 'MALE'}
                                    onChange={
                                        (e: React.ChangeEvent<HTMLInputElement>) => {
                                            setUserToUpdate(Object.assign({}, userToUpdate, {gender: 'MALE'}))
                                        }
                                    }/>
                            </Col>
                            <Col size={6} lg={4}>
                                <CustomInput
                                    id="gender-other" type="radio"
                                    name="gender" label="Other"
                                    defaultChecked={userToUpdate.gender === 'OTHER'}
                                    onChange={
                                        (e: React.ChangeEvent<HTMLInputElement>) => {
                                            setUserToUpdate(Object.assign({}, userToUpdate, {gender: 'OTHER'}))
                                        }
                                    }/>
                            </Col>
                        </Row>
                    </fieldset>
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
                            (examPreferences && examPreferences[EXAM_BOARD.OCR]) ? EXAM_BOARD.OCR : EXAM_BOARD.AQA
                        }
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setExamPreferences(
                                event.target.value == EXAM_BOARD.AQA ?
                                    {[EXAM_BOARD.AQA]: true, [EXAM_BOARD.OCR]: false} :
                                    {[EXAM_BOARD.AQA]: false, [EXAM_BOARD.OCR]: true}
                            )
                        }
                    >
                        {/*<option></option> This was not an option although we should probably support it */}
                        <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                        <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
                    </Input>
                </FormGroup>
            </Col>

            <Col md={6}>
                <SchoolInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={attemptedAccountUpdate} />
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


        {userToUpdate && userToUpdate.role == "STUDENT" && <Row>
            <Col className="text-muted text-center mt-2">
                Are you a teacher? {" "}
                <a href="/pages/teacher_accounts" target="_blank" rel="noopener noreferrer">
                    <span className='sr-only'> Are you a teacher? </span>
                    Let us know
                </a> {" "}
                and we&apos;ll convert your account to a teacher account.
            </Col>
        </Row>}
    </CardBody>
};
