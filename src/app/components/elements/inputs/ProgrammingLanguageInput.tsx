import {FormGroup, Input, Label} from "reactstrap";
import {PROGRAMMING_LANGUAGE, programmingLanguagesMap} from "../../../services";
import {ProgrammingLanguage} from "../../../../IsaacAppTypes";
import React, {ChangeEvent} from "react";


interface ProgrammingLanguageInputProps {
    programmingLanguage: Nullable<ProgrammingLanguage>;
    setProgrammingLanguage: (language: ProgrammingLanguage) => void;
}

export const ProgrammingLanguageInput = ({programmingLanguage, setProgrammingLanguage} : ProgrammingLanguageInputProps) => {
    return <FormGroup>
        <Label className={"font-weight-bold"} htmlFor="programming-language-select">Preferred programming language</Label>
        <Input
            type="select"
            name="select"
            id="programming-language-select"
            value={Object.values(PROGRAMMING_LANGUAGE).reduce((val: string | undefined, key) =>
                programmingLanguage?.[key as keyof ProgrammingLanguage] ? key : val, PROGRAMMING_LANGUAGE.NONE)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                let newProgrammingLanguage = Object.entries(programmingLanguage ?? {}).reduce((acc, [k, v]) => ({...acc, [k]: false}), {});
                setProgrammingLanguage(event.target.value ? {...newProgrammingLanguage, [event.target.value]: true} : newProgrammingLanguage);
            }}
        >
            <option />
            <option value={PROGRAMMING_LANGUAGE.PSEUDOCODE}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PSEUDOCODE]}</option>
            <option value={PROGRAMMING_LANGUAGE.PYTHON}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.PYTHON]}</option>
            <option value={PROGRAMMING_LANGUAGE.CSHARP}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.CSHARP]}</option>
            <option value={PROGRAMMING_LANGUAGE.VBA}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.VBA]}</option>
            <option value={PROGRAMMING_LANGUAGE.JAVA}>{programmingLanguagesMap[PROGRAMMING_LANGUAGE.JAVA]}</option>
        </Input>
    </FormGroup>
}
