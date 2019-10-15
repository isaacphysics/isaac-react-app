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
}
