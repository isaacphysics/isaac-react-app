import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {NavBar} from "./NavBar";
import {HomePage} from "./HomePage";
import {QuestionPage} from "./QuestionPage";
import {LogInPage} from "./LogInPage";
import {LogOutHandler} from "./LogOutHandler";
import {ProviderCallbackHandler} from "./ProviderCallbackHandler";
import {LandingPage} from "./LandingPage";
import {AccountPage} from "./AccountPage";
import {requestCurrentUser} from "../state/actions";
import PageNotFound from "./PageNotFound";

const mapStateToProps = (state: any) => ({user: state.user});
const mapDispatchToProps = {requestCurrentUser};

const IsaacApp = ({user, requestCurrentUser}: any) => {
    useEffect(() => {
        requestCurrentUser();
    }, []); // run only once on mount

    return (
        <Router>
            <React.Fragment>
                <NavBar />
                <hr />
                <Switch>
                    <Route exact path="/" component={user ? HomePage : LandingPage} />
                    <Route path="/login" component={LogInPage}/> :
                    <Route path="/logout" component={LogOutHandler}/>
                    <Route path="/auth/:provider/callback" component={ProviderCallbackHandler} />
                    <Route path="/account" component={AccountPage} />
                    <Route path="/questions/:questionId" component={QuestionPage} />
                    <Route component={PageNotFound} />
                </Switch>
            </React.Fragment>
        </Router>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
