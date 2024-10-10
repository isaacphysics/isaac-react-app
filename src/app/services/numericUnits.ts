import Rand from "rand-seed";
import { IsaacNumericQuestionDTO } from "../../IsaacApiTypes";

export function selectUnits(doc: IsaacNumericQuestionDTO, questionId: string, units?: string[], userId?: number): (string|undefined)[] {
    const seedValue = userId + "|" + questionId;
    const random = new Rand(seedValue);

    function randInt(size: number): number {
        return Math.floor(random.next() * size);
    }

    function pick<T>(arr: T[]): T {
        if (arr.length === 0) return null as unknown as T;
        const index = randInt(arr.length);
        return arr.splice(index, 1)[0];
    }

    function shuffle<T>(arr: T[]): void {
        let i = arr.length;
        while (--i > 0) {
            const j = randInt(i);
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    const unitsToShow: (string|undefined)[] = [];
    function addUnitToShow(unit: string): void {
        unit = unit.trim();
        if (unit === "" || unitsToShow.includes(unit)) return;
        unitsToShow.push(unit);
    }

    function addUpTo(from: string[], limit: number): void {
        from = from.slice(0);
        while (from.length > 0 && unitsToShow.length < limit) {
            addUnitToShow(pick(from));
        }
    }

    if (doc.knownUnits) {
        // Include all known units, that is, units used in any answers
        doc.knownUnits.forEach(addUnitToShow);
    }

    if (doc.availableUnits) {
        // Add availableUnits to the list until we reach 6 units or run out of available units
        addUpTo(doc.availableUnits, 6);
    }

    if (!(doc.availableUnits && doc.availableUnits.length > 0) && units) {
        addUpTo(units, 6);
    }

    shuffle(unitsToShow);
    unitsToShow.unshift(undefined, "");
    return unitsToShow;
}

export function wrapUnitForSelect(unit?: string): string {
    switch (unit) {
        case undefined:
            return "\u00A0";
        case "":
            return "None";
        default:
            return "$\\units{" + unit + "}$";
    }
}