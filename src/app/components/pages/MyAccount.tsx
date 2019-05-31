import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import classnames from "classnames";
import {
    Alert,
    Container,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Card,
    CardFooter,
    Col,
    Form,
    Input,
    Row,
} from "reactstrap";
import {RegisteredUserDTO, UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {AppState, ErrorState} from "../../state/reducers";
import {updateCurrentUser, resetPassword} from "../../state/actions";
import {LoggedInUser, UserPreferencesDTO, LoggedInValidationUser} from "../../../IsaacAppTypes";
import {UserDetails} from "../elements/UserDetails";
import {UserPassword} from "../elements/UserPassword";
import {UserEmailPreference} from "../elements/UserEmailPreferences";
import {validateDob, validateEmail} from "../../services/validation";
import {Link} from "react-router-dom";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {EXAM_BOARD} from "../../services/constants";
import {history} from "../../services/history"

const stateToProps = (state: AppState) => ({
    errorMessage: state ? state.error : null,
    userAuthSettings: state ? state.userAuthSettings : null,
    userPreferences: state ? state.userPreferences : null,
    firstLogin: history.location && history.location.state && history.location.state.firstLogin
});

const dispatchToProps = {
    updateCurrentUser,
    resetPassword,
};

interface AccountPageProps {
    user: LoggedInUser;
    errorMessage: ErrorState;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    userPreferences: UserPreferencesDTO | null;
    updateCurrentUser: (
        params: { registeredUser: LoggedInValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string },
        currentUser: LoggedInUser
    ) => void;
    firstLogin: boolean;
}

const AccountPageComponent = ({user, updateCurrentUser, errorMessage, userAuthSettings, userPreferences, firstLogin}: AccountPageProps) => {

    // Catch the (unlikely?) case where a user does not have email preferences in the database.
    if (userPreferences && !userPreferences.EMAIL_PREFERENCE) {
        userPreferences.EMAIL_PREFERENCE = { NEWS_AND_UPDATES: true, ASSIGNMENTS: true, EVENTS: true };
    }

    const [myUser, setMyUser] = useState(
        Object.assign({}, user, {password: ""})
    );
    const [myUserPreferences, setMyUserPreferences] = useState(
        userPreferences && userPreferences.EXAM_BOARD && Object.assign({}, userPreferences) || Object.assign({}, userPreferences, {EXAM_BOARD: {[EXAM_BOARD.AQA]: false, [EXAM_BOARD.OCR]: true}})
    );
    const [emailPreferences, setEmailPreferences] = useState(
        Object.assign({}, userPreferences ? userPreferences.EMAIL_PREFERENCE : { NEWS_AND_UPDATES: true, ASSIGNMENTS: true, EVENTS: true })
    );
    const [examPreferences, setExamPreferences] = useState(
        Object.assign({}, userPreferences && userPreferences.EXAM_BOARD ? userPreferences.EXAM_BOARD : {[EXAM_BOARD.AQA]: false, [EXAM_BOARD.OCR]: true})
    );
    const [isEmailValid, setIsEmailValid] = useState(
        !!user.loggedIn && !!user.email && validateEmail(user.email)
    );
    const [isDobValid, setIsDobValid] = useState(
        true
    );
    const [currentPassword, setCurrentPassword] = useState("");
    const [isNewPasswordConfirmed, setIsNewPasswordConfirmed] = useState(false);

    const [activeTab, setTab] = useState(0);

    {/• TODO handle #... in with react-router for tab url navigation? •/}

    return <Container id="account-page" className="mb-5">
        <BreadcrumbTrail currentPageTitle="My account" />
        <h1 className="h-title mb-4">My Account</h1>
        <h3 className="d-md-none text-center text-muted m-3">
            <small>
                Update your Isaac Computer Science account, or <Link to="/logout" className="text-secondary">Log out</Link>
            </small>
        </h3>
        {firstLogin &&
            <Alert color="success">
                Registration successful
            </Alert>
        }
        {user.loggedIn && myUser.loggedIn && // We can guarantee user and myUser are logged in from the route requirements
            <Card>
                <Nav tabs className="my-4">
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({ active: activeTab === 0 })}
                            onClick={() => setTab(0)} tabIndex={0}
                        >
                            Profile
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({ active: activeTab === 1 })}
                            onClick={() => setTab(1)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block d-md-block">Change Password</span>
                            <span className="d-block d-md-none">Password</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({ active: activeTab === 2 })}
                            onClick={() => setTab(2)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block d-md-block">Email Preferences</span>
                            <span className="d-block d-md-none">Email</span>
                        </NavLink>
                    </NavItem>
                </Nav>
                <Form name="my-account" onSubmit={(event: React.FormEvent<HTMLInputElement>) => {
                    event.preventDefault();
                    Object.assign(myUserPreferences.EMAIL_PREFERENCE, emailPreferences);
                    Object.assign(myUserPreferences.EXAM_BOARD, examPreferences);
                    if (isEmailValid && (isDobValid || myUser.dateOfBirth == undefined) && (!myUser.password || isNewPasswordConfirmed)) {
                        updateCurrentUser({
                            registeredUser: myUser,
                            userPreferences: myUserPreferences,
                            passwordCurrent: currentPassword
                        }, user)
                    }
                }}>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId={0}>
                            <UserDetails
                                myUser={myUser} setMyUser={setMyUser} examPreferences={examPreferences} setExamPreferences={setExamPreferences}
                                isDobValid={isDobValid} setIsDobValid={setIsDobValid}
                                isEmailValid={isEmailValid} setIsEmailValid={setIsEmailValid}
                            />
                        </TabPane>
                        <TabPane tabId={1}>
                            <UserPassword
                                currentUserEmail={user && user.email && user.email} userAuthSettings={userAuthSettings}
                                myUser={myUser} setMyUser={setMyUser}
                                setCurrentPassword={setCurrentPassword} currentPassword={currentPassword}
                                isNewPasswordConfirmed={isNewPasswordConfirmed} setIsNewPasswordConfirmed={setIsNewPasswordConfirmed}
                            />
                        </TabPane>
                        <TabPane tabId={2}>
                            <UserEmailPreference
                                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                            />
                        </TabPane>
                    </TabContent>

                    <CardFooter className="py-4">
                        <Row>
                            <Col>
                                <span className="d-block pb-3 pb-md-0 text-right text-md-left form-required">
                                    Required field
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col size={12} md={{size: 6, offset: 3}}>
                                {errorMessage && errorMessage.type === "generalError" &&
                                    <h3 role="alert" className="text-danger text-center">
                                        {errorMessage.generalError}
                                    </h3>
                                }
                                <Input type="submit" value="Save" className="btn btn-block btn-secondary border-0" />
                            </Col>
                        </Row>
                    </CardFooter>
                </Form>
            </Card>
        }
    </Container>;
};

export const MyAccount = connect(stateToProps, dispatchToProps)(AccountPageComponent);
