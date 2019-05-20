import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Button,
    Card,
    CardBody,
    CardTitle,
    CardText,
    CardFooter,
    Col,
    CustomInput,
    Form,
    FormGroup,
    Input,
    Row,
    Label,
    Table,
    FormFeedback
} from "reactstrap";
import {RegisteredUserDTO, UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {updateCurrentUser, getUserAuthsettings, resetPassword} from "../../state/actions";
import classnames from 'classnames';
import {ValidationUser} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState) => ({
    user: state ? state.user : null,
    errorMessage: state ? state.error : null,
    authSettings: state ? state.authSettings : null
});

const dispatchToProps = {
    updateCurrentUser,
    getUserAuthsettings,
    resetPassword
};

interface AccountPageProps {
    user: RegisteredUserDTO | null
    updateCurrentUser: (
        params: { registeredUser: ValidationUser; passwordCurrent: string },
        currentUser: RegisteredUserDTO
    ) => void
    errorMessage: string | null,
    getUserAuthsettings: () => void
    authSettings: UserAuthenticationSettingsDTO | null
    resetPassword: (params: {email: string}) => void;
};


const AccountPageComponent = ({user, updateCurrentUser, errorMessage, getUserAuthsettings, authSettings, resetPassword}: AccountPageProps) => {
    const updateDetails = () => console.log("Account updated");

    const emailPreferences = {"NEWS_AND_UPDATES": true, "ASSIGNMENTS": true, "EVENTS": true};

    const [myUser, setMyUser] = useState(Object.assign({}, user, {password: ""}));
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
        console.log(isValidEmail);
    };

    const validateAndSetDob = (event: any) => {
        setValidDob((myUser.dateOfBirth != undefined) &&
        ((new Date(String(event.target.value)).getTime()/1000) <= thirteenYearsAgo));
        console.log(isValidDob);
    };

    const validateAndSetPassword = (event: any) => {
        setValidPassword(
            (event.target.value == (document.getElementById("password") as HTMLInputElement).value) &&
                ((document.getElementById("password") as HTMLInputElement).value != undefined) &&
                ((document.getElementById("password") as HTMLInputElement).value.length > 5)
        );
        console.log(isValidPassword);
    };

    const resetPasswordIfValidEmail = () => {
        if (user && user.email) {
            resetPassword({email: user.email});
            setPasswordResetRequest(!passwordResetRequest);
        }
    };

    useEffect(() => {
        setMyUser(Object.assign({}, user, {password: ""}));
        const thisAuthSettings = getUserAuthsettings();
        const userAuth = authSettings;
    }, [user]);

    {/• TODO handle #... in with react-router for tab url navigation? •/}

    return <div id="account-page">
        <h1 className="h-title">My Account</h1>
        {user &&
            <div>
                <Card>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === 0 })}
                                onClick={() => setTab(0)}
                            >
                                Profile
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === 1 })}
                                onClick={() => setTab(1)}
                            >
                                <span className="d-none d-lg-block d-md-block">Change Password</span>
                                <span className="d-block d-md-none">Password</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === 2 })}
                                onClick={() => setTab(2)}
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
                                                <Input id="first-name-input" type="text" name="givenName"
                                                       defaultValue={myUser.givenName}
                                                       onChange={(e: any) => {setMyUser(Object.assign(myUser, {givenName: e.target.value}))}}
                                                       required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="last-name-input">Last Name</Label>
                                                <Input id="last-name-input" type="text" name="last-name"
                                                       defaultValue={myUser.familyName}
                                                       onChange={(e: any) => {setMyUser(Object.assign(myUser, {familyName: e.target.value}))}}
                                                       required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="email-input">Email</Label>
                                                <Input invalid={!isValidEmail} id="email-input" type="email"
                                                       name="email" defaultValue={myUser.email}
                                                       onChange={(e: any) => {
                                                           validateAndSetEmail(e);
                                                           (isValidEmail) ? setMyUser(Object.assign(myUser, {email: e.target.value})) : null
                                                       }}
                                                       aria-describedby="emailValidationMessage" required/>
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
                                                    defaultValue={myUser.dateOfBirth}
                                                    onChange={(e: any) => {
                                                        validateAndSetDob;
                                                        (isValidDob) ? setMyUser(Object.assign(myUser, {dateOfBirth: e.target.value})) : null
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
                                                        <CustomInput id="gender-male" type="radio"
                                                                     name="gender" label="Male"
                                                                     defaultChecked={myUser.gender == 'MALE'}
                                                                     onClick={
                                                                         (e: any) => {setMyUser(Object.assign(myUser, {gender: 'MALE'}))}
                                                                     } required/>
                                                    </Col>
                                                    <Col size={6} lg={2}>
                                                        <CustomInput id="gender-female" type="radio"
                                                                     name="gender" label="Female"
                                                                     defaultChecked={myUser.gender == 'FEMALE'}
                                                                     onClick={
                                                                         (e: any) => {setMyUser(Object.assign(myUser, {gender: 'FEMALE'}))}
                                                                     } required/>
                                                    </Col>
                                                    <Col size={6} lg={2}>
                                                        <CustomInput id="gender-other" type="radio"
                                                                     name="gender" label="Other"
                                                                     defaultChecked={myUser.gender == 'OTHER'}
                                                                     onClick={
                                                                         (e: any) => {setMyUser(Object.assign(myUser, {gender: 'OTHER'}))}
                                                                     } required/>
                                                    </Col>
                                                </Row>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="school-input">School</Label>
                                                <Input id="school-input" type="text" name="school"
                                                       defaultValue={myUser.schoolId} required/>
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
                                                <Row>
                                                    <FormGroup>
                                                        <Label htmlFor="password-input">Current Password</Label>
                                                        <Input id="password-current" type="password" name="password"
                                                               onChange={(e: any) => setCurrentPassword(e.target.value)}
                                                               required/>
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
                                                        <Input invalid={!isValidPassword} id="password-confirm"
                                                               type="password" name="password"
                                                               onChange={(e: any) => {
                                                                   validateAndSetPassword(e);
                                                                   (e.target.value == (document.getElementById("password") as HTMLInputElement).value) ?
                                                                       setMyUser(Object.assign(myUser, {password: e.target.value})) :
                                                                       null;
                                                               }} aria-describedby="passwordValidationMessage" required/>
                                                        <FormFeedback id="passwordValidationMessage">
                                                            {(!isValidPassword) ?
                                                                "Password must be at least 6 characters long" :
                                                                null}
                                                        </FormFeedback>
                                                    </FormGroup>
                                                </Row>
                                            </div> :
                                            !passwordResetRequest ?
                                                <div>
                                                    <p>You do not currently have a password set for this account; you sign in using</p>
                                                    <Button color="link" onClick={resetPasswordIfValidEmail}>
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
                        {/*TODO move default and defined email pref to redux*/}
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
                                                    <td><CustomInput id="news" type="checkbox" name="news" defaultChecked={emailPreferences.NEWS_AND_UPDATES}/></td>
                                                </tr>
                                                <tr>
                                                    <td>Assignments</td>
                                                    <td>Get notified when your teacher gives your group a new assignment.</td>
                                                    <td><CustomInput id="assignments" type="checkbox" name="assignments" defaultChecked={emailPreferences.ASSIGNMENTS}/></td>
                                                </tr>
                                                <tr>
                                                    <td>Events</td>
                                                    <td>Information about new virtual or real world physics events.</td>
                                                    <td><CustomInput id="events" type="checkbox" name="events" defaultChecked={emailPreferences.EVENTS}/></td>
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
                                <h3 role="alert" className="text-danger text-center">{errorMessage}</h3>
                                <Button color="secondary" onClick={() => {
                                        (isValidEmail && isValidDob && isValidPassword) ?
                                            updateCurrentUser({registeredUser: myUser, passwordCurrent: currentPassword}, user) :
                                        console.log("nope")}}
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
