import React, {useEffect, useMemo, useState} from 'react';
import {connect} from "react-redux";
import {Alert, Container, Card, CardBody, CardFooter, Col, Form, FormGroup, Input, Row, Label, FormFeedback} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {submitMessage} from "../../state/actions";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {validateEmail} from "../../services/validation";
import queryString from "query-string";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";


const stateToProps = (state: AppState) => {
    const urlQuery = queryString.parse(location.search);
    let presetSubject = "";
    let presetMessage = "";
    if (urlQuery && urlQuery.preset == "teacherRequest") {
        if (state && state.user && state.user.loggedIn && state.user.role != "TEACHER") {
            presetSubject = "Teacher Account Request";
            presetMessage = "Hello,\n\nPlease could you convert my Isaac account into a teacher account.\n\nMy school is: \nI have changed my account email address to be my school email: [Yes/No]\nA link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: \n\nThanks, \n\n" + state.user.givenName + " " + state.user.familyName;
        }
    } else if (urlQuery && urlQuery.preset == 'accountDeletion') {
        if (state && state.user && state.user.loggedIn) {
            presetSubject = "Account Deletion Request";
            presetMessage = "Hello,\n\nPlease could you delete my Isaac Computer Science account.\n\nThanks, \n\n" + state.user.givenName + " " + state.user.familyName;
        }
    }
    return {
        user: state ? state.user : null,
        errorMessage: state ? state.error : null,
        presetSubject: urlQuery.subject as string || presetSubject,
        presetMessage: urlQuery.message as string || presetMessage,
    };
};

const dispatchToProps = {
    submitMessage
};

interface ContactPageProps {
    user: LoggedInUser | null;
    submitMessage: (extra: any, params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string}) => void;
    errorMessage: ErrorState;
    presetSubject: string;
    presetMessage: string;
}

const ContactPageComponent = ({user, submitMessage, errorMessage, presetSubject, presetMessage}: ContactPageProps) => {
    const [firstName, setFirstName] = useState(user && user.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user && user.loggedIn && user.familyName || "");
    const [email, setEmail] = useState(user && user.loggedIn && user.email || "");
    const [subject, setSubject] = useState(presetSubject);
    const [message, setMessage] = useState(presetMessage);
    const [messageSendAttempt, setMessageSendAttempt] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    // set subject and message if any of user, presetSubject or presetMessage change
    useMemo(() => {
        setSubject(presetSubject);
        setMessage(presetMessage);
    }, [user, presetSubject, presetMessage]);

    useEffect(() => {
        setFirstName(user && user.loggedIn && user.givenName || "");
        setLastName(user && user.loggedIn && user.familyName || "");
        setEmail(user && user.loggedIn && user.email || "");
    }, [user]);

    const isValidEmail = validateEmail(email);

    const sendForm = () => {
        submitMessage(
            {},
            {
                firstName: firstName,
                lastName: lastName,
                emailAddress: email,
                subject: subject,
                message: message
            })
    };

    return <Container id="contact-page" className="pb-5">
        <TitleAndBreadcrumb currentPageTitle="Contact us" />
        <div className="pt-4">
            <Row>
                <Col size={12} md={{size: 3, order: 1}} xs={{order: 2}} className="mt-4 mt-md-0">
                    <h3>Upcoming events</h3>
                    <p>If you&apos;d like to find out more about our upcoming events visit our <a href="https://isaaccomputerscience.org/events">Events Page</a></p>
                    <h3>Problems with the site?</h3>
                    <p>We always want to improve so please report any issues to <a className="small" href="mailto:webmaster@isaaccomputerscience.org">webmaster@isaaccomputerscience.org</a></p>
                    <h3>Follow us</h3>
                    <p>Follow us on:</p>
                    <a href="https://twitter.com/IsaacCompSci">Twitter</a><br/>
                    <a href="https://www.facebook.com/IsaacComputerScience/">Facebook</a><br/>
                    <a href="https://www.instagram.com/isaaccompsci/">Instagram</a><br/>
                    <a href="https://www.youtube.com/channel/UC-qoIYj8kgR8RZtQphrRBYQ">YouTube</a>
                </Col>
                <Col size={12} md={{size: 9, order: 2}} xs={{order: 1}}>
                    <Card>
                        {messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <h3>
                                        Thank you for your message.
                                    </h3>
                                </Col>
                            </Row>:
                            <Form name="contact" onSubmit={(e: any) => {
                                setMessageSendAttempt(true);
                                e.preventDefault();
                                sendForm();
                                setMessageSent(true)
                            }}>
                                <CardBody>
                                    <h3>Send us a message</h3>
                                    <p>Please get in touch with the Isaac Computer Science team if you have comments about our resources or events, questions about the site, ideas, or other feedback. We would love to hear from you! <br/><br/>
                                        To contact us, please fill out this form:
                                    </p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="first-name-input" className="form-required">First Name</Label>
                                                <Input id="first-name-input" type="text" name="first-name"
                                                       defaultValue={user && user.loggedIn ? user.givenName : ""}
                                                       onChange={(e: any) => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="last-name-input" className="form-required">Last Name</Label>
                                                <Input id="last-name-input" type="text" name="last-name"
                                                       defaultValue={user && user.loggedIn ? user.familyName : ""}
                                                       onChange={(e: any) => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="email-input" className="form-required">Your Email Address</Label>
                                                <Input invalid={messageSendAttempt && !isValidEmail} id="email-input"
                                                       type="email" name="email"
                                                       defaultValue={user && user.loggedIn ? user.email : ""}
                                                       onChange={(e: any) => setEmail(e.target.value)}
                                                       aria-describedby="emailValidationMessage" required/>
                                                <FormFeedback id="emailValidationMessage">
                                                    {!isValidEmail && "Please enter a valid email address"}
                                                </FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="subject-input" className="form-required">Message Subject</Label>
                                                <Input id="subject-input" type="text" name="subject" defaultValue={subject}
                                                       onChange={(e: any) => setSubject(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label htmlFor="message-input" className="form-required">Message</Label>
                                                <Input id="message-input" type="textarea" name="message" rows={7} value={message}
                                                       onChange={(e: any) => setMessage(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
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
                                            <Input type="submit" value="Submit" className="btn btn-block btn-secondary border-0" block/>
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

export const Contact = connect(stateToProps, dispatchToProps)(ContactPageComponent);
