import { InterstitialCookieState } from '../state';
import { AppState, useAppSelector } from '../state';

interface UseUserConsentreturnType {
    cookieConsent: InterstitialCookieState;
}

export function useUserConsent(): UseUserConsentreturnType {
    const cookieConsent = useAppSelector((state: AppState) => state?.cookieConsent ?? null);

    return { cookieConsent };
}