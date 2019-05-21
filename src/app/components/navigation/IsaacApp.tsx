import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Router, Switch} from "react-router-dom";
import {NavigationBar} from "./NavigationBar";
import {Footer} from "./Footer";
import {Homepage} from "../pages/Homepage";
import {Question} from "../pages/Question";
import {Concept} from "../pages/Concept";
import {LogIn} from "../pages/LogIn";
import {Registration} from "../pages/Registration";
import {LogOutHandler} from "../handlers/LogOutHandler";
import {ProviderCallbackHandler} from "../handlers/ProviderCallbackHandler";
import {MyAccount} from "../pages/MyAccount";
import {MyAssignments} from "../pages/MyAssignments";
import {Gameboard} from "../pages/Gameboard";
import {AllTopics} from "../pages/AllTopics";
import {Topic} from "../pages/Topic";
import {ComingSoon} from "../pages/ComingSoon";
import {NotFound} from "../pages/NotFound";
import {requestCurrentUser} from "../../state/actions";
import {history} from "../../services/history"
import {TrackedRoute} from "./TrackedRoute";
import {Generic} from "../pages/Generic";
import {ServerError} from "../pages/ServerError";
import {SessionExpired} from "../pages/SessionExpired";

const mapStateToProps = null;
const mapDispatchToProps = {requestCurrentUser};

interface IsaacAppProps {
    requestCurrentUser: () => void;
}
const IsaacApp = ({requestCurrentUser}: IsaacAppProps) => {

    useEffect(() => {requestCurrentUser()}, []); // run only once on mount

    return <Router history={history}>
        <React.Fragment>
            <NavigationBar />
            <main role="main" className="flex-fill py-4">
                <div className={"container"}>
                    <Switch>
                        <TrackedRoute path="/pages/coming_soon" component={ComingSoon} />

                        <TrackedRoute exact path="/(home)?" component={Homepage} />
                        <TrackedRoute path="/events" component={ComingSoon}/>
                        <TrackedRoute path="/gameboards" component={Gameboard}/>
                        <TrackedRoute path="/assignments" component={MyAssignments} />

                        <TrackedRoute path="/login" component={LogIn} />
                        <TrackedRoute path="/logout" component={LogOutHandler} />
                        <TrackedRoute path="/register" component={Registration} />
                        <TrackedRoute path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                        <TrackedRoute path="/account" component={MyAccount} />

                        <TrackedRoute path="/questions/:questionId" component={Question} />
                        <TrackedRoute path="/concepts/:conceptId" component={Concept} />
                        <TrackedRoute path="/pages/:pageId" component={Generic} />
                        <TrackedRoute exact path="/topics" component={AllTopics} />
                        <TrackedRoute path="/topics/:topicName" component={Topic} />

                        <TrackedRoute path="/privacy" component={Generic} componentProps={{pageIdOverride: "privacy_policy"}}/>
                        <TrackedRoute path="/terms" component={Generic} componentProps={{pageIdOverride: "terms_of_use"}}/>
                        <TrackedRoute path="/cookies" component={Generic} componentProps={{pageIdOverride: "cookie_policy"}}/>
                        <TrackedRoute path="/about" component={Generic} componentProps={{pageIdOverride: "about_us"}}/>
                        <TrackedRoute path="/cyberessentials" component={Generic} componentProps={{pageIdOverride: "cyberessentials"}}/>

                        <TrackedRoute path="/error" component={ServerError} />
                        <TrackedRoute path="/error_stale" component={SessionExpired} />
                        <TrackedRoute component={NotFound} />
                    </Switch>
                </div>
            </main>
            <Footer />
        </React.Fragment>
    </Router>;
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
