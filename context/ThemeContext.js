import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'appDarkMode';

const ThemeContext = createContext({
    isDarkMode: false,
    setDarkMode: () => {},
    toggleDarkMode: () => {},
});

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    /** After initial load from AsyncStorage — avoid persisting before hydrate (race with stored preference). */
    const [themeHydrated, setThemeHydrated] = useState(false);
    const persist = useCallback(async (value) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (mounted && stored === 'true') {
                    setIsDarkMode(true);
                }
            } catch {
                /* ignore */
            } finally {
                if (mounted) {
                    setThemeHydrated(true);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Persist only after hydrate — never call persist inside setState updaters (React 18/19 + Strict Mode).
    useEffect(() => {
        if (!themeHydrated) {
            return;
        }
        persist(isDarkMode);
    }, [isDarkMode, themeHydrated, persist]);

    const setDarkMode = useCallback((value) => {
        setIsDarkMode(!!value);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prev) => !prev);
    }, []);

    const value = useMemo(
        () => ({ isDarkMode, setDarkMode, toggleDarkMode }),
        [isDarkMode, setDarkMode, toggleDarkMode]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
