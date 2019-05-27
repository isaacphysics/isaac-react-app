import React, {useState} from 'react';
import {connect} from "react-redux";
import classnames from "classnames";
import {
    Button,
    CustomInput,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Card,
    CardBody,
    CardFooter,
    Col,
    Form,
    FormGroup,
    Input,
    Row,
    Label,
    FormFeedback,
    Table
} from "reactstrap";
import {RegisteredUserDTO, UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {AppState, ErrorState} from "../../state/reducers";
import {updateCurrentUser, resetPassword} from "../../state/actions";
import {LoggedInUser, ValidationUser, UserPreferencesDTO, LoggedInValidationUser} from "../../../IsaacAppTypes";
import {UserDetails} from "../elements/UserDetails";
import {UserPassword} from "../elements/UserPassword";
import {UserEmailPreference} from "../elements/UserEmailPreferences";
import {validateDob, validateEmail} from "../../services/validation";

const stateToProps = (state: AppState) => ({
    errorMessage: state ? state.error : null,
    userAuthSettings: state ? state.userAuthSettings : null,
    userPreferences: state ? state.userPreferences : null
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
}

const AccountPageComponent = ({user, updateCurrentUser, errorMessage, userAuthSettings, userPreferences}: AccountPageProps) => {

    const [myUser, setMyUser] = useState(
        Object.assign({}, user, {password: ""})
    );
    const [myUserPreferences, setMyUserPreferences] = useState(
        Object.assign({}, userPreferences)
    );
    const [emailPreferences, setEmailPreferences] = useState(
        Object.assign({}, userPreferences ? userPreferences.EMAIL_PREFERENCE : null)
    );

    const [isEmailValid, setIsEmailValid] = useState(
        !!user.loggedIn && !!user.email && validateEmail(user.email)
    );
    const [isDobValid, setIsDobValid] = useState(
        !!user.loggedIn && !!user.dateOfBirth && validateDob(user.dateOfBirth.toString())
    );
    const [currentPassword, setCurrentPassword] = useState("");
    const [isNewPasswordConfirmed, setIsNewPasswordConfirmed] = useState(false);

    const [activeTab, setTab] = useState(0);

    {/• TODO handle #... in with react-router for tab url navigation? •/}

    return <div id="account-page" className="mt-4 mb-5">
        <h1 className="h-title mb-4">My Account</h1>
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
                    if (isEmailValid && isDobValid && (!myUser.password || isNewPasswordConfirmed)) {
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
                                myUser={myUser} setMyUser={setMyUser}
                                isDobValid={isDobValid} setIsDobValid={setIsDobValid}
                                isEmailValid={isEmailValid} setIsEmailValid={setIsEmailValid}
                            />
                        </TabPane>
                        <TabPane tabId={1}>
                            <UserPassword
                                currentUserEmail={user && user.email && user.email} userAuthSettings={userAuthSettings}
                                myUser={myUser} setMyUser={setMyUser}
                                setCurrentPassword={setCurrentPassword}
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
    </div>;
};

export const MyAccount = connect(stateToProps, dispatchToProps)(AccountPageComponent);
