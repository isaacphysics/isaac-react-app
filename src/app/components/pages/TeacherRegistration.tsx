import React, { useEffect, useRef, useState } from "react";
import { selectors, useAppSelector } from "../../state";
import { Button, Card, CardBody, CardTitle, Col, Container, Form, FormFeedback, Row } from "reactstrap";
import { BooleanNotation, DisplaySettings, UserEmailPreferences, ValidationUser } from "../../../IsaacAppTypes";
import { api, loadZxcvbnIfNotPresent, REGISTER_CRUMB, schoolNameWithPostcode, validateForm } from "../../services";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Redirect } from "react-router";
import { MetaDescription } from "../elements/MetaDescription";
import { SchoolInput } from "../elements/inputs/SchoolInput";
import { UserContext } from "../../../IsaacApiTypes";
import { Immutable } from "immer";
import { RegistrationContext } from "../elements/inputs/RegistrationContext";
import { RegistrationEmailPreference } from "../elements/inputs/RegistrationEmailPreference";
import { GenderInput } from "../elements/inputs/GenderInput";
import { EmailInput } from "../elements/inputs/EmailInput";
import { RegistrationNameInput } from "../elements/inputs/RegistrationNameInput";
import { RegistrationDobInput } from "../elements/inputs/RegistrationDobInput";
import { RegistrationPasswordInputs } from "../elements/inputs/RegistrationPasswordInputs";
import TeacherVerification from "../elements/inputs/TeacherVerification";
import useRegistration from "../hooks/useRegistration";
import { RegistrationSubmit } from "../elements/inputs/RegistrationSubmit";
import ReCAPTCHA from "react-google-recaptcha";
import { Recaptcha } from "../elements/inputs/Recaptcha";

const metaDescriptionCS =
  "Sign up for a free account and get powerful GCSE and A Level Computer Science resources and questions. For classwork, homework, and revision.";

export const TeacherRegistrationTerms = ({ acceptConditions }: { acceptConditions: (arg0: boolean) => void }) => {
  return (
    <Container id="teacher-conditions" className="mb-5">
      <TitleAndBreadcrumb
        currentPageTitle="Conditions for Teacher accounts"
        breadcrumbTitleOverride="Teacher"
        intermediateCrumbs={[REGISTER_CRUMB]}
        className="mb-4"
      />
      <MetaDescription description={metaDescriptionCS} />
      <p className="mt-5">
        To be eligible to upgrade your Isaac Computer Science account to a teacher account, you must meet the following
        criteria:
      </p>
      <ul>
        <li>You must be at least 18 years of age</li>
        <li>You must be a qualified teacher or professional tutor</li>
        <li>
          Your profile on the Isaac platform must be set up under your own full name, not the name of your department
        </li>
        <li>
          Your profile on the Isaac platform must include the name of your school, unless you are applying as a private
          tutor
        </li>
        <li>
          You must use the email address given to you by your school or institution, or used for your private tuition
          services.
        </li>
        <li>You must have verified your email address by clicking on the link that we sent to you by email</li>
      </ul>
      <h3>Verification of teacher accounts</h3>
      <p>Isaac Computer Science accounts are upgraded to teacher accounts following a manual verification process:</p>
      <ul>
        <li>
          If your school&apos;s website features a staff list, we will check that your verified email domain matches the
          URL of your school&apos;s website, and that you are listed as a member of staff.
        </li>
        <li>
          If your school&apos;s website does not feature a staff list, we will contact your school&apos;s reception by
          telephone to verify that you are a member of staff.
        </li>
        <li>
          If you are a private tutor we ask that you provide a reference from a former colleague at a school, evidence
          of your tutoring services and a DBS certificate.
        </li>
      </ul>
      <p>
        We process all requests as quickly as possible, however, please note that the initial stage can take up to 5
        working days. To help us process your request quickly, please provide a link to a page on your school&apos;s
        website on which you are listed as a member of staff, or if you know that you are not listed on the school
        website, please inform your school reception team that they may receive a call from us.
      </p>
      <h3>What does a teacher account give you?</h3>
      <p>
        A teacher account gives you access to features that help you to set questions and view student progress from the
        platform. The features are designed for use in the classroom or for setting homework. Teacher accounts can:
      </p>
      <ul>
        <li>create groups for your students to join</li>
        <li>assign pre-made gameboards to your class groups</li>
        <li>create your own gameboards from the pre-made questions available</li>
        <li>view progress of the students in a group you have created</li>
      </ul>
      <p>Teacher accounts do not give you access to:</p>
      <ul>
        <li>any additional resources</li>
        <li>the answers to any of the questions</li>
        <li>the ability to communicate directly with students</li>
      </ul>
      <p>
        If you have any further questions, please check our{" "}
        <a href="https://isaaccomputerscience.org/support/teacher/general">FAQ section</a>.
      </p>
      <p className="text-center mb-1 mt-4">
        <Button onClick={() => acceptConditions(true)} className="btn btn-secondary border-0">
          Continue to a teacher account
        </Button>
      </p>
    </Container>
  );
};

// TODO: useLocation hook to retrieve email/password when upgrading react router to v6+
export const TeacherRegistrationBody = () => {
  const user = useAppSelector(selectors.user.orNull);
  const errorMessage = useAppSelector(selectors.error.general);
  const { register, attemptedSignUp } = useRegistration({ isTeacher: true });

  const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings | undefined>();
  const [userContexts, setUserContexts] = useState<UserContext[]>([{}]);
  const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences | undefined>({ ASSIGNMENTS: true });

  // states & functions for teacher verification
  const [otherInformation, setOtherInformation] = useState("");
  const [verificationDetails, setVerificationDetails] = useState<string>();
  const [school, setSchool] = useState<string | undefined>();

  // Inputs which trigger re-render
  const [registrationUser, setRegistrationUser] = useState<Immutable<ValidationUser>>({
    ...user,
    email: undefined,
    dateOfBirth: undefined,
    password: null,
    familyName: undefined,
    givenName: undefined,
    gender: undefined,
    schoolId: undefined,
    schoolOther: undefined,
    teacherPending: true,
  });

  loadZxcvbnIfNotPresent();

  const [unverifiedPassword, setUnverifiedPassword] = useState<string | undefined>();
  const [dobOver13CheckboxChecked, setDobOver13CheckboxChecked] = useState(true);
  const [isRecaptchaTicked, setIsRecaptchaTicked] = useState(false);

  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  useEffect(() => {
    function fetchSchool(urn: string) {
      if (urn !== "") {
        api.schools.getByUrn(urn).then(({ data }) => {
          setSchool(schoolNameWithPostcode(data[0]));
        });
      } else if (registrationUser.schoolOther) {
        setSchool(registrationUser.schoolOther);
      } else {
        setSchool(undefined);
      }
    }

    fetchSchool(registrationUser.schoolId || "");
  }, [registrationUser.schoolOther, registrationUser.schoolId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (recaptchaRef.current) {
      const recaptchaToken = recaptchaRef.current.getValue() as string;
      register({
        registrationUser: registrationUser,
        unverifiedPassword: unverifiedPassword,
        userContexts: userContexts,
        dobOver13CheckboxChecked: dobOver13CheckboxChecked,
        emailPreferences: emailPreferences,
        booleanNotation: booleanNotation,
        displaySettings: displaySettings,
        verificationDetails: verificationDetails,
        otherInformation: otherInformation,
        school: school,
        recaptchaToken: recaptchaToken,
      });
    }
  };

  if (user && user.loggedIn) {
    return <Redirect to="/" />;
  }

  // Render
  return (
    <Container id="registration-page" className="mb-5">
      <TitleAndBreadcrumb
        currentPageTitle="Register as a teacher"
        breadcrumbTitleOverride="Teacher"
        intermediateCrumbs={[REGISTER_CRUMB]}
        className="mb-4"
      />
      <MetaDescription description={metaDescriptionCS} />

      <Card>
        <CardBody>
          <CardTitle tag="h3">About you</CardTitle>

          <Form name="register" onSubmit={handleSubmit} className="mt-3">
            {/* Name */}
            <Row>
              <RegistrationNameInput
                userToUpdate={registrationUser}
                setUserToUpdate={setRegistrationUser}
                attemptedSignUp={attemptedSignUp}
              />
            </Row>

            {/* School and DOB */}
            <Row>
              <Col md={6}>
                <SchoolInput
                  userToUpdate={registrationUser}
                  setUserToUpdate={setRegistrationUser}
                  submissionAttempted={attemptedSignUp}
                  required
                />
              </Col>
              <Col md={6}>
                <RegistrationDobInput
                  userToUpdate={registrationUser}
                  setUserToUpdate={setRegistrationUser}
                  attemptedSignUp={attemptedSignUp}
                  dobOver13CheckboxChecked={dobOver13CheckboxChecked}
                  setDobOver13CheckboxChecked={setDobOver13CheckboxChecked}
                />
              </Col>
            </Row>

            {/* Email address and gender */}

            <Row>
              <Col md={6}>
                <EmailInput
                  userToUpdate={registrationUser}
                  setUserToUpdate={setRegistrationUser}
                  submissionAttempted={attemptedSignUp}
                  teacherRegistration={true}
                />
              </Col>
              <Col md={6}>
                <GenderInput
                  userToUpdate={registrationUser}
                  setUserToUpdate={setRegistrationUser}
                  submissionAttempted={attemptedSignUp}
                  idPrefix="registration"
                />
              </Col>
            </Row>

            <RegistrationPasswordInputs
              userToUpdate={registrationUser}
              setUserToUpdate={setRegistrationUser}
              submissionAttempted={attemptedSignUp}
              unverifiedPassword={unverifiedPassword}
              setUnverifiedPassword={setUnverifiedPassword}
            />

            {/* User contexts */}
            <Row className="pb-3">
              <Col md={6}>
                <RegistrationContext
                  userContexts={userContexts}
                  setUserContexts={setUserContexts}
                  displaySettings={displaySettings}
                  setDisplaySettings={setDisplaySettings}
                  setBooleanNotation={setBooleanNotation}
                  submissionAttempted={attemptedSignUp}
                  userRole="TEACHER"
                />
              </Col>
              <Col md={6}>
                <TeacherVerification
                  setVerificationDetails={setVerificationDetails}
                  setOtherInformation={setOtherInformation}
                />
              </Col>
            </Row>

            <hr className="text-center" />

            {/*Email Preferences */}
            <RegistrationEmailPreference
              emailPreferences={emailPreferences}
              setEmailPreferences={setEmailPreferences}
              submissionAttempted={attemptedSignUp}
              userRole="TEACHER"
            />

            {/* Form Error */}
            <Row>
              <Col>
                <FormFeedback className="text-center always-show">
                  {attemptedSignUp &&
                    !validateForm(
                      registrationUser,
                      unverifiedPassword,
                      userContexts,
                      dobOver13CheckboxChecked,
                      emailPreferences,
                    ) && <h5>Please fill out all fields</h5>}
                </FormFeedback>
                <h4 role="alert" className="text-danger text-center">
                  {errorMessage}
                </h4>
              </Col>
            </Row>
            <Recaptcha setIsRecaptchaTicked={setIsRecaptchaTicked} recaptchaRef={recaptchaRef} />
            <RegistrationSubmit isRecaptchaTicked={isRecaptchaTicked} />
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export const TeacherRegistration = () => {
  const [conditionsAccepted, setConditionsAccepted] = useState(false);

  return conditionsAccepted ? (
    <TeacherRegistrationBody />
  ) : (
    <TeacherRegistrationTerms acceptConditions={setConditionsAccepted} />
  );
};
