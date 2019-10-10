import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Alert, Container, Card, CardBody, CardFooter, Col, Form, FormGroup, Input, Row, Label} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {submitMessage} from "../../state/actions";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {validateEmail} from "../../services/validation";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {api} from "../../services/api";
import {requestEmailVerification} from "../../state/actions";
import {Link} from "react-router-dom";



const stateToProps = (state: AppState) => {
    return {
        user: state ? state.user : null,
        errorMessage: state ? state.error : null,
    };
};

const dispatchToProps = {
    requestEmailVerification,
    submitMessage
};

interface TeacherAccountPageProps {
    user: LoggedInUser | null;
    submitMessage: (params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string}) => void;
    errorMessage: ErrorState;
    requestEmailVerification: () => void;
}

const TeacherAccountRequestPageComponent = ({user, submitMessage, errorMessage, requestEmailVerification}: TeacherAccountPageProps) => {
    const [firstName, setFirstName] = useState(user && user.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user && user.loggedIn && user.familyName || "");
    const [email, setEmail] = useState(user && user.loggedIn && user.email || "");
    const [school, setSchool] = useState();
    const [otherInformation, setOtherInformation] = useState("");
    const [verificationDetails, setVerificationDetails] = useState();
    const [messageSent, setMessageSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user && user.loggedIn && user.emailVerificationStatus == "VERIFIED");
    const [allowedDomain, setAllowedDomain] = useState();

    const urn = user && user.loggedIn && user.schoolId || "";
    const presetSubject = "Teacher Account Request";
    const presetMessage = "Hello,\n\nPlease could you convert my Isaac account into a teacher account.\n\nMy school is: " + school + "\nA link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: " + verificationDetails + "\n\n\nAny other information: " + otherInformation + "\n\nThanks, \n\n" + firstName + " " + lastName;
    const nonSchoolDomains = ["@gmail", "@yahoo", "@hotmail", "@sharklasers", "@guerrillamail"];

    const isValidEmail = validateEmail(email);

    const sendForm = () => {
        submitMessage(
            {
                firstName: firstName,
                lastName: lastName,
                emailAddress: email,
                subject: presetSubject,
                message: presetMessage
            })
    };

    function isEmailDomainAllowed(email: string) {
        for (let domain in nonSchoolDomains) {
            if (email.includes(nonSchoolDomains[domain])) {
                setAllowedDomain(false)
            }
        }
    }

    function fetchSchool(urn: string) {
        if (urn != "") {
            api.schools.getByUrn(urn).then(({data}) => {
                setSchool(data[0].name + ", " + data[0].postcode);
            });
        } else if (user && user.loggedIn && user.schoolOther) {
            setSchool(user.schoolOther);
        } else {
            setSchool(undefined);
        }
    }

    function clickVerify() {
        requestEmailVerification();
    }

    useEffect(() => {
        setFirstName(user && user.loggedIn && user.givenName || "");
        setLastName(user && user.loggedIn && user.familyName || "");
        setEmail(user && user.loggedIn && user.email || "");
        setEmailVerified(user && user.loggedIn && user.emailVerificationStatus == "VERIFIED");
        fetchSchool(urn);
        isEmailDomainAllowed(email);
    }, [user]);

    return <Container id="contact-page" className="pb-5">
        <TitleAndBreadcrumb currentPageTitle="Teacher Account Request" />
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    <Card>
                        {messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <h3>
                                        Thank you for submitting a teacher account request, we will be in touch shortly.
                                    </h3>
                                </Col>
                            </Row>:
                            <Form name="contact" onSubmit={e => {
                                e.preventDefault();
                                sendForm();
                                setMessageSent(true)
                            }}>
                                <CardBody>
                                    <p>To request a teacher account on Isaac Computer Science, please fill in this form.
                                    You must use the email address that was assigned to you by your school, and the
                                    name of your school should be shown in the ‘School’ field. If any of the
                                    information is incorrect or missing, you can amend it on your
                                    <a href="/account">My Account</a> page.
                                    </p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="first-name-input" className="form-required">First name</Label>
                                                <Input disabled id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user && user.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="last-name-input" className="form-required">Last name</Label>
                                                <Input disabled id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user && user.loggedIn ? user.familyName : ""}
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
                                                    defaultValue={user && user.loggedIn ? user.email : ""}
                                                    onChange={e => setEmail(e.target.value)}
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
                                                email address. You can <Link onClick={clickVerify} to={"#"}>request a
                                                    new verification email</Link> if necessary.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                    {typeof school == "undefined" &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-left">You have not provided your school —
                                                please add your school on your <a href="/account">My Account</a> page.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                    {allowedDomain == false &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-left">Your have not used your school
                                            email address — please change your email address on your <a href="/account">My Account</a> page.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <Alert color="danger" isOpen={!!errorMessage}>{errorMessage} You can contact us at <a href="mailto:webmaster@isaaccomputerscience.org">webmaster@isaaccomputerscience.org</a></Alert>
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
                        }
                    </Card>
                </Col>
            </Row>
        </div>
    </Container>;
};

export const TeacherRequest = connect(stateToProps, dispatchToProps)(TeacherAccountRequestPageComponent);
