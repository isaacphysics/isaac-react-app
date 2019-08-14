import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Router, Switch} from "react-router-dom";
import {Footer} from "./Footer";
import {Homepage} from "../pages/Homepage";
import {Question} from "../pages/Question";
import {Concept} from "../pages/Concept";
import {Contact} from "../pages/Contact";
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
import {requestConstantsSegueEnvironment, requestCurrentUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {TrackedRoute} from "./TrackedRoute";
import {ResetPasswordHandler} from "../handlers/PasswordResetHandler";
import {Admin} from "../pages/Admin";
import {history} from "../../services/history"
import {Generic} from "../pages/Generic";
import {ServerError} from "../pages/ServerError";
import {SessionExpired} from "../pages/SessionExpired";
import {ConsistencyErrorModal} from "./ConsistencyErrorModal";
import {Search} from "../pages/Search";
import {CookieBanner} from "./CookieBanner";
import {EmailVerificationBanner} from "./EmailVerificationBanner";
import {Toasts} from "./Toasts";
import {Header} from "./Header";
import {Route} from "react-router";
import {AdminUserManager} from "../pages/AdminUserManager";
import {AdminStats} from "../pages/AdminStats";
import {AdminContentErrors} from "../pages/AdminContentErrors";
import {ActiveModal} from "../elements/modals/ActiveModal";
import {isAdmin, isLoggedIn, isStaff, isTeacher} from "../../services/user";
import {Groups} from "../pages/Groups";
import {Equality} from '../pages/Equality';
import {SetAssignments} from "../pages/SetAssignments";
import {RedirectToGameboard} from './RedirectToGameboard';
import {AssignmentProgress} from "../pages/AssignmentProgress";
import {Support} from "../pages/Support";
import {ForStudents} from "../pages/ForStudents";
import {ForTeachers} from "../pages/ForTeachers";
import {AddGameboard} from "../handlers/AddGameboard";

import "../../services/scrollManager";
import {isTest} from "../../services/constants";

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
    }, []);

    // Render
    return <Router history={history}>
        <React.Fragment>
            <Header />
            <Toasts />
            <ActiveModal />
            <CookieBanner />
            <EmailVerificationBanner />
            <main role="main" className="flex-fill content-body">
                <Switch>
                    {/* Errors; these paths work but aren't really used */}
                    <TrackedRoute path={serverError ? undefined : "/error"} component={ServerError} />
                    <TrackedRoute path={goneAwayError ? undefined : "/error_stale"} component={SessionExpired} />
                    {/* Special case */}
                    <TrackedRoute exact path="/questions/:questionId(_regression_test_)" component={segueEnvironment !== "PROD" || isTest ? Question : NotFound} />

                    {/* Application pages */}
                    <TrackedRoute exact path="/(home)?" component={Homepage} />
                    <TrackedRoute path="/account" ifUser={isLoggedIn} component={MyAccount} />

                    <TrackedRoute path="/search" component={Search} />

                    <TrackedRoute path="/questions/:questionId" component={Question} />
                    <TrackedRoute path="/concepts/:conceptId" component={Concept} />
                    <TrackedRoute path="/pages/:pageId" component={Generic} />

                    <TrackedRoute exact path="/topics" component={AllTopics} />
                    <TrackedRoute path="/topics/:topicName" component={Topic} />

                    <TrackedRoute path="/gameboards" component={Gameboard} />
                    <TrackedRoute path="/assignment/:gameboardId" ifUser={isLoggedIn} component={RedirectToGameboard} />
                    <TrackedRoute path="/add_gameboard/:gameboardId" ifUser={isLoggedIn} component={AddGameboard} />

                    <Route path='/events' component={() => {window.location.href = "https://isaaccomputerscience.org/events"; return null;}}/>

                    {/* Student pages */}
                    <TrackedRoute path="/students" component={ForStudents} />
                    <TrackedRoute path="/assignments" ifUser={isLoggedIn} component={MyAssignments} />
                    <TrackedRoute path="/progress" component={ComingSoon} />

                    {/* Teacher pages */}
                    <TrackedRoute path="/teachers" component={ForTeachers} />
                    <TrackedRoute path="/groups" ifUser={isTeacher} component={Groups} />
                    <TrackedRoute path="/set_assignments" ifUser={isTeacher} component={SetAssignments} />
                    <TrackedRoute path="/assignment_progress" ifUser={isTeacher} component={AssignmentProgress} />

                    {/* Admin */}
                    <TrackedRoute exact path="/admin" ifUser={isStaff} component={Admin} />
                    <TrackedRoute path="/admin/usermanager" ifUser={isAdmin} component={AdminUserManager} />
                    <TrackedRoute exact path="/admin/stats" ifUser={isStaff} component={AdminStats} />
                    <TrackedRoute path="/admin/content_errors" ifUser={isStaff} component={AdminContentErrors} />

                    {/* Authentication */}
                    <TrackedRoute path="/login" component={LogIn} />
                    <TrackedRoute path="/logout" component={LogOutHandler} />
                    <TrackedRoute path="/register" component={Registration} />
                    <TrackedRoute path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                    <TrackedRoute path="/resetpassword/:token" component={ResetPasswordHandler}/>
                    <TrackedRoute path="/verifyemail" ifUser={isLoggedIn} component={EmailAlterHandler}/>

                    {/* Static pages */}
                    <TrackedRoute path="/contact" component={Contact}/>
                    <TrackedRoute path="/privacy" component={Generic} componentProps={{pageIdOverride: "privacy_policy"}} />
                    <TrackedRoute path="/terms" component={Generic} componentProps={{pageIdOverride: "terms_of_use"}} />
                    <TrackedRoute path="/cookies" component={Generic} componentProps={{pageIdOverride: "cookie_policy"}} />
                    <TrackedRoute path="/about" component={Generic} componentProps={{pageIdOverride: "about_us"}} />
                    <TrackedRoute path="/cyberessentials" component={Generic} componentProps={{pageIdOverride: "cyberessentials"}} />
                    <TrackedRoute path="/coming_soon" component={ComingSoon} />
                    <TrackedRoute path="/equality" component={Equality} />

                    {/* Support pages */}
                    <TrackedRoute path="/support/:type?/:category?" component={Support} />

                    {/* Error pages */}
                    <TrackedRoute component={NotFound} />
                </Switch>
            </main>
            <Footer />
            <ConsistencyErrorModal consistencyError={consistencyError} />
        </React.Fragment>
    </Router>;
};
