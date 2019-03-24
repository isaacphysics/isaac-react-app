import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NavBar from "./NavBar";
import PageNotFound from "./PageNotFound";
import {HomePage} from "./HomePage";
import {QuestionPage} from "./QuestionPage";
import {connect} from "react-redux";
import {requestCurrentUser} from "../state/actions";

const mapStateToProps = null;
const mapDispatchToProps = {requestCurrentUser};

const IsaacApp = ({requestCurrentUser}: any) => {
    useEffect(() => {
        requestCurrentUser();
    }, []); // run only once on mount

    return (
        <Router>
            <React.Fragment>
                <NavBar />
                <hr />
                <Switch>
                    <Route exact path="/" component={HomePage} />
                    <Route path="/questions/:questionId" component={QuestionPage} />
                    <Route component={PageNotFound} />
                </Switch>
            </React.Fragment>
        </Router>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(IsaacApp);
