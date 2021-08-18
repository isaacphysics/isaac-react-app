import React, {ChangeEvent} from "react";
import {ProgrammingLanguage, SubjectInterests, ValidationUser} from "../../../../IsaacAppTypes";
import {PROGRAMMING_LANGUAGE, programmingLanguagesMap, UserFacingRole} from "../../../services/constants";
import {allRequiredInformationIsPresent, validateEmail} from "../../../services/validation";
import {CardBody, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {GenderInput} from "../inputs/GenderInput";
import {UserAuthenticationSettingsDTO, UserContext} from "../../../../IsaacApiTypes";
import {SITE, SITE_SUBJECT, TEACHER_REQUEST_ROUTE} from "../../../services/siteConstants";
import {SubjectInterestTableInput} from "../inputs/SubjectInterestTableInput";
import {Link} from "react-router-dom";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";

interface UserDetailsProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    subjectInterests: SubjectInterests;
    setSubjectInterests: (si: SubjectInterests) => void;
    userContexts: UserContext[];
    setUserContexts: (uc: UserContext[]) => void;
    programmingLanguage: ProgrammingLanguage;
    setProgrammingLanguage: (pl: ProgrammingLanguage) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
}

export const UserDetails = (props: UserDetailsProps) => {
    const {
        userToUpdate, setUserToUpdate,
        subjectInterests, setSubjectInterests,
        userContexts, setUserContexts,
        programmingLanguage, setProgrammingLanguage,
        submissionAttempted, editingOtherUser
    } = props;

    const allRequiredFieldsValid =
        userToUpdate?.email && allRequiredInformationIsPresent(userToUpdate, {SUBJECT_INTEREST: subjectInterests, EMAIL_PREFERENCE: null}, userContexts);

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
                Account type: <b>{userToUpdate?.role && UserFacingRole[userToUpdate.role]}</b> {userToUpdate?.role == "STUDENT" && <span>
                    <small>(Are you a teacher? {" "}
                        <Link to={TEACHER_REQUEST_ROUTE} target="_blank">
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
                        onChange={e => setUserToUpdate({...userToUpdate, givenName: e.target.value})}
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
                        onChange={e => setUserToUpdate({...userToUpdate, familyName: e.target.value})}
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
                        onChange={event => setUserToUpdate({...userToUpdate, email: event.target.value})}
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
            <Col md={6}>
                <FormGroup>
                    <GenderInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                                 required={SITE_SUBJECT === SITE.CS}/>
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <SchoolInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                                 required={SITE_SUBJECT === SITE.CS}/>
                </FormGroup>
            </Col>
            <Col md={6}>
                <UserContextAccountInput user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts} submissionAttempted={submissionAttempted} />
            </Col>
        </Row>
        {SITE_SUBJECT === SITE.CS && <Row>
            <Col md={6}>
                <FormGroup>
                    <Label className="d-inline-block pr-2" htmlFor="programming-language-select">
                        Default programming language
                    </Label>
                    <Input
                        type="select" name="select" id="programming-language-select"
                        value={Object.values(PROGRAMMING_LANGUAGE).reduce((val: string | undefined, key) => programmingLanguage[key as keyof ProgrammingLanguage] ? key : val, "")}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setProgrammingLanguage({[event.target.value]: true})
                        }}
                    >
                        <option value=""></option>
                        <option value={PROGRAMMING_LANGUAGE.PYTHON}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PYTHON]}</option>
                        <option value={PROGRAMMING_LANGUAGE.CSHARP}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.CSHARP]}</option>
                        <option value={PROGRAMMING_LANGUAGE.JAVASCRIPT}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.JAVASCRIPT]}</option>
                    </Input>
                </FormGroup>
            </Col>
        </Row>}
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
