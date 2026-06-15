/**
 * The exact font weights loaded at startup. Keep this list lean — every
 * weight is a bundled .ttf, so we only ship the ones the type ramp uses.
 * The keys here become the `fontFamily` strings referenced in `fonts`
 * (styles/tokens.js).
 */
import {
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_900Black,
} from '@expo-google-fonts/fraunces';
import {
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';

export default {
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_900Black,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
};
