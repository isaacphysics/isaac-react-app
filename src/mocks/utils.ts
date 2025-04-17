// this makes sure `elem` implements an interface without widening its type
export const recordOf = <T extends string | number | symbol, U>() => <V extends U>(elem: Record<T, V>) => elem;
