import React, {useCallback, useState} from "react";

export const RegisterContentErrorContext = React.createContext<(err: string) => void>((err) => console.error(err));
export const ContentErrorListContext = React.createContext<string[]>([]);

export const ContentErrorBoundary = ({children}: {children?: JSX.Element | JSX.Element[]}) => {
    const [contentErrors, setContentErrors] = useState<string[]>([]);

    const registerContentError = useCallback((err: string) => {
        console.error(err);
        setContentErrors(errs => [...errs, err]);
    }, []);

    return <RegisterContentErrorContext.Provider value={registerContentError}>
        <ContentErrorListContext.Provider value={contentErrors}>
            {children}
        </ContentErrorListContext.Provider>
    </RegisterContentErrorContext.Provider>
}
