import React, {useEffect, useState} from 'react';
import {
    AppState,
    selectors,
    useAppSelector,
    useGetPageFragmentQuery,
    useRequestEmailVerificationMutation,
    useSubmitContactFormMutation
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
    isPhy,
    isTutorOrAbove,
    selectOnChange,
    SITE_TITLE, SITE_TITLE_SHORT,
    tags,
    validateEmail,
    WEBMASTER_EMAIL
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {extractErrorMessage} from '../../services/errors';

const warningFragmentId = "teacher_registration_warning_message"; // TUTOR have decided to keep this message

export const TutorRequest = () => {
    const user = useAppSelector(selectors.user.orNull);
    const error = useAppSelector((state: AppState) => state?.error);
    const errorMessage = extractErrorMessage(error);
    const {data: warningFragment} = useGetPageFragmentQuery(warningFragmentId);
    const [submitContactForm] = useSubmitContactFormMutation();

    const [sendVerificationEmail] = useRequestEmailVerificationMutation();
    const requestVerificationEmail = () => {
        if (user?.loggedIn && user.email) {
            sendVerificationEmail({email: user.email});
        }
    };

    const [firstName, setFirstName] = useState(user?.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user?.loggedIn && user.familyName || "");
    const [emailAddress, setEmailAddress] = useState(user?.loggedIn && user.email || "");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [reason, setReason] = useState<string>("");
    const [messageSent, setMessageSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));

    const subject = "Tutor Account Request";
    const message = "Hello,\n\n" +
        `Please could you convert my ${SITE_TITLE_SHORT} account into a tutor account.` + "\n\n" +
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

    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb currentPageTitle="Tutor Account request" icon={{type: "icon", icon: "icon-account"}}/>
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
                                    <span className="h3 mb-3 d-inline-block">
                                        You already have a tutor or teacher account
                                    </span>
                                    {isPhy && <p className="mb-2">
                                        Go to the <Link to="/tutor_features">Tutor features page</Link> to start using your
                                        new account features.
                                    </p>}
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
                                submitContactForm({firstName, lastName, emailAddress, subject, message});
                                setMessageSent(true);
                            }}>
                                <CardBody>
                                    <p>
                                        {`To request a tutor account on ${SITE_TITLE}, please fill in this form. `}
                                        {"You must have verified your account email address. If any of the "}
                                        {"information is incorrect or missing, you can amend it on your "}
                                        <Link to="/account">My account</Link>{" page."}
                                    </p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="first-name-input" className="form-required">First name</Label>
                                                <Input disabled id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user?.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="last-name-input" className="form-required">Last name</Label>
                                                <Input disabled id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user?.loggedIn ? user.familyName : ""}
                                                    onChange={e => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={isPhy ? 6 : undefined}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="email-input" className="form-required">Email address</Label>
                                                <Input disabled invalid={!isValidEmail || !emailVerified} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user?.loggedIn ? user.email : ""}
                                                    onChange={e => setEmailAddress(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                            </FormGroup>
                                        </Col>
                                        {isPhy && <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="subject-input">Subjects</Label>
                                                <StyledSelect
                                                    inputId="subject-input"
                                                    placeholder="All"
                                                    isClearable
                                                    isMulti
                                                    onChange={selectOnChange(setSubjects, true)}
                                                    options={tags.allSubjectTags.map(tag => ({value: tag.title, label: tag.title}))}
                                                />
                                            </FormGroup>
                                        </Col>}
                                    </Row>
                                    <Row>
                                        <Col size={12}>
                                            <FormGroup className="form-group">
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
                                            <small className="text-danger text-start">Your email address is not verified —
                                                please click on the link in the verification email to confirm your
                                                email address. You can <Button color="link primary-font-link" onClick={requestVerificationEmail}>request a
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
                                            <span className="d-block pb-3 pb-md-0 text-end text-md-start form-required">
                                                Required field
                                            </span>
                                        </Col>
                                        <Col size={12} md={6} className="text-end">
                                            <Button type="submit" color="keyline" disabled={!emailVerified} className='w-100'>Submit</Button>
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
