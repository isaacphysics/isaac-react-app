import React, {ChangeEvent} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacItemQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {CustomInput, Label} from "reactstrap";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";

export const IsaacItemQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacItemQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);

    function updateItems(changeEvent: ChangeEvent<HTMLInputElement>, item: ItemDTO) {
        const selected = changeEvent.target.checked;
        const currentItems = currentAttempt && currentAttempt.items || [];
        const itemChoice: ItemChoiceDTO = {type: "itemChoice", items: currentItems};

        if (selected) {
            if (!itemChoice.items) {
                itemChoice.items = [item];
            } else if (itemChoice.items.filter(i => i.id == item.id).length == 0) {
                itemChoice.items.push(item);
            }
        } else if (itemChoice.items) {
            itemChoice.items = itemChoice.items.filter(i => i.id !== item.id);
        }
        dispatchSetCurrentAttempt(itemChoice);
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
                        <CustomInput
                            id={`${questionId}|${item.id}`}
                            color="secondary"
                            type="checkbox"
                            checked={!!(currentAttempt && currentAttempt.items && currentAttempt.items.filter(i => i.id == item.id).length == 1)}
                            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => updateItems(changeEvent, item)}
                            disabled={readonly}
                        />
                        <div className="flex-fill">
                            <IsaacContentValueOrChildren value={item.value} encoding={doc.encoding} />
                        </div>
                    </Label>
                </li>)
            }</ul>
        </div>
    );
};
