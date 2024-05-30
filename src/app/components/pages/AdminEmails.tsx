import React, { useEffect, useState } from "react";
import { AppState, getEmailTemplate, sendAdminEmailWithIds, useAppDispatch, useAppSelector } from "../../state";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import { debounce } from "lodash";
import { isEventManager } from "../../services";
import { Container, Card, CardTitle, CardBody, Label, Input, Row, Col } from "reactstrap";

interface AdminEmailsProps {
  location: {
    state?: {
      csvIDs?: number[];
    };
  };
}

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

export const AdminEmails = (props: AdminEmailsProps) => {
  const dispatch = useAppDispatch();
  const [csvIDs, setCSVIDs] = useState(props.location.state?.csvIDs || ([] as number[]));
  const [emailType, setEmailType] = useState("null");
  const [contentObjectID, setContentObjectID] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const user = useAppSelector((state: AppState) => state?.user);
  const emailTemplateSelector = useAppSelector(
    (state: AppState) => state && state.adminEmailTemplate && state.adminEmailTemplate,
  );

  const numberOfUsers = csvIDs.length;
  const canSubmit = emailTemplateSelector && emailType != "null" && numberOfUsers > 0;
  const csvInputDebounce = debounce(
    (value: string) =>
      setCSVIDs(
        value
          .split(/[\s,]+/)
          .map((e) => {
            return parseInt(e);
          })
          .filter((num) => !isNaN(num)),
      ),
    250,
  );

  useEffect(() => {
    isEventManager(user) && setEmailType("EVENTS");
  }, [user]);

  return (
    <Container id="admin-emails-page">
      <TitleAndBreadcrumb currentPageTitle="Admin emails" />

      <Card className="p-3 my-3">
        <CardTitle tag="h2">User selection</CardTitle>
        <CardBody>
          <Label>Comma separated list of user IDs to email.</Label>
          <Input
            id="email-user-ids-input"
            type="textarea"
            defaultValue={csvIDs.join(", ")}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              csvInputDebounce(event.target.value);
            }}
          />
        </CardBody>
      </Card>

      <Card className="p-3 my-3">
        <CardTitle tag="h2">Email type</CardTitle>
        <CardBody>
          <Label>The type of email you are sending.</Label>
          <p>
            Users who have opted out of this type of email will not receive anything. Administrative emails cannot be
            opted out of and should be avoided.
          </p>
          <Input
            id="email-type-input"
            type="select"
            value={emailType}
            disabled={isEventManager(user)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmailType(e.target.value);
            }}
          >
            <option value="null">--- Make a selection ---</option>
            <option value="ASSIGNMENTS">Assignments</option>
            <option value="NEWS_AND_UPDATES">News and updates</option>
            <option value="EVENTS">Events</option>
            <option value="ADMIN">Urgent administrative email</option>
          </Input>
        </CardBody>
      </Card>

      <Card className="p-3 my-3">
        <CardTitle tag="h2">Content object</CardTitle>
        <CardBody>
          <Row>
            <Col>
              <Input
                id="content-object-id-input"
                type="text"
                placeholder="Enter email content object ID"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setContentObjectID(e.target.value);
                }}
              ></Input>
            </Col>
            <Col>
              <Input
                type="submit"
                value="Load template"
                className={
                  "btn btn-block btn-secondary border-0 " + classnames({ disabled: contentObjectID.length == 0 })
                }
                disabled={contentObjectID.length == 0}
                onClick={() => dispatch(getEmailTemplate(contentObjectID))}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {emailTemplateSelector && (
        <>
          <Card className="p-3 my-3">
            <CardTitle tag="h2">Details</CardTitle>
            <CardBody>
              <ul>
                <li>
                  <b>Subject:</b> {emailTemplateSelector.subject || "no subject"}
                </li>
                {emailTemplateSelector.from && (
                  <li>
                    <b>From:</b> {emailTemplateSelector.fromName || ""} &lt;{emailTemplateSelector.from}&gt;
                  </li>
                )}
                {emailTemplateSelector.replyTo && (
                  <li>
                    <b>Reply-To:</b> {emailTemplateSelector.replyToName || ""} &lt;{emailTemplateSelector.replyTo}&gt;
                  </li>
                )}
                <li>
                  <b>Sent via:</b>&nbsp;
                  {emailTemplateSelector.sender?.includes("@mail.isaac") ? "MailGun" : "University"}
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card className="p-3 my-3">
            <CardTitle tag="h2">HTML preview</CardTitle>
            <Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</Label>
            <CardBody>
              {emailTemplateSelector.html && (
                <iframe
                  title="Email content preview"
                  className="email-preview-frame"
                  srcDoc={emailTemplateSelector.html}
                />
              )}
            </CardBody>
          </Card>

          <Card className="p-3 my-3">
            <CardTitle tag="h2">Plain text preview</CardTitle>
            <Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</Label>
            <CardBody>
              <pre>{emailTemplateSelector.plainText}</pre>
            </CardBody>
          </Card>
        </>
      )}

      <Card className="mb-5">
        <CardBody>
          <div className="text-center">
            {!emailSent ? (
              <React.Fragment>
                {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && (
                  <div className="alert alert-warning">
                    <strong>Warning:</strong> There are currently <strong>{numberOfUsers}</strong> selected recipients.
                  </div>
                )}
                <Input
                  type="button"
                  value="Send emails"
                  className={"btn btn-xl btn-secondary border-0 " + classnames({ disabled: !canSubmit })}
                  disabled={!canSubmit}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to send a ${emailType} email (${contentObjectID}) to ${numberOfUsers} user${
                          numberOfUsers > 1 ? "s" : ""
                        }?`,
                      )
                    ) {
                      setEmailSent(true);
                      dispatch(sendAdminEmailWithIds(contentObjectID, emailType, csvIDs));
                    }
                  }}
                />
              </React.Fragment>
            ) : (
              <React.Fragment>Request made, to send another refresh.</React.Fragment>
            )}
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};
