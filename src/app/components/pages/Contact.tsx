import React, { useEffect, useRef, useState } from "react";
import { AppState, selectors, submitMessage, useAppDispatch, useAppSelector } from "../../state";
import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { LoggedInUser, PotentialUser } from "../../../IsaacAppTypes";
import { isTeacherOrAbove, SITE_SUBJECT_TITLE, SOCIAL_LINKS, validateEmail, WEBMASTER_EMAIL } from "../../services";
import queryString from "query-string";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { MetaDescription } from "../elements/MetaDescription";
import { Immutable } from "immer";

const determineUrlQueryPresets = (user?: Immutable<PotentialUser> | null) => {
  const urlQuery = queryString.parse(location.search);
  let presetSubject = "";
  let presetMessage = "";
  let presetPlaceholder = "";
  let presetUrl = "";

  const setTeacherRequestPresets = (user: Immutable<LoggedInUser>) => {
    presetSubject = "Teacher Account Request";
    presetMessage =
      "Hello,\n\nPlease could you convert my Isaac account into a teacher account.\n\nMy school is: \nI have changed my account email address to be my school email: [Yes/No]\nA link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: \n\nThanks, \n\n" +
      user.givenName +
      " " +
      user.familyName;
  };

  const setAccountDeletionPresets = (user: Immutable<LoggedInUser>) => {
    presetSubject = "Account Deletion Request";
    presetMessage =
      `Hello,\n\nPlease could you delete my Isaac ${SITE_SUBJECT_TITLE} account.\n\nThanks, \n\n` +
      user.givenName +
      " " +
      user.familyName;
  };

  const setContentProblemPresets = () => {
    presetSubject = "Content problem";
    presetPlaceholder = "Please describe the problem here.";
    presetUrl = `Page link: ${urlQuery.url}`;
    if (urlQuery?.accordion) {
      presetSubject += ` in "${urlQuery.accordion}"`;
    } else if (urlQuery?.page) {
      presetSubject += ` in "${urlQuery.page}"`;
    }
    if (urlQuery?.section != null) {
      presetSubject += `, section "${urlQuery.section}"`;
    }
  };

  if (urlQuery?.preset == "teacherRequest" && user?.loggedIn && !isTeacherOrAbove(user)) {
    setTeacherRequestPresets(user);
  } else if (urlQuery?.preset == "accountDeletion" && user?.loggedIn) {
    setAccountDeletionPresets(user);
  } else if (urlQuery?.preset == "contentProblem") {
    setContentProblemPresets();
  }
  return [
    (urlQuery.subject as string) || presetSubject,
    (urlQuery.message as string) || presetMessage,
    (urlQuery.placeholder as string) || presetPlaceholder,
    presetUrl,
  ];
};

export const Contact = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectors.user.orNull);
  const error = useAppSelector((state: AppState) => state?.error ?? null);
  const [presetSubject, presetMessage, presetPlaceholder, presetUrl] = determineUrlQueryPresets(user);
  const [firstName, setFirstName] = useState((user?.loggedIn && user.givenName) || "");
  const [lastName, setLastName] = useState((user?.loggedIn && user.familyName) || "");
  const [email, setEmail] = useState((user?.loggedIn && user.email) || "");
  const [subject, setSubject] = useState(presetSubject);
  const [message, setMessage] = useState(presetMessage);
  const [messageSendAttempt, setMessageSendAttempt] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // set subject and message if any of user, presetSubject or presetMessage change
  useEffect(() => {
    setSubject(presetSubject);
    setMessage(presetMessage);
  }, [presetSubject, presetMessage]);

  useEffect(() => {
    setFirstName((user?.loggedIn && user.givenName) || "");
    setLastName((user?.loggedIn && user.familyName) || "");
    setEmail((user?.loggedIn && user.email) || "");
  }, [user]);

  const successRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    messageSent && successRef.current && successRef.current.focus();
  }, [messageSent, successRef]);

  const isValidEmail = validateEmail(email);

  const metaDescriptionCS =
    "Ask us a question about our GCSE and A level Computer Science online learning programme. We are here to help.";

  return (
    <Container id="contact-page" className="pb-5">
      <TitleAndBreadcrumb currentPageTitle="Contact us" />
      <MetaDescription description={metaDescriptionCS} />
      <div className="pt-4">
        <Row>
          <Col
            data-testid="contact-links"
            size={12}
            md={{ size: 3, order: 1 }}
            xs={{ order: 2 }}
            className="mt-4 mt-md-0"
          >
            <h3>Upcoming events</h3>
            <p>
              If you&apos;d like to find out more about our upcoming events, visit our <a href="/events">Events Page</a>
            </p>
            <h3>Problems with the site?</h3>
            <p>
              We always want to improve so please report any issues to{" "}
              <a className="small" href={`mailto:${WEBMASTER_EMAIL}`}>
                {WEBMASTER_EMAIL}
              </a>
            </p>
            <h3>Follow us</h3>
            <p>Follow us on:</p>
            {Object.entries(SOCIAL_LINKS).map(([_, { name, href }]) => (
              <p className="mb-0" key={`social-link-${name}`}>
                <a href={href}>{name}</a>
              </p>
            ))}
          </Col>
          <Col size={12} md={{ size: 9, order: 2 }} xs={{ order: 1 }}>
            <Card>
              {messageSent && !error ? (
                <Row>
                  <Col className="text-center">
                    <h3 ref={successRef} tabIndex={-1}>
                      Thank you for your message.
                    </h3>
                  </Col>
                </Row>
              ) : (
                <Form
                  name="contact"
                  onSubmit={(e) => {
                    if (e) {
                      e.preventDefault();
                    }
                    setMessageSendAttempt(true);
                    const urlAndMessage = `${presetUrl}\n\n${message}`;
                    dispatch(
                      submitMessage({
                        firstName,
                        lastName,
                        emailAddress: email,
                        subject,
                        message: presetUrl ? urlAndMessage : message,
                      }),
                    );
                    setMessageSent(true);
                  }}
                >
                  <CardBody>
                    <h3>Send us a message</h3>
                    <PageFragment fragmentId="contact_intro" />
                    <Row>
                      <Col size={12} md={6}>
                        <FormGroup>
                          <Label htmlFor="first-name-input" className="form-required">
                            First name
                          </Label>
                          <Input
                            id="first-name-input"
                            type="text"
                            name="first-name"
                            defaultValue={user?.loggedIn ? user.givenName : ""}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col size={12} md={6}>
                        <FormGroup>
                          <Label htmlFor="last-name-input" className="form-required">
                            Last name
                          </Label>
                          <Input
                            id="last-name-input"
                            type="text"
                            name="last-name"
                            defaultValue={user?.loggedIn ? user.familyName : ""}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col size={12} md={6}>
                        <FormGroup>
                          <Label htmlFor="email-input" className="form-required">
                            Email address
                          </Label>
                          <Input
                            invalid={messageSendAttempt && !isValidEmail}
                            id="email-input"
                            type="email"
                            name="email"
                            defaultValue={user?.loggedIn ? user.email : ""}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-describedby="emailValidationMessage"
                            required
                          />
                          <FormFeedback id="emailValidationMessage">
                            {!isValidEmail && "Please enter a valid email address"}
                          </FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col size={12} md={6}>
                        <FormGroup>
                          <Label htmlFor="subject-input" className="form-required">
                            Message subject
                          </Label>
                          <Input
                            id="subject-input"
                            type="text"
                            name="subject"
                            defaultValue={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label htmlFor="message-input" className="form-required">
                            Message
                          </Label>
                          <Input
                            id="message-input"
                            type="textarea"
                            name="message"
                            rows={7}
                            value={message}
                            placeholder={presetPlaceholder}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <div>
                      <Alert color="danger" isOpen={!!error}>
                        <h4 className="d-inline">Error:</h4>
                        {error?.type === "generalError" && <span> {error.generalError}</span>}
                        <p>
                          You can contact us at <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a>
                        </p>
                      </Alert>
                    </div>
                    <Row>
                      <Col size={12} md={6}>
                        <span className="d-block pb-3 pb-md-0 text-right text-md-left form-required">
                          Required field
                        </span>
                      </Col>
                      <Col size={12} md={6} className="text-right">
                        <Input type="submit" value="Submit" className="btn btn-block btn-secondary border-0" />
                      </Col>
                    </Row>
                  </CardFooter>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};
