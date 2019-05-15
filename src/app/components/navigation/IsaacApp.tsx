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
import {PageNotFound} from "../pages/PageNotFound";
import {Search} from "../pages/Search";
import {requestCurrentUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import history from "../../services/history"
import {TrackedRoute} from "./TrackedRoute";

const mapStateToProps = (state: AppState) => ({user: state ? state.user : null});
const mapDispatchToProps = {requestCurrentUser};

interface IsaacAppProps {
    user: RegisteredUserDTO | null;
    requestCurrentUser: () => void;
}
const IsaacApp = ({requestCurrentUser}: IsaacAppProps) => {
    useEffect(() => {
        requestCurrentUser();
    }, []); // run only once on mount

    return (
        <Router history={history}>
            <React.Fragment>
                <NavigationBar />
                <main role="main" className="flex-fill py-4">
                    <div className={"container"}>
                        <Switch>
                            <TrackedRoute exact path="/" component={Homepage} />
                            <TrackedRoute path="/login" component={LogIn} />
                            <TrackedRoute path="/logout" component={LogOutHandler} />
                            <TrackedRoute path="/register" component={Registration} />
                            <TrackedRoute path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                            <TrackedRoute path="/account" component={MyAccount} />
                            <TrackedRoute path="/assignments" component={MyAssignments} />
                            <TrackedRoute path="/gameboards" component={Gameboard}/>
                            <TrackedRoute path="/questions/:questionId" component={Question} />
                            <TrackedRoute path="/concepts/:conceptId" component={Concept} />
                            <TrackedRoute exact path="/topics" component={AllTopics} />
                            <TrackedRoute path="/topics/:topicName" component={Topic} />
                            <TrackedRoute path="/page/coming_soon" component={ComingSoon} />
                            <TrackedRoute path="/search" component={Search} />
                            <TrackedRoute component={PageNotFound} />
                        </Switch>
                    </div>
                </main>
                <Footer />
            </React.Fragment>
        </Router>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
