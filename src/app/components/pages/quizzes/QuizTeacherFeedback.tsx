import React, { useEffect, useState } from "react";
import {
  loadQuizAssignmentFeedback,
  selectors,
  showToast,
  updateQuizAssignmentDueDate,
  updateQuizAssignmentFeedbackMode,
  useAppDispatch,
  useAppSelector,
} from "../../../state";
import { useParams } from "react-router-dom";
import { ShowLoading } from "../../handlers/ShowLoading";
import { TitleAndBreadcrumb } from "../../elements/TitleAndBreadcrumb";
import { QuizFeedbackMode, RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { AssignmentProgressLegend } from "../AssignmentProgress";
import {
  extractTeacherName,
  getQuizAssignmentCSVDownloadLink,
  isDefined,
  useAssignmentProgressAccessibilitySettings,
} from "../../../services";
import { AssignmentProgressPageSettingsContext, QuizFeedbackModes } from "../../../../IsaacAppTypes";
import { teacherQuizzesCrumbs } from "../../elements/quiz/QuizAttemptComponent";
import { formatDate } from "../../elements/DateString";
import { Spacer } from "../../elements/Spacer";
import { IsaacSpinner } from "../../handlers/IsaacSpinner";
import { currentYear, DateInput } from "../../elements/inputs/DateInput";
import { range } from "lodash";
import { ResultsTable } from "../../elements/quiz/QuizProgressCommon";
import {
  Alert,
  Button,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

const pageHelp = <span>See the feedback for your students for this test assignment.</span>;

const feedbackNames: Record<QuizFeedbackMode, string> = {
  NONE: "No feedback for students",
  OVERALL_MARK: "Overall mark only",
  SECTION_MARKS: "Section-by-section mark breakdown",
  DETAILED_FEEDBACK: "Detailed feedback on each question",
};

export const QuizTeacherFeedback = ({ user }: { user: RegisteredUserDTO }) => {
  const { quizAssignmentId } = useParams<{ quizAssignmentId: string }>();
  const pageSettings = useAssignmentProgressAccessibilitySettings({ user });
  const assignmentState = useAppSelector(selectors.quizzes.assignment);

  const dispatch = useAppDispatch();

  const numericQuizAssignmentId = parseInt(quizAssignmentId, 10);
  useEffect(() => {
    dispatch(loadQuizAssignmentFeedback(numericQuizAssignmentId));
  }, [dispatch, numericQuizAssignmentId]);

  const [settingFeedbackMode, setSettingFeedbackMode] = useState(false);
  const setFeedbackMode = async (mode: QuizFeedbackMode) => {
    if (mode === assignment?.quizFeedbackMode) {
      return;
    }
    try {
      setSettingFeedbackMode(true);
      await dispatch(updateQuizAssignmentFeedbackMode(numericQuizAssignmentId, mode));
    } finally {
      setSettingFeedbackMode(false);
    }
  };

  const assignment = assignmentState && "assignment" in assignmentState ? assignmentState.assignment : null;
  const error = assignmentState && "error" in assignmentState ? assignmentState.error : null;
  const quizTitle = (assignment?.quiz?.title || assignment?.quiz?.id || "Test") + " results";

  // Date input variables
  const yearRange = range(currentYear, currentYear + 5);

  const [settingDueDate, setSettingDueDate] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState<EpochTimeStamp | null>(null);

  useEffect(() => {
    setDueDate(assignment?.dueDate ?? null);
  }, [assignment?.dueDate]);

  const setValidDueDate = async (newDate: EpochTimeStamp | null) => {
    if (settingDueDate || !newDate || assignment?.dueDate == newDate) {
      return;
    }
    if (assignment?.dueDate && newDate > assignment.dueDate) {
      try {
        setSettingDueDate(true);
        if (
          confirm(
            "Are you sure you want to change the due date? This will extend the due date for all users this test is assigned to.",
          )
        ) {
          dispatch(updateQuizAssignmentDueDate(numericQuizAssignmentId, newDate)).then((succeeded) => {
            if (succeeded) {
              dispatch(
                showToast({
                  color: "success",
                  title: "Due date extended successfully",
                  body: `This test is now due ${new Date(newDate).toLocaleDateString()}.`,
                  timeout: 5000,
                }),
              );
            }
          });
        } else {
          setDueDate(assignment.dueDate);
        }
      } finally {
        setSettingDueDate(false);
      }
    }
  };

  return (
    <Container>
      <ShowLoading until={assignmentState}>
        {assignment && (
          <>
            <TitleAndBreadcrumb
              currentPageTitle={quizTitle}
              help={pageHelp}
              intermediateCrumbs={teacherQuizzesCrumbs}
            />
            <p className="d-flex">
              <span>
                Set by: {extractTeacherName(assignment.assignerSummary ?? null)} on{" "}
                {formatDate(assignment.creationDate)}
              </span>
              {isDefined(assignment.dueDate) && (
                <>
                  <Spacer />
                  Due: {formatDate(assignment.dueDate)}
                </>
              )}
            </p>
            <Row>
              {assignment.dueDate && (
                <Col xs={12} sm={6} md={4}>
                  <Label for="dueDate" className="pr-1">
                    Extend the due date:
                    <DateInput
                      id="dueDate"
                      value={dueDate ?? undefined}
                      invalid={dueDate ? dueDate < assignment.dueDate : undefined}
                      yearRange={yearRange}
                      noClear
                      onChange={(e) => e.target.value && setDueDate(parseInt(e.target.value, 10))}
                    />
                  </Label>
                  <div className={"mt-2 w-100 text-center mb-2"}>
                    {dueDate && dueDate > assignment.dueDate && (
                      <Button color="primary" outline className={"btn-md"} onClick={() => setValidDueDate(dueDate)}>
                        {settingDueDate ? (
                          <>
                            Saving <IsaacSpinner size="sm" className="quizFeedbackModeSpinner" />
                          </>
                        ) : (
                          "Extend due date"
                        )}
                      </Button>
                    )}
                  </div>
                </Col>
              )}
              <Col>
                <Label for="feedbackMode" className="pr-1">
                  Student feedback mode:
                </Label>
                <br />
                <UncontrolledDropdown className="d-inline-block">
                  <DropdownToggle
                    color="dark"
                    outline
                    className={"px-3 text-nowrap"}
                    caret={!settingFeedbackMode}
                    id="feedbackMode"
                    disabled={settingFeedbackMode}
                  >
                    {settingFeedbackMode ? (
                      <>
                        Saving <IsaacSpinner size="sm" className="quizFeedbackModeSpinner" />
                      </>
                    ) : (
                      feedbackNames[assignment.quizFeedbackMode as QuizFeedbackMode]
                    )}
                  </DropdownToggle>
                  <DropdownMenu>
                    {QuizFeedbackModes.map((mode) => (
                      <DropdownItem
                        key={mode}
                        onClick={() => setFeedbackMode(mode)}
                        active={mode === assignment?.quizFeedbackMode}
                      >
                        {feedbackNames[mode]}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Col>
              <Col sm={12} md={"auto"} className={"text-right mt-2 mt-md-0"}>
                <Button
                  color="primary"
                  outline
                  className="btn-md mt-1 text-nowrap"
                  href={getQuizAssignmentCSVDownloadLink(assignment.id as number)}
                  target="_blank"
                >
                  Export as CSV
                </Button>
              </Col>
            </Row>
            <div
              className={`assignment-progress-details bg-transparent ${
                pageSettings.colourBlind ? " colour-blind" : ""
              }`}
            >
              <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                <AssignmentProgressLegend showQuestionKey />
                <ResultsTable assignment={assignment} />
              </AssignmentProgressPageSettingsContext.Provider>
            </div>
          </>
        )}
        {error && (
          <>
            <TitleAndBreadcrumb
              currentPageTitle={quizTitle}
              help={pageHelp}
              intermediateCrumbs={teacherQuizzesCrumbs}
            />
            <Alert color="danger">
              <h4 className="alert-heading">Error loading test feedback</h4>
              <p>{error}</p>
            </Alert>
          </>
        )}
      </ShowLoading>
    </Container>
  );
};
