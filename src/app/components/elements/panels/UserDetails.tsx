import {CardBody, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {SubjectInterests, UserExamPreferences, ValidationUser} from "../../../../IsaacAppTypes";
import {EXAM_BOARD} from "../../../services/constants";
import React, {ChangeEvent} from "react";
import {
    validateEmail,
    validateSubjectInterests,
    validateUserGender,
    validateUserSchool
} from "../../../services/validation";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {StudyingCsInput} from "../inputs/StudyingCsInput";
import {GenderInput} from "../inputs/GenderInput";

interface UserDetailsProps {
    examPreferences: UserExamPreferences;
    setExamPreferences: (e: any) => void;
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    subjectInterests: SubjectInterests;
    setSubjectInterests: (si: SubjectInterests) => void;
    submissionAttempted: boolean;
}

export const UserDetails = (props: UserDetailsProps) => {
    const {
        userToUpdate, setUserToUpdate,
        examPreferences, setExamPreferences,
        subjectInterests, setSubjectInterests,
        submissionAttempted
    } = props;

    const allRequiredFieldsValid = userToUpdate && subjectInterests &&
        validateEmail(userToUpdate.email) &&
        validateUserGender(userToUpdate) &&
        validateUserSchool(userToUpdate) &&
        validateSubjectInterests(subjectInterests);

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
                    <Label htmlFor="first-name-input" className="form-required">First name</Label>
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
                    <Label htmlFor="last-name-input" className="form-required">Last name</Label>
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
                    <Label htmlFor="email-input" className="form-required">Email address</Label>
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
                <DobInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted} />
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <GenderInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted} />
                <SchoolInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted} />
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label className="d-inline-block pr-2" htmlFor="exam-board-select">
                        Exam board
                    </Label>
                    <Input
                        type="select" name="select" id="exam-board-select"
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
                <div className="mt-5 pt-1">
                    <StudyingCsInput subjectInterests={subjectInterests} setSubjectInterests={setSubjectInterests} submissionAttempted={submissionAttempted} />
                </div>
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

        {submissionAttempted && !allRequiredFieldsValid && <h4 role="alert" className="text-danger text-center mt-4 mb-3">
            Required information in this form is not set
        </h4>}
    </CardBody>
};
