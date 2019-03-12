import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import NavBar from "./NavBar";
import Home from "./HomePage";
import QuestionPage from "./QuestionPage";

const IsaacApp = () => {
  return (
    <Router>
        <div>
            <NavBar />
            <hr />
            <Route exact path="/" component={Home} />
            <Route path="/question" component={QuestionPage} />
        </div>
    </Router>
  );
};

export default IsaacApp;
