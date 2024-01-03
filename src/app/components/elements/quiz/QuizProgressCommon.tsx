import React, {ComponentProps, useContext, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Button} from "reactstrap";
import {AppAssignmentProgress, AssignmentProgressPageSettingsContext} from "../../../../IsaacAppTypes";
import {siteSpecific, TODAY} from "../../../services";
import {Link} from "react-router-dom";
import orderBy from "lodash/orderBy";
import { IsaacSpinner } from "../../handlers/IsaacSpinner";
import { closeActiveModal, openActiveModal, useAppDispatch, useReturnQuizToStudentMutation } from "../../../state";

export const ICON = siteSpecific(
    {
        correct: <svg style={{width: 30, height: 30}}><use href={`/assets/tick-rp-hex.svg#icon`} xlinkHref={`/assets/tick-rp-hex.svg#icon`}/></svg>,
        incorrect: <svg style={{width: 30, height: 30}}><use href={`/assets/cross-rp-hex.svg#icon`} xlinkHref={`/assets/cross-rp-hex.svg#icon`}/></svg>,
        notAttempted: <svg  style={{width: 30, height: 30}}><use href={`/assets/dash-hex.svg#icon`} xlinkHref={`/assets/dash-hex.svg#icon`}/></svg>,
    },
    {
        correct: <img src="/assets/tick-rp.svg" alt="Correct" style={{width: 30}} />,
        incorrect: <img src="/assets/cross-rp.svg" alt="Incorrect" style={{width: 30}} />,
        notAttempted: <img src="/assets/dash.svg" alt="Not attempted" style={{width: 30}} />,
    }
);

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

export interface QuestionType {
    id?: string | undefined;
    title?: string | undefined;
    questionPartsTotal?: number | undefined;
}

export interface ResultsTableProps<Q extends QuestionType> {
    assignmentId?: number;
    duedate?: Date;
    progress?: AppAssignmentProgress[];
    questions: Q[];
    header: JSX.Element;
    getQuestionTitle: (question: Q) => JSX.Element;
    assignmentAverages: number[];
    assignmentTotalQuestionParts: number;
    markClasses: (row: AppAssignmentProgress, assignmentTotalQuestionParts: number) => string;
    markQuestionClasses: (row: AppAssignmentProgress, questionIndex: number) => string;
    isQuiz?: boolean;
}

export function ResultsTable<Q extends QuestionType>({assignmentId,
                                                     duedate,
                                                     progress,
                                                     questions,
                                                     header,
                                                     getQuestionTitle,
                                                     assignmentAverages,
                                                     assignmentTotalQuestionParts,
                                                     markClasses,
                                                     markQuestionClasses,
                                                     isQuiz} : ResultsTableProps<Q>) {

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
                <Button key={1} color="primary" outline target="_blank" onClick={() => dispatch(closeActiveModal())}>
                    Cancel
                </Button>,
                <Button key={0} color="primary" target="_blank" onClick={confirm}>
                    Confirm
                </Button>,
        ]
        }));
    };

    type SortOrder = number | "name" | "totalQuestionPartPercentage" | "totalQuestionPercentage";
    const [sortOrder, setSortOrder] = useState<SortOrder>("name");
    const [reverseOrder, setReverseOrder] = useState(false);
    
    function isSelected(q: Q) {
        return q == selectedQuestion ? "selected" : "";
    }

    function sortClasses(q: SortOrder) {
        if (q === sortOrder) {
            return "sorted" + (reverseOrder ? " reverse" : " forward");
        } else {
            return "";
        }
    }

    function toggleSort(itemOrder: SortOrder) {
        setSortOrder(itemOrder);
        if (sortOrder === itemOrder) {
            setReverseOrder(!reverseOrder);
        } else {
            setReverseOrder(false);
        }
    }

    function sortItem(props: ComponentProps<"th"> & {itemOrder: SortOrder}) {
        const {itemOrder, ...rest} = props;
        const className = (props.className || "") + " " + sortClasses(itemOrder);
        const clickToSelect = typeof itemOrder === "number" ? (() => setSelectedQuestionNumber(itemOrder)) : undefined;
        const sortArrows = (typeof itemOrder !== "number" || itemOrder === selectedQuestionNumber) ?
            <button className="sort" onClick={() => {toggleSort(itemOrder);}}>
                <span className="up" >▲</span>
                <span className="down">▼</span>
            </button>
            : undefined;
        return <th key={props.key} {...rest} className={className} onClick={clickToSelect}>{props.children}{sortArrows}</th>;
    }

    const semiSortedProgress = useMemo(() => orderBy(progress, (item) => {
        return item.user.authorisedFullAccess && -item.notAttemptedPartResults.reduce(function(sum, increment) {return sum + increment;}, 0);
    }, [reverseOrder ? "desc" : "asc"]), [progress, reverseOrder]);

    const sortedProgress = useMemo(() => orderBy((semiSortedProgress), (item) => {
            switch (sortOrder) {
                case "name":
                    return (item.user.familyName + ", " + item.user.givenName).toLowerCase();
                case "totalQuestionPartPercentage":
                    return -item.correctQuestionPartsCount;
                case "totalQuestionPercentage":
                    return -item.tickCount;
                default:
                    return -item.correctPartResults[sortOrder];
            }
        }, [reverseOrder ? "desc" : "asc"])
    , [semiSortedProgress, reverseOrder, sortOrder]);

    const tableHeaderFooter = <tr className="progress-table-header-footer">
        {sortItem({key: "name", itemOrder: "name", className: "student-name"})}
        {questions.map((q, index) =>
            sortItem({key: q.id, itemOrder: index, className: isSelected(q), children: `${assignmentAverages[index]}%`})
        )}
        {isQuiz ? <>
            {sortItem({key: "totalQuestionPartPercentage", itemOrder: "totalQuestionPartPercentage", className:"total-column left", children: "Total Parts"})}
            {sortItem({key: "totalQuestionPercentage", itemOrder: "totalQuestionPercentage", className:"total-column right", children: "Total Qs"})}
        </> : 
        <>
            {sortItem({key: "totalQuestionPartPercentage", itemOrder: "totalQuestionPartPercentage", className:"total-column", children: "Overall"})}
        </>
    }
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
        {header}
        {progress && progress.length > 0 && <>
            <div className="progress-questions">
                <Button color="tertiary" disabled={selectedQuestionNumber == 0}
                    onClick={() => setSelectedQuestionNumber(selectedQuestionNumber - 1)}>◄</Button>
                <div>
                    {getQuestionTitle(selectedQuestion)}
                </div>
                <Button color="tertiary" disabled={selectedQuestionNumber === questions.length - 1}
                    onClick={() => setSelectedQuestionNumber(selectedQuestionNumber + 1)}>►</Button>
            </div>
            <div className="assignment-progress-table-wrapper">
                <table ref={tableRef} className="progress-table w-100 border">
                    <thead>
                        {tableHeaderFooter}
                    </thead>
                    <tbody>
                        {sortedProgress.map((studentProgress, index) => {
                            const fullAccess = studentProgress.user.authorisedFullAccess;
                            return <tr key={studentProgress.user.id} className={`${markClasses(studentProgress, assignmentTotalQuestionParts)}${fullAccess ? "" : " not-authorised"}`} title={`${studentProgress.user.givenName + " " + studentProgress.user.familyName}`}>
                                <th className="student-name">
                                    {fullAccess && pageSettings.isTeacher ?
                                        (
                                            isQuiz ?
                                            <>
                                                <Button className="quiz-student-menu" color="link" onClick={() => toggle(index)} disabled={returningQuizToStudent}>
                                                    <div
                                                        className="quiz-student-name"
                                                    >
                                                        {studentProgress.user.givenName}
                                                        <span className="d-none d-lg-inline"> {studentProgress.user.familyName}</span>
                                                    </div>
                                                    <div className="quiz-student-menu-icon">
                                                        {returningQuizToStudent ? <IsaacSpinner size="sm" /> : <img src="/assets/menu.svg" alt="Menu" />}
                                                    </div>
                                                </Button>
                                                {!returningQuizToStudent && dropdownOpen?.[index] && <>
                                                    {duedate && duedate.valueOf() > TODAY().valueOf() &&
                                                        (studentProgress.completed) &&
                                                        <div className="py-2 px-3">
                                                            <Button size="sm" onClick={() => returnToStudent(studentProgress.user.id)}>Allow another attempt</Button>
                                                        </div>}
                                                    <div className="py-2 px-3">
                                                        <Button size="sm" tag={Link} to={`/test/attempt/feedback/${assignmentId}/${studentProgress.user.id}`}>View answers</Button>
                                                    </div>
                                                </>}
                                            </>
                                            : <Link to={`/progress/${studentProgress.user.id}`} target="_blank">
                                                {studentProgress.user.givenName}
                                                <span className="d-none d-lg-inline"> {studentProgress.user.familyName}</span>
                                            </Link>
                                        ) :
                                        <span>{studentProgress.user.givenName} {studentProgress.user.familyName}</span>
                                    }
                                </th>
                                {questions.map((q, index) =>
                                    <td key={q.id} className={isSelected(questions[index]) + " " + markQuestionClasses(studentProgress, index)} onClick={() => setSelectedQuestionNumber(index)}>
                                        {(assignmentTotalQuestionParts === questions.length) ?
                                            studentProgress.correctPartResults[index] === 1 ? ICON.correct :
                                            studentProgress.incorrectPartResults[index] === 1 ? ICON.incorrect :
                                            /* default */ ICON.notAttempted
                                        : 
                                        fullAccess ? formatMark(studentProgress.correctPartResults[index],
                                            questions[index].questionPartsTotal as number,
                                            pageSettings.formatAsPercentage) : ""
                                        }
                                    </td> 
                                )}
                                {isQuiz ? <>
                                    <th className="total-column left" title={fullAccess ? undefined : "Not Sharing"}>
                                        {fullAccess ? formatMark(studentProgress.correctQuestionPartsCount,
                                            assignmentTotalQuestionParts,
                                            pageSettings.formatAsPercentage) : ""}
                                    </th>
                                    <th className="total-column right" title={fullAccess ? undefined : "Not Sharing"}>
                                        {fullAccess ? formatMark(studentProgress.tickCount,
                                            questions.length,
                                            pageSettings.formatAsPercentage) : ""}
                                    </th>
                                </> : 
                                    <th className="total-column" title={fullAccess ? undefined : "Not Sharing"}>
                                        {fullAccess ? formatMark(studentProgress.correctQuestionPartsCount,
                                            assignmentTotalQuestionParts,
                                            pageSettings.formatAsPercentage) : ""}
                                    </th>
                                }
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        {tableHeaderFooter}
                    </tfoot>
                </table>
            </div>
        </>}
    </div>;
}
