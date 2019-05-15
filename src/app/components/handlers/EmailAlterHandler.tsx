import React, {Dispatch, useEffect} from 'react';
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {handleEmailAlter} from "../../state/actions";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {Button, Col} from "reactstrap";
import {AppState} from "../../state/reducers";
import history from "../../services/history";

const stateToProps = (state: AppState) => ({
    user: state ? state.user : null,
    errorMessage: state ? state.error : null
});
const dispatchToProps = {handleEmailAlter: handleEmailAlter};

interface EmailAlterHandlerProps {
    user: RegisteredUserDTO | null,
    handleEmailAlter: (params: {userId: string | null, token: string | null}) => void,
    errorMessage: string | null
}

const EmailAlterHandlerComponent = ({user, handleEmailAlter, errorMessage}: EmailAlterHandlerProps) => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userid');
    const token = urlParams.get('token');

    useEffect(() => {
        setTimeout(function(){handleEmailAlter({userId: userId, token: token})},10);
        // handleEmailAlter({userId: userId, token: token})
        console.log("useEffect called in emailAlterHandler")
    }, []);

    return <div id="email-verification">
        {!errorMessage &&
            <div>
                <h3>Email address verified</h3>
                <Col>
                    <Button color="primary" onClick={() => {history.push('/account'); history.go(0);}} block >Go to My Account</Button>
                </Col>
            </div>
        }
        {errorMessage &&
            <div>
                <h3>Couldn't verify email address</h3>
                <p>{errorMessage}</p>
            </div>
        }
    </div>;
};

export const EmailAlterHandler = connect(stateToProps, dispatchToProps)(EmailAlterHandlerComponent);
