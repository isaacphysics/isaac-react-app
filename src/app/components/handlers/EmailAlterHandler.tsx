import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {handleEmailAlter, requestCurrentUser} from "../../state/actions";
import {Button, Col, Container} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {history} from "../../services/history";
import queryString from "query-string";
import {LoggedInUser} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState, {location: {search}}: any) => ({
    errorMessage: state ? state.error : null,
    queryParams: queryString.parse(search)
});
const dispatchToProps = {handleEmailAlter, requestCurrentUser};

interface EmailAlterHandlerProps {
    user: LoggedInUser;
    queryParams: {userid?: string; token?: string};
    handleEmailAlter: (params: {userid: string | null; token: string | null}) => void;
    errorMessage: ErrorState;
    requestCurrentUser: () => void;
}

const EmailAlterHandlerComponent = ({user, queryParams: {userid, token}, handleEmailAlter, errorMessage, requestCurrentUser}: EmailAlterHandlerProps) => {
    useEffect(() => {
        if (userid && token) {
            Promise.resolve(handleEmailAlter({userid, token})).then(requestCurrentUser);
        }
    }, []);

    return <Container id="email-verification">
        {(!errorMessage || errorMessage.type !== "generalError") &&
            <div>
                <h3>Email address verified</h3>
                <Col>
                    <Button color="primary" onClick={() => {
                        Promise.resolve(requestCurrentUser()).then(() => history.push('/account'));
                    }} block >
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
