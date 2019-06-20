import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    Container,
    Row,
    Col,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Label, Spinner
} from "reactstrap"
import {loadGroups, loadAssignmentsOwnedByMe, loadBoard} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {sortBy} from "lodash";
import {AppGroup} from "../../../IsaacAppTypes";
import {groups} from "../../state/selectors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AssignmentDTO, GameboardDTO} from "../../../IsaacApiTypes";

type AppGroupWithAssignments = AppGroup & {assignments: AssignmentDTO[]};

const stateFromProps = (state: AppState) => {
    if (state != null) {
        const gameboards: { [id: string]: GameboardDTO} = {};
        if (state.boards && state.boards.boards) {
            state.boards.boards.boards.forEach(board => {
                gameboards[board.id as string] = board;
            });
        }
        const assignments: { [id: number]: AssignmentDTO[] } = {};
        if (state.assignmentsByMe) {
            state.assignmentsByMe.forEach(assignment => {
                const id = assignment.groupId as number;
                assignment.gameboard = assignment.gameboard || gameboards[assignment.gameboardId as string];
                if (id in assignments) {
                    assignments[id].push(assignment);
                } else {
                    assignments[id] = [assignment];
                }
            });
        }

        const activeGroups = groups.active(state);
        if (activeGroups) {
            const activeGroupsWithAssignments = activeGroups.map(g => {
                const gWithAssignments = g as AppGroupWithAssignments;
                gWithAssignments.assignments = assignments[g.id as number] || [];
                return gWithAssignments;
            });
            return {groups: activeGroupsWithAssignments};
        }
    }
    return {
        groups: null
    };
};

const dispatchFromProps = {loadGroups, loadAssignmentsOwnedByMe, loadBoard};

interface AssignmentProgressPageProps {
    groups: AppGroupWithAssignments[] | null;
    loadGroups: (getArchived: boolean) => void;
    loadAssignmentsOwnedByMe: () => void;
    loadBoard: (boardId: string) => void;
}

enum SortOrder {
    "Alphabetical" = "Alphabetical",
    "Date Created" = "Date Created"
}

interface PageSettings {
    colourBlind: boolean;
    setColourBlind: (newValue: boolean) => void;
    formatAsPercentage: boolean;
    setFormatAsPercentage: (newValue: boolean) => void;
}

type GroupAssignmentProgressProps = AssignmentProgressPageProps & {
    group: AppGroupWithAssignments;
    pageSettings: PageSettings;
};

const passMark = 0.75;

function formatDate(date: number | Date | undefined) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString();
}

const GroupAssignmentProgressDetails = (props: GroupAssignmentProgressProps) => {
    const {group, pageSettings, loadBoard} = props;

    const gameboardIs = group.assignments.map(assignment => assignment.gameboardId as string);
    const joinedGameboardIds = gameboardIs.join(",");
    useEffect( () => {
        gameboardIs.forEach(gameboardId => loadBoard(gameboardId));
    }, [joinedGameboardIds]);

    const gameboardsLoaded = group.assignments.every(assignment => assignment.gameboard != null);

    return <div className={"assignment-progress-details" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <div className="p-4"><div className="assignment-progress-legend">
            <ul className="block-grid-xs-5">
                <li>
                    <div className="key-cell"><span className="completed">&nbsp;</span>
                    </div>
                    <div className="key-description">100% correct</div>
                </li>
                <li>
                    <div className="key-cell"><span className="passed">&nbsp;</span>
                    </div>
                    <div className="key-description">&ge;{passMark * 100}% correct
                        <span className="d-none d-md-inline"> (or Mastery)</span></div>
                </li>
                <li>
                    <div className="key-cell"><span className="in-progress">&nbsp;</span>
                    </div>
                    <div className="key-description">&lt;{passMark * 100}% correct</div>
                </li>
                <li>
                    <div className="key-cell"><span>&nbsp;</span>
                    </div>
                    <div className="key-description"><span className="d-none d-md-inline">Not attempted</span><span
                        className="d-inline d-md-none">No attempt</span></div>
                </li>
                <li>
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
        {gameboardsLoaded ? group.assignments.map(assignment => assignment.gameboard && <div className="assignment-progress-gameboard" key={assignment.gameboardId}>
            <div className="gameboard-header">
                <div className="gameboard-title">
                    <span>{assignment.gameboard.title}{assignment.dueDate && <span className="gameboard-due-date">(Due: {formatDate(assignment.dueDate)})</span>}</span>
                </div>
            </div>
        </div>) : <div className="p-4 text-center"><Spinner color="primary" style={{width: "3rem", height: "3rem"}} /></div>}
    </div>;
};

const GroupAssignmentProgress = (props: GroupAssignmentProgressProps) => {
    const {group} = props;
    const [isExpanded, setExpanded] = useState(false);

    const assignmentCount = group.assignments.length;

    return <React.Fragment>
        <Row onClick={() => setExpanded(!isExpanded)} className={isExpanded ? "assignment-progress-group active" : "assignment-progress-group"}>
            <Col className="group-name"><span className="icon-group"/><span>{group.groupName}</span></Col>
            <Col className="flex-grow-1" />
            <Col><strong>{assignmentCount}</strong> Assignment{assignmentCount != 1 && "s"} set</Col>
            <Col className="d-none d-md-block"><a href="">(Download Group CSV)</a></Col>
            <Col><img src="/assets/icon-expand-arrow.png" alt="" className="accordion-arrow" /></Col>
        </Row>
        {isExpanded && <GroupAssignmentProgressDetails {...props} />}
    </React.Fragment>;
};

const AssignmentProgressPageComponent = (props: AssignmentProgressPageProps) => {
    const {groups, loadGroups, loadAssignmentsOwnedByMe} = props;

    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);

    const pageSettings = {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage};

    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Alphabetical);

    let data = groups;
    if (data) {
        switch(sortOrder) {
            case SortOrder.Alphabetical:
                data = sortBy(data, g => g.groupName && g.groupName.toLowerCase());
                break;
            case SortOrder["Date Created"]:
                data = sortBy(data, g => g.created).reverse();
                break;
        }
    }

    useEffect(() => {
        loadGroups(false);
        loadAssignmentsOwnedByMe();
    }, []);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Assignment Progress" subTitle="Track your class performance" intermediateCrumbs={[{title: "Teachers", to: "#"}]} help="Click on your groups to see the assignments you have set. View your students' progress by question." />
        <Row className="align-items-center d-none d-md-flex">
            <Col className="text-right">
                <Label className="pr-2">Sort groups:</Label>
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle color="tertiary" caret>
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
        <ShowLoading until={data}>
            {data && data.map(group => <GroupAssignmentProgress key={group.id} {...props} group={group} pageSettings={pageSettings} />)}
            {data && data.length == 0 && <h3>You&apos;ll need to create a group using <a href="/groups">Manage Groups</a> to set an assignment.</h3>}
        </ShowLoading>
    </Container>;
};

export const AssignmentProgress = connect(stateFromProps, dispatchFromProps)(AssignmentProgressPageComponent);
