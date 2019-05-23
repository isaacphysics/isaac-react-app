import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {handleEmailAlter} from "../../state/actions";
import {Button, Col} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {history} from "../../services/history";

const stateToProps = (state: AppState) => ({
    errorMessage: state ? state.error : null
});
const dispatchToProps = {handleEmailAlter};

interface EmailAlterHandlerProps {
    handleEmailAlter: (params: {userId: string | null; token: string | null}) => void;
    errorMessage: ErrorState;
}

const EmailAlterHandlerComponent = ({handleEmailAlter, errorMessage}: EmailAlterHandlerProps) => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userid');
    const token = urlParams.get('token');

    useEffect(() => {
        setTimeout(function(){handleEmailAlter({userId: userId, token: token})},0);
    }, []);

    return <div id="email-verification">
        {(!errorMessage || errorMessage.type !== "generalError") &&
            <div>
                <h3>Email address verified</h3>
                <Col>
                    <Button color="primary" onClick={() => {history.push('/account'); history.go(0);}} block >Go to My Account</Button>
                </Col>
            </div>
        }
        {errorMessage && errorMessage.type === "generalError" &&
            <div>
                <h3>{"Couldn't verify email address"}</h3>
                <p>{errorMessage.generalError}</p>
            </div>
        }
    </div>;
};

export const EmailAlterHandler = connect(stateToProps, dispatchToProps)(EmailAlterHandlerComponent);
