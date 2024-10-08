import React, {useCallback, useEffect} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {CoordinateChoiceDTO, CoordinateItemDTO, IsaacCoordinateQuestionDTO} from "../../../IsaacApiTypes";
import {Button, Input} from "reactstrap";
import {isDefined, useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {Immutable} from "immer";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";

// Custom input component for coordinates - a pair of inputs, one for x and one for y, formatted with brackets
// and a comma in between.
interface CoordinateInputProps {
    value: Immutable<CoordinateItemDTO>;
    placeholderXValue?: string;
    placeholderYValue?: string;
    onChange: (value: Immutable<CoordinateItemDTO>) => void;
    readonly?: boolean;
    remove?: () => void;
}

export const coordinateInputValidator = (input: string[][]) => {
    const errors: string[] = [];
    const allBadChars: string[] = [];
    let containsComma = false;
    let containsOperator = false;
    input.forEach((coordinate) => {
        coordinate.forEach((value) => {
            if (value.includes(",")) {
                containsComma = true;
            }
            if (/[0-9]\s*[+/÷\-x×]\s*[0-9]/.test(value)) {
                containsOperator = true;
            }
            const foundBadChars =  [...value.matchAll(/[^ 0-9+-.eE]/g)];
            if (foundBadChars.length > 0) {
                allBadChars.push(foundBadChars.toString());
            }
        });
    });
    if (containsComma) {
        errors.push('Your answer should not contain commas. Enter each part of your answer in a separate box.');
    }
    if (containsOperator) {
        errors.push('Simplify each part of your answer into a single decimal number.');
    }
    if (allBadChars.length > 0) {
        const uniqueBadChars = [...new Set(allBadChars.toString())].filter(e => e !== ",").join(" ");
        errors.push('Some of the characters you are using are not allowed: ' + uniqueBadChars);
    }
    return errors;
};

const CoordinateInput = (props: CoordinateInputProps) => {
    const {value, placeholderXValue, placeholderYValue, onChange, readonly, remove} = props;
    return <span className="coordinate-input">
        (
        <Input
            type="text"
            className="force-print"
            placeholder={placeholderXValue ?? "x"}
            value={value.x ?? ""}
            onChange={event => onChange({...value, x: event.target.value === "" ? undefined : event.target.value})}
            readOnly={readonly}
        />
        <span className="coordinate-input-separator">,&nbsp;</span>
        <Input
            type="text"
            className="force-print"
            placeholder={placeholderYValue ?? "y"}
            value={value.y ?? ""}
            onChange={event => onChange({...value, y: event.target.value === "" ? undefined : event.target.value})}
            readOnly={readonly}
        />
        )
        {remove && <Button className="ms-3" size="sm" onClick={remove}>Delete</Button>}
    </span>;
};

const DEFAULT_COORDINATE_ITEM = {type: "coordinateItem", x: undefined, y: undefined};

const IsaacCoordinateQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacCoordinateQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<CoordinateChoiceDTO>(questionId);

    useEffect(() => {
        if (!isDefined(currentAttempt)) {
            dispatchSetCurrentAttempt({type: "coordinateChoice", items: [{...DEFAULT_COORDINATE_ITEM}]});
        }
    }, [dispatchSetCurrentAttempt, currentAttempt]);

    const updateItem = useCallback((index: number, value: Immutable<CoordinateItemDTO>) => {
        const items = [...(currentAttempt?.items ?? [])].map(item => isDefined(item) ? item : {...DEFAULT_COORDINATE_ITEM});
        items[index] = value;
        dispatchSetCurrentAttempt({type: "coordinateChoice", items});
    }, [currentAttempt, dispatchSetCurrentAttempt]);

    const removeItem = useCallback((index: number) => {
        const items = [...(currentAttempt?.items ?? [])].map(item => isDefined(item) ? item : {...DEFAULT_COORDINATE_ITEM});
        items.splice(index, 1);
        dispatchSetCurrentAttempt({type: "coordinateChoice", items});
    }, [currentAttempt, dispatchSetCurrentAttempt]);

    return <div className="coordinate-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {doc.numberOfCoordinates
            ? Array.from({length: doc.numberOfCoordinates}).map((_, index) =>
                <CoordinateInput
                    key={index}
                    placeholderXValue={doc.placeholderXValue}
                    placeholderYValue={doc.placeholderYValue}
                    value={currentAttempt?.items?.[index] ?? {...DEFAULT_COORDINATE_ITEM}}
                    readonly={readonly}
                    onChange={value => updateItem(index, value)}
                />
            ) : (currentAttempt?.items && currentAttempt?.items.length > 0)
                ? <>
                    {currentAttempt?.items?.map((item, index) =>
                        <CoordinateInput
                            key={index}
                            placeholderXValue={doc.placeholderXValue}
                            placeholderYValue={doc.placeholderYValue}
                            value={item}
                            readonly={readonly}
                            onChange={value => updateItem(index, value)}
                            remove={(currentAttempt?.items && currentAttempt?.items.length > 1) ? () => removeItem(index) : undefined}
                        />
                    )}
                </>
                : <CoordinateInput
                    key={0}
                    placeholderXValue={doc.placeholderXValue}
                    placeholderYValue={doc.placeholderYValue}
                    value={{...DEFAULT_COORDINATE_ITEM}}
                    readonly={readonly}
                    onChange={value => updateItem(0, value)}
                />
        }
        <QuestionInputValidation userInput={currentAttempt?.items?.map(answer => [answer.x ?? "", answer.y ?? ""]) ?? []} validator={coordinateInputValidator}/>
        {!doc.numberOfCoordinates && <Button color="secondary" size="sm" className="mt-3" onClick={() => updateItem(currentAttempt?.items?.length ?? 1, {...DEFAULT_COORDINATE_ITEM})}>Add coordinate</Button>}
    </div>;
};
export default IsaacCoordinateQuestion;
