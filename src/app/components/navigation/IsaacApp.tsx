import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Router, Switch} from "react-router-dom";
import {Footer} from "./Footer";
import {Homepage} from "../pages/Homepage";
import {Question} from "../pages/Question";
import {Concept} from "../pages/Concept";
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
import {requestCurrentUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {TrackedRoute} from "./TrackedRoute";
import {ResetPasswordHandler} from "../handlers/PasswordResetHandler";
import {Admin} from "../pages/Admin";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {history} from "../../services/history"
import {Generic} from "../pages/Generic";
import {ServerError} from "../pages/ServerError";
import {SessionExpired} from "../pages/SessionExpired";
import {ConsistencyErrorModal} from "./ConsistencyErrorModal";
import {Search} from "../pages/Search";
import {NotFound} from "../pages/NotFound";
import {Header} from "./Header";

const mapStateToProps = (state: AppState) => ({
    consistencyError: state && state.error && state.error.type == "consistencyError" || false,
});
const mapDispatchToProps = {requestCurrentUser};

interface IsaacAppProps {
    consistencyError: boolean;
    requestCurrentUser: () => void;
}

const IsaacApp = ({requestCurrentUser, consistencyError}: IsaacAppProps) => {

    useEffect(() => {requestCurrentUser();}, []); // run only once on mount

    return <Router history={history}>
        <React.Fragment>
            <Header />
            <main role="main" className="flex-fill content-body">
                <div className="container">
                    <Switch>
                        {/* Application pages */}
                        <TrackedRoute exact path="/(home)?" component={Homepage} />
                        <TrackedRoute path="/search" component={Search} />
                        <TrackedRoute path="/account" onlyFor={(user: LoggedInUser) => user.loggedIn} component={MyAccount} />
                        <TrackedRoute path="/events" component={ComingSoon}/>
                        <TrackedRoute path="/questions/:questionId" component={Question} />
                        <TrackedRoute path="/concepts/:conceptId" component={Concept} />
                        <TrackedRoute path="/pages/:pageId" component={Generic} />
                        <TrackedRoute exact path="/topics" component={AllTopics} />
                        <TrackedRoute path="/topics/:topicName" component={Topic} />

                        <TrackedRoute path="/admin" onlyFor={(user: LoggedInUser) => user.loggedIn && user.role == "ADMIN"} component={Admin} />

                        {/* June release application pages */}
                        <TrackedRoute path="/gameboards" onlyFor={(user: LoggedInUser) => user.loggedIn && user.role == "ADMIN"} component={Gameboard}/>
                        <TrackedRoute path="/assignments" onlyFor={(user: LoggedInUser) => user.loggedIn && user.role == "ADMIN"} component={MyAssignments} />

                        {/* Authentication */}
                        <TrackedRoute path="/login" component={LogIn} />
                        <TrackedRoute path="/logout" component={LogOutHandler} />
                        <TrackedRoute path="/register" component={Registration} />
                        <TrackedRoute path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                        <TrackedRoute path="/resetpassword/:token" component={ResetPasswordHandler}/>
                        <TrackedRoute path="/verifyemail" component={EmailAlterHandler}/>

                        {/* Static pages */}
                        <TrackedRoute path="/privacy" component={Generic} componentProps={{pageIdOverride: "privacy_policy"}}/>
                        <TrackedRoute path="/terms" component={Generic} componentProps={{pageIdOverride: "terms_of_use"}}/>
                        <TrackedRoute path="/cookies" component={Generic} componentProps={{pageIdOverride: "cookie_policy"}}/>
                        <TrackedRoute path="/about" component={Generic} componentProps={{pageIdOverride: "about_us"}}/>
                        <TrackedRoute path="/cyberessentials" component={Generic} componentProps={{pageIdOverride: "cyberessentials"}}/>
                        <TrackedRoute path="/coming_soon" component={ComingSoon} />

                        {/* Error pages */}
                        <TrackedRoute path="/error" component={ServerError} />
                        <TrackedRoute path="/error_stale" component={SessionExpired} />
                        <TrackedRoute component={NotFound} />
                    </Switch>
                </div>
            </main>
            <Footer />
            <ConsistencyErrorModal consistencyError={consistencyError} />
        </React.Fragment>
    </Router>;
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
