import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {loadGroups, loadBoards, loadGroupsForBoard, deleteBoard, assignBoard, unassignBoard, showToast} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState, Boards} from "../../state/reducers";
import {
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
import {sortBy} from "lodash";

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
}

function formatDate(date: number | Date | undefined) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString();
}

function formatBoardOwner(user: RegisteredUserDTO, board: GameboardDTO) {
    if (board.tags && board.tags.includes("isaac")) {
        return "Isaac CS";
    }
    if (user.id == board.ownerUserId) {
        return "Me";
    }
    return "Someone else";
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

    return <Container>
        <Label>Group:
            <Input type="select" value={groupId} onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupId(e.target.value ? parseInt(e.target.value, 10) : undefined)}>
                <option key={undefined} value={undefined} />
                {groups && sortBy(groups, group => group.groupName).map(group => <option key={group.id} value={group.id}>{group.groupName}</option>)}
            </Input>
        </Label>
        <Label>Due Date Reminder <span className="font-weight-lighter"> (optional)</span>
            <Input type="date" value={dueDate ? dueDate.toISOString().slice(0, 10) : ""} placeholder="Select your due date..." onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate)} />
        </Label>
        <Button block color="primary" onClick={assign} disabled={groupId === null}>Assign to group</Button>
    </Container>;
};

const Board = (props: BoardProps) => {
    const {user, board, loadGroupsForBoard, deleteBoard, unassignBoard} = props;

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
                alert("Warning: You currently have groups assigned to this board. If you delete this your groups will still be assigned but you won't be able to unassign them or see the board in your Assigned Boards or My boards page.");
            } else {
                showToast({color: "failure", title: "Board Deletion Not Allowed", body: "You have groups assigned to this board. To delete this board, you must unassign all groups.", timeout: 5000});
                return;
            }
        }

        if (confirm(`You are about to delete ${board.title} board?`)) {
            deleteBoard(board);
        }
    }

    function confirmUnassignBoard(group: UserGroupDTO) {
        if (confirm("Are you sure you want to unassign this board from this group?")) {
            unassignBoard(board, group);
        }
    }

    const [showAssignments, setShowAssignments] = useState(false);

    const hexagonId = `board-hex-${board.id}`;

    return <Card className="board-card">
        <CardBody>
            <Button className="close" size="small" onClick={confirmDeleteBoard}>X</Button>
            <button onClick={() => setShowAssignments(!showAssignments)} className="groups-assigned subject-compsci" id={hexagonId}>
                <strong>{board.assignedGroups ? board.assignedGroups.length : <Spinner size="sm" />}</strong>
                group{(!board.assignedGroups || board.assignedGroups.length != 1) && "s"} assigned
                {board.assignedGroups && <UncontrolledTooltip target={"#" + hexagonId}>{board.assignedGroups.length == 0 ?
                    "No groups have been assigned."
                    : ("Board assigned to: " + board.assignedGroups.map(g => g.groupName).join(", "))}</UncontrolledTooltip>
                }
            </button>
            <aside>
                <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
            </aside>
            <div className={`share-link ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{assignmentLink}</div></div>
            <button className="ru_share" onClick={toggleShareLink}/>
            <CardTitle><a href={assignmentLink}>{board.title}</a></CardTitle>
            <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
            {showAssignments && <React.Fragment>
                <hr />
                <AssignGroup {...props} />
                <hr />
                <Label>Board currently assigned to:</Label>
                {board.assignedGroups && hasAssignedGroups && <Container className="mb-4">{board.assignedGroups.map(group =>
                    <Row key={group.id}>
                        <span className="flex-grow-1">{group.groupName}</span>
                        <Button size="sm" color="tertiary" className="unassign" aria-label="Unassign" onClick={() => confirmUnassignBoard(group)}><span aria-hidden="true">&times;</span></Button>
                    </Row>
                )}</Container>}
                {!hasAssignedGroups && <p>No groups.</p>}
            </React.Fragment>}
            <Button block color="tertiary" onClick={() => setShowAssignments(!showAssignments)}>{showAssignments ? "Close" : "Assign / Unassign"}</Button>
        </CardBody>
    </Card>;
};


enum BoardLimit {
    "two" = "2",
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
    "created": "Date Created",
    "visited": "Date Visited",
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

    const [boardLimit, setBoardLimit] = useState<BoardLimit>(BoardLimit.two);
    const [boardOrder, setBoardOrder] = useState<BoardOrder>(BoardOrder.created);

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
            setLoading(false);
            if (boards.boards) {
                if (actualBoardLimit != boards.boards.length) {
                    setActualBoardLimit(actualBoardLimit = boards.boards.length);
                }
                if (boards.boards.length == 0) {
                    // Through deletion or something we have ended up with no boards, so fetch more.
                    viewMore();
                }
            }
        }
    }, [boards]);

    return <Container>
        <h2 className="mt-4"><span>Set Assignments<span id="set-assignments-title" className="icon-help" /></span>
            <UncontrolledTooltip placement="bottom" target="set-assignments-title">
                Assign any of the boards you have selected to your groups.
            </UncontrolledTooltip>
        </h2>
        <hr />
        <p>Add a board from <Link to="/lesson_plans">our lesson plans</Link></p>
        <hr />
        {boards && boards.totalResults == 0 && <h4>You have no boards to assign; select an option above to add a board.</h4>}
        {boards && boards.totalResults > 0 && <h4>You have <strong>{boards.totalResults}</strong> board{boards.totalResults > 1 && "s"} ready to assign...</h4>}
        {!boards && <h4>You have <Spinner size="sm" /> boards ready to assign...</h4>}
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
    </Container>;
};

export const SetAssignments = connect(stateToProps, dispatchToProps)(SetAssignmentsPageComponent);