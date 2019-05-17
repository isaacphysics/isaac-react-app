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
import {submitMessage} from "../../state/actions"
import classnames from 'classnames';
import {string} from "prop-types";



const stateToProps = (state: AppState) => ({user: state ? state.user : null});

const dispatchToProps = {
    submitMessage
};

interface ContactPageProps {
    user: RegisteredUserDTO | null
    submitMessage: (extra: any, params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string}) => void;
    errorMessage: string | null;
}

const ContactPageComponent = ({user, submitMessage, errorMessage}: ContactPageProps) => {
    const updateDetails = () => console.log("Account updated"); // TODO BH account update action


    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [messageSendAttempt, setMessageSendAttempt] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");

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
        <h2>We'd love to hear from you</h2>
        <div>
            <Row>
                <Col size={12} md={3}>
                    <h3>Frequently Asked Question?</h3>
                        <p>You might like to check our FAQs pages to see if they can help you: </p>
                    <h3>Upcoming events</h3>
                        <p>If you'd like to find out more about our upcoming events visit our</p>
                    <h3>Problems with the site?</h3>
                        <p>We always want to improve so please report any issues to</p>
                    <h3>Call us</h3>
                        <p>Give us a call on</p>
                    <h3>Follow us</h3>
                        <p>Follow us on Twitter</p>
                </Col>
                <Col size={12} md={9}>
                    <Card>
                        {messageSent ?
                            <Row>
                                <Col className="text-center">
                                    <Alert color="$secondary" isOpen={errorMessage}>{errorMessage}</Alert>
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
                                    <p>Thank you for using isaacphysics.org. If you have any comments or questions about
                                        our
                                        resources or any of our past or upcoming events, we would be happy to hear from
                                        you.
                                        We would also welcome any constructive feedback you have about the content and
                                        layout
                                        we present here. If you have registered with Isaac Physics and are a current
                                        teacher
                                        please do contact us to tell us. We look forward to hearing from you. <br/><br/>To
                                        contact us
                                        please fill out the form below:</p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="first-name-input" className="form-required">First Name</Label>
                                                <Input id="first-name-input" type="text" name="first-name"
                                                       defaultValue={user ? user.givenName : ""}
                                                       onBlur={(e: any) => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="last-name-input" className="form-required">Last Name</Label>
                                                <Input id="last-name-input" type="text" name="last-name"
                                                       defaultValue={user ? user.familyName : ""}
                                                       onBlur={(e: any) => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="email-input" className="form-required">Your Email Address</Label>
                                                <Input invalid={messageSendAttempt && !isValidEmail} id="email-input"
                                                       type="email" name="email"
                                                       defaultValue={user ? user.email : ""}
                                                       onBlur={(e: any) => setEmail(e.target.value)}
                                                       aria-describedby="emailValidationMessage" required/>
                                                <FormFeedback id="emailValidationMessage">
                                                    {!isValidEmail && "Please enter a valid email address"}
                                                </FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup>
                                                <Label htmlFor="subject-input" className="form-required">Message Subject</Label>
                                                <Input id="subject-input" type="text" name="subject"
                                                       onBlur={(e: any) => setSubject(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label htmlFor="message-input" className="form-required">Message</Label>
                                                <Input id="message-input" type="textarea" rows="7" name="message"
                                                       onBlur={(e: any) => setMessage(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>
                                <CardFooter>
                                    <Row>
                                        <Alert color="$secondary">
                                            {errorMessage}
                                        </Alert>
                                    </Row>
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
