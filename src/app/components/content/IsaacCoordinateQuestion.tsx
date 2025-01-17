import React, {useCallback, useEffect} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {CoordinateChoiceDTO, CoordinateItemDTO, IsaacCoordinateQuestionDTO} from "../../../IsaacApiTypes";
import {Button, Input} from "reactstrap";
import {isDefined, useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {Immutable} from "immer";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";

// Custom input component for coordinates
interface CoordinateInputProps {
    value: Immutable<CoordinateItemDTO>;
    placeholderValues: string[];
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
    const {value, placeholderValues, numberOfDimensions, onChange, readonly, remove} = props;
    return <span className="coordinate-input">{[...Array(numberOfDimensions)].map((_, i) =>
        <>
            <Input
                key={i}
                type="text"
                className="force-print"
                placeholder={placeholderValues[i] ?? ""}
                value={value.coordinates ? value.coordinates[i] : ""}
                onChange={event => onChange({...value, coordinates: value.coordinates && value.coordinates.length ? value.coordinates.with(i, event.target.value) :
                    (event.target.value === "" ? undefined : Array<string>(numberOfDimensions).fill("").with(i, event.target.value))})}
                readOnly={readonly}
            />
            {(i < numberOfDimensions - 1) && <span className="coordinate-input-separator">,&nbsp;</span>}
        </>)}
    {remove && <Button className="ms-3" size="sm" onClick={remove}>Delete</Button>}
    </span>;
};

const DEFAULT_COORDINATE_ITEM = {type: "coordinateItem", coordinates: []};

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
                    placeholderValues={doc.placeholderValues ?? []}
                    numberOfDimensions={doc.numberOfDimensions ?? 1}
                    value={currentAttempt?.items?.[index] ?? {...DEFAULT_COORDINATE_ITEM}}
                    readonly={readonly}
                    onChange={value => updateItem(index, value)}
                />
            ) : (currentAttempt?.items && currentAttempt?.items.length > 0)
                ? <>
                    {currentAttempt?.items?.map((item, index) =>
                        <CoordinateInput
                            key={index}
                            placeholderValues={doc.placeholderValues ?? []}
                            numberOfDimensions={doc.numberOfDimensions ?? 1}
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
                    numberOfDimensions={doc.numberOfDimensions ?? 1}
                    value={{...DEFAULT_COORDINATE_ITEM}}
                    readonly={readonly}
                    onChange={value => updateItem(0, value)}
                />
        }
        <QuestionInputValidation userInput={currentAttempt?.items?.map(answer => answer.coordinates ?? []) ?? []} validator={coordinateInputValidator}/>
        {!doc.numberOfCoordinates && <Button color="secondary" size="sm" className="mt-3" onClick={() => updateItem(currentAttempt?.items?.length ?? 1, {...DEFAULT_COORDINATE_ITEM})}>Add coordinate</Button>}
    </div>;
};
export default IsaacCoordinateQuestion;
