import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NavBar from "./NavBar";
import Home from "./HomePage";
import QuestionPage from "./QuestionPage";
import PageNotFound from "./PageNotFound";

const IsaacApp = () => {
  return (
      <Router>
          <div>
              <NavBar />
              <hr />
              <Switch>
                  <Route exact path="/" component={Home} />
                  <Route path="/question/:questionId" component={QuestionPage} />
                  <Route component={PageNotFound} />
              </Switch>
          </div>
      </Router>
  );
};

export default IsaacApp;
