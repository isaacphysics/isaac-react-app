import { useEffect, useRef, useState } from "react";
import React from "react";

interface QuestionInputValidationProps<T> {
    userInput: T;
    validator: (i: T) => string[];
}

const QuestionInputValidation = <T,>({userInput, validator}: QuestionInputValidationProps<T>) => {
    const [errors, setErrors] = useState<string[]>([]);
    const debounceTimer = useRef<number|null>(null);

    useEffect(() => {
        if (debounceTimer.current) {
            window.clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        debounceTimer.current = window.setTimeout(() => {
            setErrors(validator(userInput));
        }, 250);
    }, [userInput, validator]);

    return errors.length > 0 && <div className="question-feedback-input-errors mt-2">
        <strong>Careful!</strong>
        <ul className="mb-1">{errors.map(e => (<li key={e}>{e}</li>))}</ul>
    </div>;
};

export default QuestionInputValidation;
