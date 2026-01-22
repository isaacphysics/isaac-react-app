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
} from "../../state";
import {createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route, RouterProvider} from "react-router-dom";
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
import {ResetPasswordHandler} from "../handlers/PasswordResetHandler";
import {Admin} from "../pages/Admin";
import {
    checkForWebSocket,
    closeWebSocket,
    isAdminOrEventManager,
    isEventLeader,
    isLoggedIn,
    isTeacherPending,
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
import {notificationModal} from "../elements/modals/NotificationModal";
import {DowntimeWarningBanner} from "./DowntimeWarningBanner";
import {ErrorBoundary} from "react-error-boundary";
import {ChunkOrClientError} from "../pages/ClientError";
import {Loading} from "../handlers/IsaacSpinner";
import {TutorRequest} from "../pages/TutorRequest";
import {AssignmentProgress} from "../pages/AssignmentProgressWrapper";
import {MyGameboards} from "../pages/MyGameboards";
import {ScrollToTop} from "../site/ScrollToTop";
import {QuestionFinder} from "../pages/QuestionFinder";
import {SessionCookieExpired} from "../pages/SessionCookieExpired";
import { AccountDeletion } from '../pages/AccountDeletion';
import { AccountDeletionSuccess } from '../pages/AccountDeletionSuccess';
import { IsaacScienceLaunchBanner } from './IsaacScienceLaunchBanner';
import { RequireAuth } from './UserAuthentication';
import { FigureNumberingProvider } from '../elements/FigureNumberingProvider';
import { QualtricsRedirect } from './external/QualtricsRedirect';

const ContentEmails = lazy(() => import('../pages/ContentEmails'));
const MyProgress = lazy(() => import('../pages/MyProgress'));
const GameboardBuilder = lazy(() => import('../pages/GameboardBuilder'));

const RootLayout = () => {
    const mainContentRef = useRef(null);
    const accessibilitySettings = useAppSelector((state: AppState) => state?.userPreferences?.ACCESSIBILITY) || {};

    return <>
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
                <FigureNumberingProvider>
                    <Suspense fallback={<Loading/>}>
                        <Outlet />
                    </Suspense>
                </FigureNumberingProvider>
            </ErrorBoundary>
        </main>
        <ScrollToTop mainContent={mainContentRef}/>
        <SiteSpecific.Footer />
    </>;
};

// Render
const routes = createRoutesFromElements(
    <Route element={<RootLayout />}>
        {/* Errors; these paths work but aren't really used */}
        <Route path={"/error"} element={<ServerError />} />
        <Route path={"/error_stale"} element={<SessionExpired />} />
        <Route path={"/error_expired"} element={<SessionCookieExpired />} />
        <Route path={"/auth_error"} element={<AuthError />} />
        <Route path={"/consistency-error"} element={<ConsistencyError />} />

        {/* Site specific pages */}
        {SiteSpecific.Routes}

        {/* Application pages */}
        <Route path="/" element={<SiteSpecific.Homepage />} />
        {/* historic route which might get reintroduced with the introduction of dashboards */}
        <Route path="/home" element={
            <Navigate to="/" replace /> 
        }/>
        <Route path="/account" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyAccount user={authUser} />} /> } />
        <Route path="/search" element={<Search />} />

        {/* deprecated route */}
        <Route path="/pages/glossary" element={
            <Navigate to="/glossary" replace /> 
        }/>
        <Route path="/pages/:pageId" element={<Generic />} />
        <Route path="/concepts/:conceptId" element={<Concept />} />
        <Route path="/questions/:questionId" element={<RequireAuth auth={(user) => !isTeacherPending(user)} element={<Question />} />} />
        <Route path="/glossary" element={<Glossary />} />

        <Route path={PATHS.GAMEBOARD} element={<Gameboard />} />
        <Route path={PATHS.GAMEBOARD_BUILDER} element={<RequireAuth auth={isLoggedIn} element={(authUser) => <GameboardBuilder user={authUser} />} />} />
        <Route path="/assignment/:gameboardId" element={<RequireAuth auth={isLoggedIn} element={<RedirectToGameboard />} />} />
        <Route path={`${PATHS.ADD_GAMEBOARD}/:gameboardId/:gameboardTitle?`} element={<RequireAuth auth={isLoggedIn} element={(authUser) => <AddGameboard user={authUser} />} />} />

        {/* Student pages */}
        <Route path={PATHS.MY_ASSIGNMENTS} element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyAssignments user={authUser} />} />} />
        <Route path="/progress" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyProgress user={authUser} />} />} />
        <Route path="/progress/:userIdOfInterest" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyProgress user={authUser} />} />} />
        <Route path={PATHS.MY_GAMEBOARDS} element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyGameboards user={authUser} />} />} />
        <Route path={PATHS.QUESTION_FINDER} element={<QuestionFinder />} />

        {/* Teacher pages */}
        {/* Tutors can set and manage assignments, but not tests/quizzes */}
        <Route path="/groups" element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <Groups user={authUser} />} />} />
        <Route path={PATHS.SET_ASSIGNMENTS} element={<RequireAuth auth={isTutorOrAbove} element={<SetAssignments />} />} />
        <Route path={PATHS.ASSIGNMENT_PROGRESS} element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <AssignmentProgress user={authUser} />} />} />
        <Route path={`${PATHS.ASSIGNMENT_PROGRESS}/:assignmentId`} element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <AssignmentProgress user={authUser} />} />} />
        <Route path={`${PATHS.ASSIGNMENT_PROGRESS}/group/:groupId`} element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <AssignmentProgress user={authUser} />} />} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth auth={isStaff} element={(authUser) => <Admin user={authUser} />} />} />
        <Route path="/admin/usermanager" element={<RequireAuth auth={isAdminOrEventManager} element={<AdminUserManager />} />} />
        <Route path="/admin/events" element={<RequireAuth auth={user => isAdminOrEventManager(user) || isEventLeader(user)} element={(authUser) => <EventManager user={authUser} />} />} />
        <Route path="/admin/stats" element={<RequireAuth auth={isStaff} element={<AdminStats />} />} />
        <Route path="/admin/content_errors" element={<RequireAuth auth={user => isStaff(user)} element={<AdminContentErrors />} />} />
        <Route path="/admin/emails" element={<RequireAuth auth={isAdminOrEventManager} element={<AdminEmails />} />} />
        <Route path="/admin/direct_emails" element={<RequireAuth auth={isAdminOrEventManager} element={<ContentEmails />} />} />
        {/* Authentication */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/logout" element={<LogOutHandler />} />
        <Route path="/auth/:provider/callback" element={<ProviderCallbackHandler />} />
        <Route path="/resetpassword/:token" element={<ResetPasswordHandler />} />
        <Route path="/deleteaccount" element={<RequireAuth auth={isLoggedIn} element={<AccountDeletion />} />} />
        <Route path="/deleteaccount/success" element={<AccountDeletionSuccess />} />

        {/* Static pages */}
        <Route path="/contact" element={<Contact />} />
        {/*<Route path="/request_account_upgrade" element={<RequireAuth auth={isLoggedIn} element={<TeacherOrTutorRequest />} />} />*/}
        <Route path="/tutor_account_request" element={<RequireAuth auth={isLoggedIn} element={<TutorRequest />} />} />
        <Route path="/privacy" element={<Generic pageIdOverride={"privacy_policy"} />} />
        <Route path="/terms" element={<Generic pageIdOverride={"terms_of_use"} />} />
        <Route path="/cookies" element={<Generic pageIdOverride={"cookie_policy"} />} />
        <Route path="/accessibility" element={<Generic pageIdOverride={"accessibility_statement"} />} />
        <Route path="/cyberessentials" />

        {/* External redirects */}
        <Route path={"/survey/:qId/:refNo?"} element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QualtricsRedirect user={authUser} />} />} />

        {/*
        // TODO: schools and other admin stats
        */}

        {/* Builder pages */}
        <Route path="/markdown" element={<RequireAuth auth={isStaff} element={<MarkdownBuilder />} />} />
        <Route path="/free_text" element={<RequireAuth auth={isStaff} element={<FreeTextBuilder />} />} />

        {/* Support pages */}
        <Route path="/support/:type?/:category?" element={<Support />} />
        {/* Error pages */}
        <Route path="*" element={<NotFound />} />
    </Route>
);

const router = createBrowserRouter(routes);
(window as any).navigateComponentless = router.navigate;

export const IsaacApp = () => {
    // Redux state and dispatch
    const dispatch = useAppDispatch();
    const notifications = useAppSelector((state: AppState) => state && state.notifications && state.notifications.notifications || []);
    const user = useAppSelector(selectors.user.orNull);

    // Run once on component mount
    useEffect(() => {
        // We do not check the current user on the /auth/:provider:/callback page.
        // We clear local storage on a failed check for current user, but on the callback page we need the stored afterAuthPath.
        // The auth callback will get the logged-in user for us.
        const pathname = window.location.pathname;
        if (!(pathname.includes("/auth/") && pathname.includes("/callback"))) {
            void dispatch(requestCurrentUser());
        }
        void dispatch(fetchGlossaryTerms());
    }, [dispatch]);

    const loggedInUserId = isLoggedIn(user) ? user.id : undefined;
    useEffect(() => {
        if (loggedInUserId && !isTeacherPending(user)) {
            void dispatch(requestNotifications());
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

    return <RouterProvider router={router} />;
};
