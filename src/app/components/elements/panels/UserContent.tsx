import React from 'react';
import { MyAccountTab } from './MyAccountTab';
import { BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser } from '../../../../IsaacAppTypes';
import { UserContextAccountInput } from '../inputs/UserContextAccountInput';
import { BooleanNotationInput } from '../inputs/BooleanNotationInput';
import { UserContext, UserAuthenticationSettingsDTO } from '../../../../IsaacApiTypes';
import { ProgrammingLanguageInput } from '../inputs/ProgrammingLanguageInput';

interface UserContentProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    userContexts: UserContext[];
    setUserContexts: (uc: UserContext[]) => void;
    programmingLanguage: Nullable<ProgrammingLanguage>;
    setProgrammingLanguage: (pl: ProgrammingLanguage) => void;
    booleanNotation: Nullable<BooleanNotation>;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
}
export const UserContent = (props: UserContentProps) => {
    const {
        userToUpdate, setUserToUpdate,
        userContexts, setUserContexts,
        programmingLanguage, setProgrammingLanguage,
        booleanNotation, setBooleanNotation,
        displaySettings, setDisplaySettings,
        submissionAttempted, editingOtherUser
    } = props;

    return <MyAccountTab
        leftColumn={<>
            <h3>Account details</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mi sit amet mauris commodo quis imperdiet massa tincidunt.</p>
            <p>If you would like to delete your account please <a href="/contact?preset=accountDeletion" target="_blank" rel="noopener noreferrer">contact us</a>.</p>
        </>}
        rightColumn={<>
            <UserContextAccountInput
                user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
            />
            <hr className="border-muted my-4"/>
            <ProgrammingLanguageInput programmingLanguage={programmingLanguage} setProgrammingLanguage={setProgrammingLanguage}/>
            <BooleanNotationInput booleanNotation={booleanNotation} setBooleanNotation={setBooleanNotation} />
        </>}
    />;
};