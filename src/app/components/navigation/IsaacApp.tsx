import React, {lazy, Suspense, useEffect, useRef} from 'react';
import {
    AppState,
    fetchGlossaryTerms,
    openActiveModal,
    requestCurrentUser,
    requestNotifications,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetSegueEnvironmentQuery
} from "../../state";
import {BrowserRouter, Navigate, Route, Router, Routes, useLocation} from "react-router-dom";
import {Question} from "../pages/Question";
import {Concept} from "../pages/Concept";
import {Contact} from "../pages/Contact";
import {Glossary} from "../pages/Glossary";
import {LogIn} from "../pages/LogIn";
import {LogOutHandler} from "../handlers/LogOutHandler";
import {ProviderCallbackHandler} from "../handlers/ProviderCallbackHandler";
import {MyAccount} from "../pages/MyAccount";
import {MyAssignments} from "../pages/MyAssignments";
import {Gameboard} from "../pages/Gameboard";
import {NotFound} from "../pages/NotFound";
import {TrackedRoute} from "./TrackedRoute";
import {ResetPasswordHandler} from "../handlers/PasswordResetHandler";
import {Admin} from "../pages/Admin";
import {
    checkForWebSocket,
    closeWebSocket,
    isAdminOrEventManager,
    isEventLeader,
    isLoggedIn,
    isNotPartiallyLoggedIn,
    isStaff,
    isTutorOrAbove,
    KEY,
    OnPageLoad,
    PATHS,
    persistence,
    showNotification,
    trackEvent
} from "../../services";
import {Generic} from "../pages/Generic";
import {ServerError} from "../pages/ServerError";
import {AuthError} from "../pages/AuthError";
import {SessionExpired} from "../pages/SessionExpired";
import {ConsistencyError} from "../pages/ConsistencyError";
import {Search} from "../pages/Search";
import {ResearchNotificationBanner} from "./ResearchNotificationBanner";
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
import {FreeTextBuilder} from "../pages/FreeTextBuilder";
import {MarkdownBuilder} from "../pages/MarkdownBuilder";
import SiteSpecific from "../site/siteSpecificComponents";
import StaticPageRoute from "./StaticPageRoute";
import {notificationModal} from "../elements/modals/NotificationModal";
import {DowntimeWarningBanner} from "./DowntimeWarningBanner";
import {ErrorBoundary} from "react-error-boundary";
import {ChunkOrClientError} from "../pages/ClientError";
import {Loading} from "../handlers/IsaacSpinner";
import {ExternalRedirect} from "../handlers/ExternalRedirect";
import {TutorRequest} from "../pages/TutorRequest";
import {AssignmentProgress} from "../pages/AssignmentProgressWrapper";
import {MyGameboards} from "../pages/MyGameboards";
import {ScrollToTop} from "../site/ScrollToTop";
import {QuestionFinder} from "../pages/QuestionFinder";
import {SessionCookieExpired} from "../pages/SessionCookieExpired";
import { AccountDeletion } from '../pages/AccountDeletion';
import { AccountDeletionSuccess } from '../pages/AccountDeletionSuccess';
import { IsaacScienceLaunchBanner } from './IsaacScienceLaunchBanner';

const ContentEmails = lazy(() => import('../pages/ContentEmails'));
const MyProgress = lazy(() => import('../pages/MyProgress'));
const GameboardBuilder = lazy(() => import('../pages/GameboardBuilder'));

export const IsaacApp = () => {
    // Redux state and dispatch
    const dispatch = useAppDispatch();
    const serverError = useAppSelector((state: AppState) => state && state.error && state.error.type == "serverError" || false);
    const goneAwayError = useAppSelector((state: AppState) => state && state.error && state.error.type == "goneAwayError" || false);
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();
    const notifications = useAppSelector((state: AppState) => state && state.notifications && state.notifications.notifications || []);
    const user = useAppSelector(selectors.user.orNull);
    const location = useLocation();
    const mainContentRef = useRef(null);

    // Run once on component mount
    useEffect(() => {
        // We do not check the current user on the /auth/:provider:/callback page.
        // We clear local storage on a failed check for current user, but on the callback page we need the stored afteAuthPath.
        // The auth callback will get the logged-in user for us.
        const pathname = window.location.pathname;
        if (!(pathname.includes("/auth/") && pathname.includes("/callback"))) {
            dispatch(requestCurrentUser());
        }
        dispatch(fetchGlossaryTerms());
    }, [dispatch]);

    const loggedInUserId = isLoggedIn(user) ? user.id : undefined;
    useEffect(() => {
        if (loggedInUserId && isNotPartiallyLoggedIn(user)) {
            dispatch(requestNotifications());
            checkForWebSocket();
        }
        return () => {
            closeWebSocket();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, loggedInUserId]);

    const showNotifications = isLoggedIn(user) && showNotification(user);
    useEffect(() => {
        const dateNow = new Date();
        if (showNotifications && notifications && notifications.length > 0) {
            dispatch(openActiveModal(notificationModal(notifications[0])));
            persistence.save(KEY.LAST_NOTIFICATION_TIME, dateNow.toString());
        }
    }, [dispatch, showNotifications, notifications]);


    function onBeforePrint() {
        trackEvent("print_page");
    }
    useEffect(() => {
        window.addEventListener("beforeprint", onBeforePrint);

        return () => {
            window.removeEventListener("beforeprint", onBeforePrint);
        };
    }, []);

    const accessibilitySettings = useAppSelector((state: AppState) => state?.userPreferences?.ACCESSIBILITY) || {};

    // Render
    return <BrowserRouter>
        <SiteSpecific.Header />
        <Toasts />
        <ActiveModals />
        <IsaacScienceLaunchBanner />
        <ResearchNotificationBanner />
        <DowntimeWarningBanner />
        <EmailVerificationBanner />
        <OnPageLoad />
        <main ref={mainContentRef} id="main" data-testid="main" role="main" className="flex-fill content-body" data-reduced-motion={accessibilitySettings?.REDUCED_MOTION ? "true" : "false"}>
            <ErrorBoundary FallbackComponent={ChunkOrClientError}>
                <Suspense fallback={<Loading/>}>
                    <Routes>
                        {/* Errors; these paths work but aren't really used */}
                        <Route path={serverError ? undefined : "/error"} element={<ServerError />} />
                        <Route path={goneAwayError ? undefined : "/error_stale"} element={<SessionExpired />} />
                        <Route path={"/error_expired"} element={<SessionCookieExpired />} />
                        <TrackedRoute path={"/auth_error"} element={<AuthError location={location} />} />
                        <TrackedRoute path={"/consistency-error"} element={<ConsistencyError />} />

                        {/* Site specific pages */}
                        {SiteSpecific.Routes}

                        {/* Application pages */}
                        <TrackedRoute path="/" element={<SiteSpecific.Homepage />} />
                        {/* historic route which might get reintroduced with the introduction of dashboards */}
                        <Route path="/home" element={
                            <Navigate to="/" replace /> 
                        }/>
                        <TrackedRoute path="/account" ifUser={isLoggedIn} element={<MyAccount />} />
                        <TrackedRoute path="/search" element={<Search />} />

                        {/* deprecated route */}
                        <Route path="/pages/glossary" element={
                            <Navigate to="/glossary" replace /> 
                        }/>
                        <TrackedRoute path="/pages/:pageId" element={<Generic />} />
                        <TrackedRoute path="/concepts/:conceptId" element={<Concept />} />
                        <TrackedRoute path="/questions/:questionId" ifUser={isNotPartiallyLoggedIn} element={<Question />} />
                        <TrackedRoute path="/glossary" element={<Glossary />} />

                        <TrackedRoute path={PATHS.GAMEBOARD} element={<Gameboard />} />
                        <TrackedRoute path={PATHS.GAMEBOARD_BUILDER} ifUser={isTutorOrAbove} element={<GameboardBuilder />} />
                        <TrackedRoute path="/assignment/:gameboardId" ifUser={isLoggedIn} element={<RedirectToGameboard />} />
                        <TrackedRoute path={`${PATHS.ADD_GAMEBOARD}/:gameboardId/:gameboardTitle?`} ifUser={isLoggedIn} element={<AddGameboard />} />

                        {/* Student pages */}
                        <TrackedRoute path={PATHS.MY_ASSIGNMENTS} ifUser={isLoggedIn} element={<MyAssignments />} />
                        <TrackedRoute path="/progress" ifUser={isLoggedIn} element={<MyProgress />} />
                        <TrackedRoute path="/progress/:userIdOfInterest" ifUser={isLoggedIn} element={<MyProgress />} />
                        <TrackedRoute path={PATHS.MY_GAMEBOARDS} ifUser={isLoggedIn} element={<MyGameboards />} />
                        <TrackedRoute path={PATHS.QUESTION_FINDER} element={<QuestionFinder />} />

                        {/* Teacher pages */}
                        {/* Tutors can set and manage assignments, but not tests/quizzes */}
                        <TrackedRoute path="/groups" ifUser={isTutorOrAbove} element={<Groups />} />
                        <TrackedRoute path={PATHS.SET_ASSIGNMENTS} ifUser={isTutorOrAbove} element={<SetAssignments />} />
                        <TrackedRoute path={PATHS.ASSIGNMENT_PROGRESS} ifUser={isTutorOrAbove} element={<AssignmentProgress />} />
                        <TrackedRoute path={`${PATHS.ASSIGNMENT_PROGRESS}/:assignmentId`} ifUser={isTutorOrAbove} element={<AssignmentProgress />} />
                        <TrackedRoute path={`${PATHS.ASSIGNMENT_PROGRESS}/group/:groupId`} ifUser={isTutorOrAbove} element={<AssignmentProgress />} />

                        {/* Admin */}
                        <TrackedRoute path="/admin" ifUser={isStaff} element={<Admin />} />
                        <TrackedRoute path="/admin/usermanager" ifUser={isAdminOrEventManager} element={<AdminUserManager />} />
                        <TrackedRoute path="/admin/events" ifUser={user => isAdminOrEventManager(user) || isEventLeader(user)} element={<EventManager />} />
                        <TrackedRoute path="/admin/stats" ifUser={isStaff} element={<AdminStats />} />
                        <TrackedRoute path="/admin/content_errors" ifUser={user => segueEnvironment === "DEV" || isStaff(user)} element={<AdminContentErrors />} />
                        <TrackedRoute path="/admin/emails" ifUser={isAdminOrEventManager} element={<AdminEmails location={location} />} />
                        <TrackedRoute path="/admin/direct_emails" ifUser={isAdminOrEventManager} element={<ContentEmails location={location} />} />
                        {/* Authentication */}
                        <TrackedRoute path="/login" element={<LogIn />} />
                        <TrackedRoute path="/logout" element={<LogOutHandler />} />
                        <TrackedRoute path="/auth/:provider/callback" element={<ProviderCallbackHandler />} />
                        <TrackedRoute path="/resetpassword/:token" element={<ResetPasswordHandler />} />
                        <TrackedRoute path="/deleteaccount" ifUser={isLoggedIn} element={<AccountDeletion />} />
                        <TrackedRoute path="/deleteaccount/success" element={<AccountDeletionSuccess />} />

                        {/* Static pages */}
                        <TrackedRoute path="/contact" element={<Contact />} />
                        {/*<TrackedRoute path="/request_account_upgrade" ifUser={isLoggedIn} element={<TeacherOrTutorRequest />} />*/}
                        <TrackedRoute path="/tutor_account_request" ifUser={isLoggedIn} element={<TutorRequest />} />
                        <StaticPageRoute path="/privacy" pageId="privacy_policy" />
                        <StaticPageRoute path="/terms" pageId="terms_of_use" />
                        <StaticPageRoute path="/cookies" pageId="cookie_policy" />
                        <StaticPageRoute path="/accessibility" pageId="accessibility_statement" />
                        <StaticPageRoute path="/cyberessentials" />

                        {/* External redirects */}
                        <ExternalRedirect<{qId: string, refNo: string}> from={"/survey/:qId/:refNo?"} to={({qId, refNo}, user) => `https://cambridge.eu.qualtrics.com/jfe/form/${qId}?UID=${user.id}${refNo ? `&refno=${refNo}` : ''}`} ifUser={isLoggedIn} />

                        {/*
                        // TODO: schools and other admin stats
                        */}

                        {/* Builder pages */}
                        <TrackedRoute path="/markdown" ifUser={isStaff} element={<MarkdownBuilder />} />
                        <TrackedRoute path="/free_text" ifUser={isStaff} element={<FreeTextBuilder />} />

                        {/* Support pages */}
                        <TrackedRoute path="/support/:type?/:category?" element={<Support />} />
                        {/* Error pages */}
                        <TrackedRoute path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </main>
        <ScrollToTop mainContent={mainContentRef}/>
        <SiteSpecific.Footer />
    </Router>;
};
