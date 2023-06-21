import {
    IsaacQuizDTO,
    IsaacQuizSectionDTO,
    QuestionDTO,
    QuizAttemptDTO,
    RegisteredUserDTO,
    UserSummaryDTO
} from "../../../../IsaacApiTypes";
import React from "react";
import {
    below,
    extractTeacherName,
    isAda,
    isDefined,
    isTeacherOrAbove,
    QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP,
    siteSpecific,
    useDeviceSize
} from "../../../services";
import {Spacer} from "../Spacer";
import {formatDate} from "../DateString";
import {Link} from "react-router-dom";
import {QuizAttemptContext} from "../../../../IsaacAppTypes";
import {WithFigureNumbering} from "../WithFigureNumbering";
import {IsaacContent} from "../../content/IsaacContent";
import {Alert, Button, Col, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../TitleAndBreadcrumb";
import {closeActiveModal, openActiveModal, showQuizSettingModal, useAppDispatch,} from "../../../state";
import {IsaacContentValueOrChildren} from "../../content/IsaacContentValueOrChildren";
import {EditContentButton} from "../EditContentButton";
import {Markup} from "../markup";
import classNames from "classnames";

type PageLinkCreator = (page?: number) => string;

export interface QuizAttemptProps {
    attempt: QuizAttemptDTO;
    user: RegisteredUserDTO;
    page: number | null;
    questions: QuestionDTO[];
    sections: { [id: string]: IsaacQuizSectionDTO };
    pageLink: PageLinkCreator;
    pageHelp: React.ReactElement;
    preview?: boolean;
    studentUser?: UserSummaryDTO;
    quizAssignmentId?: string;
}

function inSection(section: IsaacQuizSectionDTO, questions: QuestionDTO[]) {
    return questions.filter(q => q.id?.startsWith(section.id as string + "|"));
}

function QuizContents({attempt, sections, questions, pageLink}: QuizAttemptProps) {
    if (isDefined(attempt.completedDate)) {
        return attempt.feedbackMode === "NONE" ?
            <h4>No feedback available</h4>
            : attempt.feedbackMode === "OVERALL_MARK" ?
                <h4>Your mark is {attempt.quiz?.individualFeedback?.overallMark?.correct} / {attempt.quiz?.total}</h4>
                :
                <table className="quiz-marks-table">
                    <tbody>
                    <tr>
                        <th>Overall mark</th>
                        <td>{attempt.quiz?.individualFeedback?.overallMark?.correct} / {attempt.quiz?.total}</td>
                    </tr>
                    <tr>
                        <th colSpan={2}>Section mark breakdown</th>
                    </tr>
                    {Object.keys(sections).map((k, index) => {
                        const section = sections[k];
                        return <tr key={k}>
                            {attempt.feedbackMode === 'DETAILED_FEEDBACK' ?
                                <td><Link replace to={pageLink(index + 1)}>{section.title}</Link></td> :
                                <td>{section.title}</td>
                            }
                            <td>
                                {attempt.quiz?.individualFeedback?.sectionMarks?.[section.id as string]?.correct}
                                {" / "}
                                {attempt.quiz?.sectionTotals?.[section.id as string]}
                            </td>
                        </tr>;
                    })}
                    </tbody>
                </table>;
    } else {
        const anyStarted = questions.some(q => q.bestAttempt !== undefined);
        return <div>
            <h4>Test sections</h4>
            <ul>
                {Object.keys(sections).map((k, index) => {
                    const section = sections[k];
                    const questionsInSection = inSection(section, questions);
                    const answerCount = questionsInSection.filter(q => q.bestAttempt !== undefined).length;
                    const completed = questionsInSection.length === answerCount;
                    return <li key={k}>
                        <Link replace to={pageLink(index + 1)}>{section.title}</Link>
                        {" "}
                        <small className="text-muted">{completed ? "Completed" : anyStarted ? `${answerCount} / ${questionsInSection.length}` : ""}</small>
                    </li>;
                })}
            </ul>
        </div>;
    }
}

function QuizHeader({attempt, preview, user}: QuizAttemptProps) {
    const dispatch = useAppDispatch();
    const assignment = attempt.quizAssignment;
    if (preview) {
        return <>
            <EditContentButton doc={attempt.quiz} />
            <div className="d-flex">
                <span>You are previewing this test.</span>
                <Spacer />
                {isTeacherOrAbove(user) && <Button onClick={() => dispatch(showQuizSettingModal(attempt.quiz as IsaacQuizDTO))}>Set Test</Button>}
            </div>
        </>;
    } else if (isDefined(assignment)) {
        return <>
            <p className="d-flex">
                <span>
                    Set by: {extractTeacherName(assignment.assignerSummary ?? null)}
                    {isDefined(attempt.completedDate) && <><br />Completed:&nbsp;{formatDate(attempt.completedDate)}</>}
                </span>
                {isDefined(assignment.dueDate) && <><Spacer/>{isDefined(attempt.completedDate) ? "Was due:" : "Due:"}&nbsp;{formatDate(assignment.dueDate)}</>}
            </p>
            {assignment?.creationDate && assignment?.creationDate.valueOf() > QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP && <Alert color="info">
                Please be aware that for tests your answer to each question <b>will be visible to your teacher(s) after
                you submit your test</b> so that they can provide further feedback and support if they wish to do so.
                <br />
                Assignments are different. We do not share with your teachers any of your entered answers or the
                number of your attempts to questions in assignments.
            </Alert>}
        </>;
    } else {
        return <p>You {attempt.completedDate ? "freely attempted" : "are freely attempting"} this test.</p>
    }
}

function QuizRubric({attempt}: {attempt: QuizAttemptDTO}) {
    const rubric = attempt.quiz?.rubric;
    const renderRubric = (rubric?.children || []).length > 0;
    return <div>
        {rubric && renderRubric && <div>
            <h4>Instructions</h4>
            <IsaacContentValueOrChildren value={rubric.value}>
            {rubric.children}
        </IsaacContentValueOrChildren>
        </div>}
    </div>
}

function QuizSection({attempt, page, studentUser, user, quizAssignmentId}: QuizAttemptProps & {page: number}) {
    const sections = attempt.quiz?.children;
    const section = sections && sections[page - 1];
    const rubric = attempt.quiz?.rubric;
    const attribution = attempt.quiz?.attribution;
    const renderRubric = (rubric?.children || []).length > 0;
    const dispatch = useAppDispatch();

    const openQuestionModal = (attempt: QuizAttemptDTO) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())}, size: "lg",
            title: "Test Instructions", body: <QuizRubric attempt={attempt} />
        }))
    };

    const viewingAsSomeoneElse = isDefined(studentUser) && studentUser?.id !== user?.id;

    return section ?
        <Row className="question-content-container">
            <Col className={classNames("py-4 question-panel", {"mw-760": isAda})}>
                {viewingAsSomeoneElse && <div className="mb-2">
                    You are viewing this test as <b>{studentUser?.givenName} {studentUser?.familyName}</b>.{quizAssignmentId && <> <Link to={`/test/assignment/${quizAssignmentId}/feedback`}>Click here</Link> to return to the teacher test feedback page.</>}
                </div>}
                <Row>
                    {rubric && renderRubric && <Col className="text-right">
                        <Button color="tertiary" outline className="mb-4 bg-light"
                            alt="Show instructions" title="Show instructions in a modal"
                            onClick={() => {rubric && openQuestionModal(attempt)}}>
                            Show instructions
                        </Button>
                    </Col>}
                </Row>

                <WithFigureNumbering doc={section}>
                    <IsaacContent doc={section}/>
                </WithFigureNumbering>

                {attribution && <p className="text-muted">
                    <Markup trusted-markup-encoding={"markdown"}>
                        {attribution}
                    </Markup>
                </p>}
            </Col>
        </Row>
    :
        <Alert color="danger">Test section {page} not found</Alert>
    ;
}

export const myQuizzesCrumbs = [{title: siteSpecific("My Tests", "My tests"), to: `/tests`}];
export const teacherQuizzesCrumbs = [{title: siteSpecific("Set Tests", "Set tests"), to: `/set_tests`}];
const QuizTitle = ({attempt, page, pageLink, pageHelp, preview, studentUser, user}: QuizAttemptProps) => {
    let quizTitle = attempt.quiz?.title || attempt.quiz?.id || "Test";
    if (isDefined(attempt.completedDate)) {
        quizTitle += " Feedback";
    }
    if (isDefined(studentUser)) {
        quizTitle += ` for ${studentUser.givenName} ${studentUser.familyName}`
    }
    if (preview) {
        quizTitle += " Preview";
    }
    const crumbs = preview && isTeacherOrAbove(user) ? teacherQuizzesCrumbs : myQuizzesCrumbs;
    if (page === null) {
        return <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp}
                                   intermediateCrumbs={crumbs}/>;
    } else {
        const sections = attempt.quiz?.children;
        const section = sections && sections[page - 1] as IsaacQuizSectionDTO;
        const sectionTitle = section?.title ?? "Section " + page;
        return <TitleAndBreadcrumb currentPageTitle={sectionTitle} help={pageHelp}
                                   intermediateCrumbs={[...crumbs, {title: quizTitle, replace: true, to: pageLink()}]}/>;
    }
};

interface QuizPaginationProps {
    page: number;
    finalLabel: string;
}

export function QuizPagination({page, sections, pageLink, finalLabel}: QuizAttemptProps & QuizPaginationProps) {
    const deviceSize = useDeviceSize();
    const sectionCount = Object.keys(sections).length;
    const backLink = pageLink(page > 1 ? page - 1 : undefined);
    const finalSection = page === sectionCount;
    const nextLink = pageLink(!finalSection ? page + 1 : undefined);

    return <div className="d-flex w-100 justify-content-between align-items-center">
        <Button color="primary" outline size={below["sm"](deviceSize) ? "sm" : ""} tag={Link} replace to={backLink}>Back</Button>
        <div className="d-none d-md-block">Section {page} / {sectionCount}</div>
        <Button color="secondary" size={below["sm"](deviceSize) ? "sm" : ""} tag={Link} replace to={nextLink}>{finalSection ? finalLabel : "Next"}</Button>
    </div>;
}

export function QuizAttemptComponent(props: QuizAttemptProps) {
    const {page, questions, studentUser, user, quizAssignmentId} = props;
    // Assumes that ids of questions are defined - I don't know why this is not enforced in the editor/backend, because
    // we do unchecked casts of "possibly undefined" content ids to strings almost everywhere
    const questionNumbers = Object.assign({}, ...questions.map((q, i) => ({[q.id as string]: i + 1})));
    const viewingAsSomeoneElse = isDefined(studentUser) && studentUser?.id !== user?.id;
    return <QuizAttemptContext.Provider value={{quizAttempt: props.attempt, questionNumbers}}>
        <QuizTitle {...props} />
        {page === null ?
            <div className="mt-4">
                {!isDefined(studentUser?.id) && <QuizHeader {...props} />}
                {viewingAsSomeoneElse && <div className="mb-2">
                    You are viewing this test as <b>{studentUser?.givenName} {studentUser?.familyName}</b>.{quizAssignmentId && <> <Link to={`/test/assignment/${quizAssignmentId}/feedback`}>Click here</Link> to return to the teacher test feedback page.</>}
                </div>}
                <QuizRubric {...props}/>
                <QuizContents {...props} />
            </div>
            :
            <QuizSection {...props} page={page}/>
        }
    </QuizAttemptContext.Provider>;
}
