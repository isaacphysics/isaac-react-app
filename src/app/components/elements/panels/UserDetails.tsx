import React, {ChangeEvent} from "react";
import {
    allRequiredInformationIsPresent,
    isCS,
    PROGRAMMING_LANGUAGE,
    programmingLanguagesMap,
    TEACHER_REQUEST_ROUTE,
    UserFacingRole,
    validateEmail,
    validateName
} from "../../../services";
import {CardBody, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser} from "../../../../IsaacAppTypes";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {GenderInput} from "../inputs/GenderInput";
import {UserAuthenticationSettingsDTO, UserContext} from "../../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {BooleanNotationInput} from "../inputs/BooleanNotationInput";

interface UserDetailsProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    userContexts: UserContext[];
    setUserContexts: (uc: UserContext[]) => void;
    programmingLanguage: ProgrammingLanguage;
    setProgrammingLanguage: (pl: ProgrammingLanguage) => void;
    booleanNotation: BooleanNotation;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
}

export const UserDetails = (props: UserDetailsProps) => {
    const {
        userToUpdate, setUserToUpdate,
        userContexts, setUserContexts,
        programmingLanguage, setProgrammingLanguage,
        booleanNotation, setBooleanNotation,
        displaySettings, setDisplaySettings,
        submissionAttempted, editingOtherUser
    } = props;

    const allRequiredFieldsValid =
        userToUpdate?.email && allRequiredInformationIsPresent(userToUpdate, {EMAIL_PREFERENCE: null}, userContexts);

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
                        invalid={!validateName(userToUpdate.givenName)} id="first-name-input" type="text"
                        name="givenName" defaultValue={userToUpdate.givenName}
                        onChange={e => setUserToUpdate({...userToUpdate, givenName: e.target.value})}
                        aria-describedby="firstNameValidationMessage" required
                    />
                    <FormFeedback id="firstNameValidationMessage">
                        {(submissionAttempted && !validateName(userToUpdate.givenName))
                            ? "Enter a valid name" : null}
                    </FormFeedback>
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="last-name-input" className="form-required">Last name</Label>
                    <Input
                        invalid={!validateName(userToUpdate.familyName)} id="last-name-input" type="text"
                        name="last-name" defaultValue={userToUpdate.familyName}
                        onChange={e => setUserToUpdate({...userToUpdate, familyName: e.target.value})}
                        aria-describedby="lastNameValidationMessage" required
                    />
                    <FormFeedback id="lastNameValidationMessage">
                        {(submissionAttempted && !validateName(userToUpdate.familyName))
                            ? "Enter a valid name" : null}
                    </FormFeedback>
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
                                 required={isCS}/>
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <SchoolInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                                 required={isCS}/>
                </FormGroup>
            </Col>
            <Col md={6}>
                <UserContextAccountInput
                    user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                    displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                    setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
                />
            </Col>
        </Row>
        {isCS && <Row>
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
                        <option value={PROGRAMMING_LANGUAGE.PSEUDOCODE}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PSEUDOCODE]}</option>
                        <option value={PROGRAMMING_LANGUAGE.PYTHON}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PYTHON]}</option>
                        <option value={PROGRAMMING_LANGUAGE.CSHARP}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.CSHARP]}</option>
                    </Input>
                </FormGroup>
            </Col>
            <Col md={6}>
                <BooleanNotationInput booleanNotation={booleanNotation} setBooleanNotation={setBooleanNotation} />
            </Col>
        </Row>}

        {submissionAttempted && !allRequiredFieldsValid && <h4 role="alert" className="text-danger text-center mt-4 mb-3">
            Not all required fields have been correctly filled.
        </h4>}
    </CardBody>
};
