import {
    ContentDTO,
    DetailedQuizSummaryDTO,
    IsaacQuizDTO,
    IsaacQuizSectionDTO,
    QuestionDTO,
    QuizAttemptDTO,
    RegisteredUserDTO,
    UserSummaryDTO
} from "../../../../IsaacApiTypes";
import React from "react";
import {
    above,
    below,
    extractTeacherName,
    isAda,
    isDefined,
    isPhy,
    isTeacherOrAbove,
    QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP,
    siteSpecific,
    SUBJECTS,
    TAG_ID,
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
import {closeActiveModal, openActiveModal, useAppDispatch,} from "../../../state";
import {IsaacContentValueOrChildren} from "../../content/IsaacContentValueOrChildren";
import {EditContentButton} from "../EditContentButton";
import {Markup} from "../markup";
import classNames from "classnames";
import { MainContent, SidebarLayout } from "../layout/SidebarLayout";
import { SetQuizzesModal } from "../modals/SetQuizzesModal";
import { QuizSidebar, QuizSidebarProps } from "../sidebar/QuizSidebar";

export type QuizView = { quiz?: DetailedQuizSummaryDTO & { subjectId?: SUBJECTS | TAG_ID }, quizId: string | undefined };

type QuizContents = {
    questions: QuestionDTO[];
    sections: { [id: string]: IsaacQuizSectionDTO };
    pageLink: (page?: number) => string;
};

export type FullQuizInfo = {
    quiz: IsaacQuizDTO;
    attempt: QuizAttemptDTO;
    quizContents: QuizContents;
};

export type QuizSummaryInfo = {
    quiz: DetailedQuizSummaryDTO;
}

export type QuizProps = {
    user: RegisteredUserDTO;
    pageHelp: React.ReactElement;
    studentUser?: UserSummaryDTO;
    quizAssignmentId?: string;
    preview?: boolean;
    page?: number;
} & (FullQuizInfo | QuizSummaryInfo);

const isFullQuiz = (quiz: IsaacQuizDTO | DetailedQuizSummaryDTO): quiz is IsaacQuizDTO => isDefined((quiz as IsaacQuizDTO).defaultFeedbackMode);


function inSection(section: IsaacQuizSectionDTO, questions: QuestionDTO[]) {
    return questions.filter(q => q.id?.startsWith(section.id as string + "|"));
}

function QuizDetails({quizContents: {sections, questions, pageLink}, attempt}: FullQuizInfo) {
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
                                    <td><Link to={pageLink(index + 1)}>{section.title}</Link></td> :
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
            <h4>Test section(s)</h4>
            <ul>
                {Object.keys(sections).map((k, index) => {
                    const section = sections[k];
                    const questionsInSection = inSection(section, questions);
                    const answerCount = questionsInSection.filter(q => q.bestAttempt !== undefined).length;
                    const completed = questionsInSection.length === answerCount;
                    return <li key={k}>
                        <Link to={pageLink(index + 1)}>{section.title}</Link>
                        {" "}
                        <small className="text-muted">{completed ? "Completed" : anyStarted ? `${answerCount} / ${questionsInSection.length}` : ""}</small>
                    </li>;
                })}
            </ul>
        </div>;
    }
}

function QuizHeader(quizProps: QuizProps & FullQuizInfo) {
    const {quiz, attempt, preview, user} = quizProps;
    const dispatch = useAppDispatch();

    if (preview) {
        return <>
            <EditContentButton doc={quiz} />
            <div data-testid="quiz-action" className="d-flex">
                <p>You are previewing this test.</p>
                <Spacer />
                {isTeacherOrAbove(user) && <Button onClick={() => dispatch(openActiveModal(SetQuizzesModal({quiz})))}>Set test</Button>}
            </div>
        </>;
    } else if (isDefined(attempt.quizAssignment)) {
        const assignment = attempt.quizAssignment;
        return <>
            <p className="d-flex">
                <span>
                    Set by: {extractTeacherName(assignment.assignerSummary ?? null)}
                    {isDefined(attempt.completedDate) && <><br />Completed:&nbsp;{formatDate(attempt.completedDate)}</>}
                </span>
                {isDefined(assignment.dueDate) && <><Spacer/>{isDefined(attempt.completedDate) ? "Was due:" : "Due:"}&nbsp;{formatDate(assignment.dueDate)}</>}
            </p>
            {assignment?.creationDate && assignment?.creationDate.valueOf() > QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP && !isDefined(attempt.completedDate) && <Alert color={siteSpecific("info", "warning")}>
                {siteSpecific(<>
                    Please be aware that for tests your answer to each question <b>will be visible to your teacher(s) after
                    you submit your test</b> so that they can provide further feedback and support if they wish to do so.
                    <br />
                    Assignments are different. We do not share with your teachers any of your entered answers or the
                    number of your attempts to questions in assignments.
                </>, <>
                    Please be aware that your answer to each test question will be visible to your teacher(s) after you submit your test.
                    This is to allow them to provide further feedback and support.
                </>)}
            </Alert>}
        </>;
    } else {
        return <p data-testid="quiz-action">You {attempt.completedDate ? "freely attempted" : "are freely attempting"} this test.</p>;
    }
}

function QuizRubric({rubric}: {rubric?: ContentDTO}) {
    const renderRubric = (rubric?.children || []).length > 0;
    return rubric && renderRubric && <div data-testid="quiz-rubric">
        <IsaacContentValueOrChildren value={rubric.value}>
            {rubric.children}
        </IsaacContentValueOrChildren>
    </div>;
}

export function QuizRubricButton({rubric}: {rubric?: ContentDTO}) {
    const dispatch = useAppDispatch();

    const openQuestionModal = () => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());}, size: "lg",
            title: "Test Instructions", body: <QuizRubric rubric={rubric} />
        }));
    };

    if (rubric) {
        return <Button color={siteSpecific("keyline", "tertiary")} outline={isAda} className={siteSpecific("btn-lg text-nowrap", "mb-4 bg-light")}
            title="Show instructions in a modal" onClick={openQuestionModal}
        >
            Show instructions
        </Button>;
    }
}

function QuizSection(quizProps: QuizProps & FullQuizInfo) {
    const {attempt, page, studentUser, user, quizAssignmentId} = quizProps;
    const deviceSize = useDeviceSize();
    const sections = attempt.quiz?.children;
    const section = !!(page && sections) && sections[page - 1];
    const attribution = attempt.quiz?.attribution;
    const viewingAsSomeoneElse = isDefined(studentUser) && studentUser?.id !== user?.id;

    return section ?
        <Row className="question-content-container">
            <Col className={classNames("py-4 question-panel", {"mw-760": isAda})}>
                {viewingAsSomeoneElse && <div className="mb-2">
                    You are viewing this test as <b>{studentUser?.givenName} {studentUser?.familyName}</b>.{quizAssignmentId && <> <Link to={`/test/assignment/${quizAssignmentId}/feedback`}>Click here</Link> to return to the teacher test feedback page.</>}
                </div>}
                <Row>
                    <Col className="d-flex flex-column align-items-end">
                        {(isAda || above["lg"](deviceSize)) && <div className="mb-3">
                            <QuizRubricButton rubric={attempt.quiz?.rubric} />
                        </div>}
                    </Col>
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

export const myQuizzesCrumbs = [{title: siteSpecific("My tests", "Tests"), to: `/tests`}];
export const teacherQuizzesCrumbs = [{title: siteSpecific("Set / manage tests", "Tests"), to: `/set_tests`}];
export const rubricCrumbs = [{title: "Practice tests", to: "/practice_tests"}];
export const viewQuizzesCrumbs = [{title: "View tests", to: "/view_tests"}];
const getCrumbs = (preview: boolean | undefined, user: RegisteredUserDTO) => {
    if (preview && isTeacherOrAbove(user)) {
        return teacherQuizzesCrumbs;
    }
    return viewQuizzesCrumbs;
    // TODO
    return myQuizzesCrumbs;
};

const generateQuizTitle = (quiz: IsaacQuizDTO | DetailedQuizSummaryDTO | undefined, preview: boolean | undefined, attempt: QuizAttemptDTO | undefined, studentUser: RegisteredUserDTO | undefined) => {
    let quizTitle = quiz?.title || quiz?.id || "Test";
    if (preview) {
        return `${quizTitle} Preview`;
    }

    if (isDefined(attempt?.completedDate)) {
        quizTitle += " Feedback";
    }
    if (isDefined(studentUser)) {
        quizTitle += ` for ${studentUser.givenName} ${studentUser.familyName}`;
    }

    return quizTitle;
}

const QuizTitle = (quizProps: QuizProps) => {
    const {page, pageHelp, preview, studentUser, user, quiz} = quizProps;

    const crumbs = getCrumbs(preview, user);
    if (page === null || page === undefined || !isFullQuiz(quiz)) {
        const quizTitle = generateQuizTitle(quiz, preview, undefined, studentUser);
        return <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp}
            intermediateCrumbs={crumbs} icon={{"type": "icon", "icon": "icon-tests"}}
        />;
    } else {
        const {attempt, quizContents: {pageLink}} = quizProps as QuizProps & FullQuizInfo;
        const quizTitle = generateQuizTitle(quiz, preview, attempt, studentUser);

        const sections = attempt.quiz?.children;
        const section = sections && sections[page - 1] as IsaacQuizSectionDTO;
        const sectionTitle = section?.title ?? "Section " + page;
        return <TitleAndBreadcrumb currentPageTitle={sectionTitle} help={pageHelp}
            intermediateCrumbs={[...crumbs, {title: quizTitle, replace: true, to: pageLink()}]}
            icon={{"type": "icon", "icon": "icon-tests"}}
        />;
    }
};

interface QuizPaginationProps {
    finalLabel: string;
}

export function QuizPagination({page, quizContents: {sections, pageLink}, finalLabel}: QuizProps & FullQuizInfo & QuizPaginationProps) {
    const deviceSize = useDeviceSize();
    if (!page) return;
    
    const sectionCount = Object.keys(sections).length;
    const backLink = pageLink(page > 1 ? page - 1 : undefined);
    const finalSection = page === sectionCount;
    const nextLink = pageLink(!finalSection ? page + 1 : undefined);

    return <div className="d-flex w-100 justify-content-between align-items-center">
        <Button color="keyline" size={below["sm"](deviceSize) ? "sm" : ""} tag={Link} to={backLink}>Back</Button>
        <div className="d-none d-md-block">Section {page} / {sectionCount}</div>
        <Button color="secondary" size={below["sm"](deviceSize) ? "sm" : ""} tag={Link} to={nextLink}>{finalSection ? finalLabel : "Next"}</Button>
    </div>;
}

export enum SectionProgress {
    NOT_STARTED = "Not started",
    STARTED = "Started",
    COMPLETED = "Completed"
}

function QuizOverview(props: QuizProps & { viewingAsSomeoneElse: boolean }) {
    const {studentUser, quizAssignmentId, viewingAsSomeoneElse, quiz} = props;
    return <div className="mt-4">
        {isFullQuiz(quiz) && !isDefined(studentUser?.id) && <QuizHeader {...props as QuizProps & FullQuizInfo} />}
        {viewingAsSomeoneElse && <div className="mb-2">
            You are viewing this test as <b>{studentUser?.givenName} {studentUser?.familyName}</b>.{quizAssignmentId && <> <Link to={`/test/assignment/${quizAssignmentId}/feedback`}>Click here</Link> to return to the teacher test feedback page.</>}
        </div>}
        <QuizRubric rubric={quiz.rubric}/>
        {isFullQuiz(quiz) && <QuizDetails {...props as QuizProps & FullQuizInfo} />}
    </div>;
}

function QuizQuestions(props: QuizProps & FullQuizInfo) {
    // Assumes that ids of questions are defined - I don't know why this is not enforced in the editor/backend, because
    // we do unchecked casts of "possibly undefined" content ids to strings almost everywhere
    const questionNumbers = Object.assign({}, ...props.quizContents.questions.map((q, i) => ({[q.id as string]: i + 1})));

    return <QuizAttemptContext.Provider value={{quizAttempt: props.attempt, questionNumbers}}>
        <QuizSection {...props} page={props.page}/>
    </QuizAttemptContext.Provider>;
}

export function QuizContentsComponent(props: QuizProps) {
    const {quiz, studentUser, user} = props;

    const questions = isFullQuiz(quiz) ? (props as QuizProps & FullQuizInfo).quizContents.questions : [];
    const sections = isFullQuiz(quiz) ? (props as QuizProps & FullQuizInfo).quizContents.sections : {};

    const sectionState = (section: IsaacQuizSectionDTO) => {
        const sectionQs = section ? inSection(section, questions) : undefined;
        const isStarted = sectionQs?.some(q => q.bestAttempt !== undefined);
        const isCompleted = sectionQs?.every(q => q.bestAttempt !== undefined);
        return isCompleted ? SectionProgress.COMPLETED : isStarted ? SectionProgress.STARTED : SectionProgress.NOT_STARTED;
    };

    const viewingAsSomeoneElse = isDefined(studentUser) && studentUser?.id !== user?.id;

    const sidebarProps: QuizSidebarProps = {
        quiz,
        viewingAsSomeoneElse,
        totalSections: Object.keys(sections).length,
        currentSection: props.page ? props.page : undefined,
        sectionStates: Object.values(sections).map(section => sectionState(section)),
        sectionTitles: Object.keys(sections).map(k => sections[k].title || "Section " + k),
    };

    return <>
        <QuizTitle {...props} />
        <SidebarLayout show={isPhy}>
            <QuizSidebar {...sidebarProps} />
            <MainContent>
                {props.page === null || props.page == undefined 
                    ? <QuizOverview {...props} viewingAsSomeoneElse={viewingAsSomeoneElse} />
                    : <QuizQuestions {...props as QuizProps & FullQuizInfo} page={props.page} /> }
            </MainContent>
        </SidebarLayout>
    </>;
}
