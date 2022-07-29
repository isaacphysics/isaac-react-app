import React, {useEffect, useState} from "react";
import {FreeTextRule} from "../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {ContentBase, TestCaseDTO} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {testQuestion} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {Tabs} from "../elements/Tabs";
import {atLeastOne} from "../../services/validation";
import {IsaacContent} from "../content/IsaacContent";

interface AugmentedTestCase extends TestCaseDTO {
    match?: boolean;
}

// JS implementation of something similar to Java's toHash() - from StackOverflow. Good enough for our use here.
function stringHash(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function choiceHash(choice: FreeTextRule) {
    const {value, correct, explanation, caseInsensitive, allowsAnyOrder, allowsExtraWords, allowsMisspelling} = choice;
    const definingProperties =
        "" + value + correct + stringHash(JSON.stringify(explanation)) +
        caseInsensitive + allowsAnyOrder + allowsExtraWords + allowsMisspelling;
    return stringHash(definingProperties);
}

function choicesHash(choices: FreeTextRule[]) {
    return stringHash(choices.map(c => choiceHash(c)).join(","));
}

function testCaseHash(testCaseInput: TestCaseDTO) {
    return (testCaseInput.answer && testCaseInput.answer.value || "") + testCaseInput.expected;
}

function checkMark(boolean?: boolean) {
    if (boolean === true) {
        return "✔️";
    } else if (boolean === false) {
        return "❌";
    }
}

let choiceNumber = 0;
function generateDefaultChoice() {
    choiceNumber++;
    return {
        "choiceNumber": choiceNumber, "type": "freeTextRule", "encoding": "markdown", "value": "",
        "correct": true, "caseInsensitive": true, "allowsAnyOrder": false, "allowsExtraWords": false, "allowsMisspelling": false,
        "explanation": {"type": "content", "children": [{"type": "content", "value": `Match ${choiceNumber}`, "encoding": "markdown"}], "encoding": "markdown"}
    }
}
const defaultChoiceExample = generateDefaultChoice();
function removeChoiceNumber(choice: FreeTextRule & {choiceNumber: number}) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {choiceNumber, ...cleanChoice} = choice;
    return cleanChoice;
}
function notEqualToDefaultChoice(choice: FreeTextRule) {
    return choiceHash(choice) != choiceHash(defaultChoiceExample);
}

function convertQuestionChoicesToJson(questionChoices: (FreeTextRule & {choiceNumber: number})[]) {
    return JSON.stringify(questionChoices.map(removeChoiceNumber), null, 2)
}

function convertJsonToQuestionChoices(jsonString: string) {
    let parsedJson = JSON.parse(jsonString);
    let choicesArray;
    if (Array.isArray(parsedJson)) {
        choicesArray = parsedJson;
    } else if (parsedJson.hasOwnProperty("type") && parsedJson.type == "isaacFreeTextQuestion") {
        choicesArray = parsedJson.choices;
    } else {
        throw TypeError("Neither a Choices array nor a FreeTextQuestion");
    }
    return choicesArray.map(
        (choice: FreeTextRule, i: number) => Object.assign(choice, {choiceNumber: i})
    );
}

let testCaseNumber = 0;
function generateDefaultTestCase() {
    testCaseNumber++;
    return {testCaseNumber: testCaseNumber, expected: true, answer: {type: "stringChoice", value: ""}}
}
const defaultTestCaseExample = generateDefaultTestCase();
function removeTestCaseNumber(testCase: TestCaseDTO & {testCaseNumber: number}) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {testCaseNumber, ...cleanTestCase} = testCase;
    return cleanTestCase;
}
function notEqualToDefaultTestCase(testCase: TestCaseDTO) {
    return testCaseHash(testCase) != testCaseHash(defaultTestCaseExample);
}

function convertTestCasesToCsv(testCases: TestCaseDTO[]) {
    return testCases.map(tc => `${tc.expected},${tc.answer?.value?.split("\n").join("\\n")}`).join("\n");
}
function convertCsvToTestCases(testCasesCsv: string): (TestCaseDTO & {testCaseNumber: number})[] {
    return testCasesCsv.split("\n").map((testCaseString, index) => {
        const [expected, ...value] = testCaseString.split(",");
        return {testCaseNumber: index, expected: expected === "true", answer: {type: "stringChoice", value: value.join(",")}};
    });
}

function isEditableExplanation(explanation?: any) {
    return explanation?.children && explanation.children.length > 0 && explanation.children[0].value !== undefined;
}

export const FreeTextBuilder = () => {
    const dispatch = useAppDispatch();
    const testCaseResponses = useAppSelector((state: AppState) => state && state.testQuestions || []);

    const [questionChoices, setQuestionChoices] = useState<(FreeTextRule & {choiceNumber: number})[]>([JSON.parse(JSON.stringify(defaultChoiceExample))]);
    const [questionChoicesJson, setQuestionChoicesJson] = useState(convertQuestionChoicesToJson(questionChoices));
    const [jsonParseError, setJsonParseError] = useState(false);
    useEffect(() => {setQuestionChoicesJson(convertQuestionChoicesToJson(questionChoices))}, [questionChoices]);

    const [testCases, setTestCases] = useState<(TestCaseDTO & {testCaseNumber: number})[]>([JSON.parse(JSON.stringify(defaultTestCaseExample))]);
    const [testCasesCsv, setTestCasesCsv] = useState(convertTestCasesToCsv(testCases));
    const [csvParseError, setCsvParseError] = useState(false);
    useEffect(() => {setTestCasesCsv(convertTestCasesToCsv(testCases))}, [testCases]);

    const [choicesHashAtPreviousRequest, setChoicesHashAtPreviousRequest] = useState<number | null>(null);

    const testCaseResponseMap: {[key: string]: AugmentedTestCase} = {};
    if (choicesHashAtPreviousRequest === choicesHash(questionChoices)) {
        // augment response with whether there was a match between the expected and actual and populate the test case response map
        testCaseResponses
            .map(response => Object.assign(response, {match: response.expected !== undefined ? response.expected === response.correct : undefined}))
            .forEach(testCaseResponse => testCaseResponseMap[testCaseHash(testCaseResponse)] = testCaseResponse);
    }
    const numberOfResponseMatches = Object.values(testCaseResponseMap).filter(testCase => testCase.match).length;
    const cleanQuestionChoices = questionChoices.map(removeChoiceNumber).filter(notEqualToDefaultChoice);
    const cleanTestCases = testCases.map(removeTestCaseNumber).filter(notEqualToDefaultTestCase);
    const atLeastOneQuestionChoiceAndTestCase = atLeastOne(cleanQuestionChoices.length) && atLeastOne(cleanTestCases.length);

    return <RS.Container>
        <TitleAndBreadcrumb className="mb-4" currentPageTitle="Free-text question builder" />
        <RS.Form onSubmit={(event: React.FormEvent) => {
            if (event) {event.preventDefault();}
            if (atLeastOneQuestionChoiceAndTestCase) {
                setChoicesHashAtPreviousRequest(choicesHash(questionChoices));
                dispatch(testQuestion(cleanQuestionChoices, cleanTestCases));
            }
        }}>
            <RS.Card className="mb-4">
                <RS.CardBody>
                    <h2 className="h3">Matching rules</h2>
                    <Tabs className="d-flex flex-column-reverse" tabTitleClass="px-3">
                        {{
                            'GUI': <RS.Table className="mb-3">
                                <thead><tr><th>Rule</th><th colSpan={3}>Response</th></tr></thead>
                                <tbody>
                                    {questionChoices.map(choice => <tr key={choice.choiceNumber}>
                                        <td>
                                            <RS.Label className="mb-3 w-100">
                                                Value
                                                <div className="d-flex align-items-center">
                                                    <RS.Input
                                                        className="w-100" type="text" value={choice.value}
                                                        onChange={e => setQuestionChoices(questionChoices.map(c => choice == c ? {...c, value: e.target.value} : c))}
                                                    />
                                                    <span id={`choice-help-${choice.choiceNumber}`} className="icon-help mr-2" />
                                                </div>
                                            </RS.Label>
                                            <RS.UncontrolledTooltip target={`choice-help-${choice.choiceNumber}`} placement="bottom" innerClassName="">
                                                <div className="text-left">
                                                    <RS.Table>
                                                        <thead>
                                                            <tr><th className="text-light" colSpan={2}>In-word wildcards:</th></tr>
                                                        </thead>
                                                        <tr>
                                                            <td><strong><code className="text-dark">|</code></strong></td>
                                                            <td className="text-light">Separate an OR list of word choices.</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong><code className="text-dark">.</code></strong></td>
                                                            <td className="text-light">Match only one character.</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong><code className="text-dark">*</code></strong></td>
                                                            <td className="text-light">Match zero or more characters.</td>
                                                        </tr>
                                                    </RS.Table>
                                                </div>
                                            </RS.UncontrolledTooltip>
                                            <RS.Row>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setQuestionChoices(questionChoices.map(c => choice == c ? {...c, caseInsensitive: !c.caseInsensitive} : c))}>
                                                        <RS.Label>Ignore case {checkMark(choice.caseInsensitive)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setQuestionChoices(questionChoices.map(c => choice == c ? {...c, allowsAnyOrder: !c.allowsAnyOrder} : c))}>
                                                        <RS.Label>Any order {checkMark(choice.allowsAnyOrder)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setQuestionChoices(questionChoices.map(c => choice == c ? {...c, allowsExtraWords: !c.allowsExtraWords} : c))}>
                                                        <RS.Label>Extra words {checkMark(choice.allowsExtraWords)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setQuestionChoices(questionChoices.map(c => choice == c ? {...c, allowsMisspelling: !c.allowsMisspelling} : c))}>
                                                        <RS.Label>Misspelling {checkMark(choice.allowsMisspelling)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                            </RS.Row>
                                        </td>
                                        <td className="align-middle">
                                            <RS.Button color="link" onClick={() => setQuestionChoices(questionChoices.map(c => choice == c ? {...c, correct: !c.correct} : c))}>
                                                <div className="h4 px-4">{checkMark(choice.correct)}</div>
                                            </RS.Button>
                                        </td>
                                        <td>
                                            <RS.Label>
                                                Feedback:
                                                {isEditableExplanation(choice.explanation) ?
                                                    <RS.Input
                                                        type="textarea" value={(choice.explanation as any).children[0].value}
                                                        onChange={event => {
                                                            const explanation = choice.explanation as any;
                                                            explanation.children[0].value = event.target.value;
                                                            setQuestionChoices(questionChoices.map(c => choice == c ? {...c, explanation} : c));
                                                        }}
                                                    />
                                                    :
                                                    <IsaacContent doc={choice.explanation as ContentBase}/>
                                                }
                                            </RS.Label>
                                        </td>
                                        <td>
                                            <button
                                                type="button" className="close" aria-label="Delete matching rule"
                                                onClick={() => setQuestionChoices(questionChoices.filter(choiceInState => choice !== choiceInState))}
                                            >×</button>
                                        </td>
                                    </tr>)}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="text-center pb-3">
                                            <RS.Button color="link" onClick={() => setQuestionChoices([...questionChoices, generateDefaultChoice()])}>
                                                <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                                            </RS.Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </RS.Table>,
                            "JSON": <div className="mb-3">
                                <p>JSON for the <strong>choices</strong> part of your isaacFreeTextQuestion</p>
                                <RS.Input
                                    type="textarea" rows={25} className={jsonParseError ? "alert-danger" : ""}
                                    value={questionChoicesJson}
                                    onChange={event => {
                                        setQuestionChoicesJson(event.target.value);
                                        setJsonParseError(false);
                                    }}
                                />
                                <div className="text-center">
                                    <RS.Button
                                        className="my-2" onClick={() => {
                                            try {
                                                setQuestionChoices(convertJsonToQuestionChoices(questionChoicesJson));
                                            } catch (e) {
                                                setJsonParseError(true);
                                            }
                                        }}
                                    >
                                        Submit
                                    </RS.Button>
                                </div>
                            </div>
                        }}
                    </Tabs>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="mb-4">
                <RS.CardBody>
                    <h2 className="h3">Test answers ({numberOfResponseMatches}/{testCases.length})</h2>
                    <Tabs className="d-flex flex-column-reverse" tabTitleClass="px-3">
                        {{
                            'GUI': <RS.Table className="mb-2">
                                <thead>
                                    <tr>
                                        <th className="w-10 text-center">Expected</th>
                                        <th>Value</th>
                                        <th className="bg-light w-10 text-center">Actual</th>
                                        <th className="bg-light w-20">Feedback</th>
                                        <th className="bg-light w-10 text-center">Match</th>
                                        <th className="bg-light"/>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testCases.map(testCase => {
                                        const testCaseResponse = testCaseResponseMap[testCaseHash(testCase)];
                                        const matchFailure = !!testCaseResponse && testCaseResponse.match == false;
                                        return <tr key={testCase.testCaseNumber}>
                                            <td className="w-10 text-center align-middle">
                                                <RS.Button color="link" onClick={() => setTestCases(testCases.map(tc => testCase == tc ? {...tc, expected: !tc.expected} : tc))}>
                                                    {checkMark(testCase.expected)}
                                                </RS.Button>
                                            </td>
                                            <td>
                                                <RS.Input
                                                    type="text" value={testCase?.answer?.value || ""}
                                                    onChange={event => setTestCases(testCases.map(
                                                        testCaseInState => testCaseInState === testCase ?
                                                            {...testCase, answer: {...testCase.answer, value: event.target.value}} :
                                                            testCaseInState
                                                    ))}
                                                />
                                            </td>

                                            <td className={`w-10 text-center align-middle ${matchFailure ? "alert-danger" : "bg-light"}`}>
                                                {testCaseResponse && checkMark(testCaseResponse.correct)}
                                            </td>
                                            <td className={`align-middle ${matchFailure ? "alert-danger" : "bg-light"}`}>
                                                {testCaseResponse?.explanation && <IsaacContent doc={testCaseResponse.explanation}/>}
                                            </td>
                                            <td className={`w-10 text-center align-middle ${matchFailure ? "alert-danger" : "bg-light"}`}>
                                                {testCaseResponse && checkMark(testCaseResponse.match)}
                                            </td>
                                            <td className={`${matchFailure ? "alert-danger" : "bg-light"}`}>
                                                <button
                                                    type="button" className="close" aria-label="Delete matching rule"
                                                    onClick={() => setTestCases(testCases.filter(testCaseInState => testCase !== testCaseInState))}
                                                >×</button>
                                            </td>
                                        </tr>;
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={6} className="text-center pb-3">
                                            <RS.Button color="link" onClick={() => setTestCases([...testCases, generateDefaultTestCase()])}>
                                                <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                                            </RS.Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </RS.Table>,
                            'CSV': <div className="mb-3">
                                <p>Enter test cases as CSV with the headers: expected(true/false), value</p>
                                <RS.Input type="textarea" rows={10} value={testCasesCsv} onChange={event => {
                                    setCsvParseError(false);
                                    setTestCasesCsv(event.target.value);
                                }} />
                                <div className="text-center">
                                    <RS.Button
                                        className={`my-2 ${csvParseError ? "alert-danger" : ""}`}
                                        onClick={() => {
                                            try {
                                                setTestCases(convertCsvToTestCases(testCasesCsv));
                                            } catch (e) {
                                                setCsvParseError(true);
                                            }
                                        }}
                                    >
                                        Submit
                                    </RS.Button>
                                </div>
                            </div>
                        }}
                    </Tabs>
                </RS.CardBody>
            </RS.Card>

            <div className="mb-5 text-center">
                <RS.Input type="submit" value="Test question" className="btn btn-xl btn-secondary border-0" />
            </div>
        </RS.Form>
    </RS.Container>;
};
