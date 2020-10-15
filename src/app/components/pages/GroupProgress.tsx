import React, {ComponentProps, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    Row,
    Spinner,
    UncontrolledButtonDropdown
} from "reactstrap"
import {getGroupProgress, loadAssignmentsOwnedByMe, loadBoard, loadGroups, loadProgress, openActiveModal} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {orderBy, sortBy} from "lodash";
import {
    AppAssignmentProgress,
    AppGroup,
    EnhancedGameboard,
    PageSettings,
    SingleProgressDetailsProps
} from "../../../IsaacAppTypes";
import {selectors} from "../../state/selectors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AssignmentDTO, GameboardDTO, GameboardItem, GameboardItemState, GameboardProgressSummaryDTO, UserGameboardProgressSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {API_PATH} from "../../services/constants";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {formatDate} from "../elements/DateString";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {getCSVDownloadLink, hasGameboard} from "../../services/assignments";
import {AnonymiseUsersCheckbox} from "../elements/AnonymiseUsersCheckbox";
import {isStaff} from "../../services/user";
import { isDefined } from '../../services/miscUtils';

function selectGroups(state: AppState) {
    if (state != null) {
        const gameboards: {[id: string]: GameboardDTO} = {};
        if (state.boards?.boards) {
            for (const board of state.boards.boards.boards) {
                gameboards[board.id as string] = board;
            }
        }

        const progress = selectors.assignments.progress(state);
        const assignments: { [id: number]: EnhancedAssignment[] } = {};
        if (state.assignmentsByMe) {
            for (const assignment of state.assignmentsByMe) {
                const assignmentId = assignment._id as number;
                const enhancedAssignment: EnhancedAssignment = {
                    ...assignment,
                    _id: assignmentId,
                    gameboard: (assignment.gameboard || gameboards[assignment.gameboardId as string]) as EnhancedGameboard,
                    progress: (progress && progress[assignmentId]) || undefined,
                };
                const groupId = assignment.groupId as number;
                if (groupId in assignments) {
                    assignments[groupId].push(enhancedAssignment);
                } else {
                    assignments[groupId] = [enhancedAssignment];
                }
            }
        }

        const activeGroups = selectors.groups.active(state);
        if (activeGroups) {
            const activeGroupsWithAssignments = activeGroups.map(g => {
                return {
                    ...g,
                    assignments: assignments[g.id as number] || []
                };
            });
            return {
                groups: activeGroupsWithAssignments
            };
        }
    }
    return {
        groups: null
    };
}

type EnhancedAssignment = AssignmentDTO & {
    gameboard: EnhancedGameboard;
    _id: number;
    progress?: AppAssignmentProgress[];
};

type AppGroupWithAssignments = AppGroup & {assignments: EnhancedAssignment[]};

interface GroupProgressPageProps {
    groups: AppGroupWithAssignments[] | null;
}

enum SortOrder {
    "Alphabetical" = "Alphabetical",
    "Date Created" = "Date Created"
}

interface GroupProgressLegendProps {
    pageSettings: PageSettings;
}

type GroupSummaryProps = GroupProgressPageProps & {
    group: AppGroupWithAssignments;
    pageSettings: PageSettings;
};

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

function computePartsCorrect(progress: GameboardProgressSummaryDTO[]) {
    const totalPartsCorrect = progress.map(gameboard => gameboard.questionPartsCorrect).reduce((a, e) => (a ?? 0) + (e ?? 0)) as number;
    const totalParts = progress.map(gameboard => gameboard.questionPartsTotal).reduce((a, e) => (a ?? 0) + (e ?? 0)) as number;

    return { totalPartsCorrect, totalParts }
}

function computePagesCorrect(progress: GameboardProgressSummaryDTO[]) {
    const totalPagesCorrect = progress.map(gameboard => gameboard.questionPagesPerfect).reduce((a, e) => (a ?? 0) + (e ?? 0)) as number;
    const totalPages = progress.map(gameboard => gameboard.questionPagesTotal).reduce((a, e) => (a ?? 0) + (e ?? 0)) as number;

    return { totalPagesCorrect, totalPages }
}

function formatPartsCorrect(progress: GameboardProgressSummaryDTO[], formatAsPercentage: boolean) {
    const { totalPartsCorrect, totalParts } = computePartsCorrect(progress);
    if (formatAsPercentage) {
        return totalParts !== 0 ? Math.round(100 * totalPartsCorrect / totalParts) + "%" : "100%";
    } else {
        return totalPartsCorrect + "/" + totalParts;
    }
}

function formatPagesCorrect(progress: GameboardProgressSummaryDTO[], formatAsPercentage: boolean) {
    const { totalPagesCorrect, totalPages } = computePagesCorrect(progress);
    if (formatAsPercentage) {
        return totalPages !== 0 ? Math.round(100 * totalPagesCorrect / totalPages) + "%" : "100%";
    } else {
        return totalPagesCorrect + "/" + totalPages;
    }
}

export const GroupProgressLegend = (props: GroupProgressLegendProps): JSX.Element => {
    const {pageSettings} = props;
    return <div className="p-4"><div className="assignment-progress-legend">
        <ul className="block-grid-xs-5">
            <li className="d-flex flex-wrap">
                <div className="key-cell">
                    <span className="completed"></span>
                </div>
                <div className="key-description">100% correct</div>
            </li>
            <li className="d-flex flex-wrap">
                <div className="key-cell"><span className="passed">&nbsp;</span>
                </div>
                <div className="key-description">&ge;{passMark * 100}% correct
                    {/*<span className="d-none d-xl-inline"> (or Mastery)</span>*/}
                </div>
            </li>
            <li className="d-flex flex-wrap">
                <div className="key-cell"><span className="in-progress">&nbsp;</span>
                </div>
                <div className="key-description">&lt;{passMark * 100}% correct</div>
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

const GroupSummary = (props: GroupSummaryProps) => {
    const dispatch = useDispatch();
    const {group, pageSettings} = props;
    const groupId = group.id || 0;
    const groupProgress = useSelector(selectors.groups.progress)?.[groupId];

    type SortOrder = number | "student-name" | "total-parts" | "total-questions";
    const [sortOrder, setSortOrder] = useState<SortOrder>("student-name");
    const [reverseOrder, setReverseOrder] = useState(false);

    const [selectedGameboardNumber, setSelectedGameboardNumber] = useState(0);

    useEffect(() => {
        dispatch(getGroupProgress(group));
    }, [dispatch]);

    if (!isDefined(groupProgress) || groupProgress.length === 0) return null;

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
        } else if (sortOrder === 'total-parts') {
            const { totalPartsCorrect, totalParts } = computePartsCorrect(item.progress || []);
            return totalPartsCorrect / totalParts;
        } else if (sortOrder === 'total-questions') {
            const { totalPagesCorrect, totalPages } = computePagesCorrect(item.progress || []);
            return totalPagesCorrect / totalPages;
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
        const clickToSelect = typeof itemOrder === "number" ? (() => setSelectedGameboardNumber(itemOrder)) : undefined;
        const sortArrows = (typeof itemOrder !== "number" || itemOrder === selectedGameboardNumber) ?
            <button className="sort" onClick={() => {toggleSort(itemOrder);}}>
                <span className="up" >▲</span>
                <span className="down">▼</span>
            </button>
            : undefined;
        return <th key={props.key} {...rest} className={className} onClick={clickToSelect}>{props.children}{sortArrows}</th>;
    }

    const tableHeaderFooter = <tr className="progress-table-header-footer">
        {sortItem({key: "student-name", itemOrder: "student-name"})}

        {(groupProgress?.[0]?.progress ?? []).map((gameboard, index) => {
            const link = <Link to={`/assignment_progress/${gameboard.assignmentId || 0}`}>{gameboard.gameboardTitle}</Link>
            return sortItem({key: gameboard.assignmentId, itemOrder: index, className: index === selectedGameboardNumber ? 'selected' : '', children: link})
        })}
        {sortItem({key: "total-parts", itemOrder: "total-parts", children: "Total Parts"})}
        {sortItem({key: "total-questions", itemOrder: "total-questions", children: "Total Qs"})}
    </tr>;

    return <div className={"group-progress-summary" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <GroupProgressLegend pageSettings={pageSettings}/>
        <div className="progress-table group-progress-summary mx-4 overflow-auto mw-100">
            <table className="table table-striped table-bordered table-sm mx-auto bg-white">
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
                                    {/* {fullAccess && formatMark(gameboard.questionPartsCorrect ?? 0, gameboard.questionPartsTotal ?? 1, pageSettings.formatAsPercentage)} */}
                                    {fullAccess && formatMark(gameboard.questionPagesPerfect ?? 0, gameboard.questionPagesTotal ?? 0, pageSettings.formatAsPercentage)}
                                </td>
                            })}
                            <td>{fullAccess && formatPartsCorrect(progress || [], pageSettings.formatAsPercentage)}</td>
                            <td>{fullAccess && formatPagesCorrect(progress || [], pageSettings.formatAsPercentage)}</td>
                        </tr>
                    })}
                </tbody>
                <tfoot>{tableHeaderFooter}</tfoot>
            </table>
        </div>
    </div>
};

function getGroupProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/assignments/assign/group/" + groupId + "/progress/download";
}

const GroupAssignmentProgress = (props: GroupSummaryProps) => {
    const dispatch = useDispatch();
    const {group} = props;

    // TODO FIXME IMPORTANT TURN THIS TO FALSE
    const [isExpanded, setExpanded] = useState(true);

    const assignmentCount = group.assignments.length;

    function openGroupDownloadLink(event: React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <React.Fragment>
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
        {isExpanded && <GroupSummary {...props} />}
    </React.Fragment>;
};

export function GroupProgress(props: GroupProgressPageProps): JSX.Element {
    const dispatch = useDispatch();
    const {groups} = useSelector(selectGroups);
    const user = useSelector(selectors.user.orNull);

    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);

    const pageSettings = {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage};

    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Alphabetical);

    let sortedGroups = groups;
    if (sortedGroups) {
        switch(sortOrder) {
            case SortOrder.Alphabetical:
                sortedGroups = sortBy(sortedGroups, g => g.groupName && g.groupName.toLowerCase());
                break;
            case SortOrder["Date Created"]:
                sortedGroups = sortBy(sortedGroups, g => g.created).reverse();
                break;
        }
    }

    useEffect(() => {
        dispatch(loadGroups(false));
        dispatch(loadAssignmentsOwnedByMe());
    }, [dispatch]);

    return <React.Fragment>
        <Container>
            <TitleAndBreadcrumb
                currentPageTitle={{[SITE.PHY]: "Group Progress", [SITE.CS]: "My markbook"}[SITE_SUBJECT]}
                subTitle="Track your class performance"
                help="Click on your groups to see the assignments you have set. View your students' progress by question."
            />
            <Row className="align-items-center d-none d-md-flex">
                {isStaff(user) && <AnonymiseUsersCheckbox className={"ml-2"}/>}
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
                {sortedGroups && sortedGroups.map(group => <GroupAssignmentProgress key={group.id} {...props} group={group} pageSettings={pageSettings} />)}
                {sortedGroups && sortedGroups.length === 0 && <Container className="py-5">
                    <h3 className="text-center">
                        You&apos;ll need to create a group using <Link to="/groups">Manage groups</Link> to set an assignment.
                    </h3>
                </Container>}
            </ShowLoading>
        </div>
    </React.Fragment>;
}
