import React, {useMemo, useState} from 'react';
import {connect} from "react-redux";
import classnames from "classnames";
import {
    Alert,
    Card,
    CardFooter,
    Col,
    Container,
    Form,
    Input,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
} from "reactstrap";
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {AppState, ErrorState} from "../../state/reducers";
import {resetPassword, updateCurrentUser} from "../../state/actions";
import {
    LoggedInUser,
    LoggedInValidationUser,
    UserEmailPreferences,
    UserExamPreferences,
    UserPreferencesDTO
} from "../../../IsaacAppTypes";
import {UserDetails} from "../elements/UserDetails";
import {UserPassword} from "../elements/UserPassword";
import {UserEmailPreference} from "../elements/UserEmailPreferences";
import {isDobOverThirteen, validateEmail, validateEmailPreferences, validatePassword} from "../../services/validation";
import queryString from "query-string";
import {Link, withRouter} from "react-router-dom";
import {ACCOUNT_TAB} from "../../services/constants";
import {history} from "../../services/history"
import {TeacherConnectionsPanel} from "../elements/TeacherConnectionsPanel";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {FIRST_LOGIN_STATE} from "../../services/firstLogin";

const stateToProps = (state: AppState, props: any) => {
    const {location: {search, hash}} = props;
    const searchParams = queryString.parse(search);
    return {
        errorMessage: state ? state.error : null,
        userAuthSettings: state ? state.userAuthSettings : null,
        userPreferences: state ? state.userPreferences : null,
        firstLogin: history.location && history.location.state && history.location.state.firstLogin,
        hashAnchor: (hash && hash.slice(1)) || null,
        authToken: (searchParams && searchParams.authToken) ? (searchParams.authToken as string) : null
    }
};

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
        updatedUser: LoggedInValidationUser,
        updatedUserPreferences: UserPreferencesDTO,
        passwordCurrent: string | null,
        currentUser: LoggedInUser
    ) => void;
    firstLogin: boolean;
    hashAnchor: string | null;
    authToken: string | null;
}

const AccountPageComponent = ({user, updateCurrentUser, errorMessage, userAuthSettings, userPreferences, firstLogin, hashAnchor, authToken}: AccountPageProps) => {
    const editingSelf = true;

    // Inputs which trigger re-render
    const [attemptedAccountUpdate, setAttemptedAccountUpdate] = useState(false);

    // - Copy of user to store changes before saving
    const [updatedUser, setUpdatedUser] = useState(Object.assign({}, user, {password: ""}));
    useMemo(() => {setUpdatedUser(Object.assign({}, user, {password: ""}))}, [user]);

    // - Passwords
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    // - User preferences
    const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences>({});
    const [examPreferences, setExamPreferences] = useState<UserExamPreferences>({});
    const [myUserPreferences, setMyUserPreferences] = useState<UserPreferencesDTO>({});

    useMemo(() => {
        const currentEmailPreferences = (userPreferences && userPreferences.EMAIL_PREFERENCE) ? userPreferences.EMAIL_PREFERENCE : {};
        const currentExamPreferences = (userPreferences && userPreferences.EXAM_BOARD) ? userPreferences.EXAM_BOARD : {};
        const currentUserPreferences = {EMAIL_PREFERENCE: currentEmailPreferences, EXAM_BOARD: currentExamPreferences};

        setEmailPreferences(currentEmailPreferences);
        setExamPreferences(currentExamPreferences);
        setMyUserPreferences(currentUserPreferences);
    }, [userPreferences]);


    // Set active tab using hash anchor
    const [activeTab, setActiveTab] = useState(ACCOUNT_TAB.account);
    useMemo(() => {
        // @ts-ignore
        let tab: ACCOUNT_TAB =
            (authToken && ACCOUNT_TAB.teacherconnections) ||
            (hashAnchor && ACCOUNT_TAB[hashAnchor as any]) ||
            ACCOUNT_TAB.account;
        setActiveTab(tab);
    }, [hashAnchor, authToken]);

    // Show registration successful banner once
    const [bannerShown, _] = useState((persistence.session.load(KEY.FIRST_LOGIN) === FIRST_LOGIN_STATE.BANNER_SHOWN));
    persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.BANNER_SHOWN);

    // Values derived from inputs (props and state)
    const isNewPasswordConfirmed = (newPassword == newPasswordConfirm) && validatePassword(newPasswordConfirm);

    // Form's submission method
    const updateAccount = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedAccountUpdate(true);

        // Only update email preferences on the email preferences tab
        if (activeTab == ACCOUNT_TAB.emailpreferences) {
            if (validateEmailPreferences(emailPreferences)) {
                Object.assign(myUserPreferences.EMAIL_PREFERENCE, emailPreferences);
            } else {
                return; // early exit
            }
        }
        Object.assign(myUserPreferences.EXAM_BOARD, examPreferences);

        if (updatedUser.loggedIn &&
            validateEmail(updatedUser.email) &&
            (isDobOverThirteen(updatedUser.dateOfBirth) || updatedUser.dateOfBirth === undefined) &&
            (!updatedUser.password || isNewPasswordConfirmed)) {
            updateCurrentUser(updatedUser, myUserPreferences, currentPassword, user);
        }
    };

    return <Container id="account-page" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="My Account" className="mb-4" />
        <h3 className="d-md-none text-center text-muted m-3">
            <small>
                Update your Isaac Computer Science account, or <Link to="/logout" className="text-secondary">Log out</Link>
            </small>
        </h3>

        {firstLogin && !bannerShown && <Alert color="success">
            Registration successful
        </Alert>}

        {user.loggedIn && updatedUser.loggedIn && // We can guarantee user and myUser are logged in from the route requirements
            <Card>
                <Nav tabs className="my-4 flex-wrap">
                    <NavItem>
                        <NavLink
                            className={classnames({"mx-2": true, active: activeTab === ACCOUNT_TAB.account})}
                            onClick={() => setActiveTab(ACCOUNT_TAB.account)} tabIndex={0}
                        >
                            Profile
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({"mx-2": true, active: activeTab === ACCOUNT_TAB.passwordreset})}
                            onClick={() => setActiveTab(ACCOUNT_TAB.passwordreset)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block">Change Password</span>
                            <span className="d-block d-lg-none">Password</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({"mx-2": true, active: activeTab === ACCOUNT_TAB.teacherconnections})}
                            onClick={() => setActiveTab(ACCOUNT_TAB.teacherconnections)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block d-md-block">Teacher Connections</span>
                            <span className="d-block d-md-none">Connections</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({"mx-2": true, active: activeTab === ACCOUNT_TAB.emailpreferences})}
                            onClick={() => setActiveTab(ACCOUNT_TAB.emailpreferences)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block">Email Preferences</span>
                            <span className="d-block d-lg-none">Emails</span>
                        </NavLink>
                    </NavItem>
                </Nav>

                <Form name="my-account" onSubmit={updateAccount}>
                    <TabContent activeTab={activeTab}>

                        <TabPane tabId={ACCOUNT_TAB.account}>
                            <UserDetails
                                myUser={updatedUser} setMyUser={setUpdatedUser}
                                examPreferences={examPreferences} setExamPreferences={setExamPreferences}
                                attemptedAccountUpdate={attemptedAccountUpdate}
                            />
                        </TabPane>

                        <TabPane tabId={ACCOUNT_TAB.passwordreset}>
                            <UserPassword
                                currentUserEmail={user && user.email && user.email} userAuthSettings={userAuthSettings}
                                myUser={updatedUser} setMyUser={setUpdatedUser}
                                setCurrentPassword={setCurrentPassword} currentPassword={currentPassword}
                                isNewPasswordConfirmed={isNewPasswordConfirmed} newPasswordConfirm={newPasswordConfirm}
                                setNewPassword={setNewPassword} setNewPasswordConfirm={setNewPasswordConfirm}
                            />
                        </TabPane>

                        <TabPane tabId={ACCOUNT_TAB.teacherconnections}>
                            {editingSelf && <TeacherConnectionsPanel user={user} authToken={authToken} />}
                        </TabPane>

                        <TabPane tabId={ACCOUNT_TAB.emailpreferences}>
                            <UserEmailPreference
                                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                                submissionAttempted={attemptedAccountUpdate}
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
                                {/* Teacher connections does not have a save */}
                                <Input
                                    type="submit" value="Save" className="btn btn-block btn-secondary border-0"
                                    disabled={activeTab === ACCOUNT_TAB.teacherconnections}
                                />
                            </Col>
                        </Row>
                    </CardFooter>
                </Form>
            </Card>
        }
        <Row className="text-muted text-center mt-3">
            <Col>
                If you would like to delete your account please <a href="/contact?preset=accountDeletion" target="_blank" rel="noopener noreferrer">contact us</a>.
            </Col>
        </Row>
    </Container>;
};

export const MyAccount = withRouter(connect(stateToProps, dispatchToProps)(AccountPageComponent));
