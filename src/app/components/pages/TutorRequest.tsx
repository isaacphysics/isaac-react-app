import React, {useEffect, useState} from 'react';
import {
    AppState,
    isaacApi,
    requestEmailVerification,
    selectors,
    submitMessage,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    Container,
    Form,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {
    isTutorOrAbove,
    SITE_SUBJECT_TITLE,
    validateEmail,
    WEBMASTER_EMAIL
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";

const warningFragmentId = "teacher_registration_warning_message"; // TUTOR have decided to keep this message

export const TutorRequest = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const errorMessage = useAppSelector((state: AppState) => (state && state.error) || null);
    const {data: warningFragment} = isaacApi.endpoints.getPageFragment.useQuery(warningFragmentId);

    const [firstName, setFirstName] = useState(user?.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user?.loggedIn && user.familyName || "");
    const [emailAddress, setEmailAddress] = useState(user?.loggedIn && user.email || "");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [reason, setReason] = useState<string>("");
    const [messageSent, setMessageSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));

    const subject = "Tutor Account Request";
    const message = "Hello,\n\n" +
        "Please could you convert my Isaac account into a tutor account.\n\n" +
        (subjects.length > 0 ? ("I would like to teach subjects: " + subjects.join(", ") + "\n\n") : "") +
        (reason ? "I would like to upgrade because: " + reason + "\n\n" : "") +
        "Thanks, \n\n" + firstName + " " + lastName;
    const isValidEmail = validateEmail(emailAddress);

    useEffect(() => {
        setFirstName(user?.loggedIn && user.givenName || "");
        setLastName(user?.loggedIn && user.familyName || "");
        setEmailAddress(user?.loggedIn && user.email || "");
        setEmailVerified(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
    }, [user]);

    return <Container id="contact-page" className="pb-5">
        <TitleAndBreadcrumb currentPageTitle="Tutor Account request" />
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    {warningFragment && <Alert color="warning">
                        <IsaacContent doc={warningFragment} />
                    </Alert>}
                    <Card>
                        {isTutorOrAbove(user) &&
                            <Row>
                                <Col className="text-center pt-3">
                                    <span className="h3">
                                        You already have a tutor or teacher account
                                    </span>
                                </Col>
                            </Row>
                        }
                        {!isTutorOrAbove(user) && (messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <p className="mt-3">
                                        Thank you for submitting a tutor account request.
                                    </p>
                                    <p>
                                        We will be in touch shortly. Please note that account verification is a manual
                                        process and may take a few days.
                                    </p>
                                </Col>
                            </Row>
                            :
                            <Form name="contact" onSubmit={e => {
                                e.preventDefault();
                                dispatch(submitMessage({firstName, lastName, emailAddress, subject, message}));
                                setMessageSent(true);
                            }}>
                                <CardBody>
                                    <p>
                                        {`To request a tutor account on Isaac ${SITE_SUBJECT_TITLE}, please fill in this form. `}
                                        {"You must have verified your account email address. If any of the "}
                                        {"information is incorrect or missing, you can amend it on your "}
                                        <Link to="/account">My account</Link>{" page."}
                                    </p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="first-name-input" className="form-required">First name</Label>
                                                <Input disabled id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user?.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="last-name-input" className="form-required">Last name</Label>
                                                <Input disabled id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user?.loggedIn ? user.familyName : ""}
                                                    onChange={e => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12}>
                                            <FormGroup>
                                                <Label htmlFor="email-input" className="form-required">Email address</Label>
                                                <Input disabled invalid={!isValidEmail || !emailVerified} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user?.loggedIn ? user.email : ""}
                                                    onChange={e => setEmailAddress(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12}>
                                            <FormGroup>
                                                <Label htmlFor="other-info-input" className="form-required">
                                                    Please tell us why you would like to apply for a tutor account
                                                </Label>
                                                <Input id="other-info-input" type="textarea" name="other-info" required
                                                    onChange={e => setReason(e.target.value)}/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {!emailVerified &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-left">Your email address is not verified —
                                                please click on the link in the verification email to confirm your
                                                email address. You can <Button color="link primary-font-link" onClick={() => dispatch(requestEmailVerification())}>request a
                                                new verification email</Button> if necessary.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <Alert color="danger" isOpen={!!errorMessage}><>{errorMessage} You can contact us at <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a></></Alert>
                                    </div>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <span className="d-block pb-3 pb-md-0 text-right text-md-left form-required">
                                                Required field
                                            </span>
                                        </Col>
                                        <Col size={12} md={6} className="text-right">
                                            <Input type="submit" value="Submit" disabled={!emailVerified} className="btn btn-block btn-secondary border-0" />
                                        </Col>
                                    </Row>
                                </CardFooter>
                            </Form>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    </Container>;
};
