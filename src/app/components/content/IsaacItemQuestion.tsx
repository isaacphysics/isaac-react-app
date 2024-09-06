import React, {ChangeEvent} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacItemQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {Input, Label} from "reactstrap";
import {isAda, useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";

const IsaacItemQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacItemQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);

    function updateItems(changeEvent: ChangeEvent<HTMLInputElement>, item: ItemDTO) {
        const selected = changeEvent.target.checked;
        const currentItems = currentAttempt && currentAttempt.items || [];
        const makeNewItems = () => {
            if (selected) {
                if (!currentItems) {
                    return [item];
                } else if (currentItems.filter(i => i.id === item.id).length === 0) {
                    return [...currentItems, item];
                }
            } else if (currentItems) {
                return currentItems.filter(i => i.id !== item.id);
            }
        };
        dispatchSetCurrentAttempt({type: "itemChoice", items: makeNewItems()});
    }

    return (
        <div className="multichoice-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>

            <ul>{doc.items && doc.items.map((item) =>
                <li key={item.value} className="list-unstyled">
                    <Label className="label-radio multichoice-option d-flex">
                        <Input
                            id={`${questionId}|${item.id}`}
                            color="secondary"
                            type="checkbox"
                            checked={!!(currentAttempt && currentAttempt.items && currentAttempt.items.filter(i => i.id == item.id).length == 1)}
                            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => updateItems(changeEvent, item)}
                            disabled={readonly}
                            className={classNames({"mt-1": isAda})}
                        />
                        <div className="flex-fill overflow-x-auto">
                            <IsaacContentValueOrChildren value={item.value} encoding={doc.encoding} />
                        </div>
                    </Label>
                </li>)
            }</ul>
        </div>
    );
};
export default IsaacItemQuestion;
