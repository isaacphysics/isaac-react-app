import React, {useContext, useMemo, useState} from "react";
import { Link } from "react-router-dom";
import { AssignmentProgressDTO, GameboardItem, CompletionState } from "../../../IsaacApiTypes";
import { EnhancedAssignmentWithProgress, AssignmentProgressPageSettingsContext, AuthorisedAssignmentProgress } from "../../../IsaacAppTypes";
import { getAssignmentCSVDownloadLink, getThemeFromTags, isAda, isAuthorisedFullAccess, isPhy, PATHS, siteSpecific } from "../../services";
import { ICON, passMark, ResultsTable, ResultsTablePartBreakdown } from "../elements/quiz/QuizProgressCommon";
import { Badge, Button, Card, CardBody } from "reactstrap";
import { formatDate } from "../elements/DateString";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { Spacer } from "../elements/Spacer";
import { Tabs } from "../elements/Tabs";
import classNames from "classnames";
import { CollapsibleContainer } from "../elements/CollapsibleContainer";
import StyledToggle from "../elements/inputs/StyledToggle";
import { Markup } from "../elements/markup";
import { AssignmentProgressLegend } from "./SingleAssignmentProgress";
import { downloadLinkModal } from "../elements/modals/AssignmentProgressModalCreators";
import { openActiveModal, useAppDispatch } from "../../state";

export const AssignmentProgressSettings = () => {
    const assignmentProgressContext = useContext(AssignmentProgressPageSettingsContext);

    return <div className="d-flex w-100 flex-column flex-md-row content-metadata-container my-0 align-items-stretch align-items-md-center px-4 px-sm-5 px-md-0">
        <div className="d-flex flex-row flex-md-column flex-grow-1 align-items-center py-2 py-md-0">
            <span>Table display mode</span>
            <Spacer />
            <StyledToggle falseLabel="Fractions" trueLabel="Percentages" 
                checked={assignmentProgressContext?.formatAsPercentage} 
                onChange={(e) => assignmentProgressContext?.setFormatAsPercentage?.(e.currentTarget.checked)}
            />
        </div>

        {isPhy && <div className="d-flex flex-row flex-md-column flex-grow-1 align-items-center py-2 py-md-0">
            <span>Colour-blind mode</span>
            <Spacer />
            <StyledToggle falseLabel="Off" trueLabel="On" 
                checked={assignmentProgressContext?.colourBlind} 
                onChange={(e) => assignmentProgressContext?.setColourBlind?.(e.currentTarget.checked)} 
            />
        </div>}

        {isPhy && <div className="d-flex flex-row flex-md-column flex-grow-1 align-items-center py-2 py-md-0">
            <span>Completion display mode</span>
            <Spacer />
            <StyledToggle trueLabel="Correct" falseLabel="Attempted"
                checked={assignmentProgressContext?.attemptedOrCorrect === "CORRECT"} 
                onChange={(e) => assignmentProgressContext?.setAttemptedOrCorrect?.(e.currentTarget.checked ? "CORRECT" : "ATTEMPTED")} 
            />
        </div>}
    </div>;
};

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
        } else if ((incorrectParts / totalParts) > (1 - passMark)) {
            return "failed";
        } else {
            return "in-progress";
        }
    } else {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        } else if (status && isQuestionFullyAttempted(status) || correctParts + incorrectParts === totalParts) {
            return "fully-attempted";
        } else if (status === CompletionState.NOT_ATTEMPTED || correctParts + incorrectParts === 0) {
            return "not-attempted";
        } else if ((correctParts + incorrectParts) / totalParts >= passMark) {
            return "passed";
        } else {
            return "in-progress";
        }
    }
}

interface GroupAssignmentTabProps {
    assignment: EnhancedAssignmentWithProgress;
    progress: AssignmentProgressDTO[];
}

const GroupAssignmentTab = ({assignment, progress}: GroupAssignmentTabProps) => {
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

    const [settingsVisible, setSettingsVisible] = useState(true);
    
    return <Card>
        <CardBody>
            <div className="d-flex w-100 flex-column flex-md-row align-items-start align-items-md-center">
                <div className="d-flex w-100 align-items-start justify-content-between">
                    <div>
                        {siteSpecific(
                            <h4>Group assignment overview</h4>,
                            <h3>Group assignment overview</h3>
                        )}
                        <span>See who attempted the assignment and which questions they struggled with.</span>
                    </div>
                    {isPhy && <button onClick={() => setSettingsVisible(o => !o)} className="d-flex align-items-center bg-transparent gap-2 invert-underline">
                        {settingsVisible ? "Hide settings" : "Show settings"}
                        <i className={classNames("icon icon-cog icon-dropdown-90", {"active": settingsVisible})}/>
                    </button>}
                </div>
                <Spacer/>
                {isAda && <StyledToggle 
                    trueLabel="Correct"
                    falseLabel="Attempted"
                    checked={assignmentProgressContext?.attemptedOrCorrect === "CORRECT"} 
                    onChange={(e) => assignmentProgressContext?.setAttemptedOrCorrect?.(e.currentTarget.checked ? "CORRECT" : "ATTEMPTED")} 
                />}
            </div>

            <div className="d-flex flex-column flex-lg-row mt-2 mb-2 row-gap-2">
                {isPhy && <CollapsibleContainer expanded={settingsVisible} className="w-100">
                    <div className="py-3">
                        <AssignmentProgressSettings />
                    </div>
                </CollapsibleContainer>}

                {isAda && <>
                    <StyledCheckbox
                        checked={assignmentProgressContext?.formatAsPercentage}
                        onChange={(e) => assignmentProgressContext?.setFormatAsPercentage?.(e.currentTarget.checked)}
                        label={<span className="text-muted">Show mark as percentages</span>}
                    />
                    <Spacer />
                    <AdaKey />
                </>}
            </div>

            {isPhy && <AssignmentProgressLegend id={`${assignment.id ?? ""}`} />}

            <ResultsTable<GameboardItem> assignmentId={assignment.id} progress={progress} questions={questions}
                assignmentTotalQuestionParts={assignmentTotalQuestionParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
                isAssignment={true} boardId={assignment.gameboardId}
            />
        </CardBody>
    </Card>;
};

const AdaKey = () => {
    const context = useContext(AssignmentProgressPageSettingsContext);

    const KeyItem = ({icon, label}: {icon: React.ReactNode, label: string}) => (
        <span className="d-flex align-items-center w-max-content gap-2">
            {icon} {label}
        </span>
    );

    return <div className="d-flex flex-column flex-md-row align-items-md-center column-gap-4 row-gap-2">
        <span className="d-inline d-lg-none d-xl-inline font-size-1 fw-bold">Key</span>
        {context?.attemptedOrCorrect === "CORRECT" 
            ? <>
                <div className="d-flex flex-column flex-sm-row flex-md-col column-gap-4 row-gap-2">
                    <KeyItem icon={ICON.correct} label="Correct" />
                    <KeyItem icon={ICON.partial} label="Partially correct" />
                </div>
                <div className="d-flex flex-column flex-sm-row flex-md-col column-gap-4 row-gap-2">
                    <KeyItem icon={ICON.incorrect} label="Incorrect" />
                    <KeyItem icon={ICON.notAttempted} label="Not attempted" />
                </div>
            </>
            : <>
                <div className="d-flex flex-column flex-md-row column-gap-4 row-gap-2">
                    <KeyItem icon={ICON.correct} label="Fully attempted" />
                    <KeyItem icon={ICON.partial} label="Partially attempted" />
                    <KeyItem icon={ICON.notAttempted} label="Not attempted" />
                </div>
            </>
        }
    </div>;
};
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
                <h5 className="m-0">
                    {questionIndex + 1}.{" "}
                    <Link to={`/questions/${questions[questionIndex].id}` + (gameboardId ? `?board=${gameboardId}` : "")} target="_blank" onClick={(e) => e.stopPropagation()}>
                        <Markup encoding="latex">{questions[questionIndex].title}</Markup>
                    </Link>
                </h5>
                {difficultParts.length > 0 && <span className="mt-2 small">
                    <strong>50%</strong> or more of the group answered incorrectly on part{difficultParts.length > 1 && <>s</>} <strong>{difficultParts.slice(0, 3).map(i => i + 1).join(", ")}{difficultParts.length > 3 ? `, and ${difficultParts.length - 3} more` : ""}</strong>.
                </span>}
            </div>
            <Spacer/>
            <Badge className="d-flex align-items-center me-2 text-black fw-bold" color={siteSpecific("neutral-light", "cultured-grey")}>
                {`${numAttemptedThisQuestion} of ${progress.length} attempted`}
            </Badge>
            <img className={classNames("icon-dropdown-180", {"active": isOpen})} src="/assets/common/icons/chevron_down.svg" alt="expand dropdown"/>
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
}

const DetailedMarksTab = ({assignment, progress}: DetailedMarksTabProps) => {
    const questions = assignment.gameboard.contents;

    return <Card>
        <CardBody>
            {siteSpecific(
                <h4>Performance on questions</h4>,
                <h3>Performance on questions</h3>
            )}
            <span>See the questions your students answered and which parts they struggled with.</span>

            {questions.map((_, questionIndex) => (
                <DetailedMarksCard 
                    key={questionIndex}
                    progress={progress}
                    questions={questions}
                    questionIndex={questionIndex}
                    gameboardId={assignment.gameboardId}
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

    const dispatch = useAppDispatch();
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
            const tickCount = [CompletionState.ALL_CORRECT].includes(results) ? oldP.tickCount + 1 : oldP.tickCount;
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
        <div className={classNames("d-flex flex-wrap mb-4 gap-2", siteSpecific("mt-md-4", "mt-xl-4"))}>
            {isPhy && <Link to={`${PATHS.ASSIGNMENT_PROGRESS}/group/${assignment.groupId}`} className="d-flex align-items-center">
                <i className="icon icon-arrow-left me-2"/>
                Back to group assignments and tests
            </Link>}
            <Spacer/>
            <Button className="d-flex align-items-center" color="solid" onClick={() => dispatch(openActiveModal(downloadLinkModal(getAssignmentCSVDownloadLink(assignment.id))))}>
                Download CSV
                <i className="icon icon-download ms-2" color="white"/>
            </Button>
        </div>
        
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
                "Detailed marks": <DetailedMarksTab
                    assignment={assignment}
                    progress={progress}
                />
            }}
        </Tabs>
    </>;

};
