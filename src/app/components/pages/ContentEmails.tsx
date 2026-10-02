import React, {useEffect, useState} from 'react';
import {useSendProvidedEmailWithUserIdsMutation} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import debounce from 'lodash/debounce';
import {convert} from 'html-to-text';
import {siteSpecific} from "../../services";
import {EmailTemplateDTO} from "../../../IsaacApiTypes";
import { Container, Card, CardTitle, CardBody, Label, Input, Button } from 'reactstrap';
import { useLocation } from 'react-router';
import { Trans, useTranslation } from "react-i18next";

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

const ContentEmails = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [csvIDs, setCSVIDs] = useState(location.state?.csvIDs || [] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [emailSent, setEmailSent] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [htmlTemplate, setHtmlTemplate] = useState("");
    const [plaintextTemplate, setPlaintextTemplate] = useState("");
    const [overrideEnvelopeFrom, setOverrideEnvelopeFrom] = useState<string|undefined>();
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplateDTO>({});

    const numberOfUsers = csvIDs.length;
    const canSubmit = emailTemplate?.subject?.length != 0 && emailTemplate?.htmlContent?.length != 0 && emailTemplate?.plainTextContent?.length != 0 && emailType != "null" && numberOfUsers > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e);}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        setPlaintextTemplate(convert(htmlTemplate));
    }, [htmlTemplate]);

    useEffect(() => {
        setEmailTemplate({
            subject: emailSubject,
            plainTextContent: plaintextTemplate,
            htmlContent: htmlTemplate,
            overrideEnvelopeFrom: overrideEnvelopeFrom,
        });
    }, [emailSubject, plaintextTemplate, htmlTemplate, overrideEnvelopeFrom]);

    const mailgunAddress = siteSpecific("no-reply@mail.isaacscience.org", "no-reply@mail.adacomputerscience.org");

    const [sendProvidedEmailWithUserIds] = useSendProvidedEmailWithUserIdsMutation();

    return <Container id="admin-emails-page">
        <TitleAndBreadcrumb currentPageTitle={t("common:admin.contentEmails.title")} icon={{type: "icon", icon: "icon-mail"}} />

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.contentEmails.userSelection.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.contentEmails.userSelection.label")}</Label>
                <Input
                    id="email-user-ids-input"
                    type = "textarea"
                    defaultValue={csvIDs.join(", ")}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        csvInputDebounce(event.target.value);
                    }}
                />
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.contentEmails.subject.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.contentEmails.subject.label")}</Label>
                <Input
                    id="email-subject-input" type="text" value={emailSubject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailSubject(e.target.value);
                    }}
                >
                </Input>
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.contentEmails.template.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.contentEmails.template.htmlLabel")}</Label>
                <Input
                    id="email-html-input"
                    type = "textarea"
                    defaultValue={htmlTemplate}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setHtmlTemplate(event.target.value);
                    }}
                    rows={10}
                />
            </CardBody>
            <CardBody>
                <Label>{t("common:admin.contentEmails.template.previewLabel")}</Label>
                <iframe title={t("common:admin.contentEmails.template.iframeTitle")} srcDoc={htmlTemplate} className="email-html"/>
            </CardBody>
            <CardBody>
                <Label>{t("common:admin.contentEmails.template.plaintextLabel")}</Label>
                <Input
                    id="email-plaintext-input"
                    type = "textarea"
                    value={plaintextTemplate}
                    disabled={true}
                    rows={10}
                />
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.contentEmails.type.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.contentEmails.type.label")}</Label>
                <p>{t("common:admin.contentEmails.type.optOutNote")}</p>
                <Input
                    id="email-type-input" type="select" value={emailType}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailType(e.target.value);
                    }}
                >
                    <option value="null">{t("common:admin.contentEmails.type.selectPlaceholder")}</option>
                    <option value="ASSIGNMENTS">{t("common:admin.contentEmails.type.assignments")}</option>
                    <option value="NEWS_AND_UPDATES">{t("common:admin.contentEmails.type.newsUpdates")}</option>
                    <option value="EVENTS">{t("common:admin.contentEmails.type.events")}</option>
                    <option value="ADMIN">{t("common:admin.contentEmails.type.adminUrgent")}</option>
                </Input>
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.contentEmails.sendVia.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.contentEmails.sendVia.label")}</Label>
                <Input
                    id="email-type-input" type="select" value={overrideEnvelopeFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setOverrideEnvelopeFrom(e.target.value);
                    }}
                >
                    <option value={undefined}>{t("common:admin.contentEmails.sendVia.isaac")}</option>
                    <option value={mailgunAddress}>{t("common:admin.contentEmails.sendVia.mailgun")}</option>
                </Input>
            </CardBody>
        </Card>

        <Card className="mb-7">
            <CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <Trans i18nKey="common:admin.contentEmails.recipientWarning" components={{ warningLabel: <strong />, countEmphasis: <strong /> }} values={{ recipientCount: numberOfUsers }} />
                            </div>}
                            <Button
                                type="button" color="secondary" className={siteSpecific("btn-xl", "form-control border-0")}
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to send a ${emailType} email to ${numberOfUsers} user${numberOfUsers > 1 ? "s" : ""}?`)) {
                                        setEmailSent(true);
                                        void sendProvidedEmailWithUserIds({emailTemplate, emailType, ids: csvIDs});
                                    }
                                }}
                            >{t("common:admin.contentEmails.sendButton")}</Button>
                        </React.Fragment>
                        :
                        <React.Fragment>{t("common:admin.contentEmails.sentMessage")}</React.Fragment>
                    }
                </div>
            </CardBody>
        </Card>
    </Container>;
};
export default ContentEmails;
