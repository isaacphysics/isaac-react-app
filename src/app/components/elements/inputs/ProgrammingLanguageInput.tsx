import {FormGroup, Label} from "reactstrap";
import {PROGRAMMING_LANGUAGE, programmingLanguagesMap} from "../../../services";
import {ProgrammingLanguage} from "../../../../IsaacAppTypes";
import React from "react";
import {StyledDropdown} from "./DropdownInput";
import classNames from "classnames";


interface ProgrammingLanguageInputProps {
    programmingLanguage: Nullable<ProgrammingLanguage>;
    setProgrammingLanguage: (language: ProgrammingLanguage) => void;
    isRequired?: boolean;
}

export const ProgrammingLanguageInput = ({programmingLanguage, setProgrammingLanguage, isRequired = false} : ProgrammingLanguageInputProps) => {
    const onChange = (event: any) => {
        const newProgrammingLanguage = Object.entries(programmingLanguage ?? {}).reduce((acc, [k, _v]) => ({...acc, [k]: false}), {});
        setProgrammingLanguage(event.target.value ? {...newProgrammingLanguage, [event.target.value]: true} : newProgrammingLanguage);
    };

    return <FormGroup className="form-group me-lg-5">
        <Label className={classNames("fw-bold", (isRequired ? "form-required" : "form-optional"))}
               htmlFor="programming-language-select">Preferred programming language</Label>
        <StyledDropdown
            id="programming-language-select"
            value={Object.values(PROGRAMMING_LANGUAGE).reduce((val: string | undefined, key) =>
                programmingLanguage?.[key as keyof ProgrammingLanguage] ? key : val, "")}
            onChange={onChange}
        >
            <option value=""/>
            {[PROGRAMMING_LANGUAGE.PSEUDOCODE, PROGRAMMING_LANGUAGE.PYTHON, PROGRAMMING_LANGUAGE.CSHARP, PROGRAMMING_LANGUAGE.VBA, PROGRAMMING_LANGUAGE.JAVA].map((language) => (
                <option key={language} value={language}>{programmingLanguagesMap[language]}</option>
            ))}
        </StyledDropdown>
    </FormGroup>;
};
