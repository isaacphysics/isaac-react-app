import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {handleEmailAlter} from "../../state/actions";
import {Button, Col, Container} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {history} from "../../services/history";
import queryString from "query-string";

const stateToProps = (state: AppState, {location: {search}}: any) => ({
    errorMessage: state ? state.error : null,
    queryParams: queryString.parse(search)
});
const dispatchToProps = {handleEmailAlter};

interface EmailAlterHandlerProps {
    queryParams: {userId?: string; token?: string};
    handleEmailAlter: (params: {userId: string | null; token: string | null}) => void;
    errorMessage: ErrorState;
}

const EmailAlterHandlerComponent = ({queryParams: {userId, token}, handleEmailAlter, errorMessage}: EmailAlterHandlerProps) => {
    useEffect(() => {
        if (userId && token) {
            handleEmailAlter({userId, token});
        }
    }, []);

    return <Container id="email-verification">
        {(!errorMessage || errorMessage.type !== "generalError") &&
            <div>
                <h3>Email address verified</h3>
                <Col>
                    <Button color="primary" onClick={() => {history.push('/account');}} block >
                        Go to My Account
                    </Button>
                </Col>
            </div>
        }
        {errorMessage && errorMessage.type === "generalError" &&
            <div>
                <h3>{"Couldn't verify email address"}</h3>
                <p>{errorMessage.generalError}</p>
            </div>
        }
    </Container>;
};

export const EmailAlterHandler = connect(stateToProps, dispatchToProps)(EmailAlterHandlerComponent);
