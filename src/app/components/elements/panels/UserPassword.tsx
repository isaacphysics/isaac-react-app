import {Button, Col, FormGroup, Label, Row} from "reactstrap";
import React, {useState} from "react";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {AuthenticationProvider, UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {
    AUTHENTICATOR_FRIENDLY_NAMES_MAP,
    AUTHENTICATOR_PROVIDERS,
    MINIMUM_PASSWORD_LENGTH,
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
import { Spacer } from "../Spacer";
import { useTranslation } from "react-i18next";

interface UserPasswordProps {
    currentPassword?: string;
    currentUserEmail?: string;
    setCurrentPassword: (e: React.SetStateAction<string>) => void;
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isNewPasswordValid: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | undefined;
    setNewPassword: (e: React.SetStateAction<string>) => void;
    newPassword: string;
    editingOtherUser: boolean;
    submissionAttempted: boolean;
}

const ThirdPartyAccount = ({provider, isLinked, imgCss} : {provider: AuthenticationProvider, isLinked: boolean, imgCss: string}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    return <button 
        type="button"
        className={classNames("w-100 d-flex align-items-center linked-account-button-outer bg-white mb-1", {"mx-2" : above['sm'](deviceSize)})}
        onClick={(e) => {
            dispatch(isLinked ? unlinkAccount(provider) : linkAccount(provider));
            e.stopPropagation();
        }}
    >
        <span className={`linked-account-button ${imgCss}`}/>
        <span className="ms-2">{AUTHENTICATOR_FRIENDLY_NAMES_MAP[provider]}</span>
        <Spacer/>
        <span className="me-4 btn btn-link">
            {isLinked ? <span>{t("common:account.linkedAccounts.unlink")}</span> : <span>{t("common:account.linkedAccounts.link")}</span>}
        </span>
    </button>;
};

export const UserPassword = (
    {currentPassword, currentUserEmail, setCurrentPassword, myUser, setMyUser, isNewPasswordValid, userAuthSettings, setNewPassword, newPassword, editingOtherUser, submissionAttempted}: UserPasswordProps) => {
    const { t } = useTranslation();

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
        "GOOGLE": (isLinked: boolean) => <ThirdPartyAccount provider={"GOOGLE"} imgCss="google-button" isLinked={isLinked}/>,
        "MICROSOFT": (isLinked: boolean) => <ThirdPartyAccount provider={"MICROSOFT"} imgCss="microsoft-button" isLinked={isLinked}/>
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
            <h2 className="h3">{t("common:account.security.title")}</h2>
            <p>{t("common:account.security.description")}</p>
        </>}
        rightColumn={<>
            <h3 className="h4">{t("common:account.security.passwordTitle")}</h3>
            {userAuthSettings && userAuthSettings.hasSegueAccount ? 
                <>  
                    {(isPhy || (isAda && showPasswordFields)) && 
                    <>
                        {!editingOtherUser && 
                        <FormGroup className="form-group">
                            <Label htmlFor="password-current">{t("common:account.security.currentPasswordLabel")}</Label>
                            <TogglablePasswordInput
                                id="password-current" type="password" name="current-password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setCurrentPassword(e.target.value)
                                }
                            />
                        </FormGroup>}
                        <FormGroup className="form-group pb-2">
                            <Label htmlFor="new-password">{t("common:account.security.newPasswordLabel")}</Label>
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
                                feedbackText={t("common:account.security.minLengthFeedback", { minLength: MINIMUM_PASSWORD_LENGTH })}
                                aria-describedby="passwordValidationMessage"
                                disabled={!editingOtherUser && currentPassword == ""}
                            />
                            {passwordFeedback && <span className='float-end small'>
                                <strong>{t("common:account.security.strengthLabel")} </strong>
                                <span id="password-strength-feedback">
                                    {passwordFeedback.feedbackText}
                                </span>
                            </span>}
                        </FormGroup>
                    </>}
                    {isAda && !showPasswordFields && <Button className="w-100 py-2 mt-3 mb-2" color="keyline" onClick={() => setShowPasswordFields(true)}>{t("common:account.security.changePasswordButton")}</Button>}
                </>
                : !passwordResetRequested ?
                    <React.Fragment>
                        <Row className="pt-4">
                            <Col className="text-center">
                                {userAuthSettings && userAuthSettings.linkedAccounts && <p>
                                    You do not currently have a password set for this account; you
                                    sign in using {" "}
                                    {(userAuthSettings.linkedAccounts).map((linked, index) => {
                                        return <span key={index}>
                                            {index > 0 && " or "}
                                            {AUTHENTICATOR_FRIENDLY_NAMES_MAP[linked]}
                                        </span>;
                                    })}.
                                </p>}
                            </Col>
                        </Row>
                        {myUser.emailVerificationStatus !== "AGE_RESTRICTED" && <Row className="pb-4">
                            <Col className="text-center">
                                <Button className="btn-keyline" onClick={resetPasswordIfValidEmail}>
                                    {t("common:account.security.addPasswordButton")}
                                </Button>
                            </Col>
                        </Row>}
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <p>
                            <strong className="d-block">{t("common:account.security.resetProcessing")}</strong>
                            <strong className="d-block">{t("common:account.security.checkInbox")}</strong>
                        </p>
                    </React.Fragment>
            }
            <React.Fragment>
                {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center"/>)}
                {connectedAccounts.length > 0 && <FormGroup className="form-group">
                    <h3 className="h4">{t("site:account.linkedAccounts.title")}</h3>
                    <Col>
                        {connectedAccounts.map((provider) => {
                            return <React.Fragment key={provider}>{authButtonsMap[provider](true)}</React.Fragment>;
                        })}
                    </Col>
                </FormGroup>}
                {unconnectedAccounts.length > 0 && <FormGroup className="form-group">
                    <h3 className="h4">{t("common:account.linkedAccounts.otherTitle")}</h3>
                    <Col>
                        {unconnectedAccounts.map((provider) => {
                            return <React.Fragment key={provider}>{authButtonsMap[provider](false)}</React.Fragment>;
                        })}
                    </Col>
                </FormGroup>}
            </React.Fragment>
            <React.Fragment>
                {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center"/>)}
                <FormGroup className="form-group">
                    <h3 className="h4">{t("common:account.logOut.title")}</h3>
                    <p>
                        {t("common:account.logOut.description")}
                    </p>
                    <Col className="text-center mt-2 px-0">
                        <Button className={classNames("w-100 py-2", {"mt-3": isAda})} color="keyline" onClick={() => dispatch(logOutUserEverywhere())}>
                            Log {above['sm'](deviceSize) ? "me " : ""}out everywhere
                        </Button>
                    </Col>
                </FormGroup>
            </React.Fragment>
        </>}
    />;
};
