import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {loadGroups, loadBoards} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState, GroupsState} from "../../state/reducers";
import {
    Button,
    Card,
    CardBody,
    CardImg, CardSubtitle, CardText, CardTitle,
    Col,
    Container,
    Form,
    Input,
    Label,
    Row,
    Spinner,
    UncontrolledTooltip
} from 'reactstrap';
import {ActualBoardLimit, BoardOrder} from "../../../IsaacAppTypes";
import {GameboardDTO, GameboardListDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState) => ({groups: state && state.groups || null, boards: state && state.boards && state.boards.boards || null});
const dispatchToProps = {loadGroups, loadBoards};

interface SetAssignmentsPageProps {
    boards: GameboardListDTO | null;
    groups: GroupsState | null;
    loadGroups: (getArchived: boolean) => void;
    loadBoards: (startIndex: number, limit: ActualBoardLimit, sort: BoardOrder) => void;
}

function formatDate(date: number | Date | undefined) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString();
}

function formatBoardOwner(board: GameboardDTO) {
    return "Unknown";
}

interface BoardProps {
    board: GameboardDTO;
}


const Board = ({board}: BoardProps) => {
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

    return <Card className="board-card">
        <CardBody>
            <Button className="close" size="small">X</Button>
            <button className="groups-assigned subject-compsci"><strong>0</strong>groups assigned</button>
            <aside>
                <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
            </aside>
            <div className={`share-link ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{assignmentLink}</div></div>
            <button className="ru_share" onClick={toggleShareLink}/>
            <CardTitle>{board.title}</CardTitle>
            <CardSubtitle>By: <strong>{formatBoardOwner(board)}</strong></CardSubtitle>
            <Button block color="tertiary">Assign / Unassign</Button>
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

const SetAssignmentsPageComponent = ({groups, loadGroups, boards, loadBoards}: SetAssignmentsPageProps) => {
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
            if (boards.results && actualBoardLimit != boards.results.length) {
                setActualBoardLimit(boards.results.length);
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
        <ShowLoading until={boards}>
            {boards && (boards.totalResults == 0 ? <h4>You have no boards to assign; select an option above to add a board.</h4> : <React.Fragment>
                <h4>You have <strong>{boards.totalResults}</strong> board{boards.totalResults && boards.totalResults > 1 && "s"} ready to assign...</h4>
                <Row>
                    <Col>
                        <Form inline>
                            <span className="flex-grow-1" />
                            <Label>Show <Input className="ml-2 mr-3" type="select" onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                            </Input></Label>
                            <Label>Sort by <Input className="ml-2" type="select" onChange={e => setBoardOrder(e.target.value as BoardOrder)}>
                                {Object.values(BoardOrder).map(order => <option key={order} value={order}>{orderName(order)}</option>)}
                            </Input></Label>
                        </Form>
                    </Col>
                </Row>
                {boards.results && <div>
                    <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                        {boards.results && boards.results.map(board => <div key={board.id}><Board board={board} /></div>)}
                    </div>
                    <div className="text-center mt-2 mb-4" style={{clear: "both"}}>
                        <p>Showing <strong>{boards.results.length}</strong> of <strong>{boards.totalResults}</strong></p>
                        {boards.totalResults && boards.results.length < boards.totalResults && <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner /> : "View more"}</Button>}
                    </div>
                </div>}
            </React.Fragment>)}
        </ShowLoading>
    </Container>;
};

export const SetAssignments = connect(stateToProps, dispatchToProps)(SetAssignmentsPageComponent);