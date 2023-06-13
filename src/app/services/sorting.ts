function valueFromObject(object: object, predicate: string) {
    const levels = predicate.split(".");
    let value = object;
    for (let level of levels) {
        // @ts-ignore
        value = value[level];
    }
    return value;
}
export const sortOnPredicateAndReverse = (predicate: string, reverse: boolean) => (a: object, b: object) => {
    if (valueFromObject(a, predicate) < valueFromObject(b, predicate)) {return reverse ? 1 : -1;}
    else if (valueFromObject(a, predicate) > valueFromObject(b, predicate)) {return reverse ? -1 : 1;}
    else {return 0;}
};

export function sortByNumberStringValue<T>(field: keyof T, undefinedFirst: boolean = false) {
    return function comparator(a: T, b: T) {
        const aValue: string | undefined = a[field] as any;
        const bValue: string | undefined = b[field] as any;
        if (aValue === bValue) return 0;
        if (aValue === undefined) return undefinedFirst ? -1 : 1;
        if (bValue === undefined) return undefinedFirst ? 1 : -1;
        const aInt = parseInt(aValue);
        const bInt = parseInt(bValue);
        return aInt > bInt ? 1 : aInt != bInt ? -1 : 0;
    };
}

export function sortByStringValue<T>(field: keyof T, undefinedFirst: boolean = false) {
    return function comparator(a: T, b: T) {
        const aValue: string | undefined = a[field] as any;
        const bValue: string | undefined = b[field] as any;
        if (aValue === bValue) return 0;
        if (aValue === undefined) return undefinedFirst ? -1 : 1;
        if (bValue === undefined) return undefinedFirst ? 1 : -1;
        return aValue.localeCompare(bValue, undefined, {numeric: true, sensitivity: 'base'});
    };
}

export const sortStringsNumerically = (a: string, b: string) => {
    const splitRegex = /(\d+)/;
    const sectionsA = a.split(splitRegex).filter((x) => x != "." && x != "");
    const sectionsB = b.split(splitRegex).filter((x) => x != "." && x != "");

    for (let i = 0; i < Math.min(sectionsA.length, sectionsB.length); i++) {
        const isNumberA = sectionsA[i].search(/\d/) != -1;
        const isNumberB = sectionsB[i].search(/\d/) != -1;

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
                return numbersB.length - numbersA.length;
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
    return sectionsB.length - sectionsA.length;
};
