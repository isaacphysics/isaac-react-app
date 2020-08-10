import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {Col, Row} from "reactstrap";
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    DragStart,
    DragUpdate,
    Droppable,
    DroppableProvided,
    DroppableStateSnapshot,
    DropResult,
    ResponderProvided
} from "react-beautiful-dnd";
import _differenceBy from "lodash/differenceBy";
import _isUndefined from "lodash/isUndefined";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";

interface IsaacParsonsQuestionProps {
    doc: IsaacParsonsQuestionDTO;
    questionId: string;
    currentAttempt?: ParsonsChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ParsonsChoiceDTO) => void;
}

interface IsaacParsonsQuestionState {
    availableItems: ParsonsItemDTO[];
    draggedElement?: HTMLElement;
    currentDestinationIndex?: number;
    initialX?: number | null;
    currentIndent?: number;
    currentMaxIndent: number;
}

// REMINDER: If you change this, you also have to change $parsons-step in questions.scss
const PARSONS_MAX_INDENT = 3;
const PARSONS_INDENT_STEP = 45;

class IsaacParsonsQuestionComponent extends React.Component<IsaacParsonsQuestionProps> {
    public state: IsaacParsonsQuestionState;

    public constructor(props: IsaacParsonsQuestionProps) {
        super(props);

        this.state = {
            availableItems: [...(this.props.doc.items || [])],
            draggedElement: undefined,
            initialX: undefined,
            currentIndent: undefined,
            currentMaxIndent: 0,
        };
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchmove', this.onMouseMove);
        window.addEventListener('keyup', this.onKeyUp);
    }

    public componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('touchmove', this.onMouseMove);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    public componentDidUpdate = (prevProps: IsaacParsonsQuestionProps, prevState: IsaacParsonsQuestionState) => {
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
            const currentAttemptItems: ParsonsItemDTO[] = (this.props.currentAttempt && this.props.currentAttempt.items) || [];
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
            const diff = _differenceBy(prevState.availableItems, availableItems, 'id');
            // This stops re-rendering when availableItems have not changed from one state update to the next.
            // The set difference is empty if the two sets contain the same elements (by 'id', see above).
            if (diff.length > 0) {
                this.setState({ availableItems });
            }
        }
    }

    private onDragStart = (initial: DragStart) => {
        const draggedElement: HTMLElement | null = document.getElementById(initial.draggableId);
        const choiceElement: HTMLElement | null = document.getElementById("parsons-choice-area");
        this.setState({
            draggedElement: draggedElement,
            initialX: choiceElement && choiceElement.getBoundingClientRect().left,
        });
    }

    // WARNING: There's a limit to how far to the right we can drag an element, presumably due to react-beautiful-dnd
    private onMouseMove = (e: MouseEvent | TouchEvent) => {
        if (this.state.draggedElement) {
            const x = this.state.draggedElement.getBoundingClientRect().left;
            let cursorX = -1;
            if (e instanceof MouseEvent) {
                cursorX = e.clientX;
            } else if (e instanceof TouchEvent && e.touches[0]) {
                cursorX = e.touches[0].clientX;
            }
            if (this.state.initialX && x) {
                const d = Math.max(0, x - this.state.initialX);
                const i = Math.min(Math.floor(d/PARSONS_INDENT_STEP), Math.min(this.state.currentMaxIndent, PARSONS_MAX_INDENT));
                if (cursorX >= this.state.initialX) {
                    const movingElement = document.getElementById(this.state.draggedElement.id);
                    if (movingElement?.style) {
                        // movingElement.style.transform = `translate(${i*PARSONS_INDENT_STEP}px, 0px)`;
                    }
                }
                const previousItem = this.props.currentAttempt?.items?.[(this.state.currentDestinationIndex || 0) - 1];
                if (previousItem) {
                    this.setState({
                        currentMaxIndent: (previousItem.indentation || 0) + 1,
                        currentIndent: i,
                    });
                } else {
                    this.setState({
                        currentMaxIndent: 0,
                        currentIndent: i,
                    });
                }
            }
        }
    }

    private onKeyUp = (e: KeyboardEvent) => {
        // There's a bug somewhere that adds this event twice, but only one has a non-zero timestamp.
        // The condition on draggedElement *might* be sufficient, but let's be explicit.
        if (e.timeStamp > 0 && this.state.draggedElement) {
            const className = this.state.draggedElement.className;
            const matches = className.match(/indent-([0-3])/);
            const currentIndent: number = this.state.currentIndent || (matches && parseInt(matches[1])) || 0;
            let newIndent = currentIndent;
            if (e.key === '[' || e.code === 'BracketLeft' || e.keyCode === 91) {
                newIndent = Math.max(currentIndent - 1, 0);
            } else if (e.key === ']' || e.code === 'BracketRight' || e.keyCode === 93) {
                newIndent = Math.min(currentIndent + 1, Math.min(this.state.currentMaxIndent, PARSONS_MAX_INDENT));
            }
            this.setState((prevState: IsaacParsonsQuestionState) => ({
                currentIndent: newIndent,
                draggedElement: Object.assign(
                    {},
                    prevState.draggedElement,
                    { className: className.replace((matches && matches[0]) || `indent-${currentIndent}`, `indent-${newIndent}`) }
                )
            }));
        }
    }

    private moveItem = (src: ParsonsItemDTO[] | undefined, fromIndex: number, dst: ParsonsItemDTO[] | undefined, toIndex: number, indent: number) => {
        if (!src || !dst) return;
        const srcItem = src.splice(fromIndex, 1)[0];
        srcItem.indentation = indent;
        dst.splice(toIndex, 0, srcItem);
    }

    private onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.source || !result.destination) {
            return;
        }
        if (result.source.droppableId == result.destination.droppableId && result.destination.droppableId == 'answerItems' && this.props.currentAttempt) {
            // Reorder currentAttempt
            const items = [...(this.props.currentAttempt.items || [])];
            this.moveItem(items, result.source.index, items, result.destination.index, this.state.currentIndent || 0);
            this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items }});
        } else if (result.source.droppableId == result.destination.droppableId && result.destination.droppableId == 'availableItems') {
            // Reorder availableItems
            const items = [...this.state.availableItems];
            this.moveItem(items, result.source.index, items, result.destination.index, 0);
            this.setState({ availableItems: items });
        } else if (result.source.droppableId == 'availableItems' && result.destination.droppableId == 'answerItems' && this.props.currentAttempt) {
            // Move from availableItems to currentAttempt
            const srcItems = [...this.state.availableItems];
            const dstItems = [...(this.props.currentAttempt.items || [])];
            this.moveItem(srcItems, result.source.index, dstItems, result.destination.index, this.state.currentIndent || 0);
            this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items: dstItems }});
            this.setState({ availableItems: srcItems });
        } else if (result.source.droppableId == 'answerItems' && result.destination.droppableId == 'availableItems' && this.props.currentAttempt) {
            // Move from currentAttempt to availableItems
            const srcItems = [...(this.props.currentAttempt.items || [])];
            const dstItems = [...this.state.availableItems];
            this.moveItem(srcItems, result.source.index, dstItems, result.destination.index, 0);
            this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items: srcItems }});
            this.setState({ availableItems: dstItems });
        } else {
            console.error("Not sure how we got here...");
        }
        this.setState({
            draggedElement: undefined,
            // choiceElement: undefined,
            initialX: undefined,
            currentIndent: undefined,
        });
    }

    private onDragUpdate = (initial: DragUpdate, provided: ResponderProvided): void => {
        // FIXME: Needs moving because onDragUpdate is not called at all the times we need it.
        if (!initial.destination || initial.destination.index <= 0) {
            this.setState({ currentMaxIndent: 0, currentDestinationIndex: undefined });
        } else {
            this.setState({ currentDestinationIndex: initial.destination.index })
        }
    }

    private getStyle = (style: any, snapshot: DraggableStateSnapshot) => {
        if (!snapshot.isDropAnimating) {
            return style;
        }
        return {
            ...style,
            // cannot be 0, but make it super tiny
            transitionDuration: `0.001s`,
        };
    }

    private getPreviousItemIndentation = (index: number) => {
        if (!this.props.currentAttempt?.items) return -1;
        const items = [...(this.props.currentAttempt.items || [])];
        return items[Math.max(0, index-1)].indentation || 0;
    }

    private reduceIndentation = (index: number) => {
        if (!this.props.currentAttempt?.items) return;

        const items = [...(this.props.currentAttempt.items || [])];
        if (!_isUndefined(items[index].indentation)) {
            items[index].indentation = Math.max((items[index].indentation || 0) - 1, 0);
        }
        this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items }});
    }

    private increaseIndentation = (index: number) => {
        if (index === 0 || !this.props.currentAttempt?.items) return;

        const items = [...(this.props.currentAttempt.items || [])];
        // This condition is insane but of course 0, undefined, and null are all false-y.
        if (!_isUndefined(items[index].indentation)) {
            items[index].indentation = Math.min((items[index].indentation || 0) + 1, Math.min((items[Math.max(index-1, 0)].indentation || 0) + 1, PARSONS_MAX_INDENT));
        }
        this.props.setCurrentAttempt(this.props.questionId, {...this.props.currentAttempt, ...{ items }});
    }

    public render() {
        return <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={this.props.doc.value} encoding={this.props.doc.encoding}>
                    {this.props.doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <Row className="my-md-3">
                <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate}>
                    <Col md={{size: 6}} className="parsons-available-items">
                        <h4>Available items</h4>
                        <Droppable droppableId="availableItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div ref={provided.innerRef} className={`parsons-items ${this.state.availableItems && this.state.availableItems.length > 0 ? "" : "empty"}`}>
                                    {this.state.availableItems && this.state.availableItems.map((item, index) => {
                                        return <Draggable
                                            key={item.id}
                                            draggableId={`${item.id || index}|parsons-item-available`}
                                            index={index}
                                        >
                                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                                return <div
                                                    id={`${item.id || index}|parsons-item-available`}
                                                    className={`parsons-item indent-${item.indentation}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={this.getStyle(provided.draggableProps.style, snapshot)}
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
                    <Col md={{size: 6}} className="no-print">
                        <h4 className="mt-sm-4 mt-md-0">Your answer</h4>
                        <Droppable droppableId="answerItems">
                            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                return <div id="parsons-choice-area" ref={provided.innerRef} className={`parsons-items ${this.state.currentIndent == null ? '' : `ghost-indent-${this.state.currentIndent}`} ${this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.length > 0 ? "" : "empty"}`}>
                                    {this.props.currentAttempt && this.props.currentAttempt.items && this.props.currentAttempt.items.map((item, index) => {
                                        return <Draggable
                                            key={item.id}
                                            draggableId={`${item.id || index}|parsons-item-choice`}
                                            index={index}
                                        >
                                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                                                return <div
                                                    onMouseEnter={e => (e.target as HTMLElement).classList.add('show-controls')}
                                                    onMouseLeave={e => (e.target as HTMLElement).classList.remove('show-controls')}
                                                    id={`${item.id || index}|parsons-item-choice`}
                                                    className={`parsons-item indent-${item.indentation}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={this.getStyle(provided.draggableProps.style, snapshot)}
                                                >
                                                    <pre>
                                                        {item.value}
                                                        <div className="controls">
                                                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                                            <span className={`reduce ${!_isUndefined(item?.indentation) && item.indentation > 0 ? 'show' : 'hide' }`} role="img" onMouseUp={() => { this.reduceIndentation(index) }} aria-label="reduce indentation">&nbsp;</span>
                                                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                                            <span className={`increase ${!_isUndefined(item?.indentation) && item.indentation <= this.getPreviousItemIndentation(index) ? 'show' : 'hide' }`} role="img" onMouseUp={() => { this.increaseIndentation(index) }} aria-label="increase indentation">&nbsp;</span>
                                                        </div>
                                                    </pre>
                                                </div>
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
        </div>
    }
}

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const pageQuestions = selectors.questions.getQuestions(state);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    return questionPart ? {currentAttempt: questionPart.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent); // Cannot remove connect as this is a class based component
