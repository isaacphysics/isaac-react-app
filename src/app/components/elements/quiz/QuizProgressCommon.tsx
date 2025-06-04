import React, {useContext, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Button} from "reactstrap";
import {AssignmentProgressPageSettingsContext, ProgressSortOrder} from "../../../../IsaacAppTypes";
import {isAuthorisedFullAccess, TODAY} from "../../../services";
import {Link} from "react-router-dom";
import orderBy from "lodash/orderBy";
import { IsaacSpinner } from "../../handlers/IsaacSpinner";
import { closeActiveModal, openActiveModal, useAppDispatch, useReturnQuizToStudentMutation } from "../../../state";
import { SortItemHeader } from "../SortableItemHeader";
import { AssignmentProgressDTO, CompletionState, QuestionPartState } from "../../../../IsaacApiTypes";
import classNames from "classnames";

export const ICON = {
    correct: <i className="icon-md icon-correct"/>,
    incorrect: <i className="icon-md icon-incorrect"/>,
    notAttempted: <i className="icon-md icon-not-attempted"/>,
    partial: <i className="icon-md icon-partial"/>,
};

export const passMark = 0.75;

export function formatMark(numerator: number, denominator: number, formatAsPercentage: boolean) {
    let result;
    if (formatAsPercentage) {
        result = denominator !== 0 ? Math.round(100 * numerator / denominator) + "%" : "100%";
    } else {
        result = numerator + "/" + denominator;
    }
    return result;
}

export const generateCorrectnessIcon = (correct: number, incorrect: number, notAttempted: number, totalParts: number) => {
    if (correct === totalParts) {
        return ICON.correct;
    } else if (notAttempted === totalParts) {
        return ICON.notAttempted;
    } else if (correct === 0) {
        return ICON.incorrect;
    } else {
        return ICON.partial;
    }
};

export const getQuizQuestionCorrectnessIcon = (state: CompletionState) => {
    switch (state) {
        case CompletionState.ALL_CORRECT:
            return ICON.correct;
        case CompletionState.ALL_INCORRECT:
            return ICON.incorrect;
        case CompletionState.ALL_ATTEMPTED:
        case CompletionState.IN_PROGRESS:
            return ICON.partial;
        case CompletionState.NOT_ATTEMPTED:
            return ICON.notAttempted;
    }
};

export const getQuizQuestionPartCorrectnessIcon = (state: QuestionPartState) => {
    switch (state) {
        case "CORRECT":
            return ICON.correct;
        case "INCORRECT":
            return ICON.incorrect;
        case "NOT_ATTEMPTED":
            return ICON.notAttempted;
    }
};
export interface QuestionType {
    id?: string | undefined;
    title?: string | undefined;
    questionPartsTotal?: number | undefined;
}

export interface ResultsTableProps<Q extends QuestionType> {
    assignmentId?: number;
    duedate?: Date | number;
    progress?: AssignmentProgressDTO[];
    questions: Q[];
    getQuestionTitle: (question: Q) => JSX.Element;
    assignmentAverages: number[];
    assignmentTotalQuestionParts: number;
    markClasses: (row: AssignmentProgressDTO, assignmentTotalQuestionParts: number) => string;
    markQuestionClasses: (row: AssignmentProgressDTO, questionIndex: number) => string;
    isAssignment?: boolean;
}

export function ResultsTable<Q extends QuestionType>({
    assignmentId,
    duedate,
    progress,
    questions,
    getQuestionTitle,
    assignmentAverages,
    assignmentTotalQuestionParts,
    markClasses,
    markQuestionClasses,
    isAssignment
} : ResultsTableProps<Q>) {

    const [selectedQuestionNumber, setSelectedQuestionNumber] = useState(0);
    const selectedQuestion: Q = questions[selectedQuestionNumber];

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    const dispatch = useAppDispatch();

    const [dropdownOpen, setDropdownOpen] = useState(progress?.map(() => false));
    const toggle = (index: number) => setDropdownOpen(dropdownOpen?.map((value, i) => i === index ? !value : value));

    const [returnQuizToStudent, {isLoading: returningQuizToStudent}] = useReturnQuizToStudentMutation();
    const returnToStudent = (userId?: number) => {
        const confirm = () => {
            returnQuizToStudent({quizAssignmentId: assignmentId as number, userId: userId as number})
                .then(() => dispatch(closeActiveModal()));
        };
        dispatch(openActiveModal({
            closeAction: () => dispatch(closeActiveModal()),
            title: "Allow another attempt?",
            body: "This will allow the student to attempt the test again.",
            buttons: [
                <Button key={1} color="keyline" target="_blank" onClick={() => dispatch(closeActiveModal())}>
                    Cancel
                </Button>,
                <Button key={0} color="solid" target="_blank" onClick={confirm}>
                    Confirm
                </Button>,
            ]
        }));
    };

    const [sortOrder, setSortOrder] = useState<ProgressSortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);

    function toggleSort(itemOrder: ProgressSortOrder) {
        setSortOrder(itemOrder);
        if (sortOrder === itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    const semiSortedProgress = useMemo(() => orderBy(progress, (item) => {
        return isAuthorisedFullAccess(item) && -item.notAttemptedPartResults.reduce(function(sum, increment) {return sum + increment;}, 0);
    }, [reverseOrder ? "desc" : "asc"]), [progress, reverseOrder]);

    const sortedProgress = useMemo(() => orderBy((semiSortedProgress), (item) => {
        if (!isAuthorisedFullAccess(item)) return -1;
        switch (sortOrder) {
            case "name":
                return (item.user?.familyName + ", " + item.user?.givenName).toLowerCase();
            case "totalQuestionPartPercentage":
                return -item.correctQuestionPartsCount;
            case "totalQuestionPercentage":
                return -item.tickCount;
            default:
                return -(item.correctPartResults || [])[sortOrder];
        }
    }, [reverseOrder ? "desc" : "asc"])
    , [semiSortedProgress, reverseOrder, sortOrder]);

    const tableHeaderFooter = <tr className="progress-table-header-footer fw-bold">
        <SortItemHeader<ProgressSortOrder> 
            className="student-name ps-3 py-3" 
            defaultOrder={"name"} 
            reverseOrder={"name"} 
            currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
        >
            Name
        </SortItemHeader>
        {/* {questions.map((q, index) =>
            <SortItemHeader<ProgressSortOrder>
                key={q.id} className={`${isSelected(q)}`}
                defaultOrder={index} reverseOrder={index} currentOrder={sortOrder}
                setOrder={toggleSort}
                clickToSelect={() => setSelectedQuestionNumber(index)}
                hideIcons={index !== selectedQuestionNumber} reversed={reverseOrder}
                alignment="center"
            >
                {assignmentAverages[index]}%
            </SortItemHeader>
        )} */}
        <SortItemHeader<ProgressSortOrder>
            className="ps-3"
            defaultOrder={"totalQuestionPercentage"}
            reverseOrder={"totalQuestionPercentage"}
            currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
        >
            Correct
        </SortItemHeader>
        {questions.map((q, index) =>
            <th key={index}>
                <a className="d-block" href={`/questions/${q.id}`}>
                    {index + 1}
                </a>
            </th>
        )}
        {/* {isAssignment ? <>
            <SortItemHeader<ProgressSortOrder>
                className="total-column left"
                defaultOrder={"totalQuestionPartPercentage"}
                reverseOrder={"totalQuestionPartPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}>
                Total Parts
            </SortItemHeader>
            <SortItemHeader<ProgressSortOrder>
                className="total-column right"
                defaultOrder={"totalQuestionPercentage"}
                reverseOrder={"totalQuestionPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}>
                Total Qs
            </SortItemHeader>
        </> :
            <SortItemHeader<ProgressSortOrder>
                defaultOrder={"totalQuestionPartPercentage"}
                reverseOrder={"totalQuestionPartPercentage"}
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
                className="total-column"
            >
                Overall
            </SortItemHeader>
        } */}
    </tr>;

    const tableRef = useRef<HTMLTableElement>(null);

    useLayoutEffect(() => {
        const table = tableRef.current;
        if (table) {
            const parentElement = table.parentElement as HTMLElement;
            const firstRow = (table.firstChild as HTMLTableSectionElement).firstChild as HTMLTableRowElement;
            const questionTH = firstRow.children[selectedQuestionNumber + 1] as HTMLTableHeaderCellElement;

            const offsetLeft = questionTH.offsetLeft;
            const parentScrollLeft = parentElement.scrollLeft;
            const parentLeft = parentScrollLeft + parentElement.offsetLeft + 130;
            const width = questionTH.offsetWidth;

            let newScrollLeft;

            if (offsetLeft < parentLeft) {
                newScrollLeft = parentScrollLeft + offsetLeft - parentLeft - width / 2;
            } else {
                const offsetRight = offsetLeft + width;
                const parentRight = parentLeft + parentElement.offsetWidth - 260;
                if (offsetRight > parentRight) {
                    newScrollLeft = parentScrollLeft + offsetRight - parentRight + width / 2;
                }
            }
            if (newScrollLeft != undefined) {
                parentElement.scrollLeft = newScrollLeft;
            }
        }
    }, [selectedQuestionNumber]);

    return <div className="assignment-progress-progress">
        {progress && progress.length > 0 && <>
            <div className="assignment-progress-table-wrapper">
                <table ref={tableRef} className="progress-table w-100 border">
                    <thead>
                        {tableHeaderFooter}
                    </thead>
                    <tbody>
                        {sortedProgress.map((studentProgress, index) => {
                            const fullAccess = isAuthorisedFullAccess(studentProgress);
                            return <tr key={studentProgress.user?.id} className={`${markClasses(studentProgress, assignmentTotalQuestionParts)}${fullAccess ? "" : " not-authorised"}`} title={`${studentProgress.user?.givenName + " " + studentProgress.user?.familyName}`}>
                                <th className="student-name py-3 fw-bold">
                                    {fullAccess && pageSettings?.isTeacher ?
                                        (
                                            isAssignment ?
                                                <Link className="d-flex justify-content-center align-items-center gap-2" to={`/progress/${studentProgress.user?.id}`} target="_blank">
                                                    <i className="icon icon-person icon-md" color="tertiary"/>
                                                    <span className="pe-3">
                                                        {studentProgress.user?.givenName}
                                                        <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                                    </span>
                                                </Link>
                                                : <>
                                                    <Button className="quiz-student-menu" color="link" onClick={() => toggle(index)} disabled={returningQuizToStudent}>
                                                        <div
                                                            className="quiz-student-name"
                                                        >
                                                            {studentProgress.user?.givenName}
                                                            <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                                                        </div>
                                                        <div className="quiz-student-menu-icon">
                                                            {returningQuizToStudent ? <IsaacSpinner size="sm" /> : <img src="/assets/common/icons/menu.svg" alt="Menu" />}
                                                        </div>
                                                    </Button>
                                                    {!returningQuizToStudent && dropdownOpen?.[index] && <>
                                                        {(!duedate || duedate.valueOf() > TODAY().valueOf()) &&
                                                        studentProgress.completed &&
                                                        <div className="py-2 px-3">
                                                            <Button size="sm" onClick={() => returnToStudent(studentProgress.user?.id)}>Allow another attempt</Button>
                                                        </div>}
                                                        <div className="py-2 px-3">
                                                            <Button size="sm" tag={Link} to={`/test/attempt/feedback/${assignmentId}/${studentProgress.user?.id}`}>View answers</Button>
                                                        </div>
                                                    </>}
                                                </>
                                        ) :
                                        <span>{studentProgress.user?.givenName} {studentProgress.user?.familyName}</span>
                                    }
                                </th>
                                <th title={fullAccess ? undefined : "Not Sharing"}>
                                    {fullAccess ? formatMark(studentProgress.tickCount,
                                        questions.length,
                                        !!pageSettings?.formatAsPercentage) : ""}
                                </th>
                                {questions.map((q, index) =>
                                    <td key={q.id}>
                                        {isAssignment 
                                            ? (fullAccess 
                                                // ? formatMark(
                                                //     (studentProgress.correctPartResults || [])[index], 
                                                //     questions[index].questionPartsTotal as number, 
                                                //     !!pageSettings?.formatAsPercentage
                                                // ) 
                                                ? getQuizQuestionCorrectnessIcon((studentProgress.questionResults || [])[index])
                                                : ""
                                            )
                                            : (studentProgress.correctPartResults || [])[index] === 1 ? ICON.correct :
                                                (studentProgress.incorrectPartResults || [])[index] === 1 ? ICON.incorrect :
                                                /* default */ ICON.notAttempted
                                        }
                                    </td> 
                                )}
                            </tr>;
                        })}
                    </tbody>
                </table>
            </div>
        </>}
    </div>;
}

interface ResultsTablePartBreakdownProps extends React.HTMLAttributes<HTMLTableElement> {
    progress?: AssignmentProgressDTO[];
    questionIndex: number;
}

export function ResultsTablePartBreakdown({
    progress,
    questionIndex,
    ...rest
}: ResultsTablePartBreakdownProps) {

    // TODO: the sorting is somewhat duplicated from above, could be slightly refactored
    const [sortOrder, setSortOrder] = useState<ProgressSortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);

    function toggleSort(itemOrder: ProgressSortOrder) {
        setSortOrder(itemOrder);
        if (sortOrder === itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    const sortedProgress = useMemo(() => orderBy((progress), (item) => {
        if (!isAuthorisedFullAccess(item)) return -1;
        return (item.user?.familyName + ", " + item.user?.givenName).toLowerCase();
    }), [progress]);

    return !!sortedProgress?.length && <table {...rest} className={classNames("progress-table border assignment-progress-progress w-100", rest.className)}>
        <thead>
            <SortItemHeader<ProgressSortOrder> 
                className="student-name ps-3 py-3" 
                defaultOrder={"name"} 
                reverseOrder={"name"} 
                currentOrder={sortOrder} setOrder={toggleSort} reversed={reverseOrder}
            >
                Name
            </SortItemHeader>
            {sortedProgress[0].questionPartResults?.[questionIndex]?.map((_, i) => 
                <th key={i} className="text-center">
                    Part {i + 1}
                </th>
            )}
        </thead>
        <tbody>
            {sortedProgress.map((studentProgress, studentIndex) => (
                <tr key={studentIndex}>
                    <th className="student-name py-3 fw-bold">
                        <Link className="d-flex justify-content-center align-items-center gap-2" to={`/progress/${studentProgress.user?.id}`} target="_blank">
                            <i className="icon icon-person icon-md" color="tertiary"/>
                            <span className="pe-3">
                                {studentProgress.user?.givenName}
                                <span className="d-none d-lg-inline"> {studentProgress.user?.familyName}</span>
                            </span>
                        </Link>
                    </th>
                    {studentProgress.questionPartResults && 
                        studentProgress.questionPartResults[questionIndex].map((questionPartResult, questionPartIndex) => (
                            <td key={questionPartIndex}>{getQuizQuestionPartCorrectnessIcon(questionPartResult)}</td>
                        ))}
                </tr>
            ))}
        </tbody>
    </table>;
}
