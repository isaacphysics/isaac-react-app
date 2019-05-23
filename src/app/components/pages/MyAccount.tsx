import React, {useState, useEffect} from 'react';
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
import {updateCurrentUser, getUserAuthsettings, resetPassword, getUserPreferences} from "../../state/actions";
import {LoggedInUser, ValidationUser, UserPreferencesDTO} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState) => ({
    user: state ? state.user : null,
    errorMessage: state ? state.error : null,
    authSettings: state ? state.authSettings : null,
    userPreferences: state ? state.userPreferences : null
});

const dispatchToProps = {
    updateCurrentUser,
    getUserAuthsettings,
    resetPassword,
    getUserPreferences
};

interface AccountPageProps {
    user: LoggedInUser | null;
    updateCurrentUser: (
        params: { registeredUser: ValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string },
        currentUser: RegisteredUserDTO
    ) => void;
    errorMessage: ErrorState;
    getUserAuthsettings: () => void;
    authSettings: UserAuthenticationSettingsDTO | null;
    getUserPreferences: () => void;
    userPreferences: UserPreferencesDTO | null;
    resetPassword: (params: {email: string}) => void;
}


const AccountPageComponent = ({user, updateCurrentUser, errorMessage, authSettings, resetPassword, userPreferences}: AccountPageProps) => {
    const updateDetails = () => console.log("Account updated");

    const [myUser, setMyUser] = useState(Object.assign({}, user, {password: ""}));
    const [myUserPreferences, setMyUserPreferences] = useState(Object.assign({}, userPreferences));
    const [emailPreferences, setEmailPreferences] = useState(Object.assign({}, userPreferences ? userPreferences.EMAIL_PREFERENCE : null));

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
        setValidDob(
            myUser.loggedIn && !!myUser.dateOfBirth &&
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
        if (user && user.loggedIn && user.email) {
            resetPassword({email: user.email});
            setPasswordResetRequest(!passwordResetRequest);
        }
    };

    {/• TODO handle #... in with react-router for tab url navigation? •/}

    return <div id="account-page">
        <h1 className="h-title mb-4">My Account</h1>
        {user && user.loggedIn &&
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
                            <CardBody>
                                <Form name="userDetails" onSubmit={updateDetails}>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="first-name-input">First Name</Label>
                                                <Input
                                                    id="first-name-input" type="text" name="givenName"
                                                    defaultValue={myUser.loggedIn && myUser.givenName}
                                                    onChange={(e: any) => {setMyUser(Object.assign(myUser, {givenName: e.target.value}))}}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="last-name-input">Last Name</Label>
                                                <Input
                                                    id="last-name-input" type="text" name="last-name"
                                                    defaultValue={myUser.loggedIn && myUser.familyName}
                                                    onChange={(e: any) => {setMyUser(Object.assign(myUser, {familyName: e.target.value}))}}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="email-input">Email</Label>
                                                <Input
                                                    invalid={!isValidEmail} id="email-input" type="email"
                                                    name="email" defaultValue={myUser.loggedIn && myUser.email}
                                                    onChange={(e: any) => {
                                                        validateAndSetEmail(e);
                                                        (isValidEmail) ? setMyUser(Object.assign(myUser, {email: e.target.value})) : null
                                                    }}
                                                    aria-describedby="emailValidationMessage" required
                                                />
                                                <FormFeedback id="emailValidationMessage">
                                                    {(!isValidEmail) ? "Enter a valid email address" : null}
                                                </FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="dob-input">Date of Birth</Label>
                                                <Input
                                                    invalid={!isValidDob}
                                                    id="dob-input"
                                                    type="date"
                                                    name="date-of-birth"
                                                    defaultValue={myUser.loggedIn && myUser.dateOfBirth}
                                                    onChange={(event: any) => {
                                                        validateAndSetDob(event);
                                                    }}
                                                    aria-describedby ="ageValidationMessage"
                                                />
                                                <FormFeedback id="ageValidationMessage">
                                                    {(!isValidDob) ? "You must be over 13 years old" : null}
                                                </FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="dob-input">Gender</Label>
                                                <Row>
                                                    <Col size={6} lg={2}>
                                                        <CustomInput
                                                            id="gender-male" type="radio"
                                                            name="gender" label="Male"
                                                            defaultChecked={!!(myUser.loggedIn && myUser.gender == 'MALE')}
                                                            onChange={
                                                                (e: any) => {setMyUser(Object.assign(myUser, {gender: 'MALE'}))}
                                                            } required/>
                                                    </Col>
                                                    <Col size={6} lg={2}>
                                                        <CustomInput
                                                            id="gender-female" type="radio"
                                                            name="gender" label="Female"
                                                            defaultChecked={!!(myUser.loggedIn && myUser.gender == 'FEMALE')}
                                                            onChange={
                                                                (e: any) => {setMyUser(Object.assign(myUser, {gender: 'FEMALE'}))}
                                                            } required/>
                                                    </Col>
                                                    <Col size={6} lg={2}>
                                                        <CustomInput
                                                            id="gender-other" type="radio"
                                                            name="gender" label="Other"
                                                            defaultChecked={!!(myUser.loggedIn && myUser.gender == 'OTHER')}
                                                            onChange={
                                                                (e: any) => {setMyUser(Object.assign(myUser, {gender: 'OTHER'}))}
                                                            } required/>
                                                    </Col>
                                                </Row>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="school-input">School</Label>
                                                <Input
                                                    id="school-input" type="text" name="school"
                                                    defaultValue={myUser.loggedIn && myUser.schoolId} required
                                                />
                                                {/* TODO lookup school */}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="linked-accounts">Linked Accounts</Label>
                                                <Row>Placeholder</Row> {/* TODO add linked account control */}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                        </TabPane>
                        <TabPane tabId={1}>
                            <CardBody>
                                <Form name="userPassword" onSubmit={updateDetails}>
                                    {authSettings && authSettings.hasSegueAccount ?
                                        <div>
                                            <Col>
                                                <Row>
                                                    <FormGroup>
                                                        <Label htmlFor="password-input">Current Password</Label>
                                                        <Input
                                                            id="password-current" type="password" name="password"
                                                            onChange={(e: any) => setCurrentPassword(e.target.value)}
                                                            required
                                                        />
                                                    </FormGroup>
                                                </Row>
                                                <Row>
                                                    <FormGroup>
                                                        <Label htmlFor="password-input">New Password</Label>
                                                        <Input id="password" type="password" name="password" required/>
                                                    </FormGroup>
                                                </Row>
                                                <Row>
                                                    <FormGroup>
                                                        <Label htmlFor="password-confirm">Re-enter New Password</Label>
                                                        <Input
                                                            invalid={!isValidPassword} id="password-confirm"
                                                            type="password" name="password"
                                                            onChange={(e: any) => {
                                                                validateAndSetPassword(e);
                                                                (e.target.value == (document.getElementById("password") as HTMLInputElement).value) ?
                                                                    setMyUser(Object.assign(myUser, {password: e.target.value})) :
                                                                    null;
                                                            }} aria-describedby="passwordValidationMessage" required
                                                        />
                                                        <FormFeedback id="passwordValidationMessage">
                                                            {(!isValidPassword) ?
                                                                "Password must be at least 6 characters long" :
                                                                null}
                                                        </FormFeedback>
                                                    </FormGroup>
                                                </Row>
                                            </Col>
                                        </div> :
                                        !passwordResetRequest ?
                                            <div className="text-center">
                                                {authSettings && authSettings.linkedAccounts &&
                                                    <p>You do not currently have a password set for this account; you
                                                    sign in
                                                    using {(authSettings.linkedAccounts).map((linked, index) => (
                                                        <span key={index} className="text-capitalize">{linked.toLowerCase()}</span>
                                                    ))}.</p>
                                                }
                                                <Button className="btn-secondary" onClick={resetPasswordIfValidEmail}>
                                                    Click here to add a password
                                                </Button>
                                            </div>:
                                            <p>
                                                <strong className="d-block">Your password reset request is being processed.</strong>
                                                <strong className="d-block">Please check your inbox.</strong>
                                            </p>
                                    }
                                </Form>
                            </CardBody>
                        </TabPane>
                        <TabPane tabId={2}>
                            <CardBody>
                                <Form name="emailPreferences" onSubmit={updateDetails}>
                                    Tell us which emails you would like to receive. These settings can be changed at any time.
                                    <FormGroup>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Email Type</th>
                                                    <th>Description</th>
                                                    <th>Preference</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>News and Updates</td>
                                                    <td>New content and website feature updates, as well as interesting news about Isaac.</td>
                                                    <td>
                                                        <CustomInput
                                                            id="news" type="checkbox" name="news" color="$secondary" defaultChecked={emailPreferences ? emailPreferences.NEWS_AND_UPDATES : true}
                                                            onChange={(e: any) => setEmailPreferences(Object.assign(emailPreferences,{NEWS_AND_UPDATES: !emailPreferences.NEWS_AND_UPDATES}))}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Assignments</td>
                                                    <td>Get notified when your teacher gives your group a new assignment.</td>
                                                    <td>
                                                        <CustomInput
                                                            id="assignments" type="checkbox" name="assignments" defaultChecked={emailPreferences ? emailPreferences.ASSIGNMENTS : true}
                                                            onChange={(e: any) => setEmailPreferences(Object.assign(emailPreferences,{ASSIGNMENTS: !emailPreferences.ASSIGNMENTS}))}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Events</td>
                                                    <td>Information about new virtual or real world physics events.</td>
                                                    <td>
                                                        <CustomInput
                                                            className="CustomInput" id="events" type="checkbox" name="events"
                                                            defaultChecked={emailPreferences ? emailPreferences.EVENTS : true}
                                                            onChange={(e: any) => setEmailPreferences(Object.assign(emailPreferences,{EVENTS: !emailPreferences.EVENTS}))}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </FormGroup>
                                </Form>
                            </CardBody>
                        </TabPane>
                    </TabContent>
                    <CardFooter>
                        <Row>
                            <Col size={12} md={{size: 6, offset: 3}}>
                                <h3 role="alert" className="text-danger text-center">
                                    {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                                </h3>
                                <Button
                                    color="secondary" onClick={() => {
                                        Object.assign(myUserPreferences.EMAIL_PREFERENCE, emailPreferences);
                                        (isValidEmail && isValidDob && isValidPassword) ?
                                            updateCurrentUser({registeredUser: myUser, userPreferences: myUserPreferences, passwordCurrent: currentPassword}, user) :
                                            null}}
                                    block >
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
