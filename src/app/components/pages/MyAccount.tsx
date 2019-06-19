import React, {useEffect, useState, useMemo} from 'react';
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
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {AppState, ErrorState} from "../../state/reducers";
import {updateCurrentUser, resetPassword} from "../../state/actions";
import {LoggedInUser, UserPreferencesDTO, LoggedInValidationUser, Toast} from "../../../IsaacAppTypes";
import {UserDetails} from "../elements/UserDetails";
import {UserPassword} from "../elements/UserPassword";
import {UserEmailPreference} from "../elements/UserEmailPreferences";
import {isDobOverThirteen, validateEmail, validatePassword} from "../../services/validation";
import queryString from "query-string";
import {Link} from "react-router-dom";
import {EXAM_BOARD, ACCOUNT_TAB} from "../../services/constants";
import {history} from "../../services/history"
import {showToast} from "../../state/actions";
import {TeacherConnectionsPanel} from "../elements/TeacherConnectionsPanel";
import {withRouter} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

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
    showToast,
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
    showToast: (toast: Toast) => void;
    hashAnchor: string | null;
    authToken: string | null;
}

const AccountPageComponent = ({user, updateCurrentUser, errorMessage, userAuthSettings, userPreferences, firstLogin, showToast, hashAnchor, authToken}: AccountPageProps) => {
    const editingSelf = true;

    if (userPreferences && !userPreferences.EMAIL_PREFERENCE) {
        userPreferences.EMAIL_PREFERENCE = { NEWS_AND_UPDATES: true, ASSIGNMENTS: true, EVENTS: true };
    }

    useEffect(() => {
        setMyUser(Object.assign({}, user, {password: ""}))
    }, [user]);

    // Inputs which trigger re-render
    const [attemptedAccountUpdate, setAttemptedAccountUpdate] = useState(false);
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
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    // @ts-ignore
    let initialTab: ACCOUNT_TAB =
        (authToken && ACCOUNT_TAB.teacherconnections) ||
        (hashAnchor && ACCOUNT_TAB[hashAnchor as any]) ||
        ACCOUNT_TAB.account;
    const [activeTab, setTab] = useState(initialTab);

    // Values derived from inputs (props and state)
    const isEmailValid = myUser.loggedIn && myUser.email && validateEmail(myUser.email) || validateEmail("");
    const isDobValid = myUser.loggedIn && myUser.dateOfBirth && isDobOverThirteen(new Date(myUser.dateOfBirth)) || false;
    const isNewPasswordConfirmed = (newPassword == newPasswordConfirm) && validatePassword(newPasswordConfirm);

    //Form's submission method
    const updateAccount = (event: React.FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        setAttemptedAccountUpdate(true);
        Object.assign({}, myUserPreferences.EMAIL_PREFERENCE || {}, emailPreferences);
        Object.assign({}, myUserPreferences.EXAM_BOARD || {}, examPreferences);
        if (myUser.loggedIn && isEmailValid && (isDobValid || myUser.dateOfBirth == undefined) &&
            (!myUser.password || isNewPasswordConfirmed)) {
            updateCurrentUser({
                registeredUser: myUser,
                userPreferences: myUserPreferences,
                passwordCurrent: currentPassword
            }, user);
        }
    };

    return <Container id="account-page" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="My account" className="mb-4" />
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
                <Nav tabs className="my-4 flex-wrap">
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({active: activeTab === ACCOUNT_TAB.account})}
                            onClick={() => setTab(ACCOUNT_TAB.account)} tabIndex={0}
                        >
                            Profile
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({active: activeTab === ACCOUNT_TAB.passwordreset})}
                            onClick={() => setTab(ACCOUNT_TAB.passwordreset)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block">Change Password</span>
                            <span className="d-block d-lg-none">Password</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({active: activeTab === ACCOUNT_TAB.teacherconnections})}
                            onClick={() => setTab(ACCOUNT_TAB.teacherconnections)} tabIndex={0}
                        >
                            <span className="d-none d-lg-block d-md-block">Teacher Connections</span>
                            <span className="d-block d-md-none">Connections</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={"mx-2 " + classnames({active: activeTab === ACCOUNT_TAB.emailpreferences})}
                            onClick={() => setTab(ACCOUNT_TAB.emailpreferences)} tabIndex={0}
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
                                myUser={myUser} setMyUser={setMyUser} examPreferences={examPreferences} setExamPreferences={setExamPreferences}
                                isDobValid={isDobValid} isEmailValid={isEmailValid} attemptedAccountUpdate={attemptedAccountUpdate}
                            />
                        </TabPane>
                        <TabPane tabId={ACCOUNT_TAB.passwordreset}>
                            <UserPassword
                                currentUserEmail={user && user.email && user.email} userAuthSettings={userAuthSettings}
                                myUser={myUser} setMyUser={setMyUser}
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
                                {/* TODO only show Save on relevant pages? */}
                                <Input type="submit" value="Save" className="btn btn-block btn-secondary border-0" />
                            </Col>
                        </Row>
                    </CardFooter>
                </Form>
            </Card>
        }
    </Container>;
};

export const MyAccount = withRouter(connect(stateToProps, dispatchToProps)(AccountPageComponent));
