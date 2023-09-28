import { useRef, useState } from "react";
import { isDefined } from "../../services";
import React from "react";

interface QuestionInputValidationProps<T> {
    userInput: T;
    validator: (i: T) => string[];
}

const QuestionInputValidation = <T,>({userInput, validator}: QuestionInputValidationProps<T>) => {
    const [errors, setErrors] = useState<string[]>([]);
    const debounceTimer = useRef<number|null>(null);

    if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
    }
    debounceTimer.current = window.setTimeout(() => {
        setErrors(validator(userInput));
    }, 250);

    return <>
        {isDefined(errors) && Array.isArray(errors) && errors.length > 0 && 
            <div className="question-feedback-input-errors"><strong>Careful!</strong><ul>
                {errors.map(e => (<li key={e}>{e}</li>))}
            </ul></div>
        }
    </>;
};

export default QuestionInputValidation;