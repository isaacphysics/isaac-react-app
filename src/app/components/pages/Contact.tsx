import React, {useEffect, useRef, useState} from 'react';
import {AppState, selectors, useAppSelector, useSubmitContactFormMutation} from "../../state";
import {
    Alert,
    Button,
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
    Row
} from "reactstrap";
import {PotentialUser} from "../../../IsaacAppTypes";
import {
    isPhy,
    isTeacherOrAbove,
    SITE_TITLE,
    siteSpecific,
    SOCIAL_LINKS,
    validateEmail,
    WEBMASTER_EMAIL
} from "../../services";
import queryString from "query-string";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {MetaDescription} from "../elements/MetaDescription";
import {Immutable} from "immer";
import {extractErrorMessage} from '../../services/errors';

const determineUrlQueryPresets = (user?: Immutable<PotentialUser> | null) => {
    const urlQuery = queryString.parse(location.search);
    let presetSubject = "";
    let presetMessage = "";
    let presetPlaceholder = "";

    if (urlQuery?.preset === "teacherRequest" && user?.loggedIn && !isTeacherOrAbove(user)) {
        presetSubject = "Teacher Account Request";
        presetMessage = `Hello,\n\nPlease could you convert my ${SITE_TITLE} account into a teacher account.\n\nMy school is: \nI have changed my account email address to be my school email: [Yes/No]\nA link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: \n\nThanks, \n\n` + user.givenName + " " + user.familyName;
    } else if (urlQuery?.preset === 'accountDeletion' && user?.loggedIn) {
        presetSubject = "Account Deletion Request";
        presetMessage = `Hello,\n\nPlease could you delete my ${SITE_TITLE} account.\n\nThanks, \n\n` + user.givenName + " " + user.familyName;
    } else if (urlQuery?.preset === 'contentProblem') {
        presetSubject = "Content problem";
        presetPlaceholder = "Please describe the problem here.";
        if (urlQuery?.accordion) {
            presetSubject += ` in "${urlQuery.accordion}"`;
        } else if (urlQuery?.page) {
            presetSubject += ` in "${urlQuery.page}"`;
        }
        if (urlQuery?.section != null) {
            presetSubject += `, section "${urlQuery.section}"`;
        }
    } else if (urlQuery?.preset === 'notFound') {
        presetSubject = "Page not found";
        presetMessage = `Page: "${urlQuery?.page}"\n\n[Add any details about how you found this missing page here.]`;
    }
    return [
        urlQuery.subject as string || presetSubject,
        urlQuery.message as string || presetMessage,
        urlQuery.placeholder as string || presetPlaceholder
    ];
};

export const Contact = () => {
    const user = useAppSelector(selectors.user.orNull);
    const error = useAppSelector((state: AppState) => state?.error);
    const errorMessage = extractErrorMessage(error);
    const [presetSubject, presetMessage, presetPlaceholder] = determineUrlQueryPresets(user);
    const [firstName, setFirstName] = useState(user && user.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user && user.loggedIn && user.familyName || "");
    const [email, setEmail] = useState(user && user.loggedIn && user.email || "");
    const [subject, setSubject] = useState(presetSubject);
    const [message, setMessage] = useState(presetMessage);
    const [messageSendAttempt, setMessageSendAttempt] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const [submitContactForm] = useSubmitContactFormMutation();

    // set subject and message if any of user, presetSubject or presetMessage change
    useEffect(() => {
        setSubject(presetSubject);
        setMessage(presetMessage);
    }, [presetSubject, presetMessage]);

    useEffect(() => {
        setFirstName(user && user.loggedIn && user.givenName || "");
        setLastName(user && user.loggedIn && user.familyName || "");
        setEmail(user && user.loggedIn && user.email || "");
    }, [user]);

    const successRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        messageSent && successRef.current && successRef.current.focus();
    }, [messageSent, successRef]);

    const isValidEmail = validateEmail(email);

    const metaDescription = siteSpecific(
        "Contact the Isaac team with questions, comments or feedback about our resources.",
        "Ask us a question about Ada Computer Science, the free online computer science programme for students and teachers. We are here to help!");

    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb 
            currentPageTitle="Contact us" 
            icon={{type: "icon", "icon": "icon-contact"}}
        />
        <MetaDescription description={metaDescription}/>
        <div className="pt-4">
            <Row>
                <Col size={12} md={{size: 3, order: 1}} xs={{order: 2}} className="mt-4 mt-md-0">
                    <div>
                        <h3>Frequently Asked Question?</h3>
                        <p> You might like to check our FAQs pages to see if they can help you: <a href="/support/student">student FAQs</a> | <a href="/support/teacher">teacher FAQs</a></p>
                    </div>
                    {isPhy && <>
                        <h3>Upcoming events</h3>
                        <p>If you&apos;d like to find out more about our upcoming events, visit our <a href="/events">Events Page</a></p>
                    </>}
                    <h3>Problems with the site?</h3>
                    <p>We always want to improve so please report any issues to <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a></p>
                    {isPhy && <div>
                        <h3>Call us</h3>
                        <p>Give us a call on <a href="tel:+441223337066">01223 337066</a></p>
                    </div>
                    }
                    <h3>Follow us</h3>
                    <p>Follow us on:</p>
                    {Object.entries(SOCIAL_LINKS).map(([_, {name, href}], i) => <>{i > 0 && <br/>}<a href={href}>{name}</a></>)}
                </Col>
                <Col size={12} md={{size: 9, order: 2}} xs={{order: 1}}>
                    <Card>
                        {messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <h3 ref={successRef} tabIndex={-1}>
                                        Thank you for your message.
                                    </h3>
                                </Col>
                            </Row>:
                            <Form name="contact" onSubmit={e => {
                                if (e) {e.preventDefault();}
                                setMessageSendAttempt(true);
                                submitContactForm({firstName, lastName, emailAddress: email, subject, message});
                                setMessageSent(true);
                            }}>
                                <CardBody>
                                    <h3>Send us a message</h3>
                                    <PageFragment fragmentId="contact_intro"/>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="first-name-input" className="form-required">First name</Label>
                                                <Input id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user && user.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="last-name-input" className="form-required">Last name</Label>
                                                <Input id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user && user.loggedIn ? user.familyName : ""}
                                                    onChange={e => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="email-input" className="form-required">Email address</Label>
                                                <Input invalid={messageSendAttempt && !isValidEmail} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user && user.loggedIn ? user.email : ""}
                                                    onChange={e => setEmail(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                                <FormFeedback id="emailValidationMessage">
                                                    {!isValidEmail && "Please enter a valid email address"}
                                                </FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="subject-input" className="form-required">Message subject</Label>
                                                <Input id="subject-input" type="text" name="subject" defaultValue={subject}
                                                    onChange={e => setSubject(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="message-input" className="form-required">Message</Label>
                                                <Input id="message-input" type="textarea" name="message" rows={7} value={message}
                                                    placeholder={presetPlaceholder}
                                                    onChange={e => setMessage(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <Alert color="danger" isOpen={!!errorMessage}><>{errorMessage} You can contact us at <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a></></Alert>
                                    </div>
                                    <Row>
                                        <Col size={12} md={6}>
                                            {isPhy && <span className="d-block pb-3 pb-md-0 text-end text-md-start form-required">
                                                Required field
                                            </span>}                                  
                                        </Col>
                                        <Col size={12} md={6} className="text-end">
                                            <Button type="submit" color="secondary" className="w-100">Submit</Button>
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
