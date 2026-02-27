import { CardBody, FormGroup, Table } from "reactstrap";
import React from "react";
import { UserEmailPreferences } from "../../../../IsaacAppTypes";
import { TrueFalseRadioInput } from "./TrueFalseRadioInput";
import { Role } from "../../../../IsaacApiTypes";

interface RegistrationEmailPreferenceProps {
  emailPreferences: UserEmailPreferences | null | undefined;
  setEmailPreferences: (e: UserEmailPreferences) => void;
  submissionAttempted: boolean;
  userRole: Role;
}

type EmailPreferenceDescriptions = {
  assignments: string;
  newsAndUpdates: string;
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
      label: "Assignments",
      property: "ASSIGNMENTS",
      condition: userRole === "STUDENT",
    },
    { key: "newsAndUpdates", label: "News and Updates", property: "NEWS_AND_UPDATES" },
  ];
  const isaacEmailPreferenceDescriptions: EmailPreferenceDescriptions = {
    assignments: "Receive assignment notifications from your teacher.",
    newsAndUpdates: "Be the first to know about new topics, platform features, competitions and free student events.",
  };

  return (
    <CardBody className="p-0">
      <h3 className="pb-4">
        Your communication preferences <span className="asterisk">*</span>
      </h3>
      <FormGroup className="overflow-auto">
        <Table className="mb-0">
          <tbody>
            {preferences.map((preference, index) => {
              const description = isaacEmailPreferenceDescriptions[preference.key as keyof EmailPreferenceDescriptions];
              return preference.condition === undefined || preference.condition ? (
                <tr key={index}>
                  <td>{preference.label}</td>
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
