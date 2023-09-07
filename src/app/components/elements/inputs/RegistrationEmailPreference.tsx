import { CardBody, FormGroup, Table } from "reactstrap";
import React from "react";
import { UserEmailPreferences } from "../../../../IsaacAppTypes";
import { TrueFalseRadioInput } from "./TrueFalseRadioInput";
import { UserRole } from "../../../../IsaacApiTypes";

interface RegistrationEmailPreferenceProps {
  emailPreferences: UserEmailPreferences | null | undefined;
  setEmailPreferences: (e: UserEmailPreferences) => void;
  submissionAttempted: boolean;
  userRole: UserRole;
}

type EmailPreferenceDescriptions = {
  assignments: string;
  news: string;
  events: string;
};

export const RegistrationEmailPreference = ({
  emailPreferences,
  setEmailPreferences,
  userRole,
  submissionAttempted,
}: RegistrationEmailPreferenceProps) => {
  const preferences = [
    {
      key: "assignments",
      property: "ASSIGNMENTS",
      condition: userRole === "STUDENT",
    },
    { key: "news", property: "NEWS_AND_UPDATES" },
    { key: "events", property: "EVENTS" },
  ];
  const isaacEmailPreferenceDescriptions: EmailPreferenceDescriptions = {
    assignments: "Receive assignment notifications from your teacher.",
    news: "Be the first to know about new topics, new platform features, and our fantastic competition giveaways.",
    events:
      "Get valuable updates on our free student workshops happening near you.",
  };

  return (
    <CardBody className="p-0">
      <h3 className="pb-4">Your communication preferences</h3>
      <FormGroup className="overflow-auto">
        <Table className="mb-0">
          <tbody>
            {preferences.map((preference, index) => {
              const description =
                isaacEmailPreferenceDescriptions[
                  preference.key as keyof EmailPreferenceDescriptions
                ];
              return preference.condition === undefined ||
                preference.condition ? (
                <tr key={index}>
                  <td>
                    {preference.key.charAt(0).toUpperCase() +
                      preference.key.slice(1)}
                  </td>
                  <td className="d-none d-sm-table-cell">{description}</td>
                  <td className="text-center">
                    <TrueFalseRadioInput
                      id={preference.key}
                      stateObject={emailPreferences}
                      propertyName={preference.property}
                      setStateFunction={setEmailPreferences}
                      submissionAttempted={submissionAttempted}
                    />
                  </td>
                </tr>
              ) : null;
            })}
          </tbody>
        </Table>
        <hr className="text-center" />
      </FormGroup>
    </CardBody>
  );
};
