import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import NavBar from "./components/presentational/NavBar";
import PageNotFound from "./components/presentational/PageNotFound";
import {storeFactory} from "./store";
import {Provider} from "react-redux";
import {Home} from "./components/container/Home";
import {Question} from "./components/container/Question";

const IsaacApp = () => {
    const store = storeFactory({});
    return (
        <Provider store={store}>
            <Router>
              <div>
                  <NavBar />
                  <hr />
                  <Switch>
                      <Route exact path="/" component={Home} />
                      <Route path="/question/:questionId" component={Question} />
                      <Route component={PageNotFound} />
                  </Switch>
              </div>
            </Router>
        </Provider>
    );
};

export default IsaacApp;
