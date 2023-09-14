import React, {useEffect, useState} from "react";
import {FreeTextRule, LlmPrompt} from "../../../IsaacAppTypes";
import * as RS from "reactstrap";
import {Content, ContentBase, TestCaseDTO} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AppState, questionDevelopmentTest, useAppDispatch, useAppSelector} from "../../state";
import {Tabs} from "../elements/Tabs";
import {atLeastOne} from "../../services";
import {IsaacContent} from "../content/IsaacContent";

interface NumberedChoice {
    choiceNumber: number;
}

function isFreeTextRule(choice: FreeTextRule | LlmPrompt): choice is FreeTextRule {
    return choice.type === "freeTextRule";
}
function areAllFreeTextRules(choices: (FreeTextRule | LlmPrompt)[]): choices is FreeTextRule[] {
    return choices.every(isFreeTextRule);
}

function isLlmPrompt(choice: FreeTextRule | LlmPrompt): choice is LlmPrompt {
    return choice.type === "llmPrompt";
}
function areAllLlmPrompts(choices: (FreeTextRule | LlmPrompt)[]): choices is LlmPrompt[] {
    return choices.every(isLlmPrompt);
}

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

function freeTextHash(choice: FreeTextRule) {
    const {value, correct, explanation, caseInsensitive, allowsAnyOrder, allowsExtraWords, allowsMisspelling} = choice;
    const definingProperties =
        "" + value + correct + stringHash(JSON.stringify(explanation)) +
        caseInsensitive + allowsAnyOrder + allowsExtraWords + allowsMisspelling;
    return stringHash(definingProperties);
}
function llmPromptHash(choice: LlmPrompt) {
    const {value} = choice;
    return stringHash("" + value);
}

function choicesHash(choices: FreeTextRule[] | LlmPrompt[]) {
    if (areAllFreeTextRules(choices)) {
        return stringHash(choices.map(freeTextHash).join(","));
    } else if (areAllLlmPrompts(choices)) {
        return stringHash(choices.map(llmPromptHash).join(","));
    } else {
        throw new Error("Mixed choice types");
    }
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
function generateDefaultFreeTextChoice(): FreeTextRule & NumberedChoice {
    choiceNumber++;
    return {
        "choiceNumber": choiceNumber, "type": "freeTextRule", "encoding": "markdown", "value": "",
        "correct": true, "caseInsensitive": true, "allowsAnyOrder": false, "allowsExtraWords": false, "allowsMisspelling": false,
        "explanation": {"type": "content", "children": [{"type": "content", "value": `Match ${choiceNumber}`, "encoding": "markdown"} as ContentBase], "encoding": "markdown"} as Content
    }
}
const defaultFreeTextChoiceExample = generateDefaultFreeTextChoice();

function generateDefaultLlmPromptChoice(): LlmPrompt & NumberedChoice {
    return {
        "choiceNumber": 0, "type": "llmPrompt", "encoding": "markdown", "value": `"<$Student Answer>" is equivalent to "some model answer".`
    };
}
const defaultLlmPromptChoiceExample = generateDefaultLlmPromptChoice();

function removeChoiceNumber(choice: (FreeTextRule | LlmPrompt) & NumberedChoice) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {choiceNumber, ...cleanChoice} = choice;
    return cleanChoice;
}
function notEqualToDefaultChoice(choice: FreeTextRule | LlmPrompt) {
    if (isFreeTextRule(choice)) return freeTextHash(choice) != freeTextHash(defaultFreeTextChoiceExample);
    if (isLlmPrompt(choice)) return llmPromptHash(choice) != llmPromptHash(defaultLlmPromptChoiceExample);
    else throw new Error("Choice neither FreeTextRule nor LlmPrompt");
}

function convertQuestionChoicesToJson(questionChoices: ((FreeTextRule | LlmPrompt) & NumberedChoice)[]) {
    return JSON.stringify(questionChoices.map(removeChoiceNumber), null, 2)
}

function convertJsonToQuestionChoices(jsonString: string) {
    let parsedJson = JSON.parse(jsonString);
    let choicesArray;
    if (Array.isArray(parsedJson)) {
        choicesArray = parsedJson;
    } else if (parsedJson.type === "isaacFreeTextQuestion" || parsedJson.type === "isaacLlmQuestion") {
        choicesArray = parsedJson.choices;
    } else {
        throw TypeError("Neither a Choices array, LlmQuestion nor a FreeTextQuestion");
    }
    if (areAllFreeTextRules(choicesArray)) {
        return choicesArray.map((choice: FreeTextRule, i: number) => Object.assign(choice, {choiceNumber: i}));
    } else if (areAllLlmPrompts(choicesArray)) {
        return choicesArray.map((choice: LlmPrompt, i: number) => Object.assign(choice, {choiceNumber: i}));
    } else {
        throw new Error("Mixed choice types when converting from JSON");
    }
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

interface JsonChoiceBuilder { questionChoicesJson: string; setQuestionChoicesJson: (questionChoicesJson: string) => void }
interface LlmPromptChoiceBuilder extends JsonChoiceBuilder { questionChoices: (LlmPrompt & NumberedChoice)[]; setQuestionChoices: (questionChoices: (LlmPrompt & NumberedChoice)[]) => void }
interface RuleBasedChoiceBuilder extends JsonChoiceBuilder { questionChoices: (FreeTextRule & NumberedChoice)[]; setQuestionChoices: (questionChoices: (FreeTextRule & NumberedChoice)[]) => void }

const RuleBasedChoiceBuilder = ({questionChoices, setQuestionChoices, questionChoicesJson, setQuestionChoicesJson}: RuleBasedChoiceBuilder) => {
    const [jsonParseError, setJsonParseError] = useState(false);

    return <React.Fragment>
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
                            <RS.Button color="link" onClick={() => setQuestionChoices([...questionChoices, generateDefaultFreeTextChoice()])}>
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
                                const convertedQuestionChoices = convertJsonToQuestionChoices(questionChoicesJson);
                                if (areAllFreeTextRules(convertedQuestionChoices)) { setQuestionChoices(convertedQuestionChoices); }
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
    </React.Fragment>
}


interface FeedbackOptions {id:string; feedback: string, correct: boolean};
interface Example {answer: string; feedbackOption: string};

function ExampleStudentAnswerEditor({example, setExample, feedbackOptions, i, deleteExample}: {example: Example, setExample: (example: Example) => void, i: number, feedbackOptions: FeedbackOptions[], deleteExample: () => void}) {
    const [isOpen, setIsOpen] = useState(false);
    return <RS.ListGroupItem className="border">
        <RS.FormGroup>
            <div className="d-flex">
                <RS.Label htmlFor={`student-example-${i}`}>
                    Student Answer:
                </RS.Label>
                <RS.Button className="p-0 m-1 text-muted ml-auto mt-n3 mr-n2" color="link" onClick={deleteExample}>
                    ✖
                </RS.Button>
            </div>
            <RS.Input id={`student-example-${i}`} type="textarea" row={2} value={example.answer} onChange={e => setExample({...example, answer: e.target.value})} />
        </RS.FormGroup>
        <RS.FormGroup row>
            <RS.Label hymlFor={`student-example-feedback-option-${i}`} className="col-auto">
                Feedback:
            </RS.Label>
            <RS.Col>
                <RS.InputGroup>
                    <RS.InputGroupButtonDropdown size="sm" addonType="prepend" isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
                        <RS.DropdownToggle color="dark" outline caret>
                            {example.feedbackOption}
                        </RS.DropdownToggle>
                        <RS.DropdownMenu>
                            {feedbackOptions.map(fo => <RS.DropdownItem key={fo.id} onClick={() => setExample({...example, feedbackOption: fo.id})}>
                                {fo.id}
                            </RS.DropdownItem>)}
                        </RS.DropdownMenu>
                    </RS.InputGroupButtonDropdown>
                    <RS.Input disabled style={{textOverflow: "ellipsis"}} value={feedbackOptions.filter(fo => fo.id === example.feedbackOption).at(0)?.feedback} />
                    <RS.InputGroupAddon addonType="append">
                        <RS.InputGroupText className="border-dark" outline size="sm">
                            {feedbackOptions.filter(fo => fo.id === example.feedbackOption).at(0)?.correct ? "✔️" : "❌"}
                        </RS.InputGroupText>
                    </RS.InputGroupAddon>
                </RS.InputGroup>
            </RS.Col>
        </RS.FormGroup>
    </RS.ListGroupItem>
}

function nextAvailableId(feedbackOptions: FeedbackOptions[]) {
    const ids = feedbackOptions.map(fo => fo.id);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let character of alphabet) {
        if (!ids.includes(character)) {
            return character;
        }
    }
    throw new Error("No more letters available");
}

const LlmPromptChoiceBuilder = ({questionChoices, setQuestionChoices, questionChoicesJson, setQuestionChoicesJson}: LlmPromptChoiceBuilder) => {
    const [systemInstruction, setSystemInstruction] = useState("You are an expert secondary school physics teacher bot that marks free-text questions.");
    const [questionContent, setQuestionContent] = useState("");
    const [markScheme, setMarkScheme] = useState("");
    const [feedbackOptions, setFeedbackOptions] = useState<FeedbackOptions[]>([{id: "A", feedback: "Correct", correct: true}, {id: "B", feedback: "Incorrect", correct: false}]);
    const [examples, setExamples] = useState<Example[]>([{answer: "", feedbackOption: "A"}]);
    
    const [jsonParseError, setJsonParseError] = useState(false);
    
    const llmPromptChoice = questionChoices[0];
    useEffect(function updatePrompt() {
        const prompt = systemInstruction +
        `#### Free-Text Question:\n${questionContent}\n\n` +
        `#### Mark Scheme:\n${markScheme}\n\n` +
        `#### Feedback Options:\n${feedbackOptions.map(fo => `[${fo.id}] { feedback: "${fo.feedback}", correct: ${fo.correct} }`).join("\n")}\n\n` +
        examples.map(e => `#### Student Answer:\n${e.answer}\n\n#### Response:\n{ "feedbackOption": "${e.feedbackOption}", "correct": ${feedbackOptions.filter(fo => fo.id === e.feedbackOption).at(0)?.correct} }\n\n`).join("") +
        `#### Student Answer:\n<$STUDENT_ANSWER>\n\n`;
        setQuestionChoices([{...llmPromptChoice, value: prompt, choiceNumber: 0}]);
    }, [systemInstruction, questionContent, markScheme, feedbackOptions, examples]);

    return <React.Fragment>
        <Tabs className="d-flex flex-column-reverse" tabTitleClass="px-3">
            {{
                'GUI': <div className="mb-3">
                    <div className="mb-3">
                        <RS.Label>
                            <strong>System Instruction:</strong>
                        </RS.Label>
                        <RS.Input
                            type="textarea" rows={1} value={systemInstruction}
                            onChange={event => setSystemInstruction(event.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <RS.Label>
                            <strong>Question Content:</strong>
                        </RS.Label>                       
                        <RS.Input
                            type="textarea" rows={4} value={questionContent}
                            onChange={event => setQuestionContent(event.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <RS.Label>
                            <strong>Mark Scheme:</strong>
                        </RS.Label>
                        <RS.Input
                            type="textarea" rows={4} value={markScheme}
                            onChange={event => setMarkScheme(event.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <RS.Label>
                            <strong>Feedback Options:</strong>
                        </RS.Label>
                        {feedbackOptions.map((feedbackOption, i) => <div className="mb-2 d-flex" key={feedbackOption.id}>
                            <RS.InputGroup>
                                <RS.InputGroupAddon addonType="prepend">
                                    <RS.InputGroupText className="border-dark" outline size="sm">
                                        {feedbackOption.id}
                                    </RS.InputGroupText>
                                </RS.InputGroupAddon>
                                <RS.Input type="text" value={feedbackOption.feedback} onChange={e => setFeedbackOptions(feedbackOptions.map((fo, j) => i === j ? {...fo, feedback: e.target.value} : fo))} />
                                <RS.InputGroupAddon addonType="append">
                                    <RS.Button size="sm" color="dark" outline onClick={() => setFeedbackOptions(feedbackOptions.map((fo, j) => i === j ? {...fo, correct: !fo.correct} : fo))}>
                                        {feedbackOption.correct ? "✔️" : "❌"}
                                    </RS.Button>
                                </RS.InputGroupAddon>
                            </RS.InputGroup>
                            <RS.Button className="p-0 m-1 ml-2 text-muted" color="link" onClick={() => setFeedbackOptions(feedbackOptions.filter(fo => fo !== feedbackOption))}>
                                ✖
                            </RS.Button>
                        </div>)}
                        <RS.Button color="link" className="d-block mx-auto mt-1" onClick={() => {setFeedbackOptions([...feedbackOptions, {id: nextAvailableId(feedbackOptions), feedback: "", correct: true}])}}>
                            <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                        </RS.Button>
                    </div>
                    <div className="mb-3">
                        <RS.Label className="d-block">
                            <strong>Example Student Answers:</strong>
                        </RS.Label>
                        <RS.ListGroup>
                            {examples.map((example, i) => <ExampleStudentAnswerEditor
                                key={i} i={i} example={example} feedbackOptions={feedbackOptions}
                                setExample={newExample => setExamples(examples.map((ex, j) => i === j ? newExample : ex))}
                                deleteExample={() => setExamples(examples.filter((ex, j) => i !== j))}
                            />)}
                        </RS.ListGroup>
                        <RS.Button color="link" className="d-block mx-auto mt-1" onClick={() => {setExamples([...examples, {answer: "", feedbackOption: "A"}])}}>
                            <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                        </RS.Button>
                    </div>
                </div>,
                'JSON': <div className="mb-3">
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
                        <RS.Button className="my-2" onClick={() => {
                            try {
                                const convertedQuestionChoices = convertJsonToQuestionChoices(questionChoicesJson);
                                if (areAllLlmPrompts(convertedQuestionChoices)) { setQuestionChoices(convertedQuestionChoices); }
                            } catch (e) {
                                setJsonParseError(true);
                            }
                        }}>
                            Submit
                        </RS.Button>
                    </div>
                </div>
            }}
        </Tabs>
    </React.Fragment>
}

export const FreeTextBuilder = () => {
    const dispatch = useAppDispatch();
    const testCaseResponses = useAppSelector((state: AppState) => state && state.testQuestions || []);

    const [questionType, setQuestionType] = useState<"isaacFreeTextQuestion" | "isaacLlmQuestion">("isaacLlmQuestion");

    const [questionChoices, setQuestionChoices] = useState<(FreeTextRule & NumberedChoice)[] | (LlmPrompt & NumberedChoice)[]>([JSON.parse(JSON.stringify(defaultLlmPromptChoiceExample))]);
    const [questionChoicesJson, setQuestionChoicesJson] = useState(convertQuestionChoicesToJson(questionChoices));
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

    return <RS.Container fluid>
        <TitleAndBreadcrumb className="mb-4" currentPageTitle="Free-text question builder" />
        <RS.Form onSubmit={(event: React.FormEvent) => {
            if (event) {event.preventDefault();}
            if (atLeastOneQuestionChoiceAndTestCase) {
                setChoicesHashAtPreviousRequest(choicesHash(questionChoices));
                dispatch(questionDevelopmentTest(questionType, cleanQuestionChoices, cleanTestCases));
            }
        }}>
            <RS.Row className="mb-5">
                <RS.Col xl={6}>
                    <RS.Card className="mb-4">
                        <RS.CardBody>
                            <RS.Label>
                                Free-text markng type:
                                <select className="ml-2" value={questionType} onChange={event => {
                                    setQuestionType(event.target.value as "isaacFreeTextQuestion" | "isaacLlmQuestion");
                                    setQuestionChoices(event.target.value === "isaacFreeTextQuestion" ? [generateDefaultFreeTextChoice()] : [generateDefaultLlmPromptChoice()]);
                                }}>
                                    <option value="isaacFreeTextQuestion">Rule based marking</option>
                                    <option value="isaacLlmQuestion">LLM based marking</option>
                                </select>
                            </RS.Label>
                            {areAllFreeTextRules(questionChoices) && <RuleBasedChoiceBuilder {...{questionChoices, setQuestionChoices, questionChoicesJson, setQuestionChoicesJson}} />}
                            {areAllLlmPrompts(questionChoices) && <LlmPromptChoiceBuilder  {...{questionChoices, setQuestionChoices, questionChoicesJson, setQuestionChoicesJson}} />}
                        </RS.CardBody>
                    </RS.Card>
                </RS.Col>
                <RS.Col xl={6}>
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

                </RS.Col>
            </RS.Row>
        </RS.Form>
    </RS.Container>;
};
