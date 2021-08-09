import {CardBody, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {BooleanNotation, SubjectInterests, ValidationUser} from "../../../../IsaacAppTypes";
import {EXAM_BOARD, UserFacingRole} from "../../../services/constants";
import React, {ChangeEvent} from "react";
import {
    allRequiredInformationIsPresent,
    validateBooleanNotation,
    validateEmail,
    validateExamBoard,
} from "../../../services/validation";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {StudyingCsInput} from "../inputs/StudyingCsInput";
import {GenderInput} from "../inputs/GenderInput";
import {UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {SubjectInterestTableInput} from "../inputs/SubjectInterestTableInput";
import {Link} from "react-router-dom";

interface UserDetailsProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    subjectInterests: SubjectInterests;
    setSubjectInterests: (si: SubjectInterests) => void;
    booleanNotation: BooleanNotation;
    setBooleanNotation: (bn: BooleanNotation) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
}

export const UserDetails = (props: UserDetailsProps) => {
    const {
        userToUpdate, setUserToUpdate,
        subjectInterests, setSubjectInterests,
        booleanNotation, setBooleanNotation,
        submissionAttempted, editingOtherUser
    } = props;

    const teacherRequestRoute = {
        [SITE.PHY]: "/pages/contact_us_teacher",
        [SITE.CS]: "/pages/teacher_accounts"
    };

    const allRequiredFieldsValid = userToUpdate && userToUpdate.email &&
        allRequiredInformationIsPresent(userToUpdate, {SUBJECT_INTEREST: subjectInterests, EMAIL_PREFERENCE: null, BOOLEAN_NOTATION: booleanNotation});

    return <CardBody className="pt-0">
        <Row>
            <Col>
                <span className="d-block pb-0 text-right text-muted required-before">
                    Required
                </span>
            </Col>
        </Row>
        <Row className="mb-3">
            <Col>
                Account type: <b>{userToUpdate && userToUpdate.role && UserFacingRole[userToUpdate.role]}</b> {userToUpdate && userToUpdate.role == "STUDENT" && <span>
                    <small>(Are you a teacher? {" "}
                        <Link to={teacherRequestRoute[SITE_SUBJECT]} target="_blank">
                            Upgrade your account
                        </Link>{".)"}</small>
                </span>}
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
                <DobInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted} editingOtherUser={editingOtherUser}/>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <GenderInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                    required={SITE_SUBJECT === SITE.CS}/>
            </Col>
            {SITE_SUBJECT === SITE.CS && <Col md={6}>
                <FormGroup>
                    <Label className="d-inline-block pr-2 form-required" htmlFor="exam-board-select">
                        Exam board
                    </Label>
                    <Input
                        type="select" name="select" id="exam-board-select"
                        value={userToUpdate.examBoard}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setUserToUpdate(
                                Object.assign({}, userToUpdate, {examBoard: event.target.value})
                            )
                        }
                        invalid={submissionAttempted && !validateExamBoard(userToUpdate)}
                    >
                        <option value={undefined}></option>
                        <option value={EXAM_BOARD.OTHER}>Other</option>
                        <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                        <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
                    </Input>
                </FormGroup>
            </Col>}
            <Col md={6}>
                <SchoolInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                    required={SITE_SUBJECT === SITE.CS}/>
            </Col>
            {SITE_SUBJECT === SITE.CS && <Col md={6}>
                <div className="mt-2 mb-2 pt-1">
                    <StudyingCsInput subjectInterests={subjectInterests} setSubjectInterests={setSubjectInterests} submissionAttempted={submissionAttempted} />
                </div>
            </Col>}
            {SITE_SUBJECT === SITE.CS && <Col md={6}>
                <FormGroup>
                    <Label className="d-inline-block pr-2 form-required" htmlFor="boolean-notation-preference">
                        Boolean logic notation
                    </Label>
                    <Input
                        type="select" name="select" id="boolean-notation-preference"
                        value={
                            // This chooses the last string in this list that (when used as a key)
                            // is mapped to true in the current value of booleanNotation
                            ["ENG", "MATH", "BOARD_SPECIFIC"].reduce((val : string | undefined, key) => booleanNotation[key as keyof BooleanNotation] === true ? key : val, undefined)
                        }
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                setBooleanNotation({[event.target.value]: true})
                            }
                        }
                        invalid={submissionAttempted && !validateBooleanNotation(booleanNotation)}
                    >
                        <option value={undefined}></option>
                        <option value={"BOARD_SPECIFIC"}>Exam board specific</option>
                        <option value={"MATH"}>And (&and;) Or (&or;) Not (&not;)</option>
                        <option value={"ENG"}>And (&middot;) Or (+) Not (bar)</option>
                    </Input>
                </FormGroup>
            </Col>}
        </Row>
        {SITE_SUBJECT === SITE.PHY && !editingOtherUser && <Row className="mt-3">
            <Col>
                <SubjectInterestTableInput stateObject={subjectInterests} setStateFunction={setSubjectInterests}/>
            </Col>
        </Row>}

        {submissionAttempted && !allRequiredFieldsValid && <h4 role="alert" className="text-danger text-center mt-4 mb-3">
            Required information in this form is not set
        </h4>}
    </CardBody>
};
