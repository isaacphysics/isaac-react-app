import React, {useMemo, useState} from "react";
import {FreeTextRule, LoggedInUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";
import * as RS from "reactstrap";
import {TestCaseDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "../content/IsaacContent";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {testQuestion} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {Tabs} from "../elements/Tabs";

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

function testCaseHash(testCaseInput: TestCaseDTO) {
    return (testCaseInput.choice && testCaseInput.choice.value || "") + testCaseInput.expected;
}

function testResponseHash(choices: FreeTextRule[], testCase: TestCaseDTO) {
    const choiceHashes = new Set();
    for (let choice of choices) {
        choiceHashes.add(choiceHash(choice));
    }
    return stringHash(choiceHashes.values() + testCaseHash(testCase));
}

function displayBoolean(boolean?: boolean) {
    return boolean ? "✔️" : "❌"
}

let choiceNumber = 0;
function generateDefaultChoice() {
    choiceNumber++;
    return {
        "choiceNumber": choiceNumber,
        "type": "freeTextRule", "encoding": "markdown", "value": "", "correct": true, "caseInsensitive": true, "allowsAnyOrder": false, "allowsExtraWords": false, "allowsMisspelling": false,
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


let testCaseNumber = 0;
function generateDefaultTestCase() {
    testCaseNumber++;
    return {testCaseNumber: testCaseNumber, choice: {type: "stringChoice", value: ""}, expected: true}
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

function convertTestCasesToCsv(testCases: (TestCaseDTO & {testCaseNumber: number})[]) {
    return testCases.map(tc => `${tc.expected},${tc.choice?.value?.replace("\n", "\\n")}`).join("\n");
}
function convertCsvToTestCases(testCasesCsv: string) {
    return testCasesCsv.split("\n").map((testCaseString, index) => {
        const [expected, ...value] = testCaseString.split(",");
        return {
            testCaseNumber: index,
            expected: expected === "true",
            choice: {type: "stringChoice", value: value.join(",")}
        };
    })
}

export const FreeTextTest = ({user}: {user: LoggedInUser}) => {
    const dispatch = useDispatch();
    const testCaseResponses = useSelector((state: AppState) => state && state.testQuestions || []);

    const [choices, setChoices] = useState<(FreeTextRule & {choiceNumber: number})[]>([{...JSON.parse(JSON.stringify(defaultChoiceExample))}]);
    const [testCaseInputs, setTestCaseInputs] = useState<(TestCaseDTO & {testCaseNumber: number})[]>([{...JSON.parse(JSON.stringify(defaultTestCaseExample))}]);
    const [testCasesCsv, setTestCasesCsv] = useState(convertTestCasesToCsv(testCaseInputs));
    useMemo(() => {setTestCasesCsv(convertTestCasesToCsv(testCaseInputs))}, [testCaseInputs]);

    const augmentedTestCaseResponseMap: {[key: string]: AugmentedTestCase} = {};
    for (const testCaseOutput of testCaseResponses) {
        const augmentedTestCaseOutput: AugmentedTestCase = JSON.parse(JSON.stringify(testCaseOutput));
        if (augmentedTestCaseOutput.expected !== undefined) {
            augmentedTestCaseOutput.match = augmentedTestCaseOutput.expected == augmentedTestCaseOutput.actual;
        }
        const testCaseInput = {choice: augmentedTestCaseOutput.choice, expected: augmentedTestCaseOutput.expected};
        augmentedTestCaseResponseMap[testResponseHash(choices, testCaseInput)] = augmentedTestCaseOutput;
    }
    const numberOfResponseMatches = Object.values(augmentedTestCaseResponseMap).filter(testCase => testCase.match).length;

    return <RS.Container>
        <TitleAndBreadcrumb className="mb-4" currentPageTitle="Free-text question builder" />
        <RS.Form onSubmit={(event: React.FormEvent) => {
            if (event) {event.preventDefault();}
            const cleanedUpChoices = choices.map(removeChoiceNumber).filter(notEqualToDefaultChoice);
            const cleanedUpTestCases = testCaseInputs.map(removeTestCaseNumber).filter(notEqualToDefaultTestCase);
            if (cleanedUpChoices.length > 0 && cleanedUpTestCases.length > 0) {
                dispatch(testQuestion(cleanedUpChoices, cleanedUpTestCases));
            }
        }}>
            <RS.Card className="mb-4">
                <RS.CardBody>
                    <h2 className="h3">Matching rules</h2>
                    <Tabs className="d-flex flex-column-reverse" tabTitleClass="px-3">
                        {{
                            'GUI': <RS.Table className="mb-3">
                                <thead>
                                    <tr>
                                        <th>Rule</th>
                                        <th colSpan={3}>Response</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {choices.map(choice => <tr key={choice.choiceNumber}>
                                        <td>
                                            <RS.Label className="mb-3 w-100">
                                                Value
                                                <RS.Input className="w-100" type="text" value={choice.value} onChange={e => {
                                                    setChoices(choices.map(c => choice == c ? {...c, value: e.target.value} : c))
                                                }} />
                                            </RS.Label>
                                            <RS.Row>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, caseInsensitive: !c.caseInsensitive} : c))}>
                                                        <RS.Label>Ignore case {displayBoolean(choice.caseInsensitive)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, allowsAnyOrder: !c.allowsAnyOrder} : c))}>
                                                        <RS.Label>Any order {displayBoolean(choice.allowsAnyOrder)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, allowsExtraWords: !c.allowsExtraWords} : c))}>
                                                        <RS.Label>Extra words {displayBoolean(choice.allowsExtraWords)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                                <RS.Col xs={3} className="text-center">
                                                    <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, allowsMisspelling: !c.allowsMisspelling} : c))}>
                                                        <RS.Label>Misspelling {displayBoolean(choice.allowsMisspelling)}</RS.Label>
                                                    </RS.Button>
                                                </RS.Col>
                                            </RS.Row>
                                        </td>
                                        <td className="align-middle">
                                            <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, correct: !c.correct} : c))}>
                                                <div className="h4 px-4">{displayBoolean(choice.correct)}</div>
                                            </RS.Button>
                                        </td>
                                        <td>
                                            <RS.Label>
                                                Feedback:
                                                <RS.Input
                                                    type="textarea" value={(choice.explanation as any).children[0].value}
                                                    onChange={event => {
                                                        const newExplanation = JSON.parse(JSON.stringify(choice.explanation)) as any;
                                                        newExplanation.children[0].value = event.target.value;
                                                        setChoices(choices.map(c => choice == c ? {...c, explanation: newExplanation} : c));
                                                    }}
                                                />
                                            </RS.Label>
                                        </td>
                                        <td>
                                            <button
                                                className="close" aria-label="Delete matching rule" type="button"
                                                onClick={() => setChoices(choices.filter(choiceInState => choice !== choiceInState))}
                                            >×</button>
                                        </td>
                                    </tr>)}
                                </tbody>
                                <tfoot>
                                    <tr className="border-bottom">
                                        <td colSpan={4} className="text-center pb-3">
                                            <RS.Button color="link" onClick={() => setChoices([...choices, generateDefaultChoice()])}>
                                                <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                                            </RS.Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </RS.Table>,
                            "JSON": <div className="mb-3">
                                <p>JSON for the choices part of your isaacFreeTextQuestion</p>
                                <RS.Input
                                    type="textarea" rows={25}
                                    value={JSON.stringify({choices: choices.map(removeChoiceNumber)}, null, 2)}
                                    onChange={event => {
                                        setChoices(JSON.parse(event.target.value).choices.map(
                                            (choice: FreeTextRule, i: number) => Object.assign(choice, {choiceNumber: i})
                                        ))
                                    }}
                                />
                            </div>
                        }}
                    </Tabs>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="mb-4">
                <RS.CardBody>
                    <h2 className="h3">Test answers ({numberOfResponseMatches}/{testCaseInputs.length})</h2>
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
                                    {testCaseInputs.map(testCase => {
                                        const testCaseResponse = augmentedTestCaseResponseMap[testResponseHash(choices, testCase)];
                                        return <tr key={testCase.testCaseNumber}>
                                            <td className="w-10 text-center align-middle">
                                                <RS.Button color="link" onClick={() =>
                                                    setTestCaseInputs(testCaseInputs.map(tc => testCase == tc ? {
                                                        ...tc,
                                                        expected: !tc.expected
                                                    } : tc))
                                                }>
                                                    {testCase.expected !== undefined && displayBoolean(testCase.expected)}
                                                </RS.Button>
                                            </td>
                                            <td>
                                                <RS.Input
                                                    type="textarea" value={testCase.choice && testCase.choice.value}
                                                    onChange={event => setTestCaseInputs(testCaseInputs.map(testCaseInState =>
                                                        testCaseInState === testCase ?
                                                            {...testCase, choice: {...testCase.choice, value: event.target.value}} :
                                                            testCaseInState
                                                    ))}
                                                />
                                            </td>

                                            <td className="bg-light w-10 text-center align-middle">
                                                {testCaseResponse && testCaseResponse.actual !== undefined && displayBoolean(testCaseResponse.actual)}
                                            </td>
                                            <td className="bg-light align-middle">
                                                {testCaseResponse && testCaseResponse.explanation &&
                                                <IsaacContent doc={testCaseResponse.explanation}/>}
                                            </td>
                                            <td className="bg-light w-10 text-center align-middle">
                                                {testCaseResponse && testCaseResponse.actual !== undefined && displayBoolean(testCaseResponse.expected == testCaseResponse.actual)}
                                            </td>
                                            <td className="bg-light">
                                                <button
                                                    className="close" aria-label="Delete matching rule" type="button"
                                                    onClick={() => setTestCaseInputs(testCaseInputs.filter(testCaseInState => testCase !== testCaseInState))}
                                                >×</button>
                                            </td>
                                        </tr>;
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-bottom">
                                        <td colSpan={6} className="text-center pb-3">
                                            <RS.Button color="link" onClick={() => setTestCaseInputs([...testCaseInputs, generateDefaultTestCase()])}>
                                                <img src="/assets/add_circle_outline.svg" alt="Add matching rule"/>
                                            </RS.Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </RS.Table>,
                            'CSV': <div className="mb-3">
                                <p>Enter test cases as CSV with the headers: expected(true/false), value</p>
                                <RS.Input type="textarea" rows={10} value={testCasesCsv} onChange={event => setTestCasesCsv(event.target.value)} />
                                <div className="my-2 text-center">
                                    <RS.Button onClick={() => setTestCaseInputs(convertCsvToTestCases(testCasesCsv))}>
                                        Submit
                                    </RS.Button>
                                </div>
                            </div>
                        }}
                    </Tabs>
                </RS.CardBody>
            </RS.Card>

            <div className="mb-5 text-center">
                <RS.Input type="submit" className="btn btn-xl btn-secondary border-0" />
            </div>
        </RS.Form>
    </RS.Container>;
};
