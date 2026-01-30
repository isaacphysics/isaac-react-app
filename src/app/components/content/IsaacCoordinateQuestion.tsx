import React, {useCallback} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {CoordinateChoiceDTO, CoordinateItemDTO, IsaacCoordinateQuestionDTO} from "../../../IsaacApiTypes";
import {Button, Input} from "reactstrap";
import {isDefined, useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {Immutable} from "immer";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import { Markup } from "../elements/markup";

// Custom input component for coordinates
interface CoordinateInputProps {
    value: Immutable<CoordinateItemDTO>;
    placeholderValues: string[];
    useBrackets: boolean;
    separator: string;
    prefixes?: string[];
    suffixes?: string[];
    numberOfDimensions: number;
    onChange: (value: Immutable<CoordinateItemDTO>) => void;
    readonly?: boolean;
    remove?: () => void;
}

export const coordinateInputValidator = (input: (readonly string[])[]) => {
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
            const foundBadChars = [...value.matchAll(/[^ 0-9+-.eE]/g)];
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

const coordItemToValue = function (item: Immutable<CoordinateItemDTO>, index: number) {
    if (isDefined(item.x) && isDefined(item.y) ) {
        // This is an old-style choice, we need to display the x and y properties for indexes 0 and 1.
        return index === 0 ? item.x : (index === 1 ? item.y : "");
    }
    return isDefined(item.coordinates?.[index]) ? item.coordinates[index] : "";
};

const updateCoordItem = function (item: Immutable<CoordinateItemDTO>, newValue: string, index: number, numberOfDimensions: number) {
    let coords;
    if (!item?.coordinates?.length) {
        // Create an array, and backfill with old-style x and y if necessary:
        coords = Array<string>(numberOfDimensions).fill("");
        if (isDefined(item.x)) {
            coords[0] = item.x;
        }
        if (isDefined(item.y)) {
            coords[1] = item.y;
        }
    } else {
        coords = item.coordinates;
    }
    coords = coords.with(index, newValue);
    return {...item, coordinates: coords};
};

const cleanItem = function (item: Immutable<CoordinateItemDTO>) {
    const { x, y, ...cleaned } = item;
    // Remove x and y from the top-level object, but only discard if coordinates already set, otherwise use to init:
    if (isDefined(x) && isDefined(y) && !isDefined(cleaned.coordinates)) {
        return {...cleaned, coordinates: [x, y]};
    }
    return cleaned;
};

const CoordinateInput = (props: CoordinateInputProps) => {
    const {value, placeholderValues, useBrackets, separator, prefixes, suffixes, numberOfDimensions, onChange, readonly, remove} = props;
    return <span className="coordinate-input">
        {useBrackets ? "(" : ""}
        {[...Array(numberOfDimensions)].map((_, i) =>
            <span key={i}>
                {prefixes && prefixes[i] && <Markup encoding="latex">{prefixes[i]}</Markup>}
                <Input
                    type="text"
                    className="force-print"
                    placeholder={placeholderValues[i] ?? ""}
                    value={coordItemToValue(value, i)}
                    onChange={event => onChange(updateCoordItem(value, event.target.value, i, numberOfDimensions))}
                    readOnly={readonly}
                />
                {suffixes && suffixes[i] && <Markup encoding="latex">{suffixes[i]}</Markup>}
                {(i < numberOfDimensions - 1) && <Markup encoding="latex" className="coordinate-input-separator">{separator}</Markup>}
            </span>)}
        {useBrackets ? ")" : ""}
        {remove && <Button className="ms-3" size="sm" onClick={remove}>Delete</Button>}
    </span>;
};

const IsaacCoordinateQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacCoordinateQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<CoordinateChoiceDTO>(questionId);

    const numberOfDimensions = doc.numberOfDimensions ?? 2;
    const buttonText = doc.buttonText ?? "Add coordinate";

    const getEmptyCoordItem = useCallback((): CoordinateItemDTO => {
        return {type: "coordinateItem", coordinates: Array<string>(numberOfDimensions).fill("")};
    }, [numberOfDimensions]);

    const updateItem = useCallback((index: number, value: Immutable<CoordinateItemDTO>) => {
        const items = [...(currentAttempt?.items ?? [])].map(item => isDefined(item) ? cleanItem(item) : getEmptyCoordItem());
        items[index] = cleanItem(value);
        dispatchSetCurrentAttempt({type: "coordinateChoice", items});
    }, [currentAttempt, dispatchSetCurrentAttempt, getEmptyCoordItem]);

    const removeItem = useCallback((index: number) => {
        const items = [...(currentAttempt?.items ?? [])].map(item => isDefined(item) ? cleanItem(item) : getEmptyCoordItem());
        items.splice(index, 1);
        dispatchSetCurrentAttempt({type: "coordinateChoice", items});
    }, [currentAttempt, dispatchSetCurrentAttempt, getEmptyCoordItem]);

    const addCoord = useCallback(() => {
        if (!isDefined(currentAttempt)) {
            dispatchSetCurrentAttempt({type: "coordinateChoice", items: [getEmptyCoordItem(), getEmptyCoordItem()]});
        }
        else {
            updateItem(currentAttempt?.items?.length ?? 1, getEmptyCoordItem());
        }
    }, [currentAttempt, dispatchSetCurrentAttempt, getEmptyCoordItem, updateItem]);

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
                    placeholderValues={doc.placeholderValues ?? []}
                    useBrackets={doc.useBrackets ?? true}
                    separator={doc.separator ?? ","}
                    prefixes={doc.prefixes}
                    suffixes={doc.suffixes}
                    numberOfDimensions={numberOfDimensions}
                    value={currentAttempt?.items?.[index] ?? getEmptyCoordItem()}
                    readonly={readonly}
                    onChange={value => updateItem(index, value)}
                />
            ) : (currentAttempt?.items && currentAttempt?.items.length > 0)
                ? <>
                    {currentAttempt?.items?.map((item, index) =>
                        <CoordinateInput
                            key={index}
                            placeholderValues={doc.placeholderValues ?? []}
                            useBrackets={doc.useBrackets ?? true}
                            separator={doc.separator ?? ","}
                            prefixes={doc.prefixes}
                            suffixes={doc.suffixes}
                            numberOfDimensions={numberOfDimensions}
                            value={item}
                            readonly={readonly}
                            onChange={value => updateItem(index, value)}
                            remove={(currentAttempt?.items && currentAttempt?.items.length > 1) ? () => removeItem(index) : undefined}
                        />
                    )}
                </>
                : <CoordinateInput
                    key={0}
                    placeholderValues={doc.placeholderValues ?? []}
                    useBrackets={doc.useBrackets ?? true}
                    separator={doc.separator ?? ","}
                    prefixes={doc.prefixes}
                    suffixes={doc.suffixes}
                    numberOfDimensions={numberOfDimensions}
                    value={getEmptyCoordItem()}
                    readonly={readonly}
                    onChange={value => updateItem(0, value)}
                />
        }
        <QuestionInputValidation userInput={currentAttempt?.items?.map(answer => answer.coordinates ?? []) ?? []} validator={coordinateInputValidator}/>
        {!doc.numberOfCoordinates && <Button color="secondary" size="sm" className="mt-3" onClick={addCoord}>
            <Markup encoding="latex">{buttonText}</Markup>
        </Button>}
    </div>;
};
export default IsaacCoordinateQuestion;
