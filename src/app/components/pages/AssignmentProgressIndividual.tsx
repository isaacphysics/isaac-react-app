import React, {useContext, useMemo} from "react";
import { Link } from "react-router-dom";
import { AssignmentProgressDTO, GameboardItemState, GameboardItem } from "../../../IsaacApiTypes";
import { EnhancedAssignmentWithProgress, AssignmentProgressPageSettingsContext, AuthorisedAssignmentProgress } from "../../../IsaacAppTypes";
import { isAuthorisedFullAccess, PATHS } from "../../services";
import { ICON, passMark, ResultsTable } from "../elements/quiz/QuizProgressCommon";
import { Card, CardBody } from "reactstrap";
import { formatDate } from "../elements/DateString";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { Spacer } from "../elements/Spacer";
import { Tabs } from "../elements/Tabs";

interface GroupAssignmentTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
    noStudentsAttemptedAll: number;
}

const GroupAssignmentTab = ({assignment, progress, noStudentsAttemptedAll}: GroupAssignmentTabProps) => {
    const assignmentProgressContext = useContext(AssignmentProgressPageSettingsContext);
    const questions = assignment.gameboard.contents;

    // Calculate 'class average', which isn't an average at all, it's the percentage of ticks per question.
    const [assignmentAverages, assignmentTotalQuestionParts] = useMemo<[number[], number]>(() => {
        if (assignmentProgressContext?.attemptedOrCorrect === "ATTEMPTED") {
            // for each column, calculate the percentage of students who attempted at all parts of the question
            return questions?.reduce(([aAvg, aTQP], q, i) => {
                const attemptedAllPartsCount = progress.reduce((tc, p) => ((p as AuthorisedAssignmentProgress)?.notAttemptedPartResults?.[i] === 0) ? tc + 1 : tc, 0);
                const attemptedAllPartsPercent = Math.round(100 * (attemptedAllPartsCount / progress.length));
                return [[...aAvg, attemptedAllPartsPercent], aTQP + (q.questionPartsTotal ?? 0)];
            }, [[] as number[], 0]) ?? [[], 0];

        } else {
            // for each column, calculate the percentage of students who got all parts of the question correct
            return questions?.reduce(([aAvg, aTQP], q, i) => {
                const tickCount = progress.reduce((tc, p) => ((p.questionResults || [])[i] === "PERFECT") ? tc + 1 : tc, 0);
                const tickPercent = Math.round(100 * (tickCount / progress.length));
                return [[...aAvg, tickPercent], aTQP + (q.questionPartsTotal ?? 0)];
            }, [[] as number[], 0]) ?? [[], 0];
        }
    }, [questions, progress]);

    function markClassesInternal(studentProgress: AssignmentProgressDTO, status: GameboardItemState | null, correctParts: number, incorrectParts: number, totalParts: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        } else if (correctParts === totalParts) {
            return "completed";
        } else if (status === "PASSED" || (correctParts / totalParts) >= passMark) {
            return "passed";
        } else if (status === "FAILED" || (incorrectParts / totalParts) > (1 - passMark)) {
            return "failed";
        } else if (correctParts > 0 || incorrectParts > 0) {
            return "in-progress";
        } else {
            return "not-attempted";
        }
    }

    function markClasses(studentProgress: AssignmentProgressDTO, totalParts: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }

        const correctParts = studentProgress.correctQuestionPartsCount;
        const incorrectParts = studentProgress.incorrectQuestionPartsCount;
        const status = null;

        return markClassesInternal(studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    function markQuestionClasses(studentProgress: AssignmentProgressDTO, index: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }


        const question = questions[index];

        const totalParts = question.questionPartsTotal;
        const correctParts = (studentProgress.correctPartResults || [])[index];
        const incorrectParts = (studentProgress.incorrectPartResults || [])[index];
        const status = (studentProgress.questionResults || [])[index];

        return markClassesInternal(studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    const tableHeader = <div className="progress-header">
        <strong>{noStudentsAttemptedAll}</strong> of <strong>{progress.length}</strong>
        {` students attempted all questions in `}
        <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>{assignment.gameboard.title}</Link>.
    </div>;

    const getQuestionTitle = (question: GameboardItem) => {
        return <Link to={`/questions/${question.id}?board=${assignment.gameboardId}`}>
            <strong>Q<span className="d-none d-md-inline">uestion</span>: </strong>{question.title}
        </Link>;
    };
    
    return <Card>
        <CardBody>
            <h3>Group assignment overview</h3>
            <span>See who attempted the assignment and which questions they struggled with.</span>

            <div className="d-flex flex-column flex-lg-row mt-3 mb-2 row-gap-2">
                {/* <StyledCheckbox 
                    checked={assignmentProgressContext.attemptedOrCorrect === "CORRECT"} 
                    onChange={(e) => assignmentProgressContext.setAttemptedOrCorrect?.(e.currentTarget.checked ? "CORRECT" : "ATTEMPTED")} 
                    label={""}
                /> */}
                <StyledCheckbox
                    checked={assignmentProgressContext?.formatAsPercentage}
                    onChange={(e) => assignmentProgressContext?.setFormatAsPercentage?.(e.currentTarget.checked)}
                    label={<span className="text-muted small">Show mark as percentages</span>}
                />
                <Spacer/>
                {/* // TODO: align with Fluent design's key? */}
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 fw-bold">
                    <span className="font-size-1">Key</span>
                    <span className="d-flex align-items-center gap-2">{ICON.correct} Correct</span>
                    <span className="d-flex align-items-center gap-2">{ICON.partial} Partially correct</span>
                    <span className="d-flex align-items-center gap-2">{ICON.incorrect} Incorrect</span>
                    <span className="d-flex align-items-center gap-2">{ICON.notAttempted} Not attempted</span>
                </div>
            </div>

            <ResultsTable<GameboardItem> assignmentId={assignment.id} progress={progress} questions={questions} header={tableHeader} getQuestionTitle={getQuestionTitle}
                assignmentAverages={assignmentAverages} assignmentTotalQuestionParts={assignmentTotalQuestionParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
                isAssignment={true}
            />
        </CardBody>
    </Card>;
};

interface QuestionDetailsTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
    noStudentsAttemptedAllPartsByQuestion: number[]
}

const QuestionDetailsTab = ({assignment, progress, noStudentsAttemptedAllPartsByQuestion}: QuestionDetailsTabProps) => {
    const questions = assignment.gameboard.contents;

    return <Card>
        <CardBody>
            <h3>Performance on questions</h3>
            <span>See the questions your students answered and which parts they struggled with.</span>
            <br />
            {/*  Todo: Temporary, to demo question part results*/}
            {questions.map((_, questionIndex) => (
                <>
                    <h5>{questionIndex + 1}. {questions[questionIndex].title}</h5>
                    <div>{noStudentsAttemptedAllPartsByQuestion[questionIndex]} of {progress.length} attempted</div>
                    <table key={questionIndex}>
                        <tbody>
                            {progress.map((studentProgress, studentIndex) => (
                                <tr key={studentIndex}>
                                    <th>{studentProgress.user?.givenName}</th>
                                    {studentProgress.questionPartResults && 
                                        studentProgress.questionPartResults[questionIndex].map((questionPartResult, questionPartIndex) => (
                                            <td key={questionPartIndex}>{questionPartResult}</td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ))}

        </CardBody>
    </Card>;
};

export const ProgressDetails = ({assignment}: { assignment: EnhancedAssignmentWithProgress }) => {

    const questions = assignment.gameboard.contents;

    const progressData = useMemo<[AssignmentProgressDTO, boolean][]>(() => assignment.progress.map(p => {
        if (!isAuthorisedFullAccess(p)) return [p, false];

        const initialState = {
            ...p,
            tickCount: 0,
            correctQuestionPartsCount: 0,
            incorrectQuestionPartsCount: 0,
            notAttemptedPartResults: []
        };

        const ret = (p.questionResults || []).reduce<AuthorisedAssignmentProgress>((oldP, results, i) => {
            const tickCount = ["PASSED", "PERFECT"].includes(results) ? oldP.tickCount + 1 : oldP.tickCount;
            const questions = assignment.gameboard.contents;
            return {
                ...oldP,
                tickCount,
                correctQuestionPartsCount: oldP.correctQuestionPartsCount + (p.correctPartResults || [])[i],
                incorrectQuestionPartsCount: oldP.incorrectQuestionPartsCount + (p.incorrectPartResults || [])[i],
                notAttemptedPartResults: [
                    ...oldP.notAttemptedPartResults,
                    (questions[i].questionPartsTotal - (p.correctPartResults || [])[i] - (p.incorrectPartResults || [])[i])
                ]
            };
        }, initialState);
        return [ret, questions.length === ret.tickCount];
    }), [assignment.gameboard.contents, assignment.progress, questions.length]);

    const progress = progressData.map(pd => pd[0]);
    const noStudentsAttemptedAll = progress.reduce((sa, p) => sa + (isAuthorisedFullAccess(p) && p.notAttemptedPartResults.every(v => v === 0) ? 1 : 0), 0);
    const noStudentsAttemptedAllPartsByQuestion = questions.map((_, qi) => progress.map(p => p.questionResults && p.questionResults[qi]).filter(v => v != 'NOT_ATTEMPTED').length);

    return <>
        {/* group overview */}
        <Card className="my-4">
            <CardBody className="d-flex flex-column flex-lg-row assignment-progress-group-overview row-gap-2">
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className={`icon ${assignment.dueDate && assignment.dueDate < new Date() ? "icon-event-completed" : "icon-event-upcoming"} icon-md me-2`} color="secondary"/>
                    Due: {formatDate(assignment.dueDate)}
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className="icon icon-group icon-md me-2" color="secondary"/>
                    {noStudentsAttemptedAll} of {progress.length} attempted all questions
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className="icon icon-task-complete icon-md me-2" color="secondary"/>
                    {progress.filter(p => p.questionResults?.every(r => r === "PERFECT")).length} of {progress.length} got full marks
                </div>
            </CardBody>
        </Card>

        <Tabs style="cards">
            {{
                "Group overview": <GroupAssignmentTab
                    assignment={assignment}
                    progress={progress}
                    noStudentsAttemptedAll={noStudentsAttemptedAll}
                />,
                "Question details": <QuestionDetailsTab
                    assignment={assignment}
                    progress={progress}
                    noStudentsAttemptedAllPartsByQuestion={noStudentsAttemptedAllPartsByQuestion}
                />
            }}
        </Tabs>

        
    </>;

};

// const QuizProgressLoader = ({quizAssignmentId}: { quizAssignmentId: number }) => {
//     const quizAssignmentFeedbackQuery = useGetQuizAssignmentWithFeedbackQuery(quizAssignmentId);
//     const pageSettings = useContext(AssignmentProgressPageSettingsContext);
//     return <ShowLoadingQuery
//         query={quizAssignmentFeedbackQuery}
//         defaultErrorTitle={"Error loading test assignment feedback"}
//         thenRender={quizAssignmentWithFeedback =>
//             <div className={`assignment-progress-details bg-transparent ${pageSettings?.colourBlind ? " colour-blind" : ""}`}>
//                 <QuizProgressDetails assignment={quizAssignmentWithFeedback} />
//             </div>
//         }
//     />;
// };
