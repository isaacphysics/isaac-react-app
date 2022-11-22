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
    api,
    isPhy,
    isTeacherOrAbove,
    schoolNameWithPostcode,
    SITE_SUBJECT_TITLE,
    validateEmail,
    WEBMASTER_EMAIL
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";

const warningFragmentId = "teacher_registration_warning_message";
const nonSchoolDomains = ["@gmail", "@yahoo", "@hotmail", "@sharklasers", "@guerrillamail"];

// TUTOR TODO add a pointer towards tutor account request (maybe in the noSchool feedback?)
export const TeacherRequest = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const errorMessage = useAppSelector((state: AppState) => (state && state.error) || null);
    const {data: warningFragment} = isaacApi.endpoints.getPageFragment.useQuery(warningFragmentId);

    const [firstName, setFirstName] = useState(user?.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user?.loggedIn && user.familyName || "");
    const [emailAddress, setEmailAddress] = useState(user?.loggedIn && user.email || "");
    const [school, setSchool] = useState<string>();
    const [otherInformation, setOtherInformation] = useState("");
    const [verificationDetails, setVerificationDetails] = useState<string>();
    const [messageSent, setMessageSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
    const [allowedDomain, setAllowedDomain] = useState<boolean>();

    const urn = user?.loggedIn && user.schoolId || "";
    const subject = "Teacher Account Request";
    const message = "Hello,\n\n" +
        "Please could you convert my Isaac account into a teacher account.\n\n" +
        "My school is: " + school + "\n" +
        "A link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: " + verificationDetails + "\n\n\n" +
        "Any other information: " + otherInformation + "\n\n" +
        "Thanks, \n\n" + firstName + " " + lastName;
    const isValidEmail = validateEmail(emailAddress);

    function isEmailDomainAllowed(email: string) {
        for (let domain in nonSchoolDomains) {
            if (email.includes(nonSchoolDomains[domain])) {
                setAllowedDomain(false)
            }
        }
    }

    function fetchSchool(urn: string) {
        if (urn !== "") {
            api.schools.getByUrn(urn).then(({data}) => {
                setSchool(schoolNameWithPostcode(data[0]));
            });
        } else if (user?.loggedIn && user.schoolOther) {
            setSchool(user.schoolOther);
        } else {
            setSchool(undefined);
        }
    }

    useEffect(() => {
        setFirstName(user?.loggedIn && user.givenName || "");
        setLastName(user?.loggedIn && user.familyName || "");
        setEmailAddress(user?.loggedIn && user.email || "");
        setEmailVerified(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
        fetchSchool(urn);
        isEmailDomainAllowed(emailAddress);
    }, [user]);

    const noSchool = <p>
        {"If you don't have an associated school please fill out our "}
        <Link to="/contact?preset=teacherRequest">Contact us</Link>
        {" form."}
    </p>;


    return <Container id="contact-page" className="pb-5">
        <TitleAndBreadcrumb currentPageTitle="Teacher Account request" />
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    {warningFragment && <Alert color="warning">
                        <IsaacContent doc={warningFragment} />
                    </Alert>}
                    <Card>
                        {isTeacherOrAbove(user) &&
                            <Row>
                                <Col className="text-center pt-3">
                                    <span className="h3">
                                        You already have a teacher account
                                    </span>
                                    <p className="mt-3">
                                        Go to the <Link to="/teachers">Teacher tools page</Link> to start using your
                                        new account features.
                                    </p>
                                </Col>
                            </Row>
                        }
                        {!isTeacherOrAbove(user) && (messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <p className="mt-3">
                                        Thank you for submitting a teacher account request.
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
                                        {`To request a teacher account on Isaac ${SITE_SUBJECT_TITLE}, please fill in this form. `}
                                        {"You must use the email address that was assigned to you by your school, and the "}
                                        {"name of your school should be shown in the 'School' field. If any of the "}
                                        {"information is incorrect or missing, you can amend it on your "}
                                        <Link to="/account">My account</Link>{" page."}
                                        {isPhy && noSchool}
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
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="email-input" className="form-required">Email address</Label>
                                                <Input disabled invalid={!isValidEmail || !emailVerified || allowedDomain == false} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user?.loggedIn ? user.email : ""}
                                                    onChange={e => setEmailAddress(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="school-input" className="form-required">School</Label>
                                                <Input disabled id="school-input" type="text" name="school"
                                                    defaultValue={school} invalid={typeof school == "undefined"}
                                                    onChange={e => setSchool(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="user-verification-input" className="form-required">URL of a page on your school website which shows your name and email address, or your school phone number</Label>
                                                <Input id="user-verification-input" type="text" name="user-verification"
                                                    onChange={e => setVerificationDetails(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="other-info-input">Any other information</Label>
                                                <Input id="other-info-input" type="textarea" name="other-info"
                                                    onChange={e => setOtherInformation(e.target.value)}/>
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
                                    {typeof school == "undefined" &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-left">You have not provided your school —
                                                please add your school on your <Link to="/account">My Account</Link> page.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                    {allowedDomain == false &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-left">You have not used your school
                                            email address — please change your email address on your <Link to="/account">My Account</Link> page.
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
                                            <Input type="submit" value="Submit" disabled={!emailVerified || typeof school == "undefined" || allowedDomain == false} className="btn btn-block btn-secondary border-0" />
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
