import { numericInputValidator } from "../../../app/components/content/IsaacNumericQuestion";
import { symbolicInputValidator } from "../../../app/components/content/IsaacSymbolicQuestion";
import { symbolicLogicInputValidator } from "../../../app/components/content/IsaacSymbolicLogicQuestion";

describe("IsaacNumericQuestion", () => {
    it("Numeric Question Validator matches correctly", async () => {

        // empty input
        expect(numericInputValidator("")).toEqual([]);

        // standard form
        expect(numericInputValidator("4.5e14")).toEqual([]);
        expect(numericInputValidator("4.5e-14")).toEqual([]);
        expect(numericInputValidator("4.5E14")).toEqual([]);
        expect(numericInputValidator("4.5x10^14")).toEqual([]);
        expect(numericInputValidator("4.5x10^-14")).toEqual([]);
        expect(numericInputValidator("4.5*10^14")).toEqual([]);
        expect(numericInputValidator("4.5*10**-14")).toEqual([]);
        expect(numericInputValidator("4.5*10xx14")).toEqual([]); // backend regex will reject, not frontend
        expect(numericInputValidator("4.5X10^-14")).toEqual([]);

        // bad chars
        expect(numericInputValidator("4.5E%14")).toEqual(['Some of the characters you are using are not allowed: %']);
        expect(numericInputValidator("-abcd531efg")).toEqual(['Some of the characters you are using are not allowed: a b c d f g']);

        // simplification
        expect(numericInputValidator("4*14")).toEqual([]); // we need multiply to be allowed for standard form, unless we overcomplicate the regex
        expect(numericInputValidator("2/5")).toEqual(['Simplify your answer into a single decimal number.']);
        expect(numericInputValidator("5+9e10")).toEqual(['Simplify your answer into a single decimal number.']);
        expect(numericInputValidator(".2/.1")).toEqual(['Simplify your answer into a single decimal number.']);
        expect(numericInputValidator("500*520")).toEqual(['Simplify your answer into a single decimal number.']);
        
        // separators
        expect(numericInputValidator("5 000 000")).toEqual(['Do not use commas or spaces as thousand separators when entering your answer.']);
        expect(numericInputValidator("5,000,000")).toEqual(['Do not use commas or spaces as thousand separators when entering your answer.']);
        expect(numericInputValidator("5,0001e234")).toEqual(['Do not use commas or spaces as thousand separators when entering your answer.']);
    });

    it("Symbolic Question Validator matches correctly", async () => {

        // empty input
        expect(symbolicInputValidator("")).toEqual([]);

        // bad chars
        expect(symbolicInputValidator("4.5E%14")).toEqual(['Some of the characters you are using are not allowed: %']);
        expect(symbolicInputValidator("-abcd531efg#")).toEqual(['Some of the characters you are using are not allowed: #']);

        // misc errors
        expect(symbolicInputValidator("((x+1))")).toEqual([]);
        expect(symbolicInputValidator("((x+1)))")).toEqual(['You are missing some opening brackets.']);
        expect(symbolicInputValidator("(((x+1))")).toEqual(['You are missing some closing brackets.']);
        expect(symbolicInputValidator(".5")).toEqual(['Please convert decimal numbers to fractions.']);
        expect(symbolicInputValidator("1/2")).toEqual([]);
        expect(symbolicInputValidator("asin(x)")).toEqual([]);
        expect(symbolicInputValidator("bsin(x)")).toEqual(["Make sure to use spaces or * signs before function names like 'sin' or 'sqrt'!"]);
    });

    it("Symbolic Question Validator matches correctly", async () => {

        // empty input
        expect(symbolicLogicInputValidator("")).toEqual([]);

        // bad chars
        expect(symbolicLogicInputValidator("A∧B∨C>+1")).toEqual(['Some of the characters you are using are not allowed: >']);

        // misc errors
        expect(symbolicLogicInputValidator("A & B & (C | D) & ~E")).toEqual([]);
        expect(symbolicLogicInputValidator("A \\land B \\land (C \\lor B) \\land \\not E")).toEqual(['LaTeX syntax is not supported.', 'Some of the characters you are using are not allowed: \\']);
        expect(symbolicInputValidator("((A&B))")).toEqual([]);
        expect(symbolicInputValidator("((A&B)))")).toEqual(['You are missing some opening brackets.']);
        expect(symbolicInputValidator("(((A&B))")).toEqual(['You are missing some closing brackets.']);
    });
});