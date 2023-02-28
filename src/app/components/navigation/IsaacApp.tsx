import React, {lazy, Suspense, useEffect} from 'react';
import {
    AppState,
    fetchGlossaryTerms,
    openActiveModal,
    requestConstantsSegueEnvironment,
    requestCurrentUser,
    requestNotifications,
    selectors,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {Route, Router, Switch} from "react-router-dom";
import {Question} from "../pages/Question";
import {Concept} from "../pages/Concept";
import {Contact} from "../pages/Contact";
import {TeacherRequest} from "../pages/TeacherRequest";
import {LogIn} from "../pages/LogIn";
import {Registration} from "../pages/Registration";
import {LogOutHandler} from "../handlers/LogOutHandler";
import {EmailAlterHandler} from "../handlers/EmailAlterHandler";
import {ProviderCallbackHandler} from "../handlers/ProviderCallbackHandler";
import {MyAccount} from "../pages/MyAccount";
import {MyAssignments} from "../pages/MyAssignments";
import {Gameboard} from "../pages/Gameboard";
import {NotFound} from "../pages/NotFound";
import {TrackedRoute} from "./TrackedRoute";
import {ResetPasswordHandler} from "../handlers/PasswordResetHandler";
import {Admin} from "../pages/Admin";
import {
    persistence,
    checkForWebSocket,
    closeWebSocket,
    history,
    isAdminOrEventManager,
    isEventLeader,
    isLoggedIn,
    isStaff,
    KEY,
    showNotification,
    isTutorOrAbove
} from "../../services"
import {Generic} from "../pages/Generic";
import {ServerError} from "../pages/ServerError";
import {AuthError} from "../pages/AuthError";
import {SessionExpired} from "../pages/SessionExpired";
import {ConsistencyErrorModal} from "./ConsistencyErrorModal";
import {Search} from "../pages/Search";
import {CookieBanner} from "./CookieBanner";
import {EmailVerificationBanner} from "./EmailVerificationBanner";
import {Toasts} from "./Toasts";
import {AdminUserManager} from "../pages/AdminUserManager";
import {AdminStats} from "../pages/AdminStats";
import {AdminContentErrors} from "../pages/AdminContentErrors";
import {ActiveModals} from "../elements/modals/ActiveModals";
import {Groups} from "../pages/Groups";
import {SetAssignments} from "../pages/SetAssignments";
import {RedirectToGameboard} from './RedirectToGameboard';
import {Support} from "../pages/Support";
import {AddGameboard} from "../handlers/AddGameboard";
import {AdminEmails} from "../pages/AdminEmails";
import {EventManager} from "../pages/EventManager";
import {MyGameboards} from "../pages/MyGameboards";
import {FreeTextBuilder} from "../pages/FreeTextBuilder";
import {MarkdownBuilder} from "../pages/MarkdownBuilder";
import SiteSpecific from "../site/siteSpecificComponents";
import StaticPageRoute from "./StaticPageRoute";
import {Redirect} from "react-router";
import {UnsupportedBrowserBanner} from "./UnsupportedBrowserWarningBanner";
import {notificationModal} from "../elements/modals/NotificationModal";
import {DowntimeWarningBanner} from "./DowntimeWarningBanner";
import {ErrorBoundary} from "react-error-boundary";
import {ChunkOrClientError} from "../pages/ClientError";
import {Loading} from "../handlers/IsaacSpinner";
import {ExternalRedirect} from "../handlers/ExternalRedirect";
import {TutorRequest} from "../pages/TutorRequest";

const ContentEmails = lazy(() => import('../pages/ContentEmails'));
const MyProgress = lazy(() => import('../pages/MyProgress'));
const Equality = lazy(() => import('../pages/Equality'));
const GameboardBuilder = lazy(() => import('../pages/GameboardBuilder'));

export const IsaacApp = () => {
    // Redux state and dispatch
    const dispatch = useAppDispatch();
    const consistencyError = useAppSelector((state: AppState) => state && state.error && state.error.type == "consistencyError" || false);
    const serverError = useAppSelector((state: AppState) => state && state.error && state.error.type == "serverError" || false);
    const goneAwayError = useAppSelector((state: AppState) => state && state.error && state.error.type == "goneAwayError" || false);
    const segueEnvironment = useAppSelector((state: AppState) => state && state.constants && state.constants.segueEnvironment || "unknown");
    const notifications = useAppSelector((state: AppState) => state && state.notifications && state.notifications.notifications || []);
    const user = useAppSelector(selectors.user.orNull);

    // Run once on component mount
    useEffect(() => {
        // We do not check the current user on the /auth/:provider:/callback page.
        // We clear local storage on a failed check for current user, but on the callback page we need the stored afteAuthPath.
        // The auth callback will get the logged-in user for us.
        const pathname = window.location.pathname;
        if (!(pathname.includes("/auth/") && pathname.includes("/callback"))) {
            dispatch(requestCurrentUser());
        }
        dispatch(requestConstantsSegueEnvironment());
        dispatch(fetchGlossaryTerms());
    }, [dispatch]);

    const loggedInUserId = isLoggedIn(user) ? user.id : undefined;
    useEffect(() => {
        if (loggedInUserId) {
            dispatch(requestNotifications());
            checkForWebSocket();
        }
        return () => {
            closeWebSocket();
        };
    }, [dispatch, loggedInUserId]);

    const showNotifications = isLoggedIn(user) && showNotification(user);
    useEffect(() => {
        const dateNow = new Date();
        if (showNotifications && notifications && notifications.length > 0) {
            dispatch(openActiveModal(notificationModal(notifications[0])));
            persistence.save(KEY.LAST_NOTIFICATION_TIME, dateNow.toString())
        }
    }, [dispatch, showNotifications, notifications]);

    // Render
    return <Router history={history}>
        <SiteSpecific.Header />
        <Toasts />
        <ActiveModals />
        <CookieBanner />
        <UnsupportedBrowserBanner />
        <DowntimeWarningBanner />
        <EmailVerificationBanner />
        <main id="main" data-testid="main" role="main" className="flex-fill content-body">
            <ErrorBoundary FallbackComponent={ChunkOrClientError}>
                <Suspense fallback={<Loading/>}>
                    <Switch>
                        {/* Errors; these paths work but aren't really used */}
                        <Route exact path={serverError ? undefined : "/error"} component={ServerError} />
                        <Route exact path={goneAwayError ? undefined : "/error_stale"} component={SessionExpired} />
                        <TrackedRoute exact path={"/auth_error"} component={AuthError} />

                        {/* Site specific pages */}
                        {SiteSpecific.Routes}

                        {/* Application pages */}
                        <TrackedRoute exact path="/" component={SiteSpecific.Homepage} />
                        <Redirect exact from="/home" to="/" /> {/* historic route which might get reintroduced with the introduction of dashboards */}
                        <TrackedRoute exact path="/account" ifUser={isLoggedIn} component={MyAccount} />
                        <TrackedRoute exact path="/search" component={Search} />

                        <TrackedRoute exact path="/pages/:pageId" component={Generic} />
                        <TrackedRoute exact path="/concepts/:conceptId" component={Concept} />
                        <TrackedRoute exact path="/questions/:questionId" component={Question} />

                        <TrackedRoute exact path="/gameboards" component={Gameboard} />
                        <TrackedRoute exact path="/my_gameboards" ifUser={isLoggedIn} component={MyGameboards} />
                        <TrackedRoute exact path="/gameboard_builder" ifUser={isTutorOrAbove} component={GameboardBuilder} />
                        <TrackedRoute exact path="/assignment/:gameboardId" ifUser={isLoggedIn} component={RedirectToGameboard} />
                        <TrackedRoute exact path="/add_gameboard/:gameboardId/:gameboardTitle?" ifUser={isLoggedIn} component={AddGameboard} />

                        {/* Student pages */}
                        <TrackedRoute exact path="/assignments" ifUser={isLoggedIn} component={MyAssignments} />
                        <TrackedRoute exact path="/progress" ifUser={isLoggedIn} component={MyProgress} />
                        <TrackedRoute exact path="/progress/:userIdOfInterest" ifUser={isLoggedIn} component={MyProgress} />

                        {/* Teacher pages */}
                        {/* Tutors can set and manage assignments, but not tests/quizzes */}
                        <TrackedRoute exact path="/groups" ifUser={isTutorOrAbove} component={Groups} />
                        <TrackedRoute exact path="/set_assignments" ifUser={isTutorOrAbove} component={SetAssignments} />

                        {/* Admin */}
                        <TrackedRoute exact path="/admin" ifUser={isStaff} component={Admin} />
                        <TrackedRoute exact path="/admin/usermanager" ifUser={isAdminOrEventManager} component={AdminUserManager} />
                        <TrackedRoute exact path="/admin/events" ifUser={user => isAdminOrEventManager(user) || isEventLeader(user)} component={EventManager} />
                        <TrackedRoute exact path="/admin/stats" ifUser={isStaff} component={AdminStats} />
                        <TrackedRoute exact path="/admin/content_errors" ifUser={user => segueEnvironment === "DEV" || isStaff(user)} component={AdminContentErrors} />
                        <TrackedRoute exact path="/admin/emails" ifUser={isAdminOrEventManager} component={AdminEmails} />
                        <TrackedRoute exact path="/admin/direct_emails" ifUser={isAdminOrEventManager} component={ContentEmails} />

                        {/* Authentication */}
                        <TrackedRoute exact path="/login" component={LogIn} />
                        <TrackedRoute exact path="/logout" component={LogOutHandler} />
                        <TrackedRoute exact path="/register" component={Registration} />
                        <TrackedRoute exact path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                        <TrackedRoute exact path="/resetpassword/:token" component={ResetPasswordHandler}/>
                        <TrackedRoute exact path="/verifyemail" component={EmailAlterHandler}/>

                        {/* Static pages */}
                        <TrackedRoute exact path="/contact" component={Contact}/>
                        {/*<TrackedRoute exact path="/request_account_upgrade" ifUser={isLoggedIn} component={TeacherOrTutorRequest}/>*/}
                        <TrackedRoute exact path="/teacher_account_request" ifUser={isLoggedIn} component={TeacherRequest}/>
                        <TrackedRoute exact path="/tutor_account_request" ifUser={isLoggedIn} component={TutorRequest}/>
                        <StaticPageRoute exact path="/privacy" pageId="privacy_policy" />
                        <StaticPageRoute exact path="/terms" pageId="terms_of_use" />
                        <StaticPageRoute exact path="/cookies" pageId="cookie_policy" />
                        <StaticPageRoute exact path="/accessibility" pageId="accessibility_statement" />
                        <StaticPageRoute exact path="/cyberessentials" />

                        {/* External redirects */}
                        <ExternalRedirect<{qId: string}> from={"/survey/:qId"} to={({qId}, user) => `https://cambridge.eu.qualtrics.com/jfe/form/${qId}?UID=${user.id}`} ifUser={isLoggedIn} />

                        {/*
                        // TODO: schools and other admin stats
                        */}

                        {/* Builder pages */}
                        <TrackedRoute exact path="/equality" component={Equality} />
                        <TrackedRoute exact path="/markdown" ifUser={isStaff} component={MarkdownBuilder} />
                        <TrackedRoute exact path="/free_text" ifUser={isStaff} component={FreeTextBuilder} />

                        {/* Support pages */}
                        <TrackedRoute exact path="/support/:type?/:category?" component={Support} />

                        {/* Error pages */}
                        <TrackedRoute component={NotFound} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </main>
        <SiteSpecific.Footer />
        <ConsistencyErrorModal consistencyError={consistencyError} />
    </Router>;
};
