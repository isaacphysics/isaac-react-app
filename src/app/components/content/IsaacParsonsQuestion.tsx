import React, {useState, useEffect, useMemo} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {SortableContainer, SortableElement, SortStart, SortEvent, SortEnd} from "react-sortable-hoc";
import {Col, Row} from "reactstrap";
import {DragDropContext, Droppable, Draggable, DragStart, DropResult, ResponderProvided, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";

interface IsaacParsonsQuestionProps {
    doc: IsaacParsonsQuestionDTO;
    questionId: string;
    currentAttempt?: ParsonsChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ParsonsChoiceDTO) => void;
}

class IsaacParsonsQuestionComponent extends React.Component<IsaacParsonsQuestionProps> {
    state: {
        draggedElement?: HTMLElement | null;
        initialX?: number | null;
        currentIndent?: number | null;
        move?: { src: Array<ParsonsItemDTO>, srcIndex: number, dst: Array<ParsonsItemDTO>, dstIndex: number, indent: number } | null;
    };

    constructor(props: IsaacParsonsQuestionProps) {
        super(props);
        const {currentAttempt, doc} = props;

        this.state = {
            draggedElement: null,
            initialX: null,
            currentIndent: null,
            move: null,
        }

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.state.draggedElement) {
                if (!this.state.initialX) {
                    this.setState({ initialX: e.clientX });
                } else {
                    console.log(e);
                    const x = e.clientX;
                    if (this.state.initialX && x) {
                        const d = Math.max(0, x - this.state.initialX);
                        const i = Math.floor(d/30);
                        this.setState({
                            currentIndent: i,
                        });
                    }
                }
            }
        });
    }

    componentDidUpdate = (prevProps: IsaacParsonsQuestionProps) => {
        if (!this.props.currentAttempt) {
            const attempt: ParsonsChoiceDTO = {
                type: "parsonsChoice",
                items: [],
            }
            this.props.setCurrentAttempt(this.props.questionId, attempt);
        }
    }

    getXFromEvent = (event: SortEvent) => {
        if (event instanceof MouseEvent) {
            return event.clientX;
        } else if (event instanceof TouchEvent) {
            return event.touches[0].clientX;
        }
        return null;
    }

    // onUpdateBeforeSortStart = (sort: SortStart, event: SortEvent) => {
    onUpdateBeforeSortStart = (initial: DragStart) => {
        console.log(initial);
        const element: HTMLElement | null = document.getElementById(`parsons-item-${initial.draggableId}`);
        this.setState({
            draggedElement: element
        });
        // const x = this.getXFromEvent(event);

        // return new Promise((res) => {
        //     this.setState({
        //         initialX: x,
        //     }, res);
        // });
    }

    onSortMove = (event: SortEvent) => {
        const x = this.getXFromEvent(event);
        if (this.state.initialX && x) {
            const d = Math.max(0, x - this.state.initialX);
            const i = Math.floor(d/30);
            this.setState({
                currentIndent: i,
            });
        }
    }

    moveItem = (src: Array<ParsonsItemDTO> | undefined, fromIndex: number, dst: Array<ParsonsItemDTO> | undefined, toIndex: number, indent: number) => {
        if (!src || !dst) return;
        const srcItem = src.splice(fromIndex, 1)[0];
        dst.splice(toIndex, 0, srcItem);
    }

    onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.source || !result.destination) {
            return;
        }
        console.log(this);
        if (result.source.droppableId == result.destination.droppableId && result.destination.droppableId == 'answerItems' && this.props.currentAttempt) {
            // Reorder currentAttempt
            this.moveItem(this.props.currentAttempt.items, result.source.index, this.props.currentAttempt.items, result.destination.index, 0);
        } else if (result.source.droppableId == result.destination.droppableId && result.destination.droppableId == 'availableItems') {
            // Reorder availableItems
            this.moveItem(this.props.doc.items, result.source.index, this.props.doc.items, result.destination.index, 0);
        } else if (result.source.droppableId == 'availableItems' && result.destination.droppableId == 'answerItems' && this.props.currentAttempt) {
            this.moveItem(this.props.doc.items, result.source.index, this.props.currentAttempt.items, result.destination.index, 0);
        } else if (result.source.droppableId == 'answerItems' && result.destination.droppableId == 'availableItems' && this.props.currentAttempt) {
            // Move from currentAttempt to availableItems
            this.moveItem(this.props.currentAttempt.items, result.source.index, this.props.doc.items, result.destination.index, 0);
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
        let availableItems = this.props.doc.items;// && this.props.doc.items.filter(item => this.props.currentAttempt && this.props.currentAttempt.items && !this.props.currentAttempt.items.includes(item));

        return <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={this.props.doc.value} encoding={this.props.doc.encoding}>
                    {this.props.doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <Row className="my-md-3">
                <DragDropContext onDragEnd={this.onDragEnd} onBeforeDragStart={this.onUpdateBeforeSortStart} onDragUpdate={console.log}>
                    <Col md={{size: 6}}>
                        <p>Available items</p>
                        <Droppable droppableId="availableItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div ref={provided.innerRef} className={`parsons-items ${availableItems && availableItems.length > 0 ? "" : "empty"}`}>
                                    {availableItems && availableItems.map((item, index) => {
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
                                                    ><pre>{item.value} [{item.indentation}]</pre></div>
                                            }}
                                        </Draggable>
                                    })}
                                    {(!availableItems || availableItems.length == 0) && <div>&nbsp;</div>}
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </Col>
                    <Col md={{size: 6}}>
                        <p>Your answer</p>
                        <Droppable droppableId="answerItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div ref={provided.innerRef} className={`parsons-items ${this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.length > 0 ? "" : "empty"}`}>
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
                                                    ><pre>{item.value} [{item.indentation}]</pre></div>
                                            }}
                                        </Draggable>
                                    })}
                                    {(!(this.props.currentAttempt && this.props.currentAttempt.items) || (this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.length == 0)) && <div>&nbsp;</div>}
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
