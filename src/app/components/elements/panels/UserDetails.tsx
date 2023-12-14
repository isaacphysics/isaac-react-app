import React, {ChangeEvent} from "react";
import {
    allRequiredInformationIsPresent,
    isAda,
    isTutor,
    PROGRAMMING_LANGUAGE,
    programmingLanguagesMap,
    validateEmail,
    validateName
} from "../../../services";
import {CardBody, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser} from "../../../../IsaacAppTypes";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {GenderInput} from "../inputs/GenderInput";
import {UserAuthenticationSettingsDTO, UserContext} from "../../../../IsaacApiTypes";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {BooleanNotationInput} from "../inputs/BooleanNotationInput";
import {CountryInput} from "../inputs/CountryInput";
import {AccountTypeMessage} from "../AccountTypeMessage";

interface UserDetailsProps {
    userToUpdate: ValidationUser;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setUserToUpdate: (user: any) => void;
    userContexts: UserContext[];
    setUserContexts: (uc: UserContext[]) => void;
    programmingLanguage: Nullable<ProgrammingLanguage>;
    setProgrammingLanguage: (pl: ProgrammingLanguage) => void;
    booleanNotation: Nullable<BooleanNotation>;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
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
                <AccountTypeMessage role={userToUpdate?.role} />
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
                                 required={isAda}/>
                </FormGroup>
            </Col>
            {
                isAda &&
                <Col md={6}>
                    <FormGroup>
                        <CountryInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                                     required={false}/>
                    </FormGroup>
                </Col>
            }
        </Row>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <SchoolInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                                 required={isAda && !isTutor(userToUpdate)}/>
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
        {isAda && <Row>
            <Col md={6}>
                <FormGroup>
                    <Label className="d-inline-block pr-2" htmlFor="programming-language-select">
                        Preferred programming language
                    </Label>
                    <Input
                        type="select" name="select" id="programming-language-select"
                        value={Object.values(PROGRAMMING_LANGUAGE).reduce((val: string | undefined, key) => programmingLanguage?.[key as keyof ProgrammingLanguage] ? key : val, PROGRAMMING_LANGUAGE.NONE)}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const newProgrammingLanguage = Object.entries(programmingLanguage ?? {}).reduce((acc, [k, _v]) => ({...acc, [k]: false}), {});
                            setProgrammingLanguage(event.target.value ? {...newProgrammingLanguage, [event.target.value]: true} : newProgrammingLanguage);
                        }}
                    >
                        <option />
                        <option value={PROGRAMMING_LANGUAGE.PSEUDOCODE}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PSEUDOCODE]}</option>
                        <option value={PROGRAMMING_LANGUAGE.PYTHON}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PYTHON]}</option>
                        <option value={PROGRAMMING_LANGUAGE.CSHARP}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.CSHARP]}</option>
                        <option value={PROGRAMMING_LANGUAGE.VBA}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.VBA]}</option>
                        <option value={PROGRAMMING_LANGUAGE.JAVA}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.JAVA]}</option>
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
    </CardBody>;
};
