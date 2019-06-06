import React, {useState, useEffect, useMemo} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {SortableContainer, SortableElement, SortStart, SortEvent, SortEnd} from "react-sortable-hoc";
import {Col, Row} from "reactstrap";
import {DragDropContext, Droppable, Draggable, DropResult, ResponderProvided, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";

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
    };

    constructor(props: IsaacParsonsQuestionProps) {
        super(props);
        const {currentAttempt, doc} = props;

        this.state = {
            draggedElement: null,
            initialX: null,
            currentIndent: null,
        }
    }

    moveItem = (fromIndex: number, toIndex: number, indent: number) => {
        const t = Object.assign({}, this.props.currentAttempt);
        if (t.items) {
            const sourceItem = t.items.splice(fromIndex, 1)[0];
            sourceItem.indentation = indent;
            t.items.splice(toIndex, 0, sourceItem);
        }
        const attempt: ParsonsChoiceDTO = {
            type: "parsonsChoice",
            items: this.props.currentAttempt && this.props.currentAttempt.items,
        }
        this.props.setCurrentAttempt(this.props.questionId, attempt);
    }

    private SortableItem = SortableElement(({value}: {value: ParsonsItemDTO}) => {
        return value ? <div id={`parsons-item-${value.id}`} className={`parsons-item indent-${value.indentation}`}><pre>{value.value} [{value.indentation}]</pre></div> : <div>ERROR: Missing item?</div>
    });
    
    private SortableList = SortableContainer(({items}: {items: any}) => {
        return <div className="parsons-items">
            {items && items.map((item: any, index: any) => {
                return <this.SortableItem key={`item-${index}`} index={index} value={item} />;
            })}
        </div>
    });

    getXFromEvent = (event: SortEvent) => {
        if (event instanceof MouseEvent) {
            return event.clientX;
        } else if (event instanceof TouchEvent) {
            return event.touches[0].clientX;
        }
        return null;
    }

    onUpdateBeforeSortStart = (sort: SortStart, event: SortEvent) => {
        const element: HTMLElement = sort.node as HTMLElement;
        const x = this.getXFromEvent(event);

        return new Promise((res) => {
            this.setState({
                draggedElement: element,
                initialX: x,
            }, res);
        });
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

    // onSortEnd = (sort: SortEnd, event: SortEvent) => {
    //     this.moveItem(sort.oldIndex, sort.newIndex, this.state.currentIndent ? this.state.currentIndent : 0);
    //     this.setState({
    //         draggedElement: null,
    //         initialX: null,
    //         currentIndent: null,
    //     });
    // }

    onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        // this.moveItem(result.source.index, sort.newIndex, this.state.currentIndent ? this.state.currentIndent : 0);
        // this.setState({
        //     draggedElement: null,
        //     initialX: null,
        //     currentIndent: null,
        // });
    }

    render() {
        let availableItems = this.props.doc.items; //&& this.props.doc.items.filter(item => this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.includes(item));

        return <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={this.props.doc.value} encoding={this.props.doc.encoding}>
                    {this.props.doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <Row className="my-md-3">
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Col md={{size: 6}}>
                        <p>Available items</p>
                        <Droppable droppableId="availableItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div ref={provided.innerRef}>
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
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </Col>
                    <Col md={{size: 6}}>
                        <p>Your answer</p>
                        <Droppable droppableId="answerItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div ref={provided.innerRef}>
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
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </Col>
                </DragDropContext>
                {/* <Col md={{size: 6}}>
                    <p>Available items</p>
                    {availableItems && <div className="parsons-items">
                        <this.SortableList
                        items={availableItems}
                        />
                    </div>}
                </Col>
                <Col md={{size: 6}}>
                    <p>Your answer</p>
                    {this.props.currentAttempt && <div className="parsons-items">
                        <this.SortableList
                        items={this.props.currentAttempt.items}
                        updateBeforeSortStart={this.onUpdateBeforeSortStart}
                        onSortMove={this.onSortMove}
                        onSortEnd={this.onSortEnd}
                        />
                    </div>}
                </Col> */}
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
