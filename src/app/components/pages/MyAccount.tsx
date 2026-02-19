import React, {lazy, Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import classnames from "classnames";
import classNames from "classnames";
import {Button, Form, Input, Nav, NavItem, NavLink, TabContent, TabPane,} from "reactstrap";
import {UserContext} from "../../../IsaacApiTypes";
import {
    AppDispatch,
    closeActiveModal,
    getRTKQueryErrorMessage,
    openActiveModal,
    selectors,
    showErrorToast,
    useAdminGetUserQuery,
    useAppDispatch,
    useAppSelector,
    useGetUserAuthSettingsQuery,
    useUpdateCurrentMutation
} from "../../state";
import {
    AccessibilitySettings,
    BooleanNotation,
    DisplaySettings,
    PotentialUser,
    ProgrammingLanguage,
    UserConsent,
    UserPreferencesDTO,
} from "../../../IsaacAppTypes";
import {UserPassword} from "../elements/panels/UserPassword";
import {UserEmailPreferencesPanel} from "../elements/panels/UserEmailPreferencesPanel";
import {
    ACCOUNT_TAB,
    ACCOUNT_TABS,
    ACCOUNT_TABS_ALIASES,
    allRequiredInformationIsPresent,
    ifKeyIsEnter,
    isAda,
    isDefined,
    isDobOldEnoughForSite,
    isFirstLoginInPersistence,
    isPhy,
    isStaff,
    isTeacherOrAbove,
    siteSpecific,
    validateEmail,
    validateEmailPreferences,
    validatePassword
} from "../../services";
import queryString from "query-string";
import {Link, useBlocker, useLocation} from "react-router-dom";
import {TeacherConnections} from "../elements/panels/TeacherConnections";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShowLoading} from "../handlers/ShowLoading";
import {UserBetaFeatures} from "../elements/panels/UserBetaFeatures";
import hash, {NormalOption} from "object-hash";
import {skipToken} from "@reduxjs/toolkit/query";
import {useEmailPreferenceState} from "../elements/inputs/UserEmailPreferencesInput";
import {UserProfile} from '../elements/panels/UserProfile';
import {UserContent} from '../elements/panels/UserContent';
import {ExigentAlert} from "../elements/ExigentAlert";
import {Loading} from '../handlers/IsaacSpinner';
import {UserAccessibilitySettings} from '../elements/panels/UserAccessibilitySettings';
import {showEmailChangeModal} from "../elements/modals/EmailChangeModal";
import { PageContainer } from '../elements/layout/PageContainer';
import { MyAccountSidebar } from '../elements/sidebar/MyAccountSidebar';

// Avoid loading the (large) QRCode library unless necessary:
const UserMFA = lazy(() => import("../elements/panels/UserMFA"));

interface AccountPageProps {
    user: PotentialUser;
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

const showChangeSchoolModal = () => (dispatch: AppDispatch) => {
    dispatch(openActiveModal({
        closeAction: () => {
            dispatch(closeActiveModal());
        },
        title: "Changing schools?",
        body: <>
            <p className="px-1">
                If you are changing schools, we recommend you take the following steps:
            </p>
            <ol type='1'>
                <li>
                    Check your <strong><a target="_blank" href="/groups">groups</a>
                    </strong>. Delete any groups that you will no longer teach.
                </li>
                <li>
                    Check your <strong><a target="_blank" href="/account#teacherconnections">connections</a></strong>. Remove any connections with old colleagues and students.
                </li>
            </ol>
            <p><strong>This information can be found in the <a target="_blank" href="/support/teacher/general#moving_schools">Teacher FAQ</a> for future reference.</strong></p>
        </>,
        buttons: [
            <Button key={1} color="solid" onClick={() => dispatch(closeActiveModal())}>
                Continue
            </Button>
        ]
    }));
};

export const MyAccount = ({user}: AccountPageProps) => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const searchParams = queryString.parse(location.search);
    const hashAnchor = location.hash?.slice(1) ?? null;
    const authToken = searchParams?.authToken as string ?? null;
    const userOfInterest = searchParams?.userId as string ?? null;

    const userPreferences = useAppSelector(selectors.user.preferences);
    const {data: userAuthSettings} = useGetUserAuthSettingsQuery(userOfInterest || undefined);

    const [updateCurrentUser, {error: updateCurrentUserError}] = useUpdateCurrentMutation();

    const {data: adminUserToEdit} = useAdminGetUserQuery(userOfInterest ? Number(userOfInterest) : skipToken);
    // Memoising this derived field is necessary so that it can be used as a dependency to a useEffect later.
    // Otherwise, it is a new object on each re-render and the useEffect is constantly re-triggered.
    const userToEdit = useMemo(function wrapUserWithLoggedInStatus() {
        return adminUserToEdit ? {...adminUserToEdit, loggedIn: true} : {loggedIn: false};
    }, [adminUserToEdit]);

    // - Admin user modification
    const editingOtherUser = !!userOfInterest && user && user.loggedIn && user?.id?.toString() !== userOfInterest || false;

    // - Copy of user to store changes before saving
    // TODO fix this type! what on earth is it? LoggedInValidationUser & {password: string} & ...?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const formSpecificTabs = [ACCOUNT_TAB.passwordreset, ACCOUNT_TAB.teacherconnections];

    useEffect(() => {
        setEmailPreferences(userPreferences?.EMAIL_PREFERENCE);
        setMyUserPreferences(userPreferences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPreferences]);

    // Set active tab using hash anchor
    const [activeTab, setActiveTab] = useState(ACCOUNT_TAB.account);
    useEffect(() => {
        // @ts-ignore
        const tab: ACCOUNT_TAB =
            (authToken && ACCOUNT_TAB.teacherconnections) ||
            (hashAnchor && hashAnchor in ACCOUNT_TAB && ACCOUNT_TAB[hashAnchor as keyof typeof ACCOUNT_TAB]) ||
            (hashAnchor && hashAnchor in ACCOUNT_TABS_ALIASES && ACCOUNT_TABS_ALIASES[hashAnchor as string]) ||
            ACCOUNT_TAB.account;
        setActiveTab(tab);
    }, [hashAnchor, authToken]);

    // Values derived from inputs (props and state)
    const isNewPasswordValid = validatePassword(newPassword);

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

    function setAccessibilitySettings(newAccessibilitySettings: AccessibilitySettings | ((oldAS?: AccessibilitySettings) => AccessibilitySettings)) {
        setMyUserPreferences(oldPref => ({
            ...oldPref,
            ACCESSIBILITY: typeof newAccessibilitySettings === "function"
                ? newAccessibilitySettings(oldPref?.ACCESSIBILITY)
                : newAccessibilitySettings
        }));
    }

    function setConsentSettings(newConsentSettings: UserConsent | ((oldCS?: UserConsent) => UserConsent)) {
        setMyUserPreferences(oldPref => ({
            ...oldPref,
            CONSENT: typeof newConsentSettings === "function"
                ? newConsentSettings(oldPref?.CONSENT)
                : newConsentSettings
        }));
    }

    const accountInfoChanged = contextsChanged || userChanged || otherPreferencesChanged || (emailPreferencesChanged && activeTab == ACCOUNT_TAB.emailpreferences);

    const blocker = useBlocker(
        useCallback(() => accountInfoChanged && !isFirstLoginInPersistence() && !saving, [accountInfoChanged, saving]),
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            if (window.confirm("If you leave this page without saving, your account changes will be lost. Are you sure you would like to leave?")) {
                blocker.proceed?.();
            } else {
                blocker.reset?.();
            }
        }
    }, [blocker]);

    // Handling teachers changing school
    useEffect(() => {
        const originalSchool: string | undefined = "schoolId" in user ? user.schoolId : undefined;
        const newSchool: string | undefined = userToUpdate.schoolId;
        if (isTeacherOrAbove(user) && !isStaff(user) && newSchool && (!originalSchool || originalSchool !== newSchool)) {
            dispatch(showChangeSchoolModal());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userToUpdate, user]);

    // Form's submission method
    async function updateAccount(event: React.FormEvent<HTMLFormElement>) {
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
            (!userToUpdate.password || isNewPasswordValid))
        {

            if (!editingOtherUser && user.loggedIn && user.email !== userToUpdate.email) {
                const confirmed = await showEmailChangeModal(dispatch);
                if (!confirmed) {
                    setSaving(false);
                    return;
                }
            }

            await updateCurrentUser({
                currentUser: user,
                updatedUser: userToUpdate,
                userPreferences: editingOtherUser ? {} : newPreferences,
                registeredUserContexts: contextsChanged ? userContextsToUpdate : undefined,
                passwordCurrent: currentPassword,
                redirect: true
            });

            return;
        } else if (activeTab !== ACCOUNT_TAB.account) {
            dispatch(showErrorToast("Account update failed", "Please make sure that all required fields in the \"Profile\" tab have been filled in."));
        }
        setSaving(false);
    }

    // Changing tab clears the email preferences - stops the user from modifying them when not explicitly on the
    // email preferences tab
    useEffect(() => {
        setEmailPreferences(userPreferences?.EMAIL_PREFERENCE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    return <PageContainer id="account-page" className="mb-7"
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={pageTitle} icon={{type: "icon", icon: "icon-account"}} className="mb-3"/>
        }
        sidebar={siteSpecific(
            <MyAccountSidebar editingOtherUser={editingOtherUser} activeTab={activeTab} setActiveTab={setActiveTab}/>,
            undefined
        )}
    >
        {isAda && <p className="d-md-none text-center text-muted m-3">
            <small>
                {`Update your Ada Computer Science account, or `}
                <Link to="/logout" className="text-theme">Log out</Link>
            </small>
        </p>}
        <ShowLoading until={editingOtherUser ? userToUpdate.loggedIn && userToUpdate.email : userToUpdate}>
            {user.loggedIn && userToUpdate.loggedIn && // We can guarantee user and myUser are logged in from the route requirements
                <div className={classNames("w-lg-75", {"card": isAda})}>
                    {isAda && <Nav tabs className="my-4 flex-wrap mx-4" data-testid="account-nav">
                        {ACCOUNT_TABS.filter(tab => !tab.hidden && !(editingOtherUser && tab.hiddenIfEditingOtherUser)).map(({tab, title, titleShort}) =>
                            <NavItem key={tab} className={classnames({active: activeTab === tab})}>
                                <NavLink
                                    className="px-2" tabIndex={0}
                                    onClick={() => setActiveTab(tab)} onKeyDown={ifKeyIsEnter(() => setActiveTab(tab))}
                                >
                                    {titleShort ? <>
                                        <span className="d-none d-lg-block">{title}</span>
                                        <span className="d-block d-lg-none">{titleShort}</span>
                                    </> : title}
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>}
                    <Form id="my-account" name="my-account" onSubmit={updateAccount}>
                        {updateCurrentUserError &&
                                <ExigentAlert color="warning">
                                    <p className="alert-heading fw-bold">Unable to update your account</p>
                                    <p>{getRTKQueryErrorMessage(updateCurrentUserError).message}</p>
                                </ExigentAlert>
                        }
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId={ACCOUNT_TAB.account}>
                                <UserProfile
                                    userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                                    userContexts={userContextsToUpdate} setUserContexts={setUserContextsToUpdate}
                                    booleanNotation={myUserPreferences?.BOOLEAN_NOTATION} setBooleanNotation={setBooleanNotation}
                                    displaySettings={myUserPreferences?.DISPLAY_SETTING} setDisplaySettings={setDisplaySettings}
                                    submissionAttempted={attemptedAccountUpdate} editingOtherUser={editingOtherUser}
                                    userAuthSettings={userAuthSettings}
                                />
                            </TabPane>
                            {isAda && <TabPane tabId={ACCOUNT_TAB.customise}>
                                <UserContent
                                    userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                                    userContexts={userContextsToUpdate} setUserContexts={setUserContextsToUpdate}
                                    programmingLanguage={myUserPreferences?.PROGRAMMING_LANGUAGE} setProgrammingLanguage={setProgrammingLanguage}
                                    booleanNotation={myUserPreferences?.BOOLEAN_NOTATION} setBooleanNotation={setBooleanNotation}
                                    displaySettings={myUserPreferences?.DISPLAY_SETTING} setDisplaySettings={setDisplaySettings}
                                    submissionAttempted={attemptedAccountUpdate} editingOtherUser={editingOtherUser}
                                    userAuthSettings={userAuthSettings}
                                />
                            </TabPane>}
                            <TabPane tabId={ACCOUNT_TAB.passwordreset}>
                                <UserPassword
                                    currentUserEmail={userToUpdate ? userToUpdate.email : user.email} userAuthSettings={userAuthSettings}
                                    myUser={userToUpdate} setMyUser={setUserToUpdate}
                                    setCurrentPassword={setCurrentPassword} currentPassword={currentPassword}
                                    newPassword={newPassword} setNewPassword={setNewPassword} editingOtherUser={editingOtherUser}
                                    isNewPasswordValid={isNewPasswordValid} submissionAttempted={attemptedAccountUpdate}
                                />
                            </TabPane>
                            {!editingOtherUser && <TabPane tabId={ACCOUNT_TAB.emailpreferences}>
                                <UserEmailPreferencesPanel
                                    emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                                    submissionAttempted={attemptedAccountUpdate}
                                />
                            </TabPane>}
                            {!editingOtherUser && <TabPane tabId={ACCOUNT_TAB.accessibility}>
                                <UserAccessibilitySettings
                                    accessibilitySettings={myUserPreferences?.ACCESSIBILITY ?? {}} setAccessibilitySettings={setAccessibilitySettings}
                                />
                            </TabPane>}
                            {!editingOtherUser && <TabPane tabId={ACCOUNT_TAB.betafeatures}>
                                <UserBetaFeatures
                                    displaySettings={myUserPreferences?.DISPLAY_SETTING ?? {}} setDisplaySettings={setDisplaySettings}
                                    consentSettings={myUserPreferences?.CONSENT ?? {}} setConsentSettings={setConsentSettings}
                                />
                            </TabPane>}
                        </TabContent>
                    </Form>
                    {/* Tabs containing forms (which cannot be nested inside another form) */}
                    {formSpecificTabs.includes(activeTab) && <TabContent activeTab={activeTab}>
                        {isStaff(userToUpdate) && !editingOtherUser && <TabPane tabId={ACCOUNT_TAB.passwordreset}>
                            <Suspense fallback={<Loading/>}>
                                <UserMFA
                                    userAuthSettings={userAuthSettings}
                                    userToUpdate={userToUpdate}
                                    editingOtherUser={editingOtherUser}
                                />
                            </Suspense>
                        </TabPane>}
                        <TabPane tabId={ACCOUNT_TAB.teacherconnections}>
                            <TeacherConnections user={user} authToken={authToken} editingOtherUser={editingOtherUser}
                                userToEdit={userToEdit}
                            />
                        </TabPane>
                    </TabContent>}
                    <div className={classNames({"py-4 card-footer": isAda})}>
                        {isPhy && <div className="section-divider-bold"/>}
                        <div className={classNames("d-flex justify-content-center", {"col-12 col-md-6 offset-md-3": isAda})}>
                            <Input
                                form="my-account" type="submit" value="Save" className={classNames("btn btn-solid border-0", {"w-100": isAda})}
                                disabled={!accountInfoChanged}
                            />
                        </div>
                    </div>
                </div>
            }
        </ShowLoading>
    </PageContainer>;
};
