import React, { useState } from 'react';
import {MyAccountTab} from './MyAccountTab';
import {FamilyNameInput, GivenNameInput} from '../inputs/NameInput';
import {EmailInput} from '../inputs/EmailInput';
import {BooleanNotation, DisplaySettings, ValidationUser} from '../../../../IsaacAppTypes';
import {
    isAda,
    isPhy,
    isTeacherOrAbove,
    isTutorOrAbove,
    SITE_TITLE,
    siteSpecific,
    useUserConsent,
    validateCountryCode,
    validateEmail,
    validateName
} from '../../../services';
import {CountryInput} from '../inputs/CountryInput';
import {GenderInput} from '../inputs/GenderInput';
import {SchoolInput} from "../inputs/SchoolInput";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {UserAuthenticationSettingsDTO, UserContext} from "../../../../IsaacApiTypes";
import {DobInput} from "../inputs/DobInput";
import {AccountTypeMessage} from "../AccountTypeMessage";
import { ConfirmAccountDeletionRequestModal } from '../modals/AccountDeletionModal';
import { cookieConsentSlice, DISABLE_EMAIL_VERIFICATION_WARNING_COOKIE, openActiveModal, showSuccessToast, store, useAppDispatch, useConfirmAccountDeletionRequestMutation, useRequestEmailVerificationMutation } from '../../../state';
import { Alert, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Trans, useTranslation } from "react-i18next";

interface UserProfileProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    userContexts: UserContext[];
    setUserContexts: (uc: UserContext[]) => void;
    booleanNotation: Nullable<BooleanNotation>;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | undefined;
}

export const UserProfile = (props: UserProfileProps) => {
    const { t } = useTranslation();
    const {
        userToUpdate, setUserToUpdate, userContexts, setUserContexts,
        setBooleanNotation, displaySettings, setDisplaySettings, submissionAttempted
    } = props;
    const [confirmAccountDeletionRequest, {isLoading: _isLoading}] = useConfirmAccountDeletionRequestMutation();
    const [sendVerificationEmail, {isSuccess: isVerificationEmailSent}] = useRequestEmailVerificationMutation();
    const dispatch = useAppDispatch();

    const {cookieConsent} = useUserConsent();
    const emailVerificationWarningsDisabled = cookieConsent?.disableEmailVerificationWarningCookiesAccepted ?? false;
    const [hasModifiedEmailVerificationState, setHasModifiedEmailVerificationState] = useState(false);

    return <MyAccountTab
        leftColumn={<>
            <h2 className="h3">{t("common:account.profile.title")}</h2>
            <p>{t("common:account.profile.description", { siteTitle: SITE_TITLE })}</p>
            <p>
                <AccountTypeMessage role={userToUpdate?.role} hideUpgradeMessage={userToUpdate.emailVerificationStatus === "AGE_RESTRICTED"} />
            </p>
            {userToUpdate.emailVerificationStatus === "AGE_RESTRICTED" ?
                <p>If you would like to delete your account, please ask your parent or guardian to <Link to="/contact?preset=accountDeletion">{siteSpecific("contact us", <strong>contact us</strong>)}</Link>.</p>
                : !isTutorOrAbove(userToUpdate) ? <p>
                    If you would like to delete your account, please <span className="text-nowrap"><Button className={classNames({"btn-link": isPhy})} color="inline-link" onClick={() => {
                        store.dispatch(openActiveModal(ConfirmAccountDeletionRequestModal(confirmAccountDeletionRequest)));
                    }}>{siteSpecific("click here", <strong>click here</strong>)}</Button>.</span>
                </p>
                    : <p>
                        Only student accounts can be deleted automatically. Please{" "}
                        <Link to="/contact?preset=accountDeletion">{siteSpecific("contact us", <strong>contact us</strong>)}</Link>
                        {" "}to request account deletion.
                    </p>}
        </>}
        rightColumn={<>
            {siteSpecific(
                <>
                    <div className="row row-cols-2">
                        <GivenNameInput
                            userToUpdate={userToUpdate}
                            setUserToUpdate={setUserToUpdate}
                            nameValid={!!validateName(userToUpdate.givenName)}
                            submissionAttempted={submissionAttempted}
                            required={true}
                        />
                        <FamilyNameInput
                            userToUpdate={userToUpdate}
                            setUserToUpdate={setUserToUpdate}
                            nameValid={!!validateName(userToUpdate.familyName)}
                            submissionAttempted={submissionAttempted}
                            required={true}
                        />
                    </div>
                </>,
                <>
                    <GivenNameInput
                        userToUpdate={userToUpdate}
                        setUserToUpdate={setUserToUpdate}
                        nameValid={!!validateName(userToUpdate.givenName)}
                        submissionAttempted={submissionAttempted}
                        required={true}
                    />
                    <FamilyNameInput
                        userToUpdate={userToUpdate}
                        setUserToUpdate={setUserToUpdate}
                        nameValid={!!validateName(userToUpdate.familyName)}
                        submissionAttempted={submissionAttempted}
                        required={true}
                    />
                </>
            )}
            {userToUpdate.emailVerificationStatus !== "AGE_RESTRICTED" && <EmailInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                emailIsValid={!!validateEmail(userToUpdate.email)}
                submissionAttempted={submissionAttempted}
                required={true}
            />}
            {(userToUpdate.emailVerificationStatus === "NOT_VERIFIED" || userToUpdate.emailVerificationStatus === "DELIVERY_FAILED") && <Alert color="warning" className="d-flex mt-2">
                <i className="icon icon-warning icon-color-alert icon-sm me-3 mt-1" />
                <div>
                    {t("common:account.profile.emailUnverified")}
                    <br/><br/>
                    <Button color="link primary-font-link" onClick={() => userToUpdate.email && sendVerificationEmail({email: userToUpdate.email})} disabled={isVerificationEmailSent}>
                        {isVerificationEmailSent ? t("common:account.profile.emailSent") : t("common:account.profile.requestVerification")}
                    </Button>
                    {userToUpdate.emailVerificationStatus === "DELIVERY_FAILED" && <>
                        <br/><br/>
                        <details>
                            <summary>{t("common:account.profile.otherOptions")}</summary>
                            <div className="ms-4 mt-3">
                                <p>
                                    <Trans i18nKey="common:account.profile.emailBlockedInfo" components={{ emailHelpLink: <Link to="/pages/emails" /> }} values={{ siteTitle: SITE_TITLE }} />
                                </p>
                                <p>
                                    {t("common:account.profile.disableWarningsWarning", { siteTitle: SITE_TITLE })}
                                </p>
                                <p>
                                    {t("common:account.profile.optionReversible")}
                                </p>
                                <Button disabled={hasModifiedEmailVerificationState} onClick={() => {
                                    if (emailVerificationWarningsDisabled) {
                                        dispatch(cookieConsentSlice.actions.removeCookie(DISABLE_EMAIL_VERIFICATION_WARNING_COOKIE));
                                    } else {
                                        dispatch(cookieConsentSlice.actions.acceptCookie(DISABLE_EMAIL_VERIFICATION_WARNING_COOKIE));
                                    }
                                    dispatch(emailVerificationWarningsDisabled 
                                        ? showSuccessToast(t("common:account.profile.warningsRestoredTitle"), t("common:account.profile.warningsRestoredMessage"))
                                        : showSuccessToast(t("common:account.profile.warningsDisabledTitle"), t("common:account.profile.warningsDisabledMessage")));
                                    setHasModifiedEmailVerificationState(true);
                                }}>
                                    {hasModifiedEmailVerificationState
                                        ? t("common:account.profile.success")
                                        : emailVerificationWarningsDisabled ? t("common:account.profile.restoreWarnings") : t("common:account.profile.disableWarnings")
                                    }
                                </Button>
                            </div>
                        </details>
                    </>}
                </div>
            </Alert>}
            <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
            <CountryInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                submissionAttempted={submissionAttempted}
                required={true}
                textOverride={siteSpecific(t("sci:account.profile.countryDescription"), undefined)}
            />
            <SchoolInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
                required={isAda && isTeacherOrAbove(userToUpdate)}
            />
            <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
            <DobInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
            />
            <GenderInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
                required={isAda}
            />
            {isPhy &&
                <UserContextAccountInput
                    user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                    displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                    setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted} required={true}
                />
            }
        </>}
    />;
};
