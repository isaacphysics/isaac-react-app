import React, {useState} from 'react';
import {
    getRTKQueryErrorMessage,
    useHandlePasswordResetMutation,
    useVerifyPasswordResetQuery,
} from "../../state";
import {Button, Card, CardBody, CardFooter, Container, Form} from "reactstrap";
import {SetPasswordInput} from "../elements/inputs/SetPasswordInput";
import {ExigentAlert} from "../elements/ExigentAlert";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useParams, useSearchParams} from "react-router-dom";


export const ResetPasswordHandler = () => {

    const {token: oldStyleToken} = useParams<{token: string}>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? oldStyleToken;
    const [newPassword, setNewPassword] = useState("");
    const [passwordValid, setPasswordValid] = useState(true);
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const {isSuccess: urlTokenValid, isLoading, error: tokenVerifyError} = useVerifyPasswordResetQuery(token ?? '', {skip: !token});
    const [handlePasswordReset, {error: passwordResetError}] = useHandlePasswordResetMutation();

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSubmissionAttempted(true);

        if (!passwordValid || !token) {
            return;
        }

        await handlePasswordReset({token, password: newPassword});
    }

    return <Container id="password-reset" className={"mb-7"}>
        <TitleAndBreadcrumb breadcrumbTitleOverride="Password reset" currentPageTitle="Reset your password" icon={{type: "icon", icon: "icon-account"}} className="mb-4" />
        {isLoading && <div>Verifying reset token...</div>}
        <div>
            {(!!tokenVerifyError || !!passwordResetError) &&
                <ExigentAlert data-testid={"warning-invalid-token"} color={"warning"}>
                    <p className="alert-heading fw-bold">Unable to reset your password</p>
                    {tokenVerifyError ?
                        getRTKQueryErrorMessage(tokenVerifyError).message : getRTKQueryErrorMessage(passwordResetError).message}
                </ExigentAlert>
            }
            {!token && 
                <ExigentAlert color={"warning"}>
                    <p className="alert-heading fw-bold">No reset token provided</p>
                    <p>Please ensure you have clicked the link provided in your password reset email.</p>
                </ExigentAlert>
            }
            <Form onSubmit={submit}>
                <Card>
                    <CardBody>
                        <SetPasswordInput
                            idPrefix={"reset"}
                            password={newPassword}
                            label={"New password"}
                            onChange={setNewPassword}
                            onValidityChange={setPasswordValid}
                            submissionAttempted={submissionAttempted}
                            required={true}
                        />
                    </CardBody>
                    <CardFooter>
                        <Button disabled={!urlTokenValid} type={"submit"} color="secondary" className="mb-2" block id="change-password">
                            Change password
                        </Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    </Container>;
};
