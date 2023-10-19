import { CardBody, FormGroup, Table } from "reactstrap";
import React, { Dispatch, SetStateAction, useState } from "react";
import { UserEmailPreferences } from "../../../../IsaacAppTypes";
import { TrueFalseRadioInput } from "../inputs/TrueFalseRadioInput";
import { AppState, selectors, useAppSelector } from "../../../state";
import { SITE_SUBJECT_TITLE, isStudent, validateEmailPreferences } from "../../../services";

// Extended useState hook for email preferences, enforcing a default of {ASSIGNMENTS: true}
export const useEmailPreferenceState = (
  initialEmailPreferences?: Nullable<UserEmailPreferences>,
): [Nullable<UserEmailPreferences>, Dispatch<SetStateAction<Nullable<UserEmailPreferences>>>] => {
  const [emailPreferences, _setEmailPreferences] = useState<Nullable<UserEmailPreferences>>({
    ASSIGNMENTS: true,
    ...initialEmailPreferences,
  });
  const setEmailPreferences = (
    newEmailPreferences:
      | Nullable<UserEmailPreferences>
      | ((ep: Nullable<UserEmailPreferences>) => Nullable<UserEmailPreferences>),
  ) => {
    if (typeof newEmailPreferences === "function") {
      return _setEmailPreferences((old) => ({ ASSIGNMENTS: true, ...newEmailPreferences(old) }));
    }
    return _setEmailPreferences({ ASSIGNMENTS: true, ...newEmailPreferences });
  };
  return [emailPreferences, setEmailPreferences];
};

interface UserEmailPreferencesProps {
  emailPreferences: UserEmailPreferences | null | undefined;
  setEmailPreferences: (e: UserEmailPreferences) => void;
  submissionAttempted: boolean;
  idPrefix?: string;
}
export const UserEmailPreference = ({
  emailPreferences,
  setEmailPreferences,
  submissionAttempted,
  idPrefix = "my-account-",
}: UserEmailPreferencesProps) => {
  const user = useAppSelector(selectors.user.orNull);
  const userIsStudent = isStudent({ ...user, loggedIn: true });
  const isaacEmailPreferenceDescriptions = {
    assignments: "Receive assignment notifications from your teacher.",
    news: "Be the first to know about new topics, new platform features, and our fantastic competition giveaways.",
    events: "Get valuable updates on our free student workshops happening near you.",
  };

  let errorMessage = null;
  if (submissionAttempted && !validateEmailPreferences(emailPreferences)) {
    errorMessage = "Please specify all preferences";
  }

  return (
    <CardBody className="p-0">
      <h3 className="pb-4">Your communication preferences</h3>
      <p>
        Get important information about the Isaac {SITE_SUBJECT_TITLE} programme delivered to your inbox. These settings
        can be changed at any time. Expect one email per term for News and a monthly bulletin for Events.{" "}
        {userIsStudent && "Assignment notifications will be sent as needed by your teacher."}
      </p>
      <FormGroup className="overflow-auto">
        <Table className="mb-0">
          <thead>
            <tr>
              <th>Email</th>
              <th className="d-none d-sm-table-cell">Description</th>
              <th className="text-center">Preference</th>
            </tr>
          </thead>
          <tbody>
            {userIsStudent && (
              <tr>
                <td>Assignments</td>
                <td className="d-none d-sm-table-cell">{isaacEmailPreferenceDescriptions.assignments}</td>
                <td className="text-center">
                  <TrueFalseRadioInput
                    id={`${idPrefix}assignments`}
                    stateObject={emailPreferences}
                    propertyName="ASSIGNMENTS"
                    setStateFunction={setEmailPreferences}
                    submissionAttempted={submissionAttempted}
                  />
                </td>
              </tr>
            )}
            <tr>
              <td>News</td>
              <td className="d-none d-sm-table-cell">{isaacEmailPreferenceDescriptions.news}</td>
              <td className="text-center">
                <TrueFalseRadioInput
                  id={`${idPrefix}news`}
                  stateObject={emailPreferences}
                  propertyName="NEWS_AND_UPDATES"
                  setStateFunction={setEmailPreferences}
                  submissionAttempted={submissionAttempted}
                />
              </td>
            </tr>
            <tr>
              <td>Events</td>
              <td className="d-none d-sm-table-cell">{isaacEmailPreferenceDescriptions.events}</td>
              <td className="text-center">
                <TrueFalseRadioInput
                  id={`${idPrefix}events`}
                  stateObject={emailPreferences}
                  propertyName="EVENTS"
                  setStateFunction={setEmailPreferences}
                  submissionAttempted={submissionAttempted}
                />
              </td>
            </tr>
          </tbody>
        </Table>
        <hr />
        {errorMessage && (
          <h4 role="alert" className="text-danger text-center">
            {errorMessage}
          </h4>
        )}
      </FormGroup>
    </CardBody>
  );
};
