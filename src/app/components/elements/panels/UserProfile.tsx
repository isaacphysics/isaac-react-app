import React from 'react';
import {MyAccountTab} from './MyAccountTab';
import {FirstNameInput, LastNameInput} from '../inputs/NameInput';
import {EmailInput} from '../inputs/EmailInput';
import {ValidationUser} from '../../../../IsaacAppTypes';
import {isTeacherOrAbove, SITE_TITLE, validateEmail, validateName} from '../../../services';
import {CountryInput} from '../inputs/CountryInput';
import {GenderInput} from '../inputs/GenderInput';
import {SchoolInput} from "../inputs/SchoolInput";

interface UserProfileProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
}

export const UserProfile = ({userToUpdate, setUserToUpdate, submissionAttempted, editingOtherUser}: UserProfileProps) => {
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
            <CountryInput
                userToUpdate={userToUpdate}
                setUserToUpdate={setUserToUpdate}
                submissionAttempted={submissionAttempted}
                required={true}
            />
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
        </>}
    />;
};