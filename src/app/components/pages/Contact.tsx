import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {
    Alert,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Button,
    Card,
    CardBody,
    CardTitle,
    CardText,
    CardFooter,
    Col,
    CustomInput,
    Form,
    FormGroup,
    Input,
    Row,
    Label,
    Table,
    FormFeedback
} from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {submitMessage} from "../../state/actions";
import classnames from 'classnames';
import {string} from "prop-types";
import {LoggedInUser} from "../../../IsaacAppTypes";



const stateToProps = (state: AppState) => ({
    user: state ? state.user : null,
    errorMessage: state ? state.error : null
});

const dispatchToProps = {
    submitMessage
};

interface ContactPageProps {
    user: LoggedInUser | null
    submitMessage: (extra: any, params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string}) => void;
    errorMessage: string | null;
}

const ContactPageComponent = ({user, submitMessage, errorMessage}: ContactPageProps) => {

    const queryString = require('query-string');
    const urlParams = queryString.parse(location.search);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState(urlParams.subject);
    const [message, setMessage] = useState("");
    const [messageSendAttempt, setMessageSendAttempt] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");

    useEffect(() => {
        if (urlParams.preset == "teacherRequest") {
            if (user && user.loggedIn && user.role != "TEACHER") {
                setSubject("Teacher Account Request");
                setMessage("Hello,\n\nPlease could you convert my Isaac account into a teacher account.\n\nMy school is: \nI have changed my account email address to be my school email: [Yes/No]\nA link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: \n\nThanks, \n\n" + user.givenName + " " + user.familyName);
            }
        } else if (urlParams.preset == 'accountDeletion') {
            if (user && user.loggedIn) {
                setSubject("Account Deletion Request");
                setMessage("Hello,\n\nPlease could you delete my Isaac Computer Science account.\n\nThanks, \n\n" + user.givenName + " " + user.familyName);
            }
        }
    }, [user]);

    const sendForm = () => {
        submitMessage(
            {},
            {
                firstName: firstName,
                lastName: lastName,
                emailAddress: email,
                subject: subject,
                message: message})
    }

    return <div id="account-page">
        <h1>Contact Us</h1>
        <h2 className="h-title mb-4">We'd love to hear from you</h2>
        <div>
            <Row>
                <Col size={12} md={{size: 3, order: 1}} xs={{order: 2}}>
                    <h3>Upcoming events</h3>
                    <p>If you'd like to find out more about our upcoming events visit our <a href="/events">Events Page</a></p>
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
                                e.preventDefault();
                                sendForm();
                                setMessageSent(true)
                            }}>
                                <CardBody>
                                    <h3>Send us a Message</h3>
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
                                        <Alert color="danger" isOpen={errorMessage}>{errorMessage} You can contact us at <a href="mailto:webmaster@isaaccomputerscience.org">webmaster@isaaccomputerscience.org</a></Alert>
                                    </div>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <span className="form-required color=$secondary">Required field</span>
                                        </Col>
                                        <Col size={12} md={6} className="text-right">
                                            <Button color="secondary" type="submit" onClick={() => {
                                                setFirstName(() => (document.getElementById("first-name-input") as HTMLInputElement).value);
                                                setLastName(() => (document.getElementById("last-name-input") as HTMLInputElement).value);
                                                setEmail(() => (document.getElementById("email-input") as HTMLInputElement).value);
                                                setMessageSendAttempt(true);
                                            }} block>Submit</Button>
                                        </Col>
                                    </Row>
                                </CardFooter>
                            </Form>
                        }
                    </Card>
                </Col>
            </Row>
        </div>
    </div>;
};

export const Contact = connect(stateToProps, dispatchToProps)(ContactPageComponent);
