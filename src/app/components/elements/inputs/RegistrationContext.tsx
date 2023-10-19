import React from "react";
import { BooleanNotation, DisplaySettings } from "../../../../IsaacAppTypes";
import {
  EMPTY_BOOLEAN_NOTATION_RECORD,
  EXAM_BOARD,
  examBoardBooleanNotationMap,
  getFilteredExamBoardOptions,
  getFilteredStageOptions,
  isDefined,
  STAGE,
  validateUserContexts,
} from "../../../services";
import { Col, FormFeedback, Label, Row, UncontrolledTooltip } from "reactstrap";
import { CustomInput, Input } from "reactstrap";
import { UserContext, UserRole } from "../../../../IsaacApiTypes";

interface UserContextRowProps {
  isStudent?: boolean;
  userContext: UserContext;
  setUserContext: (ucs: UserContext) => void;
  showNullStageOption: boolean;
  submissionAttempted: boolean;
  existingUserContexts: UserContext[];
  setBooleanNotation: (bn: BooleanNotation) => void;
  setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}
interface RegistrationContextProps {
  userContexts: UserContext[];
  setUserContexts: (ucs: UserContext[]) => void;
  setBooleanNotation: (bn: BooleanNotation) => void;
  displaySettings: Nullable<DisplaySettings>;
  setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
  submissionAttempted: boolean;
  userRole?: UserRole;
}

interface ShowOtherContentProps {
  displaySettings: Nullable<DisplaySettings>;
  setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
  isStudent?: boolean;
}

function UserContextRow({
  isStudent,
  userContext,
  setUserContext,
  showNullStageOption,
  submissionAttempted,
  existingUserContexts,
  setBooleanNotation,
  setDisplaySettings,
}: UserContextRowProps) {
  const onlyUCWithThisStage = existingUserContexts.filter((uc) => uc.stage === userContext.stage).length === 1;
  return (
    <>
      <Col xs={5} md={5} lg={5} className="pr-1 pl-0">
        {/* Stage Selector */}
        <Input
          className="form-control w-100 d-inline-block pl-1 pr-10"
          type="select"
          aria-label="Stage"
          value={userContext.stage || ""}
          invalid={submissionAttempted && !Object.values(STAGE).includes(userContext.stage as STAGE)}
          onChange={(e) => {
            const stage = e.target.value as STAGE;
            // Set exam board to something sensible (for CS)
            const onlyOneAtThisStage = existingUserContexts.filter((uc) => uc.stage === e.target.value).length === 1;
            const examBoard =
              getFilteredExamBoardOptions({
                byStages: [stage || STAGE.ALL],
                byUserContexts: existingUserContexts,
                includeNullOptions: onlyOneAtThisStage,
              })[0]?.value || EXAM_BOARD.ALL;
            setBooleanNotation({
              ...EMPTY_BOOLEAN_NOTATION_RECORD,
              [examBoardBooleanNotationMap[examBoard]]: true,
            });

            // Set display settings default values
            setDisplaySettings((oldDs) => ({
              ...oldDs,
              HIDE_NON_AUDIENCE_CONTENT: true,
            }));
            setUserContext({ ...userContext, stage, examBoard });
          }}
        >
          <option value="" disabled hidden>
            Qualification
          </option>
          {getFilteredStageOptions({
            byUserContexts: existingUserContexts.filter(
              (uc) => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard),
            ),
            includeNullOptions: showNullStageOption,
            hideFurtherA: true,
            byRole: isStudent ? true : undefined,
          }).map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Input>
      </Col>
      <Col xs={5} md={5} lg={5} className="pl-1">
        {/* Exam Board Selector */}
        <Input
          className="form-control w-100 d-inline-block pl-1 pr-10 ml-2"
          type="select"
          aria-label="Exam Board"
          value={userContext.examBoard || ""}
          invalid={submissionAttempted && !Object.values(EXAM_BOARD).includes(userContext.examBoard as EXAM_BOARD)}
          onChange={(e) => {
            setUserContext({
              ...userContext,
              examBoard: e.target.value as EXAM_BOARD,
            });
            if (e.target.value) {
              setBooleanNotation({
                ...EMPTY_BOOLEAN_NOTATION_RECORD,
                [examBoardBooleanNotationMap[e.target.value as EXAM_BOARD]]: true,
              });
            }
          }}
        >
          <option value="" disabled hidden>
            Exam Board
          </option>
          {getFilteredExamBoardOptions({
            byStages: [(userContext.stage as STAGE) || STAGE.ALL],
            includeNullOptions: onlyUCWithThisStage,
            byUserContexts: existingUserContexts.filter(
              (uc) => !(uc.stage === userContext.stage && uc.examBoard === userContext.examBoard),
            ),
          }).map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Input>
      </Col>
    </>
  );
}

const ShowOtherContent = ({ displaySettings, setDisplaySettings, isStudent }: ShowOtherContentProps) => {
  return (
    <Label className={`m-0 pt-3 ${isStudent ? "pt-md-1" : ""}`}>
      <CustomInput
        type="checkbox"
        id={`hide-content-check`}
        className="d-inline-block larger-checkbox"
        checked={
          isDefined(displaySettings?.HIDE_NON_AUDIENCE_CONTENT) ? !displaySettings?.HIDE_NON_AUDIENCE_CONTENT : true
        }
        onChange={(e) =>
          setDisplaySettings((oldDs) => ({
            ...oldDs,
            HIDE_NON_AUDIENCE_CONTENT: !e.target.checked,
          }))
        }
      />{" "}
      <span>
        Show other content that is not for my selected exam board.{" "}
        <span id={`show-other-content`} className="icon-help ml-1" />
      </span>
      <UncontrolledTooltip placement="bottom" target={`show-other-content`}>
        {isStudent
          ? "If you select this box, additional content that is not intended for your chosen stage and examination board will be shown (e.g. you will also see A level content if you are studying GCSE)."
          : "If you select this box, additional content that is not intended for your chosen stage and examination board will be shown (e.g. you will also see A level content in your GCSE view)."}
      </UncontrolledTooltip>
    </Label>
  );
};

const TeacherContext = ({
  userContexts,
  setUserContexts,
  displaySettings,
  setDisplaySettings,
  setBooleanNotation,
  submissionAttempted,
}: RegistrationContextProps) => {
  return (
    <>
      <Label htmlFor="user-context-selector" className="mb-0">
        <span>I am teaching</span>
      </Label>
      <React.Fragment>
        <span id={`show-me-content`} className="icon-help" />
        <UncontrolledTooltip placement={"left-start"} target={`show-me-content`}>
          Add a stage and examination board for each qualification you are teaching.
          <br />
          On content pages, this will allow you to quickly switch between your personalised views of the content,
          depending on which class you are currently teaching.
        </UncontrolledTooltip>
      </React.Fragment>
      {userContexts.map((userContext, index) => {
        const showPlusOption =
          index === userContexts.length - 1 &&
          // at least one exam board for the potential stage
          getFilteredStageOptions({
            byUserContexts: userContexts,
            hideFurtherA: true,
          }).length > 0 &&
          userContexts.findIndex((p) => p.stage === STAGE.ALL && p.examBoard === EXAM_BOARD.ALL) === -1;

        return (
          <React.Fragment key={index}>
            <Row className="mx-0 mt-2">
              <UserContextRow
                userContext={userContext}
                showNullStageOption={userContexts.length <= 1}
                submissionAttempted={submissionAttempted}
                setUserContext={(newUc) => setUserContexts(userContexts.map((uc, i) => (i === index ? newUc : uc)))}
                existingUserContexts={userContexts}
                setBooleanNotation={setBooleanNotation}
                setDisplaySettings={setDisplaySettings}
              />

              {userContexts.length > 1 && (
                <button
                  type="button"
                  className="mx-2 close float-none align-middle"
                  aria-label="clear stage row"
                  onClick={() => setUserContexts(userContexts.filter((uc, i) => i !== index))}
                >
                  ×
                </button>
              )}
            </Row>
            {showPlusOption && (
              <Row className="mt-3 ml-0">
                <Label className="vertical-center" for="context-add-stage">
                  <button
                    id="context-add-stage"
                    type="button"
                    aria-label="Add stage"
                    className="align-middle close float-none pointer-cursor"
                    onClick={() => setUserContexts([...userContexts, {}])}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      className="bi bi-plus-circle"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                  </button>
                  <span className="ml-2 mt-1 pointer-cursor">Add another stage</span>
                </Label>
              </Row>
            )}

            {index === userContexts.length - 1 &&
              userContexts.findIndex((p) => p.stage === STAGE.ALL && p.examBoard === EXAM_BOARD.ALL) === -1 && (
                <ShowOtherContent displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
              )}

            {submissionAttempted && !validateUserContexts(userContexts) && (
              <FormFeedback id="user-context-feedback" className="always-show">
                Please select an option.
              </FormFeedback>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const StudentContext = ({
  userContexts,
  setUserContexts,
  displaySettings,
  setDisplaySettings,
  setBooleanNotation,
  submissionAttempted,
}: RegistrationContextProps) => {
  return (
    <>
      <Label htmlFor="user-context-selector">
        <span>I am studying</span>
      </Label>
      <React.Fragment>
        <span id={`show-me-content`} className="icon-help" />
        <UncontrolledTooltip placement={"left-start"} target={`show-me-content`}>
          Select a stage and examination board here to filter the content so that you will only see material that is
          relevant for the qualification you have chosen.
        </UncontrolledTooltip>
      </React.Fragment>
      {userContexts.map((userContext, index) => {
        return (
          <Row key={index} className="mx-0 mt-2">
            <Col md={6} className="p-0">
              <Row className="m-0">
                <UserContextRow
                  isStudent={true}
                  userContext={userContext}
                  showNullStageOption={userContexts.length <= 1}
                  submissionAttempted={submissionAttempted}
                  setUserContext={(newUc) => setUserContexts(userContexts.map((uc, i) => (i === index ? newUc : uc)))}
                  existingUserContexts={userContexts}
                  setBooleanNotation={setBooleanNotation}
                  setDisplaySettings={setDisplaySettings}
                />
              </Row>
            </Col>

            <Col md={6} className="px-0 px-md-3">
              {index === userContexts.length - 1 &&
                userContexts.findIndex((p) => p.stage === STAGE.ALL && p.examBoard === EXAM_BOARD.ALL) === -1 && (
                  <ShowOtherContent
                    displaySettings={displaySettings}
                    setDisplaySettings={setDisplaySettings}
                    isStudent={true}
                  />
                )}
            </Col>

            {submissionAttempted && !validateUserContexts(userContexts) && (
              <FormFeedback id="user-context-feedback" className="always-show">
                Please select an option.
              </FormFeedback>
            )}
          </Row>
        );
      })}
    </>
  );
};

export const RegistrationContext = ({ userRole, ...otherProps }: RegistrationContextProps) => {
  return userRole === "STUDENT" ? <StudentContext {...otherProps} /> : <TeacherContext {...otherProps} />;
};
