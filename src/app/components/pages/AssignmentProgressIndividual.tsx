import React, {useContext, useMemo, useState} from "react";
import { Link } from "react-router-dom";
import { AssignmentProgressDTO, GameboardItem, CompletionState } from "../../../IsaacApiTypes";
import { EnhancedAssignmentWithProgress, AssignmentProgressPageSettingsContext, AuthorisedAssignmentProgress } from "../../../IsaacAppTypes";
import { getThemeFromTags, isAuthorisedFullAccess, siteSpecific } from "../../services";
import { ICON, passMark, ResultsTable, ResultsTablePartBreakdown } from "../elements/quiz/QuizProgressCommon";
import { Badge, Card, CardBody } from "reactstrap";
import { formatDate } from "../elements/DateString";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { Spacer } from "../elements/Spacer";
import { Tabs } from "../elements/Tabs";
import classNames from "classnames";
import { CollapsibleContainer } from "../elements/CollapsibleContainer";

interface GroupAssignmentTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
}

const GroupAssignmentTab = ({assignment, progress}: GroupAssignmentTabProps) => {
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
                const tickCount = progress.reduce((tc, p) => ((p.questionResults || [])[i] === CompletionState.ALL_CORRECT) ? tc + 1 : tc, 0);
                const tickPercent = Math.round(100 * (tickCount / progress.length));
                return [[...aAvg, tickPercent], aTQP + (q.questionPartsTotal ?? 0)];
            }, [[] as number[], 0]) ?? [[], 0];
        }
    }, [questions, progress]);

    function markClassesInternal(studentProgress: AssignmentProgressDTO, status: CompletionState | null, correctParts: number, incorrectParts: number, totalParts: number) {
        // todo: need a different marking system for when showing grade by % attempted
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        } else if (status === CompletionState.ALL_CORRECT || correctParts === totalParts) {
            return "completed";
        } else if (status === CompletionState.NOT_ATTEMPTED || correctParts + incorrectParts === 0) {
            return "not-attempted";
        } else if ((correctParts / totalParts) >= passMark) {
            return "passed";
        } else if ((incorrectParts / totalParts) > (1 - passMark)) {
            return "failed";
        } else {
            return "in-progress";
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

            <ResultsTable<GameboardItem> assignmentId={assignment.id} progress={progress} questions={questions} getQuestionTitle={getQuestionTitle}
                assignmentAverages={assignmentAverages} assignmentTotalQuestionParts={assignmentTotalQuestionParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
                isAssignment={true}
            />
        </CardBody>
    </Card>;
};

interface QuestionDetailCardProps extends React.HTMLAttributes<HTMLDivElement> {
    progress: AssignmentProgressDTO[];
    questions: GameboardItem[];
    questionIndex: number;
}

const QuestionDetailCard = ({progress, questions, questionIndex, ...rest}: QuestionDetailCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const difficultParts = useMemo(() => {
        const totalIncorrectByPart = progress.map(p => p.questionPartResults?.[questionIndex].map(state => state === "INCORRECT" ? 1 : 0) || []).reduce((acc, curr) => {
            curr.forEach((val, i) => {
                acc[i] = (acc[i] || 0) + val;
            });
            return acc;
        }, [] as number[]);

        return progress.reduce((acc, p, index) => {
            const incorrect = totalIncorrectByPart[index] || 0;
            const total = progress.length;
            if (total >= 2 && incorrect / total >= 0.5) {
                return [...acc, index];
            }
            return acc;
        }, [] as number[]);
    }, [progress, questionIndex]);

    const numAttemptedThisQuestion = useMemo(() => {
        return progress.filter(p => isQuestionFullyAttempted(p.questionResults?.[questionIndex])).length;
    }, [progress, questionIndex]);

    return <div {...rest} className={classNames("assignment-progress-card w-100 my-2", {"open": isOpen}, rest.className)}>
        <button onClick={() => setIsOpen(o => !o)} className="w-100 p-3 d-flex align-items-center text-start bg-transparent">
            <div className="d-flex flex-column">
                <h5 className="m-0">{questionIndex + 1}. {questions[questionIndex].title}</h5>
                {difficultParts.length > 0 && <span className="mt-2 small">
                    More than <strong>50%</strong> of the group answered incorrectly on parts <strong>{difficultParts.slice(0, 3).map(i => i + 1).join(", ")}{difficultParts.length > 3 ? ", ... " : ""}</strong>.
                </span>}
            </div>
            <Spacer/>
            <Badge className="d-flex align-items-center me-2 text-black fw-bold" color={siteSpecific("neutral-light", "cultured-grey")}>
                {`${numAttemptedThisQuestion} of ${progress.length} attempted`}
            </Badge>
            <img className={classNames("icon-dropdown-180", {"active": isOpen})} src="/assets/common/icons/chevron_down.svg" alt="expand dropdown"/>
        </button>
        <CollapsibleContainer expanded={isOpen}>
            <div className="overflow-auto px-2 pb-2">
                <ResultsTablePartBreakdown
                    progress={progress}
                    questionIndex={questionIndex}
                />
            </div>
        </CollapsibleContainer>
    </div>;
};

interface QuestionDetailsTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
}

const QuestionDetailsTab = ({assignment, progress}: QuestionDetailsTabProps) => {
    const questions = assignment.gameboard.contents;

    return <Card>
        <CardBody>
            <h3>Performance on questions</h3>
            <span>See the questions your students answered and which parts they struggled with.</span>

            {questions.map((_, questionIndex) => (
                <QuestionDetailCard 
                    key={questionIndex}
                    progress={progress}
                    questions={questions}
                    questionIndex={questionIndex}
                    data-bs-theme={getThemeFromTags(questions[questionIndex].tags)}
                />
            ))}

        </CardBody>
    </Card>;
};

function isQuestionFullyAttempted (state?: CompletionState) {
    return !!state && [CompletionState.ALL_CORRECT, CompletionState.ALL_ATTEMPTED, CompletionState.ALL_INCORRECT].includes(state);
}

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

    const numStudentsAttemptedAll = progress.filter(p => p.questionResults?.every(isQuestionFullyAttempted)).length;
    const numStudentsCompletedAll = progress.filter(p => p.questionResults?.every(r => r === CompletionState.ALL_CORRECT)).length;

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
                    {numStudentsAttemptedAll} of {progress.length} attempted all questions
                </div>
                <div className="d-flex align-items-center flex-grow-1 fw-bold">
                    <i className="icon icon-task-complete icon-md me-2" color="secondary"/>
                    {numStudentsCompletedAll} of {progress.length} got full marks
                </div>
            </CardBody>
        </Card>

        <Tabs style="cards">
            {{
                "Group overview": <GroupAssignmentTab
                    assignment={assignment}
                    progress={progress}
                />,
                "Question details": <QuestionDetailsTab
                    assignment={assignment}
                    progress={progress}
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
