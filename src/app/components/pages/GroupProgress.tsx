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
import {AssignmentDTO, GameboardDTO, GameboardItem, GameboardItemState} from "../../../IsaacApiTypes";
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

    useEffect(() => {
        dispatch(getGroupProgress(group));
    }, [dispatch]);

    if (!isDefined(groupProgress) || groupProgress.length === 0) return null;

    return <div className={"group-progress-summary" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <GroupProgressLegend pageSettings={pageSettings}/>
        {/* {JSON.stringify(groupProgress)} */}
        <div className="progress-table group-progress-summary mx-4 overflow-auto mw-100">
            <table className="table table-striped table-bordered table-sm mx-auto bg-white">
                <thead>
                    <tr className="user-progress-summary-header">
                        <th className="student-name"></th>
                        {(groupProgress?.[0]?.progress ?? []).map(gameboard => <th className="progress-cell text-center" key={gameboard.gameboardId}>
                            {gameboard.gameboardTitle}
                        </th>)}
                    </tr>
                </thead>
                <tbody className="">
                    {groupProgress?.map(userProgress => {
                        const {user, progress} = userProgress;
                        const fullAccess = user?.authorisedFullAccess;
                        return <tr className={`user-progress-summary-row ${fullAccess ? '' : 'revoked'}`} key={userProgress.user?.id}>
                            {user && <td className="student-name">
                                <Link to={`/progress/${user.id}`} target="_blank">
                                    {`${user.givenName} ${user.familyName}`}
                                </Link>
                            </td>}
                            {(progress ?? []).map(gameboard => {
                                const correctRate = (gameboard.questionPartsCorrect ?? 0) / (gameboard.questionPartsTotal ?? 1);
                                const incorrectRate = (gameboard.questionPartsIncorrect ?? 0) / (gameboard.questionPartsTotal ?? 1);
                                const notAttemptedRate = (gameboard.questionPartsNotAttempted ?? 0) / (gameboard.questionPartsTotal ?? 1);
                                let rateClass = '';
                                if (user?.authorisedFullAccess) {
                                    rateClass = 'revoked';
                                } else if (incorrectRate >= 0.25) {
                                    rateClass = 'failed';
                                } else if (correctRate >= 1.0) {
                                    rateClass = 'completed';
                                } else if (correctRate >= 0.75) {
                                    rateClass = 'passed';
                                } else if (notAttemptedRate < 1.0 && correctRate < 0.75 && incorrectRate < 0.25) {
                                    rateClass = 'in-progress';
                                } else if (notAttemptedRate >= 0.0) {
                                    rateClass = 'not-attemptetd';
                                }
                                return <td className={`${rateClass} progress-cell text-center`} key={gameboard.gameboardId}>
                                    {fullAccess && formatMark(gameboard.questionPartsCorrect ?? 0, gameboard.questionPartsTotal ?? 1, pageSettings.formatAsPercentage)}
                                </td>
                            })}
                        </tr>
                    })}
                </tbody>
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

    const [isExpanded, setExpanded] = useState(true);

    const assignmentCount = group.assignments.length;

    function openGroupDownloadLink(event: React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        //showDownloadModal(event.currentTarget.href);
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <React.Fragment>
        <div onClick={() => setExpanded(!isExpanded)} onKeyPress={() => setExpanded(!isExpanded)} role="button" tabIndex={0} className={isExpanded ? "assignment-progress-group active align-items-center" : "assignment-progress-group align-items-center"}>
            <div className="group-name"><span className="icon-group"/><span>{group.groupName}</span></div>
            <div className="flex-grow-1" />
            <div className="py-2"><strong>{assignmentCount}</strong> Assignment{assignmentCount !== 1 && "s"}<span className="d-none d-md-inline"> set</span></div>
            <div className="d-none d-md-inline-block"><a href={getGroupProgressCSVDownloadLink(group.id as number)} target="_blank" rel="noopener" onClick={openGroupDownloadLink}>(Download Group CSV)</a></div>
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

    let sortedGroups = groups;//?.filter(group => group.assignments.length > 0);
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
            {/* {JSON.stringify(sortedGroups)} */}
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
