import React, { useEffect, useState } from "react";
import { Form, Row, Col, Container, FormGroup, Label, Input } from "reactstrap";
import { AppGroup } from "../../../../../IsaacAppTypes";
import { isaacApi, useAppSelector } from "../../../../state";
import { selectors } from "../../../../state/selectors";
import { SchoolInput } from "../../../elements/inputs/SchoolInput";
import FormInput from "./FormInput";
import { useReserveUsersOnCompetition } from "./useReserveUsersOnCompetition";
import { useActiveGroups } from "./useActiveGroups";

const COMPETITON_ID = "20250131_isaac_competition";
interface CompetitionEntryFormProps {
  handleTermsClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const CompetitionEntryForm = ({ handleTermsClick }: CompetitionEntryFormProps) => {
  const [selectedGroup, setSelectedGroup] = useState<AppGroup | null>(null);
  const activeGroups = useActiveGroups();
  const [getGroupMembers] = isaacApi.endpoints.getGroupMembers.useLazyQuery();
  const targetUser = useAppSelector(selectors.user.orNull);
  const reserveUsersOnCompetition = useReserveUsersOnCompetition();
  const [submissionLink, setSubmissionLink] = useState("");

  useEffect(() => {
    if (selectedGroup?.id && !selectedGroup.members) {
      getGroupMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  const isSubmitDisabled = !submissionLink || !selectedGroup;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const elements = form.elements as any;
    const groupId = elements.formGroup.value;
    const selectedGroup = activeGroups.find((group) => group.groupName === groupId);
    const submissionLink = elements.submissionLink.value;
    const groupName = selectedGroup?.groupName;

    if (selectedGroup?.id) {
      const reservableIds =
        selectedGroup.members?.map((member) => member.id).filter((id): id is number => id !== undefined) || [];
      reserveUsersOnCompetition(COMPETITON_ID, reservableIds, submissionLink, groupName);
    }

    setSubmissionLink("");
    elements.formGroup.selectedIndex = 0;
  };

  return (
    <div className="py-5">
      <div className="entry-form-background-img entry-form-section">
        <Container className="pb-2">
          <Form onSubmit={handleSubmit}>
            <h1 className="py-4 entry-form-title">Enter the competition</h1>
            <Row className="d-flex flex-column flex-md-row">
              <Col lg={6}>
                <FormInput
                  label="First Name"
                  type="text"
                  id="firstName"
                  required
                  disabled={true}
                  defaultValue={targetUser?.loggedIn ? targetUser.givenName || "" : ""}
                />
                <FormInput
                  label="Last Name"
                  type="text"
                  id="lastName"
                  required
                  disabled={true}
                  defaultValue={targetUser?.loggedIn ? targetUser?.familyName || "" : ""}
                />
                {targetUser && (
                  <FormGroup>
                    <Label className="entry-form-sub-title">
                      School <span className="entry-form-asterisk">*</span>
                    </Label>
                    <SchoolInput
                      disableInput={true}
                      userToUpdate={{ ...targetUser, password: null }}
                      submissionAttempted={false}
                      required
                      showLabel={false}
                    />
                  </FormGroup>
                )}
              </Col>
              <Col lg={6}>
                <FormInput
                  label="Link to a students' project"
                  type="text"
                  id="submissionLink"
                  required
                  disabled={false}
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                />
                <FormInput
                  label="Group"
                  subLabel="Please ensure each group has no more than 4 students."
                  type="select"
                  id="formGroup"
                  required
                  disabled={false}
                  options={["Please select from the list", ...activeGroups.map((group) => group.groupName || "")]}
                  activeGroups={activeGroups.filter(
                    (group): group is { groupName: string } => group.groupName !== undefined,
                  )}
                  setSelectedGroup={setSelectedGroup}
                />
                <Row className="entry-form-button-label d-flex flex-column flex-md-row">
                  <Col xs="auto">
                    <Input
                      className="btn-sm entry-form-button"
                      type="submit"
                      value="Submit"
                      disabled={isSubmitDisabled}
                    />
                  </Col>
                  <Col className="pl-0 mt-2 ml-3 mt-md-0">
                    <Label>
                      By entering the National Computer Science Competition you agree to the{" "}
                      <a href="#terms-and-conditions" onClick={handleTermsClick}>
                        Terms and Conditions
                      </a>
                      .
                    </Label>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default CompetitionEntryForm;
