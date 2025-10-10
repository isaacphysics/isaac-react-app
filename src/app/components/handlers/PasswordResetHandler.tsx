import React, {useEffect, useState} from 'react';
import {
    AppState,
    handlePasswordReset,
    useAppDispatch,
    useAppSelector,
    verifyPasswordReset
} from "../../state";
import {Button, Card, CardBody, CardFooter, Container, Form} from "reactstrap";
import {RouteComponentProps} from "react-router";
import {SetPasswordInput} from "../elements/inputs/SetPasswordInput";
import {ExigentAlert} from "../elements/ExigentAlert";
import {extractErrorMessage} from "../../services/errors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useParams} from "react-router-dom";


export const ResetPasswordHandler = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector((state: AppState) => state?.error || null);

    const {token} = useParams<{token: string}>();
    // todo: We will soon stop using the "general error" here. For now this is the easiest way to check if it's relevant.
    const urlTokenValid = extractErrorMessage(error) != "Invalid password reset token.";

    const [newPassword, setNewPassword] = useState("");
    const [passwordValid, setPasswordValid] = useState(false);
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    // Check the password reset token is valid
    useEffect(() => {dispatch(verifyPasswordReset(token));}, [dispatch, token]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSubmissionAttempted(true);

        if (!passwordValid || !token) {
            return;
        }

        dispatch(handlePasswordReset({token: token, password: newPassword}));
    }

    return <Container id="password-reset">
        <TitleAndBreadcrumb breadcrumbTitleOverride="Password reset" currentPageTitle="Reset your password" icon={{type: "hex", icon: "icon-account"}} className="mb-4" />
        <div>
            {!!error &&
                // todo: Stop using the general error from Redux here.
                <ExigentAlert data-testid={"warning-invalid-token"} color={"warning"}>
                    {extractErrorMessage(error)}
                </ExigentAlert>
            }
            <Form onSubmit={submit}>
                <Card>
                    <CardBody>
                        <SetPasswordInput
                            className="my-4"
                            idPrefix={"reset"}
                            password={newPassword}
                            onChange={setNewPassword}
                            onValidityChange={setPasswordValid}
                            submissionAttempted={submissionAttempted}
                            required={true}
                        />
                    </CardBody>
                    <CardFooter>
                        <Button disabled={!urlTokenValid} type={"submit"} color="secondary" className="mb-2" block id="change-password">
                            Change Password
                        </Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    </Container>;
};
