import React, { useEffect, useState } from "react";
import { Form, Row, Col, Container, FormGroup, Label, Input } from "reactstrap";
import { isaacApi, useAppSelector } from "../../../../state";
import { selectors } from "../../../../state/selectors";
import { SchoolInput } from "../../../elements/inputs/SchoolInput";
import FormInput from "./FormInput";
import { useReserveUsersOnCompetition } from "./useReserveUsersOnCompetition";
import { useActiveGroups } from "./useActiveGroups";
import Select from "react-select";
import CustomTooltip from "../../../elements/CustomTooltip";

const COMPETITON_ID = "20251020_isaac_competition_form";
interface CompetitionEntryFormProps {
  handleTermsClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export const CompetitionEntryForm = ({ handleTermsClick }: CompetitionEntryFormProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const activeGroups = useActiveGroups();
  const [getGroupMembers] = isaacApi.endpoints.getGroupMembers.useLazyQuery();
  const targetUser = useAppSelector(selectors.user.orNull);
  const reserveUsersOnCompetition = useReserveUsersOnCompetition();
  const [memberSelectionError, setMemberSelectionError] = useState<string>("");
  const [userToUpdate, setUserToUpdate] = useState(targetUser ? { ...targetUser, password: null } : { password: null });

  const handleUserUpdate = (user: any) => {
    setUserToUpdate(user);
  };

  const isSchoolValidForCompetition = () => {
    if (!userToUpdate) return false;

    if ((userToUpdate as any).schoolOther === "N/A") {
      return false;
    }

    return !!(
      (userToUpdate as any).schoolId ||
      ((userToUpdate as any).schoolOther && (userToUpdate as any).schoolOther !== "N/A")
    );
  };

  const selectedGroup = selectedGroupId ? activeGroups.find((group) => group.id === selectedGroupId) || null : null;

  useEffect(() => {
    if (selectedGroup?.id && !selectedGroup.members) {
      setIsLoadingMembers(true);
      getGroupMembers(selectedGroup.id)
        .unwrap()
        .then(() => {
          setIsLoadingMembers(false);
        })
        .catch(() => {
          setIsLoadingMembers(false);
        });
    } else if (selectedGroup?.members) {
      setIsLoadingMembers(false);
    }
  }, [selectedGroup, getGroupMembers]);

  useEffect(() => {
    setSelectedMembers([]);
  }, [selectedGroupId]);

  const handleMemberSelection = (selectedOptions: any) => {
    const selectedValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];

    if (selectedValues.length > 4) {
      setMemberSelectionError("Limit of 4 students reached. To select a new student, remove one first.");

      setTimeout(() => {
        setMemberSelectionError("");
      }, 10000);

      return;
    }

    setMemberSelectionError("");
    setSelectedMembers(selectedValues);
  };

  const isSchoolValid = isSchoolValidForCompetition();
  const isSubmitDisabled =
    !projectTitle || !projectLink || !selectedGroup || selectedMembers.length === 0 || !isSchoolValid;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionAttempted(true);

    if (!isSchoolValid) {
      return;
    }

    const selectedGroupObj = activeGroups.find((group) => group.id === selectedGroupId);
    const groupName = selectedGroupObj?.groupName;

    if (selectedGroupObj?.id && selectedMembers.length > 0) {
      const reservableIds = selectedMembers
        .map((memberId) => Number.parseInt(memberId, 10))
        .filter((id) => !Number.isNaN(id));

      reserveUsersOnCompetition(COMPETITON_ID, reservableIds, projectLink, projectTitle, groupName);
    }

    setProjectTitle("");
    setProjectLink("");
    setSelectedMembers([]);
    setSelectedGroupId(null);
  };

  const getPlaceholderText = () => {
    if (memberSelectionError) {
      return memberSelectionError;
    }

    if (isLoadingMembers) {
      return "Loading students...";
    }

    if (selectedGroup) {
      if (selectedGroup.members && selectedGroup.members.length > 0) {
        return "Choose students from your selected group";
      }
      return "No members found in this group";
    }

    return "Please select a group first";
  };

  function getSelectedGroup() {
    return selectedGroupId
      ? activeGroups.find((group) => group.id === selectedGroupId)
        ? {
            value: selectedGroupId,
            label: activeGroups.find((group) => group.id === selectedGroupId)?.groupName || "",
          }
        : null
      : null;
  }

  const showNoMembersWarning =
    selectedGroup && selectedGroup.members !== undefined && !isLoadingMembers && selectedGroup.members.length === 0;

  return (
    <div className="pt-5">
      <div className="entry-form-background-img entry-form-section">
        <Container className="pb-2">
          <Form onSubmit={handleSubmit}>
            <h1 className="py-4 entry-form-title">Enter the competition</h1>

            <h2 className="py-3 entry-form-section-title">
              Your account information (
              <a href="/account" style={{ color: "#FF3A6E", textDecoration: "underline" }}>
                update
              </a>
              )
            </h2>
            <Row className="d-flex flex-column flex-md-row">
              <Col lg={6}>
                <FormInput
                  label="First name"
                  type="text"
                  id="firstName"
                  required
                  disabled={true}
                  defaultValue={targetUser?.loggedIn ? targetUser.givenName || "" : ""}
                />
                <FormInput
                  label="Email address"
                  type="email"
                  id="email"
                  required
                  disabled={true}
                  defaultValue={targetUser?.loggedIn ? targetUser?.email || "" : ""}
                />
              </Col>
              <Col lg={6}>
                <FormInput
                  label="Last name"
                  type="text"
                  id="lastName"
                  required
                  disabled={true}
                  defaultValue={targetUser?.loggedIn ? targetUser?.familyName || "" : ""}
                />
                {targetUser && (
                  <FormGroup>
                    <Label className="entry-form-sub-title">
                      My current school or college <span className="entry-form-asterisk">*</span>
                    </Label>
                    <SchoolInput
                      userToUpdate={userToUpdate}
                      setUserToUpdate={handleUserUpdate}
                      submissionAttempted={submissionAttempted}
                      disableInput={true}
                      required={true}
                      showLabel={false}
                    />
                    {!isSchoolValid && (
                      <div className="entry-form-validation-tooltip">
                        <div className="tooltip-content">
                          <div className="tooltip-arrow"></div>
                          <img src="/assets/warning_icon.svg" alt="invalid school error" />
                          <div className="tooltip-text">
                            Please <a href="/account">update</a> your account details to specify your school or college.
                            Only teachers and students from state-funded schools in England are eligible to participate.
                          </div>
                        </div>
                      </div>
                    )}
                  </FormGroup>
                )}
              </Col>
            </Row>

            <h2 className="py-3 entry-form-section-title">Project details</h2>
            <Row>
              <Col lg={6}>
                <FormInput
                  label="Project title"
                  type="text"
                  id="projectTitle"
                  required
                  disabled={false}
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="E.g., SmartLab"
                />
              </Col>
              <Col lg={6}>
                <FormInput
                  label="Project link"
                  type="url"
                  id="projectLink"
                  required
                  disabled={false}
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  placeholder="Add a link to a project saved in the cloud (e.g., Google Drive, Dropbox)"
                  tooltipMessage="Upload your project to cloud storage (e.g., Google Drive, OneDrive, Dropbox) and paste the share link here. The link must be set to 'Anyone with the link can view'."
                />
              </Col>
            </Row>

            <h2 className="pt-3 pb-2 entry-form-section-title mb-0">Your students</h2>
            <Row>
              <Col lg={12}>
                <a href="/groups" className="mb-4 manage-group-link">
                  Manage students and groups here
                </a>
              </Col>
            </Row>
            <Row>
              <Col lg={6} className="basic-multi-select">
                <FormGroup>
                  <Label className="entry-form-sub-title">
                    Select your student group <span className="entry-form-asterisk">*</span>
                    <CustomTooltip
                      id="student-group-tooltip"
                      message="Choose one of the groups you have created that includes the student(s) who worked on the project. If no groups are available, go to Teachers > Manage Groups to create one and invite students to join."
                    />
                  </Label>
                  <Select
                    isClearable
                    placeholder="Choose from the groups you've created or create one first"
                    value={getSelectedGroup()}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setSelectedGroupId(selectedOption.value);
                      } else {
                        setSelectedGroupId(null);
                      }
                    }}
                    options={activeGroups
                      .filter((group) => group.id !== undefined)
                      .map((group) => ({
                        value: group.id!,
                        label: group.groupName || "",
                      }))}
                    noOptionsMessage={() => "No options"}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        border: "1px solid #ced4da",
                        borderRadius: "0.375rem",
                        minHeight: "38px",
                        backgroundColor: "white",
                      }),
                    }}
                  />
                </FormGroup>
                {activeGroups.length === 0 && (
                  <div className="entry-form-validation-tooltip">
                    <div className="tooltip-content">
                      <div className="tooltip-arrow"></div>
                      <img src="/assets/warning_icon.svg" alt="no groups found error" />
                      <div className="tooltip-text" style={{ color: "#000" }}>
                        You have not created any groups. Please{" "}
                        <a href="/groups" style={{ color: "#1D70B8", textDecoration: "underline" }}>
                          create a group here first
                        </a>{" "}
                        and invite students to join. For guidance, see our{" "}
                        <a
                          href="https://isaaccomputerscience.org/support/teacher/assignments#create_group"
                          style={{ color: "#1D70B8", textDecoration: "underline" }}
                        >
                          FAQ for teachers
                        </a>
                        .
                      </div>
                    </div>
                  </div>
                )}
              </Col>
              <Col lg={6}>
                <FormGroup>
                  <Label className="entry-form-sub-title">
                    Select student(s) <span className="entry-form-asterisk">*</span>
                    <CustomTooltip
                      id="student-selection-tooltip"
                      message="Choose 1-4 students from the selected group who worked on the submitted project."
                    />
                    {memberSelectionError && (
                      <div
                        className="entry-form-validation-tooltip entry-form-validation-tooltip-centered mt-2"
                        style={{ alignItems: "center" }}
                      >
                        <div className="tooltip-content">
                          <img src="/assets/warning_icon.svg" alt="member selection error" />
                          <div className="tooltip-text" style={{ color: "#000" }}>
                            Limit of 4 students reached. To select a new student, remove one first.
                          </div>
                        </div>
                      </div>
                    )}
                  </Label>
                  <Select
                    inputId="group-members-select"
                    isMulti
                    required
                    isClearable
                    placeholder={getPlaceholderText()}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={
                      selectedGroup?.members
                        ? selectedGroup.members
                            .filter((member) => selectedMembers.includes(member.id?.toString() || ""))
                            .map((member) => ({
                              value: member.id?.toString() || "",
                              label:
                                `${member.givenName || ""} ${member.familyName || ""}`.trim() ||
                                `User ${member.id}` ||
                                "Unknown",
                            }))
                        : []
                    }
                    onChange={handleMemberSelection}
                    options={
                      selectedGroup?.members
                        ? selectedGroup.members.map((member) => ({
                            value: member.id?.toString() || "",
                            label:
                              `${member.givenName || ""} ${member.familyName || ""}`.trim() ||
                              `User ${member.id}` ||
                              "Unknown",
                          }))
                        : []
                    }
                    isDisabled={!selectedGroup || isLoadingMembers || !selectedGroup?.members?.length}
                    closeMenuOnSelect={false}
                    maxMenuHeight={200}
                    isLoading={isLoadingMembers}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        border: "1px solid #ced4da",
                        borderRadius: "0.375rem",
                        minHeight: "38px",
                        backgroundColor:
                          !selectedGroup || isLoadingMembers || !selectedGroup?.members?.length ? "#f8f9fa" : "white",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9998,
                      }),
                    }}
                  />
                  {showNoMembersWarning && (
                    <div className="entry-form-validation-tooltip" style={{ marginTop: "12px" }}>
                      <div className="tooltip-content">
                        <div className="tooltip-arrow"></div>
                        <img src="/assets/warning_icon.svg" alt="no members found error" />
                        <div className="tooltip-text" style={{ color: "#000" }}>
                          No students found in the selected group. To add students go to the{" "}
                          <a href="/groups" style={{ color: "#1D70B8", textDecoration: "underline" }}>
                            Manage groups page
                          </a>{" "}
                          and invite them using a URL or authentication code. For guidance, see our{" "}
                          <a
                            href="https://isaaccomputerscience.org/support/teacher/assignments#invite_students"
                            style={{ color: "#1D70B8", textDecoration: "underline" }}
                          >
                            FAQ for teachers
                          </a>
                          .
                        </div>
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center mt-4">
              <Col className="text-center">
                <Label>
                  By entering the National Computer Science Competition you agree to the{" "}
                  <a href="#terms-and-conditions" onClick={handleTermsClick} style={{ color: "#1D70B8" }}>
                    Terms and Conditions
                  </a>
                  .
                </Label>
              </Col>
            </Row>
            <Row className="entry-form-button-label justify-content-center mb-5 pt-3">
              <div className="col-md-6">
                <Input
                  className="btn btn-block btn-secondary border-0 form-control"
                  type="submit"
                  disabled={isSubmitDisabled}
                  value="Submit competition entry"
                />
              </div>
            </Row>
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default CompetitionEntryForm;
