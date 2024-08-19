import {symbolicInputValidator} from "../../../app/components/content/IsaacSymbolicQuestion";
import {symbolicLogicInputValidator} from "../../../app/components/content/IsaacSymbolicLogicQuestion";

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

    it("Symbolic Question Validator matches correctly", async () => {

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
});
