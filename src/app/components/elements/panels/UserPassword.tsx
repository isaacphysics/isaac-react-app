import {Button, Col, FormGroup, Label, Row} from "reactstrap";
import React, {useState} from "react";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {AuthenticationProvider, UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {
    AUTHENTICATOR_FRIENDLY_NAMES_MAP,
    AUTHENTICATOR_PROVIDERS,
    above,
    isAda,
    isPhy,
    loadZxcvbnIfNotPresent,
    passwordDebounce,
    siteSpecific,
    useDeviceSize,
    validateEmail
} from "../../../services";
import classNames from "classnames";
import {linkAccount, logOutUserEverywhere, resetPassword, unlinkAccount, useAppDispatch} from "../../../state";
import {TogglablePasswordInput} from "../inputs/TogglablePasswordInput";
import { MyAccountTab } from "./MyAccountTab";

interface UserPasswordProps {
    currentPassword?: string;
    currentUserEmail?: string;
    setCurrentPassword: (e: React.SetStateAction<string>) => void;
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isNewPasswordValid: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    setNewPassword: (e: React.SetStateAction<string>) => void;
    newPassword: string;
    editingOtherUser: boolean;
    submissionAttempted: boolean;
}

const ThirdPartyAccount = ({provider, isLinked, imgCss} : {provider: AuthenticationProvider, isLinked: boolean, imgCss: string}) => {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    return <Row className={classNames("align-items-center linked-account-button-outer mb-1", {"mx-2" : above['sm'](deviceSize)})}>
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

export const UserPassword = (
    {currentPassword, currentUserEmail, setCurrentPassword, myUser, setMyUser, isNewPasswordValid, userAuthSettings, setNewPassword, newPassword, editingOtherUser, submissionAttempted}: UserPasswordProps) => {

    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
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

    return <MyAccountTab
        leftColumn={<>
            <h3>Account security</h3>
            <p>Here you can change your password, link or unlink a third party account you use to sign in, and log out of all devices.</p>
        </>}
        rightColumn={<>
            <h4>Password</h4>
            {userAuthSettings && userAuthSettings.hasSegueAccount ? 
                <>  
                    {(isPhy || (isAda && showPasswordFields)) && 
                    <>
                        {!editingOtherUser && 
                        <FormGroup>
                            <Label htmlFor="password-current">Current password</Label>
                            <TogglablePasswordInput
                                id="password-current" type="password" name="current-password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setCurrentPassword(e.target.value)
                                }
                            />
                        </FormGroup>}
                        <FormGroup>
                            <Label htmlFor="new-password">New password</Label>
                            <TogglablePasswordInput
                                invalid={submissionAttempted && !isNewPasswordValid}
                                id="new-password" type="password" name="new-password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setNewPassword(e.target.value);
                                    setMyUser(Object.assign({}, myUser, {password: e.target.value}));
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
                    <p>
                        {"If you forgot to log out on a device you no longer have access to, you can " +
                        "log your account out on all devices, including this one."}
                    </p>
                    <Col className="text-center mt-2 px-0">
                        <Button className={classNames("w-100 py-2 mt-3 mb-2", isAda)} color="primary" outline onClick={() => dispatch(logOutUserEverywhere())}>
                            Log {above['sm'](deviceSize) ? "me " : ""}out everywhere
                        </Button>
                    </Col>
                </FormGroup>
            </React.Fragment>
        </>}
    />;
};
