import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector, AppState, logInUser } from "../state";
import { extractErrorMessage } from "./errors";

/* Interconnected state and functions providing a "logging in" API - intended to be used within a component that displays
 * email and password inputs, and a button to login, all inside a Form component. You will also need a TFAInput component,
 * to handle when users have two-factor auth enabled.
 * For examples, see usage in LogIn or LoginOrSignUpBody components.
 */
export const useLoginLogic = () => {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const totpChallengePending = useAppSelector((state: AppState) => state?.totpChallengePending);
    const error = useAppSelector((state: AppState) => state?.error);
    const errorMessage = extractErrorMessage(error);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [logInAttempted, setLoginAttempted] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");
    const isValidPassword = password.length > 0;

    const [passwordResetAttempted, setPasswordResetAttempted] = useState(false);

    const validateAndLogIn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if ((isValidPassword && isValidEmail)) {
            void dispatch(logInUser("SEGUE", {email: email, password: password, rememberMe: rememberMe}));
        }
    };

    const signUp = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register", { state: { email: email, password: password } });
    };

    const attemptLogIn = () => {
        setLoginAttempted(true);
    };

    return {
        loginFunctions: {attemptLogIn, signUp, validateAndLogIn},
        setStateFunctions: {setEmail, setPassword, setRememberMe, setPasswordResetAttempted},
        loginValues: {email, totpChallengePending, errorMessage, logInAttempted, passwordResetAttempted, rememberMe, isValidEmail, isValidPassword}
    };
};
