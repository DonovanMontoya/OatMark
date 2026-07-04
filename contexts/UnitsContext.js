import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'distance_unit';

/**
 * Distance unit preference ('km' | 'mi'), persisted like the theme
 * preference. Consumed anywhere a distance is rendered.
 */
const UnitsContext = createContext({
    unit: 'km',
    setUnit: () => {},
});

export const UnitsProvider = ({children}) => {
    const [unit, setUnitState] = useState('km');

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((saved) => {
                if (saved === 'km' || saved === 'mi') {
                    setUnitState(saved);
                }
            })
            .catch((error) => {
                console.error('Error loading distance unit preference:', error);
            });
    }, []);

    const setUnit = useCallback(async (next) => {
        if (next !== 'km' && next !== 'mi') return;
        setUnitState(next);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, next);
        } catch (error) {
            console.error('Error saving distance unit preference:', error);
        }
    }, []);

    const value = useMemo(() => ({unit, setUnit}), [unit, setUnit]);

    return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
};

export const useUnits = () => useContext(UnitsContext);

export default UnitsContext;
