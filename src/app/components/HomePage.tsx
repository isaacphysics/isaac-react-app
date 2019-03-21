import {connect} from "react-redux";
import React from "react";

const stateToProps = null;
const dispatchToProps = null;
const HomePageContainer = () => (
    <div>
        <h2>Home</h2>
        <p>Hello!</p>
    </div>
);
export const HomePage = connect(stateToProps, dispatchToProps)(HomePageContainer);
