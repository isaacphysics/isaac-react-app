import {numericInputValidator} from "../../../app/components/content/IsaacNumericQuestion";

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
        expect(numericInputValidator("4.5*10-14")).toEqual(['Use a correct exponent symbol, e.g. 10^-3 or 10**-3.']);

        // bad chars
        expect(numericInputValidator("4.5E%14")).toEqual(['Some of the characters you are using are not allowed: %']);
        expect(numericInputValidator("-abcd531efg")).toEqual(['Some of the characters you are using are not allowed: a b c d f g']);

        // simplification
        expect(numericInputValidator("4*14")).toEqual([]); // we need multiply to be allowed for standard form, unless we overcomplicate the regex
        expect(numericInputValidator("2/5")).toEqual(['Simplify your answer into a single decimal number.']);
        expect(numericInputValidator("5+9e10")).toEqual(['Simplify your answer into a single decimal number.']);
        expect(numericInputValidator(".2/.1")).toEqual(['Simplify your answer into a single decimal number.']);
        expect(numericInputValidator("500-520")).toEqual(['Simplify your answer into a single decimal number.']);

        // separators
        expect(numericInputValidator("5 000 000")).toEqual(['Do not use commas or spaces as thousand separators when entering your answer.']);
        expect(numericInputValidator("5,000,000")).toEqual(['Do not use commas or spaces as thousand separators when entering your answer.']);
        expect(numericInputValidator("5,0001e234")).toEqual(['Do not use commas or spaces as thousand separators when entering your answer.']);

        expect(numericInputValidator("5,25")).toEqual(['Use points instead of commas as decimal separators.']);
        expect(numericInputValidator(",25")).toEqual(['Use points instead of commas as decimal separators.']);
    });
});
