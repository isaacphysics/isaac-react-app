import {symbolicTextInputValidator} from "../../../app/components/content/IsaacSymbolicQuestion";

const symbolicInputValidator = (input: string) => symbolicTextInputValidator(input, "maths");
const symbolicLogicInputValidator = (input: string) => symbolicTextInputValidator(input, "logic");
const symbolicChemistryInputValidator = (input: string) => symbolicTextInputValidator(input, "chemistry");

describe("IsaacSymbolicQuestion", () => {

    it("Symbolic Question Validator matches correctly", async () => {

        // empty input
        expect(symbolicInputValidator("")).toEqual([]);

        // bad chars
        expect(symbolicInputValidator("4E%14")).toEqual(['Some of the characters you are using are not allowed: %']);
        expect(symbolicInputValidator("-abcd531efg#")).toEqual(['Some of the characters you are using are not allowed: #']);

        // misc errors
        expect(symbolicInputValidator("((x+1))")).toEqual([]);
        expect(symbolicInputValidator("((x+1)))")).toEqual(['You are missing some opening brackets.']);
        expect(symbolicInputValidator("(((x+1))")).toEqual(['You are missing some closing brackets.']);
        expect(symbolicInputValidator(".5")).toEqual(['Please convert decimal numbers to fractions.']);
        expect(symbolicInputValidator("1/2")).toEqual([]);
        expect(symbolicInputValidator("asin(x)")).toEqual([]);
        expect(symbolicInputValidator("bsin(x)")).toEqual(["Make sure to use spaces or * signs before function names like 'sin' or 'sqrt'!"]);
        expect(symbolicInputValidator("a<=b")).toEqual([]);
        expect(symbolicInputValidator("a == 3")).toEqual([]);
        expect(symbolicInputValidator("a<b<c")).toEqual(['We are not able to accept double inequalities, and answers will never require them.']);
    });

    it("Symbolic Logic Question Validator matches correctly", async () => {

        // empty input
        expect(symbolicLogicInputValidator("")).toEqual([]);

        // bad chars
        expect(symbolicLogicInputValidator("A∧B∨C>+1")).toEqual(['Some of the characters you are using are not allowed: >']);

        // misc errors
        expect(symbolicLogicInputValidator("A & B & (C | D) & ~E")).toEqual([]);
        expect(symbolicLogicInputValidator("A \\land B \\land (C \\lor B) \\land \\not E")).toEqual(['LaTeX syntax is not supported.', 'Some of the characters you are using are not allowed: \\']);
        expect(symbolicLogicInputValidator("((A&B))")).toEqual([]);
        expect(symbolicLogicInputValidator("((A&B)))")).toEqual(['You are missing some opening brackets.']);
        expect(symbolicLogicInputValidator("(((A&B))")).toEqual(['You are missing some closing brackets.']);
    });

    it("Symbolic Chemistry Question Validator matches correctly", async () => {

        // empty input
        expect(symbolicChemistryInputValidator("")).toEqual([]);

        // bad chars
        expect(symbolicChemistryInputValidator("A∧BC>+1")).toEqual(['Some of the characters you are using are not allowed: ∧']);

        // misc errors
        expect(symbolicChemistryInputValidator("2H2O -> 2H2 + O2")).toEqual([]);
        expect(symbolicChemistryInputValidator("2(H2O")).toEqual(['You are missing some brackets.']);
        expect(symbolicChemistryInputValidator(".5")).toEqual(['Please convert decimal numbers to fractions.']);
        expect(symbolicChemistryInputValidator("2H2O(l) -> 2H2(g) + O2(g)")).toEqual(['This question does not require state symbols.']);
        expect(symbolicTextInputValidator("2H2O(l) -> 2H2(g) + O2(g)", "chemistry", true)).toEqual([]);
    });
});
