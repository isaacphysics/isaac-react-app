import { InterstitialCookieState } from '../state';
import { AppState, useAppSelector } from '../state';

interface UseUserConsentReturnType {
    cookieConsent: InterstitialCookieState;
}

export function useUserConsent(): UseUserConsentReturnType {
    const cookieConsent = useAppSelector((state: AppState) => state?.cookieConsent ?? null);

    return { cookieConsent };
}