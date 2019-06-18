import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {Col, Row} from "reactstrap";
import {DragDropContext, Droppable, Draggable, DragStart, DropResult, ResponderProvided, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";
import _differenceBy from "lodash/differenceBy";

interface IsaacParsonsQuestionProps {
    doc: IsaacParsonsQuestionDTO;
    questionId: string;
    currentAttempt?: ParsonsChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ParsonsChoiceDTO) => void;
}

interface IsaacParsonsQuestionState {
    availableItems: ParsonsItemDTO[];
    draggedElement?: HTMLElement | null;
    initialX?: number | null;
    currentIndent?: number | null;
}

class IsaacParsonsQuestionComponent extends React.Component<IsaacParsonsQuestionProps> {
    state: IsaacParsonsQuestionState;

    constructor(props: IsaacParsonsQuestionProps) {
        super(props);

        this.state = {
            availableItems: [...(this.props.doc.items || [])],
            draggedElement: null,
            initialX: null,
            currentIndent: null,
        };
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchmove', this.onMouseMove);
    }

    componentDidUpdate = (prevProps: IsaacParsonsQuestionProps, prevState: IsaacParsonsQuestionState) => {
        if (!prevProps.currentAttempt && !this.props.currentAttempt) {
            const defaultAttempt: ParsonsChoiceDTO = {
                type: "parsonsChoice",
                items: [],
            }
            this.props.setCurrentAttempt(this.props.questionId, defaultAttempt);
        }
        if (this.props.currentAttempt) {
            // This makes sure that available items and current attempt items contain different items.
            // This is because available items always start from the document's available items (see constructor)
            // and the current attempt is assigned afterwards, so we need to carve it out of the available items.
            // This also takes care of updating the two lists when a user moves items from one to the other.
            let availableItems: ParsonsItemDTO[] = [];
            let currentAttemptItems: ParsonsItemDTO[] = (this.props.currentAttempt && this.props.currentAttempt.items) || [];
            if (this.props.doc.items && this.props.currentAttempt) {
                availableItems = this.props.doc.items.filter(item => {
                    let found = false;
                    for (const i of currentAttemptItems) {
                        if (i.id === item.id) {
                            found = true;
                            break;
                        }
                    }
                    return !found;
                });
            }
            // WARNING: Inverting the order of the arrays breaks this.
            // TODO: Investigate if there is a method that gives more formal guarantees.
            let diff = _differenceBy(prevState.availableItems, availableItems, 'id');
            // This stops re-rendering when availableItems have not changed from one state update to the next.
            // The set difference is empty if the two sets contain the same elements (by 'id', see above).
            if (diff.length > 0) {
                this.setState({ availableItems });
            }
        }
    }

    onUpdateBeforeSortStart = (initial: DragStart) => {
        const draggedElement: HTMLElement | null = document.getElementById(`parsons-item-${initial.draggableId}`);
        const choiceElement: HTMLElement | null = document.getElementById("parsons-choice-area");
        this.setState({
            draggedElement: draggedElement,
            initialX: choiceElement && choiceElement.getBoundingClientRect().left,
        });
    }

    // WARNING: There's a limit to how far right an element can be dragged, presumably due to react-beautiful-dnd
    onMouseMove = (e: MouseEvent | TouchEvent) => {
        if (this.state.draggedElement) {
            const x = this.state.draggedElement.getBoundingClientRect().left;
            if (this.state.initialX && x) {
                const d = Math.max(0, x - this.state.initialX);
                const i = Math.min(Math.floor(d/45), 3); // REMINDER: If you change this, you also have to change $parsons-step in questions.scss
                if (i != this.state.currentIndent) {
                    this.setState({
                        currentIndent: i,
                    });
                }
            }
        }
    }

    moveItem = (src: ParsonsItemDTO[] | undefined, fromIndex: number, dst: ParsonsItemDTO[] | undefined, toIndex: number, indent: number) => {
        if (!src || !dst) return;
        const srcItem = src.splice(fromIndex, 1)[0];
        srcItem.indentation = indent;
        dst.splice(toIndex, 0, srcItem);
    }

    onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.source || !result.destination) {
            return;
        }
        if (result.source.droppableId == result.destination.droppableId && result.destination.droppableId == 'answerItems' && this.props.currentAttempt) {
            // Reorder currentAttempt
            let items = [...(this.props.currentAttempt.items || [])];
            this.moveItem(items, result.source.index, items, result.destination.index, this.state.currentIndent || 0);
            this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items }});
        } else if (result.source.droppableId == result.destination.droppableId && result.destination.droppableId == 'availableItems') {
            // Reorder availableItems
            let items = [...this.state.availableItems];
            this.moveItem(items, result.source.index, items, result.destination.index, 0);
            this.setState({ availableItems: items });
        } else if (result.source.droppableId == 'availableItems' && result.destination.droppableId == 'answerItems' && this.props.currentAttempt) {
            // Move from availableItems to currentAttempt
            let srcItems = [...this.state.availableItems];
            let dstItems = [...(this.props.currentAttempt.items || [])];
            this.moveItem(srcItems, result.source.index, dstItems, result.destination.index, this.state.currentIndent || 0);
            this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items: dstItems }});
            this.setState({ availableItems: srcItems });
        } else if (result.source.droppableId == 'answerItems' && result.destination.droppableId == 'availableItems' && this.props.currentAttempt) {
            // Move from currentAttempt to availableItems
            let srcItems = [...(this.props.currentAttempt.items || [])];
            let dstItems = [...this.state.availableItems];
            this.moveItem(srcItems, result.source.index, dstItems, result.destination.index, 0);
            this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items: srcItems }});
            this.setState({ availableItems: dstItems });
        } else {
            console.error("Not sure how we got here...");
        }
        this.setState({
            draggedElement: null,
            initialX: null,
            currentIndent: null,
        });
    }

    render() {
        return <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={this.props.doc.value} encoding={this.props.doc.encoding}>
                    {this.props.doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <Row className="my-md-3">
                <DragDropContext onDragEnd={this.onDragEnd} onBeforeDragStart={this.onUpdateBeforeSortStart}>
                    <Col md={{size: 6}}>
                        <h4>Available items</h4>
                        <Droppable droppableId="availableItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div ref={provided.innerRef} className={`parsons-items ${this.state.availableItems && this.state.availableItems.length > 0 ? "" : "empty"}`}>
                                    {this.state.availableItems && this.state.availableItems.map((item, index) => {
                                        return <Draggable
                                            key={item.id}
                                            draggableId={item.id || `${index}`}
                                            index={index}
                                        >
                                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                                return <div
                                                    id={`parsons-item-${item.id}`}
                                                    className={`parsons-item indent-${item.indentation}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                ><pre>{item.value}</pre></div>
                                            }}
                                        </Draggable>
                                    })}
                                    {(!this.state.availableItems || this.state.availableItems.length == 0) && <div>&nbsp;</div>}
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </Col>
                    <Col md={{size: 6}}>
                        <h4 className="mt-sm-4 mt-md-0">Your answer</h4>
                        <Droppable droppableId="answerItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div id="parsons-choice-area" ref={provided.innerRef} className={`parsons-items ${this.state.currentIndent == null ? '' : `ghost-indent-${this.state.currentIndent}`} ${this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.length > 0 ? "" : "empty"}`}>
                                    {this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.map((item, index) => {
                                        return <Draggable
                                            key={item.id}
                                            draggableId={item.id || `${index}`}
                                            index={index}
                                        >
                                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                                return <div
                                                    id={`parsons-item-${item.id}`}
                                                    className={`parsons-item indent-${item.indentation}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                ><pre>{item.value}</pre></div>
                                            }}
                                        </Draggable>
                                    })}
                                    {(!(this.props.currentAttempt && this.props.currentAttempt.items) || (this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.length == 0)) && <div className="text-muted text-center">Drag items across to build your answer</div>}
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </Col>
                </DragDropContext>
            </Row>
            <IsaacHints hints={this.props.doc.hints} />
        </div>
    }
}

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent);
