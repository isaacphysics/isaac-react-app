import React, {useEffect, useMemo, useState, Suspense, lazy} from 'react';
import {connect} from "react-redux";
import classnames from "classnames";
import classNames from "classnames";
import {
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
import {UserAuthenticationSettingsDTO, UserContext} from "../../../IsaacApiTypes";
import {
    AppState,
    errorSlice,
    ErrorState,
    getChosenUserAuthSettings,
    resetPassword,
    showErrorToast,
    updateCurrentUser,
    useAdminGetUserQuery,
    useAppDispatch
} from "../../state";
import {
    BooleanNotation,
    DisplaySettings,
    PotentialUser,
    ProgrammingLanguage,
    UserPreferencesDTO
} from "../../../IsaacAppTypes";
import {UserDetails} from "../elements/panels/UserDetails";
import {UserPassword} from "../elements/panels/UserPassword";
import {useEmailPreferenceState, UserEmailPreference} from "../elements/panels/UserEmailPreferences";
import {
    ACCOUNT_TAB,
    allRequiredInformationIsPresent,
    history,
    ifKeyIsEnter,
    isAda,
    isDefined,
    isDobOldEnoughForSite,
    isPhy,
    isStaff,
    SITE_TITLE, siteSpecific,
    validateEmail,
    validateEmailPreferences,
    validatePassword
} from "../../services";
import queryString from "query-string";
import {Link, withRouter} from "react-router-dom";
import {TeacherConnections} from "../elements/panels/TeacherConnections";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShowLoading} from "../handlers/ShowLoading";
import {UserBetaFeatures} from "../elements/panels/UserBetaFeatures";
import hash, {NormalOption} from "object-hash";
import {skipToken} from "@reduxjs/toolkit/query";
import { Loading } from "../handlers/IsaacSpinner";

const UserMFA = lazy(() => import("../elements/panels/UserMFA"));

const stateToProps = (state: AppState, props: any) => {
    const {location: {search, hash}} = props;
    const searchParams = queryString.parse(search);
    return {
        error: state?.error ?? null,
        userAuthSettings: state?.userAuthSettings ?? null,
        userPreferences: state?.userPreferences ?? null,
        firstLogin: (history?.location?.state as { firstLogin: any } | undefined)?.firstLogin,
        hashAnchor: hash?.slice(1) ?? null,
        authToken: searchParams?.authToken as string ?? null,
        userOfInterest: searchParams?.userId as string ?? null
    }
};

const dispatchToProps = {
    resetPassword,
    getChosenUserAuthSettings,
};

interface AccountPageProps {
    user: PotentialUser;
    error: ErrorState;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    getChosenUserAuthSettings: (userid: number) => void;
    userPreferences: UserPreferencesDTO | null;
    firstLogin: boolean;
    hashAnchor: string | null;
    authToken: string | null;
    userOfInterest: string | null;
}

// The order of the first two arguments doesn't matter really, but sticking to it helps with debugging when something
// on this page inevitably goes wrong
function hashEqual<T>(current: NonNullable<T>, prev: NonNullable<T>, options?: NormalOption, debug?: boolean) {
    if (debug) {
        console.log("New", current);
        console.log("Old", prev);
    }
    const equal = hash(current, options) === hash(prev, options);
    if (debug) console.log("Equal?:", equal);
    return equal;
}

const AccountPageComponent = ({user, getChosenUserAuthSettings, error, userAuthSettings, userPreferences, hashAnchor, authToken, userOfInterest}: AccountPageProps) => {
    const dispatch = useAppDispatch();

    const {data: adminUserToEdit} = useAdminGetUserQuery(userOfInterest ? Number(userOfInterest) : skipToken);
    // Memoising this derived field is necessary so that it can be used as a dependency to a useEffect later.
    // Otherwise, it is a new object on each re-render and the useEffect is constantly re-triggered.
    const userToEdit = useMemo(function wrapUserWithLoggedInStatus() {
        return adminUserToEdit ? {...adminUserToEdit, loggedIn: true} : {loggedIn: false}
    }, [adminUserToEdit]);

    useEffect(() => {
        if (userOfInterest) {
            getChosenUserAuthSettings(Number(userOfInterest));
        }
    }, [userOfInterest]);

    // - Admin user modification
    const editingOtherUser = !!userOfInterest && user && user.loggedIn && user?.id?.toString() !== userOfInterest || false;

    // - Copy of user to store changes before saving
    const [userToUpdate, setUserToUpdate] = useState<any>(
        editingOtherUser && userToEdit ?
            {...userToEdit, loggedIn: true, password: ""} :
            {...user, password: ""}
    );
    const userChanged = useMemo(() => !hashEqual({...(editingOtherUser ? userToEdit : user), password: ""}, userToUpdate), [userToUpdate, userToEdit, user, editingOtherUser]);

    // This is necessary for updating the user when the user updates fields from the required account info modal, for example.
    useEffect(function keepUserInSyncWithChangesElsewhere() {
        if (editingOtherUser && userToEdit) {
            setUserToUpdate({...userToEdit, loggedIn: true});
        } else if (user) {
            setUserToUpdate({...user, password: ""});
        }
    }, [user, editingOtherUser, userToEdit]);

    // Inputs which trigger re-render
    const [attemptedAccountUpdate, setAttemptedAccountUpdate] = useState(false);
    const [saving, setSaving] = useState(false);

    // - Passwords
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    // - User preferences
    const [emailPreferences, setEmailPreferences] = useEmailPreferenceState(userPreferences?.EMAIL_PREFERENCE);
    const [myUserPreferences, setMyUserPreferences] = useState<UserPreferencesDTO | null | undefined>({});
    const emailPreferencesChanged = useMemo(() => !hashEqual(userPreferences?.EMAIL_PREFERENCE ?? {}, emailPreferences ?? myUserPreferences?.EMAIL_PREFERENCE ?? {}), [emailPreferences, myUserPreferences, userPreferences]);
    const otherPreferencesChanged = useMemo(() => !hashEqual(userPreferences ?? {}, myUserPreferences ?? {}, {excludeKeys: k => k === "EMAIL_PREFERENCE"}), [myUserPreferences, userPreferences]);

    // - User Contexts
    const [userContextsToUpdate, setUserContextsToUpdate] =
        useState<UserContext[]>(userToUpdate.registeredContexts?.length ? [...userToUpdate.registeredContexts] : [{}]);
    useEffect(function keepUserContextsUpdated() {
        setUserContextsToUpdate(userToUpdate.registeredContexts?.length ? [...userToUpdate.registeredContexts] : [{}]);
    }, [userToUpdate?.registeredContexts]);
    const contextsChanged = useMemo(() => !hashEqual(userToUpdate?.registeredContexts?.length ? userToUpdate?.registeredContexts : [{}], userContextsToUpdate, {unorderedArrays: true}), [userContextsToUpdate, userToUpdate]);

    const pageTitle = editingOtherUser ? "Edit user" : "My account";

    useEffect(() => {
        setEmailPreferences(userPreferences?.EMAIL_PREFERENCE);
        setMyUserPreferences(userPreferences);
    }, [userPreferences]);

    // Set active tab using hash anchor
    const [activeTab, setActiveTab] = useState(ACCOUNT_TAB.account);
    useEffect(() => {
        // @ts-ignore
        const tab: ACCOUNT_TAB =
            (authToken && ACCOUNT_TAB.teacherconnections) ||
            (hashAnchor && ACCOUNT_TAB[hashAnchor as any]) ||
            ACCOUNT_TAB.account;
        setActiveTab(tab);
    }, [hashAnchor, authToken]);

    // Values derived from inputs (props and state)
    const isNewPasswordConfirmed = (newPassword == newPasswordConfirm) && validatePassword(newPasswordConfirm);

    function setProgrammingLanguage(newProgrammingLanguage: ProgrammingLanguage) {
        setMyUserPreferences({...myUserPreferences, PROGRAMMING_LANGUAGE: newProgrammingLanguage});
    }

    function setBooleanNotation(newBooleanNotation: BooleanNotation) {
        setMyUserPreferences({...myUserPreferences, BOOLEAN_NOTATION: newBooleanNotation});
    }

    function setDisplaySettings(newDisplaySettings: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) {
        setMyUserPreferences(oldPref => ({
            ...oldPref,
            DISPLAY_SETTING: typeof newDisplaySettings === "function"
                ? newDisplaySettings(oldPref?.DISPLAY_SETTING)
                : newDisplaySettings
        }));
    }

    const accountInfoChanged = contextsChanged || userChanged || otherPreferencesChanged || (emailPreferencesChanged && activeTab == ACCOUNT_TAB.emailpreferences);
    useEffect(() => {
        if (accountInfoChanged && !saving) {
            return history.block("If you leave this page without saving, your account changes will be lost. Are you sure you would like to leave?");
        }
    }, [accountInfoChanged, saving]);

    // Form's submission method
    function updateAccount(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setAttemptedAccountUpdate(true);
        setSaving(true);

        let newPreferences = {...myUserPreferences};

        // Only update email preferences on the email preferences tab
        if (activeTab == ACCOUNT_TAB.emailpreferences) {
            if (validateEmailPreferences(emailPreferences)) {
                newPreferences = {...newPreferences, EMAIL_PREFERENCE: {...emailPreferences}};
            } else {
                return; // early exit
            }
        }

        if (userToUpdate.loggedIn &&
            validateEmail(userToUpdate.email) &&
            allRequiredInformationIsPresent(userToUpdate, {...newPreferences, EMAIL_PREFERENCE: null}, userContextsToUpdate) &&
            (isDobOldEnoughForSite(userToUpdate.dateOfBirth) || !isDefined(userToUpdate.dateOfBirth)) &&
            (!userToUpdate.password || isNewPasswordConfirmed))
        {
            dispatch(errorSlice.actions.clearError());
            dispatch(updateCurrentUser(
                userToUpdate,
                editingOtherUser ? {} : newPreferences,
                contextsChanged ? userContextsToUpdate : undefined,
                currentPassword,
                user,
                true
            )).then(() => setSaving(false)).catch(() => setSaving(false));
            return;
        } else if (activeTab == ACCOUNT_TAB.emailpreferences) {
            dispatch(showErrorToast("Account update failed", "Please make sure that all required fields in the \"Profile\" tab have been filled in."));
        }
        setSaving(false);
    }

    // Changing tab clears the email preferences - stops the user from modifying them when not explicitly on the
    // email preferences tab
    useEffect(() => {
        setEmailPreferences(userPreferences?.EMAIL_PREFERENCE);
    }, [activeTab]);

    return <Container id="account-page" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle={pageTitle} className="mb-4" />
        <h3 className="d-md-none text-center text-muted m-3">
            <small>
                {`Update your ${SITE_TITLE} account, or `}
                <Link to="/logout" className="text-secondary">Log out</Link>
            </small>
        </h3>

        <ShowLoading until={editingOtherUser ? userToUpdate.loggedIn && userToUpdate.email : userToUpdate}>
            {user.loggedIn && userToUpdate.loggedIn && // We can guarantee user and myUser are logged in from the route requirements
                <Card>
                    <Nav tabs className={classNames("my-4 flex-wrap", {"mx-4": isAda})}>
                        <NavItem className={classnames({active: activeTab === ACCOUNT_TAB.account})}>
                            <NavLink
                                className={siteSpecific("mx-2", "px-2")} tabIndex={0}
                                onClick={() => setActiveTab(ACCOUNT_TAB.account)} onKeyDown={ifKeyIsEnter(() => setActiveTab(ACCOUNT_TAB.account))}
                            >
                                Profile
                            </NavLink>
                        </NavItem>
                        <NavItem className={classnames({active: activeTab === ACCOUNT_TAB.passwordreset})}>
                            <NavLink
                                className={siteSpecific("mx-2", "px-2")} tabIndex={0}
                                onClick={() => setActiveTab(ACCOUNT_TAB.passwordreset)} onKeyDown={ifKeyIsEnter(() => setActiveTab(ACCOUNT_TAB.passwordreset))}
                            >
                                <span className="d-none d-xl-block">Account security</span>
                                <span className="d-block d-xl-none">Security</span>
                            </NavLink>
                        </NavItem>
                        <NavItem className={classnames({active: activeTab === ACCOUNT_TAB.teacherconnections})}>
                            <NavLink
                                className={siteSpecific("mx-2", "px-2")}
                                tabIndex={0}
                                onClick={() => setActiveTab(ACCOUNT_TAB.teacherconnections)}
                                onKeyDown={ifKeyIsEnter(() => setActiveTab(ACCOUNT_TAB.teacherconnections))}
                            >
                                <span className="d-none d-lg-block d-lg-block">Teacher connections</span>
                                <span className="d-block d-lg-none">Connections</span>
                            </NavLink>
                        </NavItem>
                        {!editingOtherUser && <NavItem className={classnames({active: activeTab === ACCOUNT_TAB.emailpreferences})}>
                            <NavLink
                                className={siteSpecific("mx-2", "px-2")} tabIndex={0}
                                onClick={() => setActiveTab(ACCOUNT_TAB.emailpreferences)} onKeyDown={ifKeyIsEnter(() => setActiveTab(ACCOUNT_TAB.emailpreferences))}
                            >
                                <span className="d-none d-lg-block">Email preferences</span>
                                <span className="d-block d-lg-none">Emails</span>
                            </NavLink>
                        </NavItem>}
                        {!editingOtherUser && <NavItem className={classnames({active: activeTab === ACCOUNT_TAB.betafeatures})}>
                            <NavLink
                                className={siteSpecific("mx-2", "px-2")} tabIndex={0}
                                onClick={() => setActiveTab(ACCOUNT_TAB.betafeatures)} onKeyDown={ifKeyIsEnter(() => setActiveTab(ACCOUNT_TAB.betafeatures))}
                            >
                                <span className="d-none d-lg-block">Beta features</span>
                                <span className="d-block d-lg-none">Other</span>
                            </NavLink>
                        </NavItem>}
                    </Nav>

                    <Form name="my-account" onSubmit={updateAccount}>
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId={ACCOUNT_TAB.account}>
                                <UserDetails
                                    userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                                    userContexts={userContextsToUpdate} setUserContexts={setUserContextsToUpdate}
                                    programmingLanguage={myUserPreferences?.PROGRAMMING_LANGUAGE} setProgrammingLanguage={setProgrammingLanguage}
                                    booleanNotation={myUserPreferences?.BOOLEAN_NOTATION} setBooleanNotation={setBooleanNotation}
                                    displaySettings={myUserPreferences?.DISPLAY_SETTING} setDisplaySettings={setDisplaySettings}
                                    submissionAttempted={attemptedAccountUpdate} editingOtherUser={editingOtherUser}
                                    userAuthSettings={userAuthSettings}
                                />
                            </TabPane>

                            <TabPane tabId={ACCOUNT_TAB.passwordreset}>
                                <UserPassword
                                    currentUserEmail={userToUpdate ? userToUpdate.email : user.email} userAuthSettings={userAuthSettings}
                                    myUser={userToUpdate} setMyUser={setUserToUpdate}
                                    setCurrentPassword={setCurrentPassword} currentPassword={currentPassword}
                                    isNewPasswordConfirmed={isNewPasswordConfirmed} newPasswordConfirm={newPasswordConfirm}
                                    setNewPassword={setNewPassword} setNewPasswordConfirm={setNewPasswordConfirm} editingOtherUser={editingOtherUser}
                                />
                            </TabPane>

                            <TabPane tabId={ACCOUNT_TAB.teacherconnections}>
                                <TeacherConnections user={user} authToken={authToken} editingOtherUser={editingOtherUser}
                                                    userToEdit={userToEdit}/>
                            </TabPane>

                            {!editingOtherUser && <TabPane tabId={ACCOUNT_TAB.emailpreferences}>
                                <UserEmailPreference
                                    emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                                    submissionAttempted={attemptedAccountUpdate}
                                />
                            </TabPane>}

                            {!editingOtherUser && <TabPane tabId={ACCOUNT_TAB.betafeatures}>
                                <UserBetaFeatures displaySettings={myUserPreferences?.DISPLAY_SETTING ?? {}} setDisplaySettings={setDisplaySettings} />
                            </TabPane>}
                        </TabContent>

                        <CardFooter className="py-4">
                            <Row>
                                <Col size={12} md={{size: 6, offset: 3}}>
                                    {error?.type === "generalError" && <h3 role="alert" className="text-danger text-center">
                                        {error.generalError}
                                    </h3>}
                                    {/* Teacher connections does not have a save */}
                                    {isPhy && <Input
                                        type="submit" value="Save" className="btn btn-block btn-secondary border-0"
                                        disabled={!accountInfoChanged || activeTab === ACCOUNT_TAB.teacherconnections}
                                    />}
                                </Col>
                            </Row>
                        </CardFooter>
                    </Form>
                    {activeTab === ACCOUNT_TAB.passwordreset && isStaff(userToUpdate) && !editingOtherUser &&
                        // Currently staff only. This is outside the main Form as they cannot be nested.
                        <Suspense fallback={<Loading/>}>
                            <UserMFA
                                userAuthSettings={userAuthSettings}
                                userToUpdate={userToUpdate}
                                editingOtherUser={editingOtherUser}
                            />
                        </Suspense>
                    }
                </Card>
            }
        </ShowLoading>
        <Row className="text-muted text-center mt-3">
            <Col>
                If you would like to delete your account please <a href="/contact?preset=accountDeletion" target="_blank" rel="noopener noreferrer">contact us</a>.
            </Col>
        </Row>
    </Container>;
};

export const MyAccount = withRouter(connect(stateToProps, dispatchToProps)(AccountPageComponent));
