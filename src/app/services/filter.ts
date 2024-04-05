export function arrayFromPossibleCsv(queryParamValue: string | string[] | undefined): string[] {
    return queryParamValue ?
        (queryParamValue instanceof Array ?
            queryParamValue :
            queryParamValue.split(",")
        ) :
        [];
}

export function toSimpleCSV<T extends string>(items: T[]) {
    return items.join(",");
}

export function itemiseByValue<R extends {value: string}>(values: string[], options: R[]): R[] {
    return options.filter(option => values.includes(option.value));
}
