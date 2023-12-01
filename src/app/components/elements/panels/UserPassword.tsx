import {Button, CardBody, Col, FormFeedback, FormGroup, Input, InputProps, Label, Row} from "reactstrap";
import React, {useState} from "react";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {AuthenticationProvider, UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {
    AUTHENTICATOR_FRIENDLY_NAMES_MAP,
    AUTHENTICATOR_PROVIDERS,
    isAda,
    isPhy,
    loadZxcvbnIfNotPresent,
    MINIMUM_PASSWORD_LENGTH,
    passwordDebounce,
    siteSpecific,
    validateEmail
} from "../../../services";
import classNames from "classnames";
import {linkAccount, logOutUserEverywhere, resetPassword, unlinkAccount, useAppDispatch} from "../../../state";

interface UserPasswordProps {
    currentPassword?: string;
    currentUserEmail?: string;
    setCurrentPassword: (e: React.SetStateAction<string>) => void;
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isNewPasswordConfirmed: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    setNewPassword: (e: React.SetStateAction<string>) => void;
    setNewPasswordConfirm: (e: React.SetStateAction<string>) => void;
    newPasswordConfirm: string;
    editingOtherUser: boolean;
}

const ThirdPartyAccount = ({provider, isLinked, imgCss} : {provider: AuthenticationProvider, isLinked: boolean, imgCss: string}) => {
    const dispatch = useAppDispatch();
    return <Row className="align-items-center linked-account-button-outer ml-2 mb-1">
        <input
            type="button"
            id="linked-accounts-no-password"
            className={`linked-account-button ${imgCss}`}
            onClick={() => dispatch(isLinked ? unlinkAccount(provider) : linkAccount(provider))}
        />
        <Label htmlFor="linked-accounts-no-password" className="ml-2 mb-0">
            {AUTHENTICATOR_FRIENDLY_NAMES_MAP[provider]}
        </Label>
        <Button color="link" className="ml-auto mr-3 btn-sm">
            {isLinked ? <span>Unlink</span> : <span>Link</span>}
        </Button>
    </Row>;
};

const PasswordInput = (props: InputProps) => {
    const [isVisible, setIsVisible] = useState(false);
    return <div className="d-flex flex-row">
        <Input {...props} id="password-input-field" type={isVisible ? "text" : "password"}/>
        <button type="button" className="show-password-button"  onClick={() => setIsVisible(v => !v)}>
            {isVisible ? <span>Hide</span> : <span>Show</span>}
        </button>
    </div>;
};

export const UserPassword = (
    {currentPassword, currentUserEmail, setCurrentPassword, myUser, setMyUser, isNewPasswordConfirmed, userAuthSettings, setNewPassword, setNewPasswordConfirm, newPasswordConfirm, editingOtherUser}: UserPasswordProps) => {

    const dispatch = useAppDispatch();
    const authenticationProvidersUsed = (provider: AuthenticationProvider) => userAuthSettings && userAuthSettings.linkedAccounts && userAuthSettings.linkedAccounts.includes(provider);

    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [passwordResetRequested, setPasswordResetRequested] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

    const resetPasswordIfValidEmail = () => {
        if (currentUserEmail && validateEmail(currentUserEmail)) {
            dispatch(resetPassword({email: currentUserEmail}));
            setPasswordResetRequested(true);
        }
    };

    const authButtonsMap : Record<any, (isLinked: boolean) => JSX.Element> = {
        "RASPBERRYPI": (isLinked: boolean) => <ThirdPartyAccount provider={"RASPBERRYPI"} imgCss="rpf-button" isLinked={isLinked}/>,
        "GOOGLE": (isLinked: boolean) => <ThirdPartyAccount provider={"GOOGLE"} imgCss="google-button" isLinked={isLinked}/>
    };

    const connectedAccounts : AuthenticationProvider[] = [];
    const unconnectedAccounts : AuthenticationProvider[] = [];
    AUTHENTICATOR_PROVIDERS.forEach((provider) => {
        if (authenticationProvidersUsed(provider as AuthenticationProvider) as boolean) {
            connectedAccounts.push(provider);
        } else {
            unconnectedAccounts.push(provider);
        }
    });

    return <CardBody className={"pb-0"}>
        <Row>
            {isAda && 
            <Col xs={{size: 12}} lg={{size: 6}} className={classNames({"px-5 mb-4 mb-lg-0" : isAda})}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mi sit amet mauris commodo quis imperdiet massa tincidunt.
            </Col>}
            <Col xs = {isPhy ? {size: 6, offset: 3} : {size: 12}} lg={isPhy ? {size: 6, offset: 3} : {size: 6}} className={classNames({"px-5" : isAda})}>
                <h4>Password</h4>
                {userAuthSettings && userAuthSettings.hasSegueAccount ? 
                    <>  
                        {(isPhy || (isAda && showPasswordFields)) && 
                        <>
                            {!editingOtherUser && 
                            <FormGroup>
                                <Label htmlFor="password-current">Current password</Label>
                                <PasswordInput
                                    id="password-current" type="password" name="current-password"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                />
                            </FormGroup>}
                            <FormGroup>
                                <Label htmlFor="new-password">New password</Label>
                                <PasswordInput
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
                            <FormGroup>
                                <Label htmlFor="password-confirm">Re-enter new password</Label>
                                <PasswordInput
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
                            {isAda && <>
                                <Input id="submit-password" type="submit" className="btn btn-primary" value="Save new password" />
                            </>}
                        </>}
                        {isAda && !showPasswordFields && <Button className="w-100 py-2 mt-3 mb-2" outline onClick={() => setShowPasswordFields(true)}>Change password</Button>}
                    </>
                : !passwordResetRequested ?
                    <React.Fragment>
                        <Row className="pt-4">
                            <Col className="text-center">
                                {userAuthSettings && userAuthSettings.linkedAccounts && <p>
                                    You do not currently have a password set for this account; you
                                    sign in using {" "}
                                    {(userAuthSettings.linkedAccounts).map((linked, index) => {
                                        return <span key={index} className="text-capitalize">
                                            {AUTHENTICATOR_FRIENDLY_NAMES_MAP[linked]}
                                        </span>;
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
                        <p>
                            <strong className="d-block">Your password reset request is being processed.</strong>
                            <strong className="d-block">Please check your inbox.</strong>
                        </p>
                    </React.Fragment>
                }
                <React.Fragment>
                    <hr className="text-center" />
                    {connectedAccounts.length > 0 && <FormGroup>
                        <h4>Linked {siteSpecific("Accounts", "accounts")}</h4>
                        <Col>
                            {connectedAccounts.map((provider) => {
                                return authButtonsMap[provider](true);
                            })}
                        </Col>
                    </FormGroup>}
                    {unconnectedAccounts.length > 0 && <FormGroup>
                        <h4>Link other accounts</h4>
                        <Col>
                            {unconnectedAccounts.map((provider) => {
                                return authButtonsMap[provider](false);
                            })}
                        </Col>
                    </FormGroup>}
                </React.Fragment>
                <React.Fragment>
                    <hr className="text-center"/>
                    <FormGroup>
                        <h4>Log Out</h4>
                        <small>
                            {"If you forgot to log out on a device you no longer have access to, you can " +
                            "log your account out on all devices, including this one."}
                        </small>
                        <Col className="text-center mt-2 px-0">
                            {isPhy && 
                            <div className="vertical-center ml-2">
                                <Button onClick={() => dispatch(logOutUserEverywhere())}>
                                    Log me out everywhere
                                </Button>
                            </div>}
                            {isAda &&
                            <Button className="w-100 py-2 mt-3 mb-2" outline onClick={() => dispatch(logOutUserEverywhere())}>
                                Log me out everywhere
                            </Button>}
                        </Col>
                    </FormGroup>
                </React.Fragment>
            </Col>
        </Row>
    </CardBody>;
};
