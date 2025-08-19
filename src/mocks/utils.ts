import { persistence } from "../app/services";

// this makes sure `elem` implements an interface without widening its type
export const recordOf = <T extends string | number | symbol, U>() => <V extends U>(elem: Record<T, V>) => elem;

export const mockPersistence = (cb: (p: typeof persistence) => void) => {
    const fakeStorage = new Map<string, string>();

    beforeEach(() => {
        jest.spyOn(persistence, 'load').mockImplementation((key: string) => fakeStorage.get(key) || null);
        jest.spyOn(persistence, 'save').mockImplementation((key: string, value: string) => {
            fakeStorage.set(key, value);
            return true;
        });
        jest.spyOn(persistence, 'remove').mockImplementation((key: string) => {
            fakeStorage.delete(key);
            return true;
        });
        cb(persistence);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
}; 