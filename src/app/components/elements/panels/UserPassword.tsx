import {Button, CardBody, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import React, {useState} from "react";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {AuthenticationProvider, UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {MINIMUM_PASSWORD_LENGTH, validateEmail} from "../../../services/validation";
import {resetPassword} from "../../../state/actions";
import {loadZxcvbnIfNotPresent, passwordDebounce} from "../../../services/passwordStrength";
import {useDispatch} from "react-redux";
import {isaacApi} from "../../../state/slices/api";

interface UserPasswordProps {
    currentPassword?: string;
    currentUserEmail?: string;
    setCurrentPassword: (e: any) => void;
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isNewPasswordConfirmed: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    setNewPassword: (e: any) => void;
    setNewPasswordConfirm: (e: any) => void;
    newPasswordConfirm: string;
    editingOtherUser: boolean;
}

export const UserPassword = (
    {currentPassword, currentUserEmail, setCurrentPassword, myUser, setMyUser, isNewPasswordConfirmed, userAuthSettings, setNewPassword, setNewPasswordConfirm, newPasswordConfirm, editingOtherUser}: UserPasswordProps) => {

    const dispatch = useDispatch();
    const authenticationProvidersUsed = (provider: AuthenticationProvider) => userAuthSettings && userAuthSettings.linkedAccounts && userAuthSettings.linkedAccounts.includes(provider);

    const [ logoutEverywhere ] = isaacApi.endpoints.logoutEverywhere.useMutation();
    const [ linkAccount ] = isaacApi.endpoints.linkAccount.useMutation();
    const [ unlinkAccount ] = isaacApi.endpoints.unlinkAccount.useMutation();

    const [passwordResetRequested, setPasswordResetRequested] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

    const resetPasswordIfValidEmail = () => {
        if (currentUserEmail && validateEmail(currentUserEmail)) {
            dispatch(resetPassword({email: currentUserEmail}));
            setPasswordResetRequested(true);
        }
    };

    return <CardBody className={"pb-0"}>
        <Row>
            <Col md={{size: 6, offset: 3}}>
                <h4>Password</h4>
            </Col>
        </Row>
        {userAuthSettings && userAuthSettings.hasSegueAccount ?
            <Row>
                <Col>
                    {!editingOtherUser &&
                    <Row>
                        <Col md={{size: 6, offset: 3}}>
                            <FormGroup>
                                <Label htmlFor="password-current">Current password</Label>
                                <Input
                                    id="password-current" type="password" name="current-password"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    }
                    <Row>
                        <Col md={{size: 6, offset: 3}}>
                            <FormGroup>
                                <Label htmlFor="new-password">New password</Label>
                                <Input
                                    invalid={!!newPasswordConfirm && !isNewPasswordConfirmed}
                                    id="new-password" type="password" name="new-password"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setNewPassword(e.target.value);
                                        passwordDebounce(e.target.value, setPasswordFeedback);
                                    }}
                                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        passwordDebounce(e.target.value, setPasswordFeedback);
                                    }}
                                    onFocus={loadZxcvbnIfNotPresent}
                                    aria-describedby="passwordValidationMessage"
                                    disabled={!editingOtherUser && currentPassword == ""}
                                />
                                {passwordFeedback &&
                                <span className='float-right small mt-1'>
                                    <strong>Password strength: </strong>
                                    <span id="password-strength-feedback">
                                        {passwordFeedback.feedbackText}
                                    </span>
                                </span>
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={{size: 6, offset: 3}}>
                            <FormGroup>
                                <Label htmlFor="password-confirm">Re-enter new password</Label>
                                <Input
                                    invalid={!!currentPassword && !isNewPasswordConfirmed}
                                    id="password-confirm"
                                    type="password" name="password-confirmation"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setNewPasswordConfirm(e.target.value);
                                        setMyUser(Object.assign({}, myUser, {password: e.target.value}));
                                    }} aria-describedby="passwordConfirmationValidationMessage"
                                    disabled={!editingOtherUser && currentPassword == ""}
                                />
                                {currentPassword && !isNewPasswordConfirmed &&
                                    <FormFeedback id="passwordConfirmationValidationMessage">
                                        New passwords must match and be at least {MINIMUM_PASSWORD_LENGTH} characters long.
                                    </FormFeedback>
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                </Col>
            </Row>
            : !passwordResetRequested ?
                <React.Fragment>
                    <Row className="pt-4">
                        <Col className="text-center">
                            {userAuthSettings && userAuthSettings.linkedAccounts && <p>
                                You do not currently have a password set for this account; you
                                sign in using {" "}
                                {(userAuthSettings.linkedAccounts).map((linked, index) => {
                                    return <span key={index} className="text-capitalize">{linked.toLowerCase()}</span>;
                                })}.
                            </p>}
                        </Col>
                    </Row>
                    <Row className="pb-4">
                        <Col className="text-center">
                            <Button className="btn-secondary" onClick={resetPasswordIfValidEmail}>
                                Click here to add a password
                            </Button>
                        </Col>
                    </Row>
                </React.Fragment>
                :
                <React.Fragment>
                    <Col md={{size: 6, offset: 3}}>
                        <p>
                            <strong className="d-block">Your password reset request is being processed.</strong>
                            <strong className="d-block">Please check your inbox.</strong>
                        </p>
                    </Col>
                </React.Fragment>
        }
        <React.Fragment>
            <Row>
                <Col md={{size: 6, offset: 3}}>
                    <hr className="text-center" />
                </Col>
            </Row>
            <Row>
                <Col md={{size: 6, offset: 3}}>
                    <FormGroup>
                        <h4>Linked Accounts</h4>
                        <Col className="text-center">
                            <div className="vertical-center ml-2">
                                <input
                                    type="button"
                                    id="linked-accounts-no-password"
                                    className="linked-account-button google-button"
                                    onClick={() => dispatch(authenticationProvidersUsed("GOOGLE") ? unlinkAccount("GOOGLE") : linkAccount("GOOGLE"))}
                                />
                                <Label htmlFor="linked-accounts-no-password" className="ml-2 mb-0">
                                    {authenticationProvidersUsed("GOOGLE") ? " Remove linked Google account" : " Add linked Google account"}
                                </Label>
                            </div>
                        </Col>
                    </FormGroup>
                </Col>
            </Row>
        </React.Fragment>
        <React.Fragment>
            <Row>
                <Col md={{size: 6, offset: 3}}>
                    <hr className="text-center"/>
                </Col>
            </Row>
            <Row>
                <Col md={{size: 6, offset: 3}}>
                    <FormGroup>
                        <h4>Log Out</h4>
                        <small>
                            {"If you forgot to log out on a device you no longer have access to, you can " +
                            "log your account out on all devices, including this one."}
                        </small>
                        <Col className="text-center mt-2">
                            <div className="vertical-center ml-2">
                                <Button onClick={() => logoutEverywhere()}>
                                    Log me out everywhere
                                </Button>
                            </div>
                        </Col>
                    </FormGroup>
                </Col>
            </Row>
        </React.Fragment>
    </CardBody>
};
