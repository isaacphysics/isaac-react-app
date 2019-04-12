import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {NavigationBar} from "./NavigationBar";
import {HomePage} from "./HomePage";
import {QuestionPage} from "./QuestionPage";
import {LogInPage} from "./LogInPage";
import {LogOutHandler} from "./LogOutHandler";
import {ProviderCallbackHandler} from "./ProviderCallbackHandler";
import {LandingPage} from "./LandingPage";
import {AccountPage} from "./AccountPage";
import {MyAssignmentsPage} from "./MyAssignmentsPage";
import {GameboardPage} from "./GameboardPage";
import {PageNotFound} from "./PageNotFound";
import {requestCurrentUser} from "../state/actions";
import {AppState} from "../state/reducers";
import {RegisteredUserDTO} from "../../IsaacApiTypes";

const mapStateToProps = (state: AppState) => ({user: state ? state.user : null});
const mapDispatchToProps = {requestCurrentUser};

interface IsaacAppProps {
    user: RegisteredUserDTO | null,
    requestCurrentUser: () => void
}
const IsaacApp = ({user, requestCurrentUser}: IsaacAppProps) => {
    useEffect(() => {
        requestCurrentUser();
    }, []); // run only once on mount

    return (
        <Router>
            <React.Fragment>
                <NavigationBar />
                <div className={"container"}>
                    <Switch>
                        <Route exact path="/" component={user ? HomePage : LandingPage} />
                        <Route path="/login" component={LogInPage}/> :
                        <Route path="/logout" component={LogOutHandler}/>
                        <Route path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                        <Route path="/account" component={AccountPage} />
                        <Route path="/assignments" component={MyAssignmentsPage} />
                        <Route path="/gameboards" component={GameboardPage}/>
                        <Route path="/questions/:questionId" component={QuestionPage} />
                        <Route component={PageNotFound} />
                    </Switch>
                </div>
            </React.Fragment>
        </Router>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
