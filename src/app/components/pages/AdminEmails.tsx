import React, {useEffect, useState} from 'react';
import {
    AppState,
    useAppSelector,
    useLazyGetTemplateEmailQuery,
    useSendAdminEmailWithIdsMutation
} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import debounce from 'lodash/debounce';
import {isEventManager, siteSpecific} from "../../services";
import { Container, Card, CardTitle, CardBody, Label, Input, Row, Col, Button } from 'reactstrap';
import { useLocation } from 'react-router';
import { Trans, useTranslation } from "react-i18next";

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

export const AdminEmails = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [csvIDs, setCSVIDs] = useState(location.state?.csvIDs || [] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [contentObjectID, setContentObjectID] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const user = useAppSelector((state: AppState) => state?.user);

    const [getEmailTemplate, {data: emailTemplate}] = useLazyGetTemplateEmailQuery();
    const [sendAdminEmailWithIds] = useSendAdminEmailWithIdsMutation();

    const numberOfUsers = csvIDs.length;
    const canSubmit = emailTemplate && emailType != "null" && numberOfUsers > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e);}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        isEventManager(user) && setEmailType("EVENTS");
    }, [user]);

    return <Container id="admin-emails-page">
        <TitleAndBreadcrumb 
            currentPageTitle={t("common:admin.emails.title")} 
            icon={{type: "icon", icon: "icon-contact"}}
        />

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.emails.userSelection.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.emails.userSelection.label")}</Label>
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
            <CardTitle tag="h2">{t("common:admin.emails.emailType.title")}</CardTitle>
            <CardBody>
                <Label>{t("common:admin.emails.emailType.label")}</Label>
                <p>{t("common:admin.emails.emailType.optOutInfo")}</p>
                <Input
                    id="email-type-input" type="select" value={emailType}
                    disabled={isEventManager(user)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailType(e.target.value);
                    }}
                >
                    <option value="null">{t("common:admin.emails.emailType.placeholder")}</option>
                    <option value="ASSIGNMENTS">{t("common:admin.emails.emailType.optionAssignments")}</option>
                    <option value="NEWS_AND_UPDATES">{t("common:admin.emails.emailType.optionNews")}</option>
                    <option value="EVENTS">{t("common:admin.emails.emailType.optionEvents")}</option>
                    <option value="ADMIN">{t("common:admin.emails.emailType.optionAdmin")}</option>
                </Input>
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">{t("common:admin.emails.contentObject.title")}</CardTitle>
            <CardBody>
                <Row>
                    <Col>
                        <Input
                            id="content-object-id-input" type="text" placeholder={t("common:admin.emails.contentObject.placeholder")}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setContentObjectID(e.target.value);
                            }}
                        >
                        </Input>
                    </Col>
                    <Col>
                        <Button type="submit" color="secondary" disabled={contentObjectID.length == 0}
                            onClick={() => getEmailTemplate(contentObjectID)} className={siteSpecific("w-100", "form-control border-0")}>
                            {t("common:admin.emails.contentObject.loadButton")}
                        </Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>

        {emailTemplate && <>
            <Card className="p-3 my-3">
                <CardTitle tag="h2">{t("common:admin.emails.details.title")}</CardTitle>
                <CardBody>
                    <ul>
                        <li><b>{t("common:admin.emails.details.subjectLabel")}</b> {emailTemplate.subject || t("common:admin.emails.details.noSubject")}</li>
                        {emailTemplate.from && <li><b>{t("common:admin.emails.details.fromLabel")}</b> {emailTemplate.fromName || ""} &lt;{emailTemplate.from}&gt;</li>}
                        {emailTemplate.replyTo && <li><b>{t("common:admin.emails.details.replyToLabel")}</b> {emailTemplate.replyToName || ""} &lt;{emailTemplate.replyTo}&gt;</li>}
                        <li><b>{t("common:admin.emails.details.sentViaLabel")}</b>&nbsp;
                            {emailTemplate.sender?.includes("@mail.isaac") ? "MailGun" : t("common:admin.emails.details.senderUniversity")}
                        </li>
                    </ul>
                </CardBody>
            </Card>

            <Card className="p-3 my-3">
                <CardTitle tag="h2">{t("common:admin.emails.htmlPreview.title")}</CardTitle>
                <Label>{t("common:admin.emails.htmlPreview.label")}</Label>
                <CardBody>
                    {emailTemplate.html &&
                        <iframe title={t("common:admin.emails.htmlPreview.frameTitle")} className="email-preview-frame" srcDoc={emailTemplate.html}/>
                    }
                </CardBody>
            </Card>

            <Card className="p-3 my-3">
                <CardTitle tag="h2">{t("common:admin.emails.plainTextPreview.title")}</CardTitle>
                <Label>{t("common:admin.emails.plainTextPreview.label")}</Label>
                <CardBody>
                    <pre>{emailTemplate.plainText}</pre>
                </CardBody>
            </Card>
        </>}

        <Card className="mb-7">
            <CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <Trans i18nKey="common:admin.emails.send.recipientsWarning" components={{ warning: <strong />, count: <strong /> }} values={{ recipientCount: numberOfUsers }} />
                            </div>}
                            <Button type='button' color="secondary" disabled={!canSubmit} className={siteSpecific("btn-xl", "form-control border-0")}
                                onClick={() => {
                                    if (window.confirm(t("common:admin.emails.send.confirm", { emailType, contentObjectId: contentObjectID, count: numberOfUsers }))) {
                                        setEmailSent(true);
                                        sendAdminEmailWithIds({contentId: contentObjectID, emailType, ids: csvIDs});
                                    }
                                }}>
                                {t("common:admin.emails.send.sendButton")}
                            </Button>
                        </React.Fragment>
                        :
                        <React.Fragment>{t("common:admin.emails.send.requestMade")}</React.Fragment>
                    }
                </div>
            </CardBody>
        </Card>
    </Container>;
};
