import React from 'react';
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
import { EMAIL_VERIFICATION_WARNINGS_DISABLED, openActiveModal, showSuccessToast, store, useAppDispatch, useConfirmAccountDeletionRequestMutation, useCookie, useRequestEmailVerificationMutation } from '../../../state';
import { Alert, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

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
    userAuthSettings: UserAuthenticationSettingsDTO | null;
}

export const UserProfile = (props: UserProfileProps) => {
    const {
        userToUpdate, setUserToUpdate, userContexts, setUserContexts,
        setBooleanNotation, displaySettings, setDisplaySettings, submissionAttempted
    } = props;
    const [confirmAccountDeletionRequest, {isLoading: _isLoading}] = useConfirmAccountDeletionRequestMutation();
    const [sendVerificationEmail, {isSuccess: isVerificationEmailSent}] = useRequestEmailVerificationMutation();
    const dispatch = useAppDispatch();

    const [emailVerificationWarningsDisabled, disableEmailVerificationWarnings, restoreEmailVerificationWarnings, hasModifiedEmailVerificationState] = useCookie(EMAIL_VERIFICATION_WARNINGS_DISABLED);

    return <MyAccountTab
        leftColumn={<>
            <h3>Account details</h3>
            <p>Here you can see and manage your account details for {SITE_TITLE}.</p>
            <p>
                <AccountTypeMessage role={userToUpdate?.role} />
            </p>
            {!isTutorOrAbove(userToUpdate) ? <p>
                If you would like to delete your account, please <span className="text-nowrap"><Button className={classNames({"btn-link": isPhy})} color="inline-link" onClick={() => {
                    store.dispatch(openActiveModal(ConfirmAccountDeletionRequestModal(confirmAccountDeletionRequest)));
                }}>{siteSpecific("click here", <strong>click here</strong>)}</Button>.</span>
            </p> : <p>
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
            <EmailInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                emailIsValid={!!validateEmail(userToUpdate.email)}
                submissionAttempted={submissionAttempted}
                required={true}
            />
            {userToUpdate?.emailVerificationStatus !== "VERIFIED" && <Alert color="warning" className="d-flex mt-2">
                <i className="icon icon-warning icon-color-alert icon-sm me-3 mt-1" />
                <div>
                    Your email address is unverified. This may affect your ability to receive important notifications.
                    <br/><br/>
                    <Button color="link primary-font-link" onClick={() => userToUpdate.email && sendVerificationEmail({email: userToUpdate.email})} disabled={isVerificationEmailSent}>
                        {isVerificationEmailSent ? "Verification email sent!" : "Click here to request a new verification email."}
                    </Button>
                    <br/>
                    <details>
                        <summary>Other options</summary>
                        <div className="ms-4 mt-3">
                            <p>
                                In some situations, schools or departments block email from external sites like ours, which may prevent you from receiving verification emails.
                                If this is the case, please contact your IT department to see if they can allow emails from {SITE_TITLE}.
                                We have a <Link to="/pages/emails">help page</Link> regarding our email setup that may be of use.
                            </p>
                            <p>
                                If your IT department is unable to assist, you can disable banner warnings on the site for this browser. We strongly recommend against this. 
                                Unverified email addresses may lead to issues with account recovery and you may miss important security notifications from {SITE_TITLE}.
                            </p>
                            <p>
                                You can change this option at any time.
                            </p>
                            <Button disabled={hasModifiedEmailVerificationState} onClick={() => {
                                if (emailVerificationWarningsDisabled) {
                                    restoreEmailVerificationWarnings();
                                } else {
                                    disableEmailVerificationWarnings();
                                }
                                dispatch(emailVerificationWarningsDisabled 
                                    ? showSuccessToast("Warnings restored", "Email verification warnings have been restored. You may need to refresh the page for this to take effect.")
                                    : showSuccessToast("Warnings disabled", "Email verification warnings have been disabled for this browser. You may need to refresh the page for this to take effect."));
                            }}>
                                {hasModifiedEmailVerificationState
                                    ? "Success!"
                                    : emailVerificationWarningsDisabled ? "Restore warnings" : "Disable warnings"
                                }
                            </Button>
                        </div>
                    </details>
                </div>
            </Alert>}
            {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center border-muted my-4"/>)}
            {isAda &&
                <CountryInput
                    userToUpdate={userToUpdate}
                    setUserToUpdate={setUserToUpdate}
                    countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                    submissionAttempted={submissionAttempted}
                    required={true}
                />
            }
            <SchoolInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
                required={isTeacherOrAbove(userToUpdate)}
            />
            {isPhy &&
                <DobInput
                    userToUpdate={userToUpdate}
                    setUserToUpdate={setUserToUpdate}
                    submissionAttempted={submissionAttempted}
                />
            }
            <GenderInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
                required={false}
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
