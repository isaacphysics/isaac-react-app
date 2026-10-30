import React from 'react';
import { MyAccountTab } from './MyAccountTab';
import { BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser } from '../../../../IsaacAppTypes';
import { RegisteredContextAccountInput } from '../inputs/RegisteredContextAccountInput';
import { BooleanNotationInput } from '../inputs/BooleanNotationInput';
import { UserContext, UserAuthenticationSettingsDTO } from '../../../../IsaacApiTypes';
import { ProgrammingLanguageInput } from '../inputs/ProgrammingLanguageInput';

interface UserContentProps {
    userToUpdate: ValidationUser;
    setUserToUpdate: (user: any) => void;
    registeredContexts: UserContext[];
    setRegisteredContexts: (uc: UserContext[]) => void;
    programmingLanguage: Nullable<ProgrammingLanguage>;
    setProgrammingLanguage: (pl: ProgrammingLanguage) => void;
    booleanNotation: Nullable<BooleanNotation>;
    setBooleanNotation: (bn: BooleanNotation) => void;
    displaySettings: Nullable<DisplaySettings>;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
    submissionAttempted: boolean;
    editingOtherUser: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | undefined;
}
export const UserContent = (props: UserContentProps) => {
    const {
        userToUpdate, setUserToUpdate,
        registeredContexts, setRegisteredContexts,
        programmingLanguage, setProgrammingLanguage,
        booleanNotation, setBooleanNotation,
        displaySettings, setDisplaySettings,
        submissionAttempted, editingOtherUser
    } = props;

    return <MyAccountTab
        leftColumn={<>
            <h2 className="h3">Customise what content you see</h2>
            <p>Answering these questions will help us personalise the platform for you. You can skip this or change your answers at any time.</p>
        </>}
        rightColumn={<>
            <RegisteredContextAccountInput
                user={userToUpdate} registeredContexts={registeredContexts} setRegisteredContexts={setRegisteredContexts}
                displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted} required={false}
            />
            <hr className="border-muted my-4"/>
            <ProgrammingLanguageInput programmingLanguage={programmingLanguage} setProgrammingLanguage={setProgrammingLanguage}/>
            <BooleanNotationInput booleanNotation={booleanNotation} setBooleanNotation={setBooleanNotation} />
        </>}
    />;
};
