import { useState } from "react";
import { allowedDomain, validateForm } from "../../services";
import { useAppDispatch, registerUser, upgradeAccount } from "../../state";
import { BooleanNotation, DisplaySettings, UserEmailPreferences, ValidationUser } from "../../../IsaacAppTypes";
import { UserContext } from "../../../IsaacApiTypes";
import ReactGA from "react-ga4";
import { Immutable } from "immer";

interface RegisterProps {
  registrationUser: Immutable<ValidationUser>;
  unverifiedPassword: string | undefined;
  userContexts: UserContext[];
  dobOver13CheckboxChecked: boolean;
  emailPreferences: UserEmailPreferences | undefined;
  booleanNotation: BooleanNotation | undefined;
  displaySettings: DisplaySettings | undefined;
  verificationDetails?: string | undefined;
  otherInformation?: string | undefined;
  school?: string | undefined;
  recaptchaToken: string;
}

interface RegistrationOptions {
  isTeacher?: boolean;
}

const useRegistration = ({ isTeacher }: RegistrationOptions) => {
  const dispatch = useAppDispatch();
  const [attemptedSignUp, setAttemptedSignUp] = useState(false);

  const register = ({
    registrationUser,
    unverifiedPassword,
    userContexts,
    dobOver13CheckboxChecked,
    emailPreferences,
    booleanNotation,
    displaySettings,
    verificationDetails,
    otherInformation,
    recaptchaToken,
  }: RegisterProps) => {
    setAttemptedSignUp(true);

    const isValidForm = validateForm(
      registrationUser,
      unverifiedPassword,
      userContexts,
      dobOver13CheckboxChecked,
      emailPreferences,
    );

    const userPreferencesToUpdate = {
      BOOLEAN_NOTATION: booleanNotation,
      DISPLAY_SETTING: displaySettings,
      EMAIL_PREFERENCE: emailPreferences,
    };

    const newUser = { ...registrationUser, loggedIn: false };

    const handleTeacherRegistration = async () => {
      if (isValidForm && allowedDomain(registrationUser.email) && verificationDetails) {
        // create account
        await dispatch(registerUser(newUser, userPreferencesToUpdate, userContexts, recaptchaToken));
        ReactGA.event({
          category: "user",
          action: "registration",
          label: "Create Account (SEGUE)",
        });
        // send email for account upgrade request - email definitely exists as we've already validated it
        const userEmail = registrationUser.email!;
        await dispatch(upgradeAccount({ verificationDetails, userEmail, otherInformation }));
      }
    };

    const handleStudentRegistration = () => {
      if (isValidForm) {
        dispatch(registerUser(newUser, userPreferencesToUpdate, userContexts, recaptchaToken));
        ReactGA.event({
          category: "user",
          action: "registration",
          label: "Create Account (SEGUE)",
        });
      }
    };

    const handleRegistration = () => {
      if (isTeacher) {
        handleTeacherRegistration();
      } else {
        handleStudentRegistration();
      }
    };

    handleRegistration();
  };

  return { register, attemptedSignUp };
};

export default useRegistration;
