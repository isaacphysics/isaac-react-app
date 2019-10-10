import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import {loadGroups, loadBoards, loadGroupsForBoard, deleteBoard, assignBoard, unassignBoard, showToast} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState, Boards} from "../../state/reducers";
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardTitle,
    Col,
    Container,
    Form,
    Input,
    Label,
    Row,
    Spinner,
    UncontrolledTooltip
} from 'reactstrap';
import {ActualBoardLimit, AppGameBoard, BoardOrder, Toast} from "../../../IsaacAppTypes";
import {GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {boards, groups} from "../../state/selectors";
import {sortBy, range} from "lodash";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {TEACHERS_CRUMB} from "../../services/constants";
import {withRouter} from "react-router-dom";
import {formatBoardOwner, formatDate} from "../../services/gameboards";
import {connect} from "react-redux";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: groups.active(state),
    boards: boards.boards(state)
});

const dispatchToProps = {loadGroups, loadBoards, loadGroupsForBoard, deleteBoard, assignBoard, unassignBoard, showToast};

interface SetAssignmentsPageProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    groups: UserGroupDTO[] | null;
    loadGroups: (getArchived: boolean) => void;
    loadBoards: (startIndex: number, limit: ActualBoardLimit, sort: BoardOrder) => void;
    loadGroupsForBoard: (board: GameboardDTO) => void;
    deleteBoard: (board: GameboardDTO) => void;
    assignBoard: (board: GameboardDTO, groupId?: number, dueDate?: Date) => Promise<boolean>;
    unassignBoard: (board: GameboardDTO, group: UserGroupDTO) => void;
    showToast: (toast: Toast) => void;
    location: {hash: string};

}

type BoardProps = SetAssignmentsPageProps & {
    board: AppGameBoard;
}

const AssignGroup = ({groups, board, assignBoard}: BoardProps) => {
    const [groupId, setGroupId] = useState<number>();
    const [dueDate, setDueDate] = useState<Date>();

    function assign() {
        assignBoard(board, groupId, dueDate).then(success => {
            if (success) {
                setGroupId(-1);
                setDueDate(undefined);
            }
        });
    }

    const yearRange = range(currentYear, currentYear + 5);
    const currentMonth = (new Date()).getMonth() + 1;

    return <Container className="py-2">
        <Label className="w-100 pb-2">Group:
            <Input type="select" value={groupId} onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupId(e.target.value ? parseInt(e.target.value, 10) : undefined)}>
                <option key={undefined} value={undefined} />
                {groups && sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(group => <option key={group.id} value={group.id}>{group.groupName}</option>)}
            </Input>
        </Label>
        <Label className="w-100 pb-2">Due Date Reminder <span className="text-muted"> (optional)</span>
            <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange} defaultYear={currentYear} defaultMonth={currentMonth}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate)} />
        </Label>
        <Button className="mt-3 mb-2" block color="primary" onClick={assign} disabled={groupId === null}>Assign to group</Button>
    </Container>;
};

const Board = (props: BoardProps) => {
    const {user, board, loadGroupsForBoard, deleteBoard, unassignBoard, showToast, location: {hash}} = props;
    const hashAnchor = hash.includes("#") ? hash.slice(1) : "";

    useEffect( () => {
        loadGroupsForBoard(board);
    }, [board.id]);
    const [showShareLink, setShowShareLink] = useState(false);
    const shareLink = useRef<HTMLInputElement>(null);

    const assignmentLink = `${location.origin}/assignment/${board.id}`;

    function toggleShareLink() {
        if (showShareLink) {
            setShowShareLink(false);
        } else {
            setShowShareLink(true);
            setImmediate(() => {
                if (shareLink.current) {
                    if (window.getSelection && shareLink.current) {
                        let selection = window.getSelection();
                        let range = document.createRange();
                        range.selectNodeContents(shareLink.current);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            });
        }
    }

    const hasAssignedGroups = board.assignedGroups && board.assignedGroups.length > 0;

    function confirmDeleteBoard() {
        if (hasAssignedGroups) {
            if (user.role == "ADMIN" || user.role == "EVENT_MANAGER") {
                alert("Warning: You currently have groups assigned to this gameboard. If you delete this your groups will still be assigned but you won't be able to unassign them or see the gameboard in your assigned gameboards or 'My gameboards' page.");
            } else {
                showToast({color: "failure", title: "Gameboard Deletion Not Allowed", body: "You have groups assigned to this gameboard. To delete this gameboard, you must unassign all groups.", timeout: 5000});
                return;
            }
        }

        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            deleteBoard(board);
        }
    }

    function confirmUnassignBoard(group: UserGroupDTO) {
        if (confirm("Are you sure you want to unassign this gameboard from this group?")) {
            unassignBoard(board, group);
        }
    }

    const [showAssignments, setShowAssignments] = useState(board.id === hashAnchor);

    const hexagonId = `board-hex-${board.id}`;

    return <Card className="board-card">
        <CardBody className="pb-4 pt-4">
            <button className="close" onClick={confirmDeleteBoard} aria-label="Delete gameboard">×</button>
            <button onClick={() => setShowAssignments(!showAssignments)} className="groups-assigned subject-compsci" id={hexagonId}>
                <strong>{board.assignedGroups ? board.assignedGroups.length : <Spinner size="sm" />}</strong>
                group{(!board.assignedGroups || board.assignedGroups.length != 1) && "s"}
                {board.assignedGroups && <UncontrolledTooltip target={"#" + hexagonId}>{board.assignedGroups.length == 0 ?
                    "No groups have been assigned."
                    : ("Gameboard assigned to: " + board.assignedGroups.map(g => g.groupName).join(", "))}</UncontrolledTooltip>
                }
            </button>
            <aside>
                <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
            </aside>

            <div className="my-4">
                <div className={`share-link ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{assignmentLink}</div></div>
                <button className="ru_share" onClick={toggleShareLink}/>
                <CardTitle><a href={assignmentLink}>{board.title}</a></CardTitle>
                <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
            </div>

            {showAssignments && <React.Fragment>
                <hr className="text-center" />
                <AssignGroup {...props} />
                <hr className="text-center" />
                <div className="py-2">
                    <Label>Board currently assigned to:</Label>
                    {board.assignedGroups && hasAssignedGroups && <Container className="mb-4">{board.assignedGroups.map(group =>
                        <Row key={group.id} className="px-1">
                            <span className="flex-grow-1">{group.groupName}</span>
                            <button className="close" aria-label="Unassign group" onClick={() => confirmUnassignBoard(group)}>×</button>
                        </Row>
                    )}</Container>}
                    {!hasAssignedGroups && <p>No groups.</p>}
                </div>
            </React.Fragment>}
            <Button block color="tertiary" onClick={() => setShowAssignments(!showAssignments)}>{showAssignments ? "Close" : "Assign / Unassign"}</Button>
        </CardBody>
    </Card>;
};


enum BoardLimit {
    "six" = "6",
    "eighteen" = "18",
    "sixy" = "60",
    "All" = "ALL"
}
function toActual(limit: BoardLimit) {
    if (limit == "ALL") return "ALL";
    return parseInt(limit, 10);
}

const orderNames: {[key in BoardOrder]: string} = {
    "created": "Date Created Ascending",
    "-created": "Date Created Descending",
    "visited": "Date Visited Ascending",
    "-visited": "Date Visited Descending",
    "title": "Title Ascending",
    "-title": "Title Descending"
};
function orderName(order: BoardOrder) {
    return orderNames[order];
}

const SetAssignmentsPageComponent = (props: SetAssignmentsPageProps) => {
    const {groups, loadGroups, boards, loadBoards} = props;

    useEffect(() => {loadGroups(false);}, []);

    const [loading, setLoading] = useState(false);

    const [boardLimit, setBoardLimit] = useState<BoardLimit>(BoardLimit.six);
    const [boardOrder, setBoardOrder] = useState<BoardOrder>(BoardOrder.visited);

    let [actualBoardLimit, setActualBoardLimit] = useState<ActualBoardLimit>(toActual(boardLimit));

    function loadInitial() {
        loadBoards(0, actualBoardLimit, boardOrder);
        setLoading(true);
    }

    useEffect( () => {
        if (actualBoardLimit != boardLimit) {
            setActualBoardLimit(actualBoardLimit = toActual(boardLimit));
            loadInitial();
        }
    }, [boardLimit]);

    useEffect( loadInitial, [boardOrder]);

    function viewMore() {
        const increment = toActual(boardLimit);
        if (increment != "ALL" && actualBoardLimit != "ALL") {
            loadBoards(actualBoardLimit, increment, boardOrder);
            setLoading(true);
        }
    }

    useEffect( () => {
        if (boards) {
            const wasLoading = loading;
            setLoading(false);
            if (boards.boards) {
                if (actualBoardLimit != boards.boards.length) {
                    setActualBoardLimit(actualBoardLimit = boards.boards.length);
                    if (!wasLoading && boards.boards.length == 0) {
                        // Through deletion or something we have ended up with no boards, so fetch more.
                        viewMore();
                    }
                }
            }
        }
    }, [boards]);

    const pageHelp = <span>
        Use this page to set assignments to your groups. You can assign any gameboard you have saved to your account.
        <br />
        Students in the group will be emailed when you set a new assignment.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Set assignments" intermediateCrumbs={[TEACHERS_CRUMB]} help={pageHelp} />
        <h4 className="mt-4 mb-3">
            Add a board from ...
        </h4>
        <RS.Row className="mb-4">
            <RS.Col>
                <RS.Button tag={Link} to={"/pages/gameboards"} color="secondary" block>
                    {"Pre-made gameboards"}
                </RS.Button>
            </RS.Col>
            <RS.Col>
                <RS.Button tag={Link} to={"/topics"} color="secondary" block>
                    {"Topics list"}
                </RS.Button>
            </RS.Col>
            <RS.Col>
                <RS.Button tag={Link} to={"/gameboards/builder"} color="secondary" block>
                    {"Create gameboard"}
                </RS.Button>
            </RS.Col>
        </RS.Row>
        {groups && groups.length == 0 && <Alert color="warning">You have not created any groups to assign work to. Please <Link to="/groups">create a group here first.</Link></Alert>}
        {boards && boards.totalResults == 0 ? <h3 className="text-center mt-4 mb-5">You have no gameboards to assign; use one of the options above to find one.</h3> :
            <React.Fragment>
                {boards && boards.totalResults > 0 && <h4>You have <strong>{boards.totalResults}</strong> gameboard{boards.totalResults > 1 && "s"} ready to assign...</h4>}
                {!boards && <h4>You have <Spinner size="sm" /> gameboards ready to assign...</h4>}
                <Row>
                    <Col>
                        <Form inline>
                            <span className="flex-grow-1" />
                            <Label>Show <Input className="ml-2 mr-3" type="select" value={boardLimit} onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                            </Input></Label>
                            <Label>Sort by <Input className="ml-2" type="select" value={boardOrder} onChange={e => setBoardOrder(e.target.value as BoardOrder)}>
                                {Object.values(BoardOrder).map(order => <option key={order} value={order}>{orderName(order)}</option>)}
                            </Input></Label>
                        </Form>
                    </Col>
                </Row>
                <ShowLoading until={boards}>
                    {boards && boards.boards && <div>
                        <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                            {boards.boards && boards.boards.map(board => <div key={board.id}><Board {...props} board={board} /></div>)}
                        </div>
                        <div className="text-center mt-2 mb-4" style={{clear: "both"}}>
                            <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong></p>
                            {boards.boards.length < boards.totalResults && <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner /> : "View more"}</Button>}
                        </div>
                    </div>}
                </ShowLoading>
            </React.Fragment>}
    </Container>;
};

export const SetAssignments = withRouter(connect(stateToProps, dispatchToProps)(SetAssignmentsPageComponent));
