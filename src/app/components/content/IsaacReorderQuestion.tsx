import React, {useEffect, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacReorderQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {Col, Row} from "reactstrap";
import {DragDropContext, Droppable, DropResult} from "@hello-pangea/dnd";
import _differenceBy from "lodash/differenceBy";
import {useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";
import {Immutable} from "immer";
import { handleParsonsItemMove, ParsonsDraggableItem } from "./IsaacParsonsQuestion";

const IsaacReorderQuestion = ({doc, questionId, readonly} : IsaacQuestionProps<IsaacReorderQuestionDTO>) => {
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);
    const [availableItems, setAvailableItems] = useState<Immutable<ItemDTO>[]>([...doc.items ?? []]);
    const attemptItems = (currentAttempt?.items || []) as Immutable<ItemChoiceDTO>[];
    const setAttemptItems = (items: Immutable<ItemChoiceDTO>[]) => {
        if (currentAttempt) {
            dispatchSetCurrentAttempt({...currentAttempt, items});
        } else {
            dispatchSetCurrentAttempt({type: "itemChoice", items});
        }
    };

    const onDragEnd = (result: DropResult) => {
        handleParsonsItemMove(result, availableItems, setAvailableItems, attemptItems, setAttemptItems);
    };

    const onCurrentAttemptUpdate = (newCurrentAttempt?: Immutable<ItemChoiceDTO>, newAvailableItems?: Immutable<ItemDTO>[]) => {
        if (!newCurrentAttempt) {
            const defaultAttempt: ItemChoiceDTO = {
                type: "itemChoice",
                items: [],
            };
            dispatchSetCurrentAttempt(defaultAttempt);
        }
        if (newCurrentAttempt) {
            // This makes sure that available items and current attempt items contain different items.
            // This is because available items always start from the document's available items (see constructor)
            // and the current attempt is assigned afterwards, so we need to carve it out of the available items.
            // This also takes care of updating the two lists when a user moves items from one to the other.
            let fixedAvailableItems: ItemDTO[] = [];
            const currentAttemptItems = newCurrentAttempt.items || [];
            if (doc.items) {
                fixedAvailableItems = doc.items.filter(item => {
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
            const diff = _differenceBy(newAvailableItems, fixedAvailableItems, 'id');
            // This stops re-rendering when availableItems have not changed from one state update to the next.
            // The set difference is empty if the two sets contain the same elements (by 'id', see above).
            if (diff.length > 0) {
                setAvailableItems(fixedAvailableItems);
            }
        }
    };

    useEffect(() => {
        onCurrentAttemptUpdate(currentAttempt, availableItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt, availableItems]);

    return <div className="parsons-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        <Row className="my-md-3">
            <DragDropContext onDragEnd={onDragEnd}>
                <Col md={{size: 6}} className="parsons-available-items">
                    <h4>Available items</h4>
                    <Droppable droppableId="availableItems">
                        {(provided, snapshot) =>
                            <div ref={provided.innerRef}
                                className={classNames("parsons-items", {"empty": !(availableItems && availableItems.length > 0), "drag-over": snapshot.isDraggingOver})}
                            >
                                {availableItems && availableItems.map((item, index) =>
                                    <ParsonsDraggableItem key={item.id} currentItem={item} index={index} inAvailableItems readonly={readonly}
                                        setItems={setAvailableItems} items={availableItems}/>)}
                                {(!availableItems || availableItems.length === 0)
                                    ? <div>&nbsp;</div>
                                    : provided.placeholder}
                            </div>
                        }
                    </Droppable>
                </Col>
                <Col md={{size: 6}} className={classNames({"no-print": !currentAttempt || currentAttempt?.items?.length === 0})}>
                    <h4 className="mt-sm-4 mt-md-0">Your answer</h4>
                    <Droppable droppableId="answerItems">
                        {(provided, snapshot) =>
                            <div id="parsons-choice-area" ref={provided.innerRef}
                                className={classNames("parsons-items", {"empty": !(currentAttempt && currentAttempt.items && currentAttempt.items.length > 0), "drag-over": snapshot.isDraggingOver})}
                            >
                                {currentAttempt && currentAttempt.items && currentAttempt.items.map((item, index) =>
                                    <ParsonsDraggableItem key={item.id} currentItem={item} index={index} readonly={readonly}
                                        setItems={(items: Immutable<ItemDTO>[]) => dispatchSetCurrentAttempt({...currentAttempt, items})} 
                                        items={(currentAttempt?.items || []) as Immutable<ItemDTO>[]}/>)}
                                {(!currentAttempt || currentAttempt?.items?.length === 0)
                                    ? <div className="text-muted text-center">
                                        {readonly ? "No answer entered" : "Drag items across to build your answer"}
                                    </div>
                                    : provided.placeholder}
                            </div>
                        }
                    </Droppable>
                </Col>
            </DragDropContext>
        </Row>
    </div>;
};
export default IsaacReorderQuestion;
