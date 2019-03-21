import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NavBar from "./components/NavBar";
import PageNotFound from "./components/PageNotFound";
import {storeFactory} from "./redux/store";
import {Provider} from "react-redux";
import {HomePage} from "./components/HomePage";
import {QuestionPage} from "./components/QuestionPage";

const IsaacApp = () => {
    const store = storeFactory({});
    return (
        <Provider store={store}>
            <Router>
              <div>
                  <NavBar />
                  <hr />
                  <Switch>
                      <Route exact path="/" component={HomePage} />
                      <Route path="/questions/:questionId" component={QuestionPage} />
                      <Route component={PageNotFound} />
                  </Switch>
              </div>
            </Router>
        </Provider>
    );
};

export default IsaacApp;
