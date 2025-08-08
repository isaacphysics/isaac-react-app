import * as Actions from "../app/state/actions";
import { redirectTo } from "../app/state/actions";

// this makes sure `elem` implements an interface without widening its type
export const recordOf = <T extends string | number | symbol, U>() => <V extends U>(elem: Record<T, V>) => elem;

export const mockRedirects = () => {
    jest.spyOn(Actions, "redirectTo");
    
    beforeEach(() => {
        // @ts-ignore
        redirectTo.mockImplementation(() => true);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
};