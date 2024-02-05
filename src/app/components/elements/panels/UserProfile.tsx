import React from 'react';
import {MyAccountTab} from './MyAccountTab';
import {FirstNameInput, LastNameInput} from '../inputs/NameInput';
import {EmailInput} from '../inputs/EmailInput';
import {BooleanNotation, DisplaySettings, ValidationUser} from '../../../../IsaacAppTypes';
import {isAda, isPhy, isTeacherOrAbove, SITE_TITLE, validateEmail, validateName} from '../../../services';
import {CountryInput} from '../inputs/CountryInput';
import {GenderInput} from '../inputs/GenderInput';
import {SchoolInput} from "../inputs/SchoolInput";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {UserAuthenticationSettingsDTO, UserContext} from "../../../../IsaacApiTypes";

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
        userToUpdate, setUserToUpdate, userContexts, setUserContexts, booleanNotation,
        setBooleanNotation, displaySettings, setDisplaySettings, submissionAttempted, editingOtherUser
    } = props;
    return <MyAccountTab
        leftColumn={<>
            <h3>Account details</h3>
            <p>Here you can see and manage your account details for {SITE_TITLE}.</p>
            <p>If you would like to delete your account please <a href="/contact?preset=accountDeletion" target="_blank" rel="noopener noreferrer">contact us</a>.</p>
        </>}
        rightColumn={<>
            <FirstNameInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                nameValid={!!validateName(userToUpdate.givenName)}
                submissionAttempted={submissionAttempted}
                required={true}
            />
            <LastNameInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                nameValid={!!validateName(userToUpdate.familyName)}
                submissionAttempted={submissionAttempted}
                required={true}
            />
            <EmailInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                emailIsValid={!!validateEmail(userToUpdate.email)}
                submissionAttempted={submissionAttempted}
                required={true}
            />
            <hr className="text-center border-muted my-4"/>
            {isAda &&
                <CountryInput
                    userToUpdate={userToUpdate}
                    setUserToUpdate={setUserToUpdate}
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
                    setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted} required={isPhy}
                />
            }
        </>}
    />;
};