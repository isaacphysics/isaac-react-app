import React from 'react';
import {connect} from "react-redux";
import {handleProviderLoginRedirect} from "../state/actions";

const stateToProps = null;
const dispatchToProps = {loginProviderRedirect: handleProviderLoginRedirect};

const LogInPageComponent = ({loginProviderRedirect}: any) => {
    return <React.Fragment>
        <div><a onClick={() => {loginProviderRedirect("google")}}>Google</a></div>
        <div><del><a onClick={() => {/*loginProviderRedirect("twitter")*/}}>Twitter</a></del></div>
        <div><del><a onClick={() => {/*loginProviderRedirect("facebook")*/}}>Facebook</a></del></div>
        <hr />
        <div><del>Isaac Segue Account Log In</del></div>
    </React.Fragment>;
};

export const LogInPage = connect(stateToProps, dispatchToProps)(LogInPageComponent);
