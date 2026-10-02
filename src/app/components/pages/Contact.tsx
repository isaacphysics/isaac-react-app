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
import { CONTACT_FORM_CHAR_LENGTH_LIMIT, isPhy, isTeacherOrAbove, SITE_TITLE, SOCIAL_LINKS, validateEmail, WEBMASTER_EMAIL } from "../../services";
import queryString from "query-string";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {MetaDescription} from "../elements/MetaDescription";
import {Immutable} from "immer";
import {extractErrorMessage} from '../../services/errors';
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

const determineUrlQueryPresets = (user?: Immutable<PotentialUser> | null) => {
    const urlQuery = queryString.parse(location.search);
    let presetSubject = "";
    let presetMessage = "";
    let presetPlaceholder = "";

    if (urlQuery?.preset === "teacherRequest" && user?.loggedIn && !isTeacherOrAbove(user)) {
        presetSubject = i18next.t("common:contact.preset.teacherAccountSubject");
        presetMessage = i18next.t("common:contact.preset.teacherAccountMessage", { siteTitle: SITE_TITLE }) + user.givenName + " " + user.familyName;
    } else if (urlQuery?.preset === 'accountDeletion' && user?.loggedIn) {
        presetSubject = i18next.t("common:contact.preset.accountDeletionSubject");
        presetMessage = i18next.t("common:contact.preset.accountDeletionMessage", { siteTitle: SITE_TITLE }) + user.givenName + " " + user.familyName;
    } else if (urlQuery?.preset === 'contentProblem') {
        presetSubject = i18next.t("common:contact.preset.contentProblemSubject");
        presetPlaceholder = i18next.t("common:contact.preset.contentProblemPlaceholder");
        if (urlQuery?.accordion) {
            presetSubject += ` in "${urlQuery.accordion}"`;
        } else if (urlQuery?.page) {
            presetSubject += ` in "${urlQuery.page}"`;
        }
        if (urlQuery?.section != null) {
            presetSubject += i18next.t("common:contact.preset.contentProblemSection", { sectionName: urlQuery.section });
        }
    } else if (urlQuery?.preset === 'notFound') {
        presetSubject = i18next.t("common:contact.preset.pageNotFoundSubject");
        presetMessage = i18next.t("common:contact.preset.pageNotFoundMessage", { pageName: urlQuery?.page });
    }
    return [
        urlQuery.subject as string || presetSubject,
        urlQuery.message as string || presetMessage,
        urlQuery.placeholder as string || presetPlaceholder
    ];
};

export const Contact = () => {
    const { t } = useTranslation();
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
    const reachedMaxLength = message.length >= CONTACT_FORM_CHAR_LENGTH_LIMIT; 

    const metaDescription = t("site:contact.metaDescription");

    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb 
            currentPageTitle={t("common:contact.title")} 
            icon={{type: "icon", "icon": "icon-contact"}}
        />
        <MetaDescription description={metaDescription}/>
        <div className="pt-4">
            <Row>
                <Col size={12} md={{size: 3, order: 1}} xs={{order: 2}} className="mt-4 mt-md-0">
                    <div>
                        <h3>{t("common:contact.faq.heading")}</h3>
                        <p> {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:contact.faq.text" components={{ studentFaqLink: <a href="/support/student" />, teacherFaqLink: <a href="/support/teacher" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</p>
                    </div>
                    {isPhy && <>
                        <h3>{t("sci:contact.events.heading")}</h3>
                        <p>{/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="sci:contact.events.text" components={{ eventsLink: <a href="/events" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</p>
                    </>}
                    <h3>{t("common:contact.problems.heading")}</h3>
                    <p>{/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:contact.problems.text" components={{ webmasterEmailLink: <a href={`mailto:${WEBMASTER_EMAIL}`} /> }} values={{ webmasterEmail: WEBMASTER_EMAIL }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</p>
                    <h3>{t("common:contact.social.heading")}</h3>
                    <p>{t("common:contact.social.text")}</p>
                    {Object.entries(SOCIAL_LINKS).map(([_, {name, href}], i) => <>{i > 0 && <br/>}<a href={href}>{name}</a></>)}
                </Col>
                <Col size={12} md={{size: 9, order: 2}} xs={{order: 1}}>
                    <Card>
                        {messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <h3 ref={successRef} tabIndex={-1}>
                                        {t("common:contact.form.successMessage")}
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
                                    <h3>{t("common:contact.form.heading")}</h3>
                                    <PageFragment fragmentId="contact_intro"/>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="first-name-input" className="form-required">{t("common:contact.form.firstNameLabel")}</Label>
                                                <Input id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user && user.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="last-name-input" className="form-required">{t("common:contact.form.lastNameLabel")}</Label>
                                                <Input id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user && user.loggedIn ? user.familyName : ""}
                                                    onChange={e => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="email-input" className="form-required">{t("common:contact.form.emailLabel")}</Label>
                                                <Input invalid={messageSendAttempt && !isValidEmail} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user && user.loggedIn ? user.email : ""}
                                                    onChange={e => setEmail(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                                <FormFeedback id="emailValidationMessage">
                                                    {!isValidEmail && t("common:contact.form.emailValidationError")}
                                                </FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="subject-input" className="form-required">{t("common:contact.form.subjectLabel")}</Label>
                                                <Input id="subject-input" type="text" name="subject" defaultValue={subject}
                                                    onChange={e => setSubject(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="message-input" className="form-required">{t("common:contact.form.messageLabel")}</Label>
                                                <Input id="message-input" type="textarea" name="message" rows={7} value={message}
                                                    placeholder={presetPlaceholder} maxLength={CONTACT_FORM_CHAR_LENGTH_LIMIT}
                                                    onChange={e => setMessage(e.target.value)} required/>
                                            </FormGroup>
                                            {reachedMaxLength && <Alert color="warning">{t("common:contact.form.maxLengthWarning")}</Alert>}
                                        </Col>
                                    </Row>
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <Alert color="danger" isOpen={!!errorMessage}><>{/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:contact.form.errorMessage" components={{ webmasterEmailLink: <a href={`mailto:${WEBMASTER_EMAIL}`} /> }} values={{ errorMessage, webmasterEmail: WEBMASTER_EMAIL }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</></Alert>
                                    </div>
                                    <Row>
                                        <Col size={12} md={6}>
                                            {isPhy && <span className="d-block pb-3 pb-md-0 text-end text-md-start form-required">
                                                {t("common:contact.form.requiredField")}
                                            </span>}                                  
                                        </Col>
                                        <Col size={12} md={6} className="text-end">
                                            <Button type="submit" color="secondary" className="w-100">{t("common:contact.form.submitButton")}</Button>
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
