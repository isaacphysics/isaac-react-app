import { useState } from "react";
import { FIRST_LOGIN_STATE, KEY, allowedDomain, persistence, validateForm } from "../../services";
import { useAppDispatch, registerUser, submitMessage } from "../../state";
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
    school,
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

    const handleTeacherRegistration = () => {
      if (isValidForm && allowedDomain(registrationUser.email) && verificationDetails) {
        // create account
        dispatch(registerUser(newUser, userPreferencesToUpdate, userContexts, recaptchaToken));
        ReactGA.event({
          category: "user",
          action: "registration",
          label: "Create Account (SEGUE)",
        });

        const subject = "Teacher Account Request";
        const firstName = registrationUser.givenName || "";
        const lastName = registrationUser.familyName || "";
        const emailAddress = registrationUser.email || "";
        const message =
          "Hello,\n\n" +
          "Please could you convert my Isaac account into a teacher account.\n\n" +
          "My school is: " +
          school +
          "\n" +
          "A link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: " +
          verificationDetails +
          "\n\n" +
          "Any other information: " +
          otherInformation +
          "\n\n" +
          "Thanks, \n\n" +
          firstName +
          " " +
          lastName;
        // send email for account upgrade request
        dispatch(
          submitMessage({
            firstName,
            lastName,
            emailAddress,
            subject,
            message,
          }),
        );
      }
    };

    const handleStudentRegistration = () => {
      if (isValidForm) {
        persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);

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
