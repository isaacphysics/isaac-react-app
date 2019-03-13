import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NavBar from "./components/presentational/NavBar";
import PageNotFound from "./components/presentational/PageNotFound";
import {storeFactory} from "./store";
import {Provider} from "react-redux";
import {HomeContainer} from "./components/container/HomeContainer";
import {QuestionContainer} from "./components/container/QuestionContainer";

const IsaacApp = () => {
    const store = storeFactory({});
    return (
        <Provider store={store}>
            <Router>
              <div>
                  <NavBar />
                  <hr />
                  <Switch>
                      <Route exact path="/" component={HomeContainer} />
                      <Route path="/question/:questionId" component={QuestionContainer} />
                      <Route component={PageNotFound} />
                  </Switch>
              </div>
            </Router>
        </Provider>
    );
};

export default IsaacApp;
