import React, {Dispatch, SetStateAction, useContext, useMemo, useState} from "react";
import { AssignmentProgressDTO, GameboardItem, CompletionState } from "../../../../IsaacApiTypes";
import { EnhancedAssignmentWithProgress, AssignmentProgressPageSettingsContext } from "../../../../IsaacAppTypes";
import { isAuthorisedFullAccess, isPhy, PATHS, siteSpecific } from "../../../services";
import { passMark, ResultsTable, ResultsTablePartBreakdown } from "../../elements/quiz/QuizProgressCommon";
import { Badge, Card, CardBody} from "reactstrap";
import { Spacer } from "../../elements/Spacer";
import classNames from "classnames";
import { CollapsibleContainer } from "../../elements/CollapsibleContainer";
import { Markup } from "../../elements/markup";
import { ResultsTableHeader } from "../../elements/ResultsTableHeader";

export function markClassesInternal(attemptedOrCorrect: "ATTEMPTED" | "CORRECT", studentProgress: AssignmentProgressDTO, status: CompletionState | null, correctParts: number, incorrectParts: number, totalParts: number) {
    if (attemptedOrCorrect === "CORRECT") {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        } else if (status === CompletionState.ALL_CORRECT || correctParts === totalParts) {
            return "completed";
        } else if (status === CompletionState.NOT_ATTEMPTED || correctParts + incorrectParts === 0) {
            return "not-attempted";
        } else if ((correctParts / totalParts) >= passMark) {
            return "passed";
        } else if ((correctParts / totalParts) < (1 - passMark)) {
            return "failed";
        } else {
            return "in-progress";
        }
    } else {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        } else if (status && isQuestionFullyAttempted(status) || correctParts + incorrectParts === totalParts) {
            return "fully-attempted";
        } else if (status === CompletionState.NOT_ATTEMPTED || siteSpecific((correctParts + incorrectParts) / totalParts < (1 - passMark), correctParts + incorrectParts === 0)) {
            return "not-attempted";
        } else if ((correctParts + incorrectParts) / totalParts >= passMark) {
            return "passed";
        } else {
            return "in-progress";
        }
    }
}

export function isQuestionFullyAttempted (state?: CompletionState) {
    return !!state && [CompletionState.ALL_CORRECT, CompletionState.ALL_ATTEMPTED, CompletionState.ALL_INCORRECT].includes(state);
}

const BoardLink = ({id}: {id?: string}) => <a className="new-tab-link" href={`${PATHS.GAMEBOARD}#${id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
    <i className="icon icon-new-tab" />
</a>;

interface GroupAssignmentTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
    settingsVisible: boolean;
    setSettingsVisible: Dispatch<SetStateAction<boolean>>
}

export const GroupAssignmentTab = ({assignment, progress, settingsVisible, setSettingsVisible}: GroupAssignmentTabProps) => {
    const assignmentProgressContext = useContext(AssignmentProgressPageSettingsContext);
    const questions = assignment.gameboard.contents;

    const assignmentTotalQuestionParts = questions.reduce((acc, q) => {
        return acc + (q?.questionPartsTotal ?? 0);
    }, 0);

    function markClasses(studentProgress: AssignmentProgressDTO, totalParts: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }

        const correctParts = studentProgress.correctQuestionPartsCount;
        const incorrectParts = studentProgress.incorrectQuestionPartsCount;
        const status = null;

        return markClassesInternal(assignmentProgressContext?.attemptedOrCorrect ?? "CORRECT", studentProgress, status, correctParts, incorrectParts, totalParts);
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

        return markClassesInternal(assignmentProgressContext?.attemptedOrCorrect ?? "CORRECT", studentProgress, status, correctParts, incorrectParts, totalParts);
    }

    return <Card>
        <CardBody>
            <ResultsTableHeader settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible} isAssignment showLegend
                headerText={<div>
                    {siteSpecific(
                        <h4>Overview: {assignment.gameboard.title} <BoardLink id={assignment.gameboard?.id} /></h4>,
                        <h3>Group assignment overview <BoardLink id={assignment.gameboard?.id} /></h3>
                    )}
                    <span>See who attempted the assignment and which questions they struggled with.</span>
                </div>}
            />

            <ResultsTable<GameboardItem> assignmentId={assignment.id} progress={progress} questions={questions}
                assignmentTotalQuestionParts={assignmentTotalQuestionParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
                isAssignment={true} boardId={assignment.gameboardId}
            />
        </CardBody>
    </Card>;
};

const QuestionLink = ({questionId, boardId}: {questionId?: string, boardId?: string}) => <a className="new-tab-link" href={`/questions/${questionId}` + (boardId ? `?board=${boardId}` : "")} target="_blank" onClick={(e) => e.stopPropagation()} aria-label="Open question in new tab">
    <i className="icon icon-new-tab" />
</a>;

interface DetailedMarksProps extends React.HTMLAttributes<HTMLDivElement> {
    progress: AssignmentProgressDTO[];
    questions: GameboardItem[];
    questionIndex: number;
    gameboardId?: string;
}

const DetailedMarksCard = ({progress, questions, questionIndex, gameboardId, ...rest}: DetailedMarksProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const difficultParts = useMemo(() => {
        const totalIncorrectByPart = progress.map(p => p.questionPartResults?.[questionIndex].map(state => state === "INCORRECT" ? 1 : 0) || []).reduce((acc, curr) => {
            curr.forEach((val, i) => {
                acc[i] = (acc[i] || 0) + val;
            });
            return acc;
        }, [] as number[]);

        const total = progress.length;
        return totalIncorrectByPart.reduce((acc, incorrect, index) => {
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
                <div className="d-flex">
                    <h5 className="m-0">
                        {questionIndex + 1}.{" "}
                        <Markup encoding="latex">{questions[questionIndex].title}</Markup>
                    </h5>
                    <QuestionLink questionId={questions[questionIndex].id} boardId={gameboardId} />
                </div>

                {difficultParts.length > 0 && <span className="mt-2 small">
                    <strong>50%</strong> or more of the group answered incorrectly on part{difficultParts.length > 1 && <>s</>} <strong>{difficultParts.slice(0, 3).map(i => i + 1).join(", ")}{difficultParts.length > 3 ? `, and ${difficultParts.length - 3} more` : ""}</strong>.
                </span>}
            </div>
            <Spacer/>
            <Badge className="d-flex align-items-center me-2 text-black fw-bold" color={siteSpecific("neutral-light", "cultured-grey")}>
                {`${numAttemptedThisQuestion} of ${progress.length} attempted`}
            </Badge>
            <i className={classNames("icon icon-chevron-down icon-color-black icon-dropdown-180", {"active": isOpen})}/>
        </button>
        <CollapsibleContainer expanded={isOpen}>
            <div className="pb-2">
                {/* nested divs required for clean table border when scrolling :/ */}
                <div className="overflow-auto ms-2 pe-2 results-table-container">
                    <ResultsTablePartBreakdown
                        progress={progress}
                        questionIndex={questionIndex}
                    />
                </div>
            </div>
        </CollapsibleContainer>
    </div>;
};

interface DetailedMarksTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
    settingsVisible: boolean;
    setSettingsVisible: Dispatch<SetStateAction<boolean>>
}

export const DetailedMarksTab = ({assignment, progress, settingsVisible, setSettingsVisible}: DetailedMarksTabProps) => {
    const questions = assignment.gameboard.contents;

    return <Card>
        <CardBody>
            <ResultsTableHeader settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible} isAssignment 
                headerText={<div>
                    {siteSpecific(<h4>Performance on questions</h4>, <h3>Performance on questions</h3>)}
                    <span>See the questions your students answered{isPhy && " and which parts they struggled with"}.</span>
                </div>}
            />

            {questions.map((_, questionIndex) => (
                <DetailedMarksCard
                    key={questionIndex}
                    progress={progress}
                    questions={questions}
                    questionIndex={questionIndex}
                    gameboardId={assignment.gameboardId}
                    // data-bs-theme={getThemeFromTags(questions[questionIndex].tags)}
                />
            ))}

        </CardBody>
    </Card>;
};
