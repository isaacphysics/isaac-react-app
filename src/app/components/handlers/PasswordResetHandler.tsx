import React, {useEffect, useState} from 'react';
import {useAppDispatch, verifyPasswordReset} from "../../state";
import {Button, Card, CardBody, CardFooter, Container, Form} from "reactstrap";
import {RouteComponentProps} from "react-router";
import {SetPasswordInput} from "../elements/inputs/SetPasswordInput";


export const ResetPasswordHandler = ({match}: RouteComponentProps<{token?: string}>) => {
    const dispatch = useAppDispatch();
    const urlToken = match.params.token || null;

    const [newPassword, setNewPassword] = useState("");
    const [passwordValid, setPasswordValid] = useState(false);

    // Check the password reset token is valid
    useEffect(() => {dispatch(verifyPasswordReset(urlToken));}, [dispatch, urlToken]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // todo: submit
    }

    return <Container id="email-verification">
        <div>
            <h3>Reset your password</h3>
            <Form onSubmit={submit}>
                <Card>
                    <CardBody>
                        <SetPasswordInput
                            className="my-4"
                            onChange={setNewPassword}
                            onValidityChange={setPasswordValid}
                            submissionAttempted={false} // todo
                            required={true}
                        />
                    </CardBody>
                    <CardFooter>
                        <Button type={"submit"} color="secondary" className="mb-2" block id="change-password">
                            Change Password
                        </Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    </Container>;
};
