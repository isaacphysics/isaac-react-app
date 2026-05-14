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
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()
    const {
        userToUpdate, setUserToUpdate, userContexts, setUserContexts,
        setBooleanNotation, displaySettings, setDisplaySettings, submissionAttempted
    } = props;
    const [confirmAccountDeletionRequest, {isLoading: _isLoading}] = useConfirmAccountDeletionRequestMutation();

    return <MyAccountTab
        leftColumn={<>
            <h3>{t('accountDetails', 'Account details')}</h3>
            <p>{t('hereYouCanSeeAndManageYourAccountDetailsForSite_title', 'Here you can see and manage your account details for {{SITE_TITLE}}.', { SITE_TITLE })}</p>
            <p>
                <AccountTypeMessage role={userToUpdate?.role} />
            </p>
            {!isTutorOrAbove(userToUpdate) ? <p>
                {t('ifYouWouldLikeToDeleteYourAccountPlease', 'If you would like to delete your account, please')} <span className="text-nowrap"><Button className={classNames({"btn-link": isPhy})} color="inline-link" onClick={() => {
                    store.dispatch(openActiveModal(ConfirmAccountDeletionRequestModal(confirmAccountDeletionRequest)));
                }}>{siteSpecific(t('clickHere2', 'click here'), <strong>{t('clickHere2', 'click here')}</strong>)}</Button>.</span>
            </p> : <p>
                {t('onlyStudentAccountsCanBeDeletedAutomaticallyPlease', 'Only student accounts can be deleted automatically. Please')}{" "}
                <Link to="/contact?preset=accountDeletion">{siteSpecific("contact us", <strong>{t('contactUs', 'contact us')}</strong>)}</Link>
                {" "}{t('toRequestAccountDeletion', 'to request account deletion.')}
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
            <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
            <CountryInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                submissionAttempted={submissionAttempted}
                required={true}
                textOverride={siteSpecific(t('thisHelpsUsToMeasureOurReachAndImpactIfYouDidNotSelectACountryWhenYouRegisteredWeMayHaveSuggestedOneFromYourSchoolOrSchoolEmailAddress', 'This helps us to measure our reach and impact. If you did not select a country when you registered, we may have suggested one from your school or school email address.'), undefined)}
            />
            <SchoolInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
                required={isAda && isTeacherOrAbove(userToUpdate)}
            />
            <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
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
