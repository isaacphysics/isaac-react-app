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
import {LoggedInUser, ValidationUser, UserPreferencesDTO} from "../../../IsaacAppTypes";
import {UserDetails} from "../elements/UserDetails";
import {UserPassword} from "../elements/UserPassword";
import {UserEmailPreference} from "../elements/UserEmailPreferences";

const stateToProps = (state: AppState) => ({
    errorMessage: state ? state.error : null,
    authSettings: state ? state.authSettings : null,
    userPreferences: state ? state.userPreferences : null
});

const dispatchToProps = {
    updateCurrentUser,
    resetPassword,
};

interface AccountPageProps {
    user: LoggedInUser;
    errorMessage: ErrorState;
    authSettings: UserAuthenticationSettingsDTO | null;
    userPreferences: UserPreferencesDTO | null;
    updateCurrentUser: (
        params: { registeredUser: ValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string },
        currentUser: RegisteredUserDTO
    ) => void;
    resetPassword: (params: {email: string}) => void;
}


const AccountPageComponent = ({user, updateCurrentUser, errorMessage, authSettings, resetPassword, userPreferences}: AccountPageProps) => {

    const [myUser, setMyUser] = useState(
        Object.assign({}, user, {password: ""})
    );
    const [myUserPreferences, setMyUserPreferences] = useState(
        Object.assign({}, userPreferences)
    );
    const [emailPreferences, setEmailPreferences] = useState(
        Object.assign({}, userPreferences ? userPreferences.EMAIL_PREFERENCE : null)
    );

    const [isValidEmail, setValidEmail] = useState(true);
    const [isValidDob, setValidDob] = useState(true);
    const [isValidPassword, setValidPassword] = useState(true);

    const [currentPassword, setCurrentPassword] = useState("");
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);
    const [activeTab, setTab] = useState(0);

    let today = new Date();
    let thirteenYearsAgo = Date.UTC(today.getFullYear() - 13, today.getMonth(), today.getDate())/1000;

    const validateAndSetEmail = (event: any) => {
        setValidEmail((event.target.value.length > 0 && event.target.value.includes("@")));
    };

    const validateAndSetDob = (event: any) => {
        setValidDob(myUser.loggedIn && !!myUser.dateOfBirth &&
            ((new Date(String(event.target.value)).getTime()/1000) <= thirteenYearsAgo)
        );
    };

    const validateAndSetPassword = (event: any) => {
        setValidPassword(
            (event.target.value == (document.getElementById("password") as HTMLInputElement).value) &&
                ((document.getElementById("password") as HTMLInputElement).value != undefined) &&
                ((document.getElementById("password") as HTMLInputElement).value.length > 5)
        );
    };

    const resetPasswordIfValidEmail = () => {
        if (user.loggedIn && user.email) {
            resetPassword({email: user.email});
            setPasswordResetRequest(!passwordResetRequest);
        }
    };

    {/• TODO handle #... in with react-router for tab url navigation? •/}

    return <div id="account-page">
        <h1 className="h-title mb-4">My Account</h1>
        {user.loggedIn && myUser.loggedIn && // We can guarantee user and myUser are logged in from the route requirements
            <div>
                <Card>
                    <Nav tabs className="my-4">
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === 0 })}
                                onClick={() => setTab(0)} tabIndex={0}
                            >
                                Profile
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === 1 })}
                                onClick={() => setTab(1)} tabIndex={0}
                            >
                                <span className="d-none d-lg-block d-md-block">Change Password</span>
                                <span className="d-block d-md-none">Password</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === 2 })}
                                onClick={() => setTab(2)} tabIndex={0}
                            >
                                <span className="d-none d-lg-block d-md-block">Email Preferences</span>
                                <span className="d-block d-md-none">Email</span>
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId={0}>
                            <UserDetails
                                myUser={myUser} setMyUser={setMyUser}
                                isValidDob={isValidDob} isValidEmail={isValidEmail}
                                validateAndSetDob={validateAndSetDob} validateAndSetEmail={validateAndSetEmail}
                            />
                        </TabPane>
                        <TabPane tabId={1}>
                            <UserPassword
                                myUser={myUser} authSettings={authSettings} isValidPassword={isValidPassword}
                                passwordResetRequest={passwordResetRequest} resetPasswordIfValidEmail={resetPasswordIfValidEmail}
                                setCurrentPassword={setCurrentPassword} setMyUser={setMyUser}
                                validateAndSetPassword={validateAndSetPassword}
                            />
                        </TabPane>
                        <TabPane tabId={2}>
                            <UserEmailPreference
                                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                            />
                        </TabPane>
                    </TabContent>

                    <CardFooter>
                        <Row>
                            <Col size={12} md={{size: 6, offset: 3}}>
                                <h3 role="alert" className="text-danger text-center">
                                    {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                                </h3>
                                <Button
                                    color="secondary" block
                                    onClick={() => {
                                        Object.assign(myUserPreferences.EMAIL_PREFERENCE, emailPreferences);
                                        isValidEmail && isValidDob && isValidPassword &&
                                            updateCurrentUser({
                                                registeredUser: myUser,
                                                userPreferences: myUserPreferences,
                                                passwordCurrent: currentPassword
                                            }, user);
                                    }}>
                                    Save
                                </Button>
                            </Col>
                        </Row>
                    </CardFooter>
                </Card>
            </div>
        }
    </div>;
};

export const MyAccount = connect(stateToProps, dispatchToProps)(AccountPageComponent);
