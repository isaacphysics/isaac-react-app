import {SortOrder} from "./constants";
import {GameboardItem} from "../../IsaacApiTypes";
import {orderBy} from "lodash";

export const sortQuestions = (sortState: { [s: string]: string }) => {
    const keys: string[] = [];
    const order: ("asc" | "desc")[] = [];
    for (const key of Object.keys(sortState)) {
        if (sortState[key] && sortState[key] != SortOrder.NONE) {
            keys.push(key);
            order.push(sortState[key] == SortOrder.ASC ? "asc" : "desc");
        }
    }
    return (questions: GameboardItem[]) => orderBy(questions, keys, order);
};

export const bookSort = (a: string, b: string) => {
    const isNumberRegex = /((\d\.)*\d)/;
    const sectionsA = a.split(isNumberRegex).filter((x) => x != "" && x != undefined);
    const sectionsB = b.split(isNumberRegex).filter((x) => x != "" && x != undefined);

    for (let i = 0; i < Math.min(sectionsA.length, sectionsB.length); i++) {
        debugger;
        const isNumberA = sectionsA[i].search(isNumberRegex) != -1;
        const isNumberB = sectionsB[i].search(isNumberRegex) != -1;

        if (isNumberA && isNumberB) {
            const numbersA = sectionsA[i].split(/\./).map((x) => parseInt(x));
            const numbersB = sectionsB[i].split(/\./).map((x) => parseInt(x));

            for (let j = 0; j < Math.min(numbersA.length, numbersB.length); j++) {
                const comparison = numbersA[j] - numbersB[j];
                if (comparison) {
                    return comparison;
                }
            }

            if (numbersA.length != numbersB.length) {
                return numbersA.length - numbersB.length;
            }
        } else if (!isNumberA && !isNumberB) {
            const comparison = sectionsA[i].localeCompare(sectionsB[i]);
            if (comparison) {
                return comparison;
            }
        } else {
            return isNumberA ? 1 : -1;
        }
    }
    return sectionsA.length - sectionsB.length;
};