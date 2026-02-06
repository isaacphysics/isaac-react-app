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
import { openActiveModal, store, useConfirmAccountDeletionRequestMutation } from '../../../state';
import { Button } from 'reactstrap';
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
            {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center border-muted my-4"/>)}
            <CountryInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                submissionAttempted={submissionAttempted}
                required={isAda}
            />
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
