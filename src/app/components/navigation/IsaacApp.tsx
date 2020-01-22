import React, {useEffect} from 'react';
import "../../services/scrollManager"; // important
import "../../services/polyfills"; // important
import {useDispatch, useSelector} from "react-redux";
import {Route, Router, Switch} from "react-router-dom";
import {Footer} from "./Footer";
import {Homepage} from "../pages/Homepage";
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
import {AllTopics} from "../pages/AllTopics";
import {Topic} from "../pages/Topic";
import {ComingSoon} from "../pages/ComingSoon";
import {NotFound} from "../pages/NotFound";
import {fetchGlossaryTerms, requestConstantsSegueEnvironment, requestCurrentUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {TrackedRoute} from "./TrackedRoute";
import {ResetPasswordHandler} from "../handlers/PasswordResetHandler";
import {Admin} from "../pages/Admin";
import {history} from "../../services/history"
import {Generic} from "../pages/Generic";
import {ServerError} from "../pages/ServerError";
import {AuthError} from "../pages/AuthError";
import {SessionExpired} from "../pages/SessionExpired";
import {ConsistencyErrorModal} from "./ConsistencyErrorModal";
import {Search} from "../pages/Search";
import {CookieBanner} from "./CookieBanner";
import {EmailVerificationBanner} from "./EmailVerificationBanner";
import {Toasts} from "./Toasts";
import {HeaderCS} from "./HeaderCS";
import {AdminUserManager} from "../pages/AdminUserManager";
import {AdminStats} from "../pages/AdminStats";
import {AdminContentErrors} from "../pages/AdminContentErrors";
import {isAdmin, isAdminOrEventManager, isEventLeader, isLoggedIn, isStaff, isTeacher} from "../../services/user";
import {ActiveModals} from "../elements/modals/ActiveModals";
import {Groups} from "../pages/Groups";
import {Equality} from '../pages/Equality';
import {SetAssignments} from "../pages/SetAssignments";
import {RedirectToGameboard} from './RedirectToGameboard';
import {AssignmentProgress} from "../pages/AssignmentProgress";
import {Support} from "../pages/Support";
import {ForStudents} from "../pages/ForStudents";
import {ForTeachers} from "../pages/ForTeachers";
import {AddGameboard} from "../handlers/AddGameboard";
import {isTest} from "../../services/constants";
import {AdminEmails} from "../pages/AdminEmails";
import {Events} from "../pages/Events";
import {EventDetails} from "../pages/EventDetails";
import {EventManager} from "../pages/EventManager";
import {MyGameboards} from "../pages/MyGameboards";
import {GameboardBuilder} from "../pages/GameboardBuilder";
import {Quiz} from "../pages/Quiz";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {HeaderPhy} from "./HeaderPhy";

export const IsaacApp = () => {
    // Redux state and dispatch
    const dispatch = useDispatch();
    const consistencyError = useSelector((state: AppState) => state && state.error && state.error.type == "consistencyError" || false);
    const serverError = useSelector((state: AppState) => state && state.error && state.error.type == "serverError" || false);
    const goneAwayError = useSelector((state: AppState) => state && state.error && state.error.type == "goneAwayError" || false);
    const segueEnvironment = useSelector((state: AppState) => state && state.constants && state.constants.segueEnvironment || "unknown");

    // Run once on component mount
    useEffect(() => {
        dispatch(requestCurrentUser());
        dispatch(requestConstantsSegueEnvironment());
        dispatch(fetchGlossaryTerms());
    }, []);

    // Render
    return <Router history={history}>
        <React.Fragment>
            {{[SITE.PHY]: <HeaderPhy />, [SITE.CS]: <HeaderCS />}[SITE_SUBJECT]}
            <Toasts />
            <ActiveModals />
            <CookieBanner />
            <EmailVerificationBanner />
            <main id="main" role="main" className="flex-fill content-body">
                <Switch>
                    {/* Errors; these paths work but aren't really used */}
                    <Route exact path={serverError ? undefined : "/error"} component={ServerError} />
                    <Route exact path={goneAwayError ? undefined : "/error_stale"} component={SessionExpired} />
                    <TrackedRoute exact path={"/auth_error"} component={AuthError} />

                    {/* Special case */}
                    <TrackedRoute exact path="/questions/:questionId(_regression_test_)" component={segueEnvironment !== "PROD" || isTest ? Question : NotFound} />

                    {/* Application pages */}
                    <TrackedRoute exact path="/(home)?" component={Homepage} />
                    <TrackedRoute exact path="/account" ifUser={isLoggedIn} component={MyAccount} />

                    <TrackedRoute exact path="/search" component={Search} />

                    <TrackedRoute exact path="/pages/:pageId" component={Generic} />
                    <TrackedRoute exact path="/concepts/:conceptId" component={Concept} />
                    <TrackedRoute exact path="/questions/:questionId" component={Question} />
                    <TrackedRoute exact path="/quizzes/:quizId" ifUser={isLoggedIn} component={Quiz} />

                    <TrackedRoute exact path="/topics" component={AllTopics} />
                    <TrackedRoute exact path="/topics/:topicName" component={Topic} />

                    <TrackedRoute exact path="/gameboards" component={Gameboard} />
                    <TrackedRoute exact path="/my_gameboards" ifUser={isLoggedIn} component={MyGameboards} />
                    <TrackedRoute exact path="/gameboard_builder" ifUser={isTeacher} component={GameboardBuilder} />
                    <TrackedRoute exact path="/assignment/:gameboardId" ifUser={isLoggedIn} component={RedirectToGameboard} />
                    <TrackedRoute exact path="/add_gameboard/:gameboardId" ifUser={isLoggedIn} component={AddGameboard} />

                    <TrackedRoute exact path='/events' component={Events}/>
                    <TrackedRoute exact path='/events/:eventId' component={EventDetails}/>

                    {/* Student pages */}
                    <TrackedRoute exact path="/students" component={ForStudents} />
                    <TrackedRoute exact path="/assignments" ifUser={isLoggedIn} component={MyAssignments} />
                    <TrackedRoute exact path="/progress" component={ComingSoon} />

                    {/* Teacher pages */}
                    <TrackedRoute exact path="/teachers" component={ForTeachers} />
                    <TrackedRoute exact path="/groups" ifUser={isTeacher} component={Groups} />
                    <TrackedRoute exact path="/set_assignments" ifUser={isTeacher} component={SetAssignments} />
                    <TrackedRoute exact path="/assignment_progress" ifUser={isTeacher} component={AssignmentProgress} />

                    {/* Admin */}
                    <TrackedRoute exact path="/admin" ifUser={isStaff} component={Admin} />
                    <TrackedRoute exact path="/admin/usermanager" ifUser={isAdminOrEventManager} component={AdminUserManager} />
                    <TrackedRoute exact path="/admin/events" ifUser={user => isAdminOrEventManager(user) || isEventLeader(user)} component={EventManager} />
                    <TrackedRoute exact path="/admin/stats" ifUser={isStaff} component={AdminStats} />
                    <TrackedRoute exact path="/admin/content_errors" ifUser={isStaff} component={AdminContentErrors} />
                    <TrackedRoute exact path="/admin/emails" ifUser={isAdmin} component={AdminEmails} />

                    {/* Authentication */}
                    <TrackedRoute exact path="/login" component={LogIn} />
                    <TrackedRoute exact path="/logout" component={LogOutHandler} />
                    <TrackedRoute exact path="/register" component={Registration} />
                    <TrackedRoute exact path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                    <TrackedRoute exact path="/resetpassword/:token" component={ResetPasswordHandler}/>
                    <TrackedRoute exact path="/verifyemail" component={EmailAlterHandler}/>

                    {/* Static pages */}
                    <TrackedRoute exact path="/contact" component={Contact}/>
                    <TrackedRoute exact path="/teacher_account_request" ifUser={isLoggedIn} component={TeacherRequest}/>
                    <TrackedRoute exact path="/privacy" component={Generic} componentProps={{pageIdOverride: "privacy_policy"}} />
                    <TrackedRoute exact path="/terms" component={Generic} componentProps={{pageIdOverride: "terms_of_use"}} />
                    <TrackedRoute exact path="/cookies" component={Generic} componentProps={{pageIdOverride: "cookie_policy"}} />
                    <TrackedRoute exact path="/accessibility" component={Generic} componentProps={{pageIdOverride: "accessibility_statement"}} />
                    <TrackedRoute exact path="/about" component={Generic} componentProps={{pageIdOverride: "about_us"}} />
                    <TrackedRoute exact path="/cyberessentials" component={Generic} componentProps={{pageIdOverride: "cyberessentials"}} />
                    <TrackedRoute exact path="/coming_soon" component={ComingSoon} />
                    <TrackedRoute exact path="/teaching_order" component={Generic} componentProps={{pageIdOverride: "teaching_order"}} />
                    <TrackedRoute exact path="/equality" component={Equality} />

                    {/* Support pages */}
                    <TrackedRoute exact path="/support/:type?/:category?" component={Support} />

                    {/* Error pages */}
                    <Route component={NotFound} />
                </Switch>
            </main>
            <Footer />
            <ConsistencyErrorModal consistencyError={consistencyError} />
        </React.Fragment>
    </Router>;
};
