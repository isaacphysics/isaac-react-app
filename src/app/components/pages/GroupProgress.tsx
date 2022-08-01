import React, {ComponentProps, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    Row,
    UncontrolledButtonDropdown
} from "reactstrap"
import {getGroupProgress, loadGroups, openActiveModal} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {orderBy, sortBy} from "lodash";
import {
    AppGroup,
    AssignmentProgressPageSettingsContext,
} from "../../../IsaacAppTypes";
import {selectors} from "../../state/selectors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    GameboardProgressSummaryDTO,
    UserGameboardProgressSummaryDTO
} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {API_PATH} from "../../services/constants";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {siteSpecific} from "../../services/siteConstants";
import {isDefined, isFound} from '../../services/miscUtils';
import {formatDate} from "../elements/DateString";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {useAssignmentProgressAccessibilitySettings} from "../../services/progress";
import {isaacApi} from "../../state/slices/api";
import {useGroupAssignments} from "../../state/slices/api/assignments";

enum SortOrder {
    "Alphabetical" = "Alphabetical",
    "Date Created" = "Date Created"
}

const passMark = 0.75;

function formatMark(numerator: number, denominator: number, formatAsPercentage: boolean) {
    let result;
    if (formatAsPercentage) {
        result = denominator !== 0 ? Math.round(100 * numerator / denominator) + "%" : "100%";
    } else {
        result = numerator + "/" + denominator;
    }
    return result;
}

function computePagesCorrect(progress: GameboardProgressSummaryDTO[]) {
    const totalPagesCorrect = progress.map(gameboard => gameboard.questionPagesPerfect).reduce((a, e) => (a ?? 0) + (e ?? 0)) as number;
    const totalPages = progress.map(gameboard => gameboard.questionPagesTotal).reduce((a, e) => (a ?? 0) + (e ?? 0)) as number;

    return { totalPagesCorrect, totalPages };
}

function computeAssignmentsCompleted(progress: GameboardProgressSummaryDTO[]) {
    const totalAssignments = progress.length;
    const assignmentsCompleted = progress.reduce((a,i) => i.questionPagesPerfect === i.questionPagesTotal ? a += 1 : a, 0);

    return { assignmentsCompleted, totalAssignments };
}

function formatPagesCorrect(progress: GameboardProgressSummaryDTO[], formatAsPercentage: boolean) {
    const { totalPagesCorrect, totalPages } = computePagesCorrect(progress);
    if (formatAsPercentage) {
        return totalPages !== 0 ? Math.round(100 * totalPagesCorrect / totalPages) + "%" : "100%";
    } else {
        return totalPagesCorrect + "/" + totalPages;
    }
}

function formatAssignmentsCompleted(progress: GameboardProgressSummaryDTO[], formatAsPercentage: boolean) {
    const { assignmentsCompleted, totalAssignments } = computeAssignmentsCompleted(progress);
    if (formatAsPercentage) {
        return totalAssignments !== 0 ? Math.round(100 * assignmentsCompleted / totalAssignments) + "%" : "100%";
    } else {
        return assignmentsCompleted + "/" + totalAssignments;
    }
}

export const GroupProgressLegend = () => {
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);
    return <div className="p-4"><div className="assignment-progress-legend">
        <ul className="block-grid-xs-5">
            <li className="d-flex flex-wrap">
                <div className="key-cell">
                    <span className="completed"></span>
                </div>
                <div className="key-description">100% completed</div>
            </li>
            <li className="d-flex flex-wrap">
                <div className="key-cell"><span className="passed">&nbsp;</span>
                </div>
                <div className="key-description">&ge;{passMark * 100}% completed
                    {/*<span className="d-none d-xl-inline"> (or Mastery)</span>*/}
                </div>
            </li>
            <li className="d-flex flex-wrap">
                <div className="key-cell"><span className="in-progress">&nbsp;</span>
                </div>
                <div className="key-description">&lt;{passMark * 100}% completed</div>
            </li>
            <li className="d-flex flex-wrap">
                <div className="key-cell"><span>&nbsp;</span>
                </div>
                <div className="key-description"><span className="d-none d-md-inline">Not attempted</span><span
                    className="d-inline d-md-none">No attempt</span></div>
            </li>
            <li className="d-flex flex-wrap">
                <div className="key-cell"><span className="failed">&nbsp;</span>
                </div>
                <div className="key-description">&gt;{100 -(passMark * 100)}% incorrect</div>
            </li>
        </ul>
        <div className="assignment-progress-options">
            <label>Colour-blind&nbsp;<input type="checkbox" checked={pageSettings.colourBlind} onChange={e => pageSettings.setColourBlind(e.target.checked)}/></label>
            <label>Percent view&nbsp;<input type="checkbox" checked={pageSettings.formatAsPercentage} onChange={e => pageSettings.setFormatAsPercentage(e.target.checked)}/></label>
        </div>
    </div></div>
};

const GroupSummary = ({group}: {group: AppGroup}) => {
    const dispatch = useAppDispatch();
    const groupId = group.id || 0;

    const groupProgress = useAppSelector(selectors.groups.progress)?.[groupId];
    useEffect(() => {
        dispatch(getGroupProgress(group));
    }, [dispatch]);

    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    type SortOrder = number | "student-name" | "total-questions" | "assignments-completed";
    const [sortOrder, setSortOrder] = useState<SortOrder>("student-name");
    const [reverseOrder, setReverseOrder] = useState(false);

    const [selectedGameboardNumber, setSelectedGameboardNumber] = useState(0);
    const [_selectedGameboardTitle, setSelectedGameboardTitle] = useState("");

    const tableRef = useRef<HTMLTableElement>(null);

    useLayoutEffect(() => {
        const table = tableRef.current;
        if (table) {
            const parentElement = table.parentElement as HTMLElement;
            const firstRow = (table.firstChild as HTMLTableSectionElement).firstChild as HTMLTableRowElement;
            const questionTH = firstRow.children[selectedGameboardNumber + 1] as HTMLTableHeaderCellElement;

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
            if (isDefined(newScrollLeft)) {
                parentElement.scrollLeft = newScrollLeft;
            }
        }
    }, [selectedGameboardNumber]);

    if (isDefined(groupProgress) && groupProgress.length === 0) {
        return null;
    }

    function markClasses(fullAccess: boolean, correctParts: number, incorrectParts: number, totalParts: number, _passMark: number) {
        if (!fullAccess) {
            return "revoked";
        } else if (correctParts === totalParts) {
            return "completed";
        } else if ((correctParts / totalParts) >= _passMark) {
            return "passed";
        } else if ((incorrectParts / totalParts) > (1 - _passMark)) {
            return "failed";
        } else if (correctParts > 0 || incorrectParts > 0) {
            return "in-progress";
        } else {
            return "not-attempted";
        }
    }

    const sortedProgress = orderBy(groupProgress, (item: UserGameboardProgressSummaryDTO) => {
        if (sortOrder === 'student-name') {
            return (item.user?.familyName + ", " + item.user?.givenName).toLowerCase();
        } else if (sortOrder === 'total-questions') {
            const { totalPagesCorrect, totalPages } = computePagesCorrect(item.progress || []);
            return totalPagesCorrect / totalPages;
        } else if (sortOrder === 'assignments-completed') {
            const { assignmentsCompleted, totalAssignments } = computeAssignmentsCompleted(item.progress || []);
            return assignmentsCompleted / totalAssignments;
        } else if (typeof sortOrder === 'number') {
            return (item?.progress?.[sortOrder]?.questionPartsCorrect || 0)
        }
    }, [reverseOrder ? "desc" : "asc"]);

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
        const className = (props.className || "") + " py-2 " + sortClasses(itemOrder);
        const clickToSelect = typeof itemOrder === "number" ? (() => {
            setSelectedGameboardNumber(itemOrder);
            setSelectedGameboardTitle(groupProgress?.[0]?.progress?.[itemOrder].gameboardTitle || "");
        }) : undefined;
        const sortArrows = (typeof itemOrder !== "number" || itemOrder === selectedGameboardNumber) ?
            <button className="sort" onClick={() => {toggleSort(itemOrder);}}>
                <span className="up" >▲</span>
                <span className="down">▼</span>
            </button>
            : undefined;
        return <th scope="col" key={props.key} {...rest} className={className} onClick={clickToSelect}>{props.children}{sortArrows}</th>;
    }

    const totalAssignments = (groupProgress?.[0]?.progress || []).length;
    const assignmentsProgress = [];
    for (let i = 0; i < totalAssignments; ++i) {
        assignmentsProgress.push((groupProgress || []).map(summary => summary?.progress?.[i] ));
    }
    const assignmentsCompletion = assignmentsProgress.map(p => {
        return p.reduce((a, e) => ({
            questionPagesPerfect: (a?.questionPagesPerfect || 0) + (e?.questionPagesPerfect || 0),
            questionPagesTotal: (a?.questionPagesTotal || 0) + (e?.questionPagesTotal || 0)
        }));
    })

    const tableHeaderFooter = <tr className="progress-table-header-footer">
        {sortItem({key: "student-name", itemOrder: "student-name"})}

        {(groupProgress?.[0]?.progress ?? []).map((gameboard, index) => {
            const currentAssignmentCompletion = assignmentsCompletion[index];
            const completionPercentage = formatMark(currentAssignmentCompletion?.questionPagesPerfect || 0, currentAssignmentCompletion?.questionPagesTotal || 1, true)
            return sortItem({key: gameboard.assignmentId, itemOrder: index, className: `mw-25 ${index === selectedGameboardNumber ? 'selected' : ''}`, children: completionPercentage})
        })}
        {sortItem({key: "total-questions", itemOrder: "total-questions", className: "total-column left pr-4 pl-4", children: "Total Qs"})}
        {sortItem({key: "assignments-completed", itemOrder: "assignments-completed", className: "total-column right pr-4 pl-4", children: "Assignments completed"})}
    </tr>;

    const selectedGameboard = groupProgress?.[0]?.progress?.[selectedGameboardNumber];

    return <ShowLoading until={groupProgress} placeholder={<div className="w-100 text-center"><IsaacSpinner color="secondary" /></div>}>
        <div className={"group-progress-summary" + (pageSettings.colourBlind ? " colour-blind" : "")}>
            <GroupProgressLegend/>
            <div className="progress-questions mx-4">
                <Button color="tertiary" disabled={selectedGameboardNumber === 0}
                    onClick={() => setSelectedGameboardNumber(selectedGameboardNumber - 1)}>◄</Button>
                <div><Link
                    to={`/assignment_progress/${selectedGameboard?.assignmentId || -1}?board=${selectedGameboard?.gameboardId}`} target="_blank"><strong>A<span className="d-none d-md-inline">ssignment</span>: </strong>{selectedGameboard?.gameboardTitle}
                </Link>
                <span className="ml-3"></span>
                {selectedGameboard?.dueDate && <small className="font-weight-bold text-muted">(Due date: {formatDate(selectedGameboard?.dueDate)})</small>}
                {!selectedGameboard?.creationDate && <small>(Date Created: {formatDate(selectedGameboard?.creationDate)})</small>}
                </div>
                <Button color="tertiary" disabled={selectedGameboardNumber === (groupProgress?.[0]?.progress || []).length - 1}
                    onClick={() => setSelectedGameboardNumber(selectedGameboardNumber + 1)}>►</Button>
            </div>
            <div className="progress-table mx-4">
                <table ref={tableRef}>
                    <thead>{tableHeaderFooter}</thead>
                    <tbody className="">
                        {(sortedProgress || []).map(userProgress => {
                            const {user, progress} = userProgress;
                            const fullAccess = user?.authorisedFullAccess || false;
                            return <tr className={`user-progress-summary-row ${fullAccess ? '' : 'revoked'}`} key={userProgress.user?.id}>
                                {user && <th className="student-name py-2">
                                    <Link to={`/progress/${user.id}`} target="_blank">
                                        {`${user.givenName} ${user.familyName}`}
                                    </Link>
                                </th>}
                                {(progress ?? []).map((gameboard, index) => {
                                    /* Do we still base this on question parts or should we move to question pages?
                                       Do we want to give users the option to switch between the two? (hint: NO) */
                                    const rateClass = markClasses(fullAccess,
                                                                gameboard.questionPartsCorrect ?? 0,
                                                                gameboard.questionPartsIncorrect ?? 0,
                                                                gameboard.questionPartsTotal ?? 1,
                                                                gameboard.passMark ?? passMark
                                                               );
                                    return <td className={`py-2 ${rateClass} ${index === selectedGameboardNumber ? 'selected' : ''} progress-cell text-center`} key={gameboard.assignmentId}>
                                        {fullAccess && formatMark(gameboard.questionPagesPerfect ?? 0, gameboard.questionPagesTotal ?? 0, pageSettings.formatAsPercentage)}
                                    </td>
                                })}
                                <th className="total-column left" title={fullAccess ? undefined : "Not Sharing"}>
                                    {fullAccess && formatPagesCorrect(progress || [], pageSettings.formatAsPercentage)}
                                </th>
                                <th className="total-column right" title={fullAccess ? undefined : "Not Sharing"}>
                                    {fullAccess && formatAssignmentsCompleted(progress || [], pageSettings.formatAsPercentage)}
                                </th>
                            </tr>
                        })}
                    </tbody>
                    <tfoot>{tableHeaderFooter}</tfoot>
                </table>
            </div>
        </div>
    </ShowLoading>
};

function getGroupProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/assignments/assign/group/" + groupId + "/progress/download";
}

const GroupAssignmentProgress = ({group}: {group: AppGroup}) => {
    const [isExpanded, setExpanded] = useState(false);

    const {assignmentCount, openGroupDownloadLink} = useGroupAssignments(group.id);

    return <>
        <div onClick={() => setExpanded(!isExpanded)} onKeyPress={() => setExpanded(!isExpanded)} role="button" tabIndex={0} className={isExpanded ? "assignment-progress-group active align-items-center" : "assignment-progress-group align-items-center"}>
            <div className="group-name"><span className="icon-group"/><span>{group.groupName}</span></div>
            <div className="flex-grow-1" />
            <div className="py-2"><strong>{assignmentCount}</strong> Assignment{assignmentCount !== 1 && "s"}<span className="d-none d-md-inline"> set</span></div>
            <div className="d-none d-md-inline-block"><a href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openGroupDownloadLink}>(Download Detailed Group CSV)</a></div>
            <Button color="link" className="px-2" tabIndex={0} onClick={() => setExpanded(!isExpanded)}>
                <img src="/assets/icon-expand-arrow.png" alt="" className="accordion-arrow" />
                <span className="sr-only">{isExpanded ? "Hide" : "Show"}{` ${group.groupName} assignments`}</span>
            </Button>
        </div>
        {isExpanded && <GroupSummary group={group} />}
    </>;
};

export const GroupProgress = () => {
    const dispatch = useAppDispatch();

    const groups = useAppSelector(selectors.groups.active);
    useEffect(() => {
        dispatch(loadGroups(false));
    }, [dispatch]);

    const pageSettings = useAssignmentProgressAccessibilitySettings();

    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Alphabetical);

    const sortedGroups = useMemo(() => {
        if (!groups) return groups;
        switch(sortOrder) {
            case SortOrder.Alphabetical:
                return sortBy(groups, g => g.groupName && g.groupName.toLowerCase());
            case SortOrder["Date Created"]:
                return sortBy(groups, g => g.created).reverse();
        }
    }, []);

    return <>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={siteSpecific("Group Progress", "My markbook")}
                subTitle="Track your group performance by assignment"
                help={<span>
                    Click on your groups to see the assignments you have set. View your students' progress by question.
                </span>}
            />
            <Row className="align-items-center d-none d-md-flex">
                <Col className="text-right">
                    <Label className="pr-2">Sort groups:</Label>
                    <UncontrolledButtonDropdown size="sm">
                        <DropdownToggle color="tertiary" className="border" caret>
                            {sortOrder}
                        </DropdownToggle>
                        <DropdownMenu>
                            {Object.values(SortOrder).map(item =>
                                <DropdownItem key={item} onClick={() => setSortOrder(item)}>{item}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </Col>
            </Row>
        </Container>
        <div className="assignment-progress-container mb-5">
            <ShowLoading until={sortedGroups}>
                <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                    {sortedGroups && sortedGroups.map(group => <GroupAssignmentProgress key={group.id} group={group} />)}
                </AssignmentProgressPageSettingsContext.Provider>
                {sortedGroups && sortedGroups.length === 0 && <Container className="py-5">
                    <h3 className="text-center">
                        You&apos;ll need to create a group using <Link to="/groups">Manage groups</Link> to set an assignment.
                    </h3>
                </Container>}
            </ShowLoading>
        </div>
    </>;
}
