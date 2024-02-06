import React from "react";
import {allRequiredInformationIsPresent, isAda, isTutor, validateEmail, validateName} from "../../../services";
import {CardBody, Col, FormGroup, Row} from "reactstrap";
import {BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser} from "../../../../IsaacAppTypes";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {GenderInput} from "../inputs/GenderInput";
import {UserAuthenticationSettingsDTO, UserContext} from "../../../../IsaacApiTypes";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {BooleanNotationInput} from "../inputs/BooleanNotationInput";
import {CountryInput} from "../inputs/CountryInput";
import {AccountTypeMessage} from "../AccountTypeMessage";
import {ProgrammingLanguageInput} from "../inputs/ProgrammingLanguageInput";
import {FamilyNameInput, GivenNameInput} from "../inputs/NameInput";
import {EmailInput} from "../inputs/EmailInput";
import {ExigentAlert} from "../ExigentAlert";

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
        {submissionAttempted && !allRequiredFieldsValid &&
                <ExigentAlert color="warning">
                    <p className="alert-heading font-weight-bold">Unable to update your account</p>
                    <p>Please ensure you have completed all required fields.</p>
                </ExigentAlert>
        }
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
                <GivenNameInput
                    userToUpdate={userToUpdate}
                    setUserToUpdate={setUserToUpdate}
                    nameValid={!!validateName(userToUpdate.givenName)}
                    submissionAttempted={submissionAttempted}
                    required={true}
                />
            </Col>
            <Col md={6}>
                <FamilyNameInput
                    userToUpdate={userToUpdate}
                    setUserToUpdate={setUserToUpdate}
                    nameValid={!!validateName(userToUpdate.familyName)}
                    submissionAttempted={submissionAttempted}
                    required={true}
                />
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <EmailInput
                    userToUpdate={userToUpdate}
                    setUserToUpdate={setUserToUpdate}
                    emailIsValid={!!validateEmail(userToUpdate.email)}
                    submissionAttempted={submissionAttempted}
                    required={true}
            />
            </Col>
            <Col md={6}>
                <DobInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted} editingOtherUser={editingOtherUser}/>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <GenderInput userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} submissionAttempted={submissionAttempted}
                                 required={false}/>
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
                <ProgrammingLanguageInput programmingLanguage={programmingLanguage} setProgrammingLanguage={setProgrammingLanguage}/>
            </Col>
            <Col md={6}>
                <BooleanNotationInput booleanNotation={booleanNotation} setBooleanNotation={setBooleanNotation} />
            </Col>
        </Row>}
    </CardBody>;
};
