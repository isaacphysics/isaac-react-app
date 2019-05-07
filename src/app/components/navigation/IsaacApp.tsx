import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Router, Route, Switch} from "react-router-dom";
import {NavigationBar} from "./NavigationBar";
import {Footer} from "./Footer";
import {Homepage} from "../pages/Homepage";
import {Question} from "../pages/Question";
import {LogIn} from "../pages/LogIn";
import {Registration} from "../pages/Registration";
import {LogOutHandler} from "../handlers/LogOutHandler";
import {ProviderCallbackHandler} from "../handlers/ProviderCallbackHandler";
import {MyAccount} from "../pages/MyAccount";
import {MyAssignments} from "../pages/MyAssignments";
import {Gameboard} from "../pages/Gameboard";
import {AllTopics} from "../pages/AllTopics";
import {Topic} from "../pages/Topic";
import {PageNotFound} from "../pages/PageNotFound";
import {requestCurrentUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import history from "../../services/history"

const mapStateToProps = (state: AppState) => ({user: state ? state.user : null});
const mapDispatchToProps = {requestCurrentUser};

interface IsaacAppProps {
    user: RegisteredUserDTO | null;
    requestCurrentUser: () => void;
}
const IsaacApp = ({user, requestCurrentUser}: IsaacAppProps) => {
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
                            <Route exact path="/" component={Homepage} />
                            <Route path="/login" component={LogIn} />
                            <Route path="/logout" component={LogOutHandler} />
                            <Route path="/register" component={Registration} />
                            <Route path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                            <Route path="/account" component={MyAccount} />
                            <Route path="/assignments" component={MyAssignments} />
                            <Route path="/gameboards" component={Gameboard}/>
                            <Route path="/questions/:questionId" component={Question} />
                            <Route exact path="/topics" component={AllTopics} />
                            <Route path="/topics/:topicName" component={Topic} />
                            <Route component={PageNotFound} />
                        </Switch>
                    </div>
                </main>
                <Footer />
            </React.Fragment>
        </Router>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
