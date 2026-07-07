import React, {useEffect, useMemo, useState} from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {fonts, radius, space} from '../styles/tokens';
import {validateOatMilk, validateUpcharge} from '../utils/ValidationUtils';

/**
 * Small modal for disputing a shop's displayed info: the user says what
 * the brand/upcharge actually is now. Suggestions are stored on the
 * report for admins to act on; they do not directly edit the shop.
 */
const ReportChangeModal = ({visible, shop, onClose, onSubmit, isSubmitting = false}) => {
    const {colors} = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const [brand, setBrand] = useState('');
    const [upCharge, setUpCharge] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [error, setError] = useState('');

    // Re-seed the form from the shop each time the modal opens
    useEffect(() => {
        if (visible && shop) {
            setBrand(typeof shop.oatMilk === 'string' ? shop.oatMilk : '');
            const current = typeof shop.upCharge === 'string' ? shop.upCharge : '';
            setIsFree(current.toLowerCase() === 'free');
            setUpCharge(current.toLowerCase() === 'free' ? '' : current.replace(/[^0-9.]/g, ''));
            setError('');
        }
    }, [visible, shop]);

    const handleSubmit = () => {
        const brandValidation = validateOatMilk(brand);
        if (!brandValidation.isValid) {
            setError(brandValidation.message);
            return;
        }

        const upchargeValidation = validateUpcharge(upCharge, isFree);
        if (!upchargeValidation.isValid) {
            setError(upchargeValidation.message);
            return;
        }

        setError('');
        onSubmit({
            suggestedBrand: brandValidation.sanitized,
            suggestedUpCharge: upchargeValidation.sanitized,
        });
    };

    if (!shop) return null;

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>What changed at {shop.name}?</Text>
                    <Text style={styles.subtitle}>
                        Your report flags this shop for review — it won't change the
                        listing directly.
                    </Text>

                    <Text style={styles.fieldLabel}>Oat milk brand</Text>
                    <TextInput
                        style={styles.input}
                        value={brand}
                        onChangeText={setBrand}
                        placeholder="e.g. Oatly"
                        placeholderTextColor={colors.tertiaryText}
                        maxLength={30}
                    />

                    <Text style={styles.fieldLabel}>Upcharge</Text>
                    <View style={styles.upchargeRow}>
                        <TextInput
                            style={[styles.input, styles.upchargeInput, isFree && styles.inputDisabled]}
                            value={upCharge}
                            onChangeText={(value) => setUpCharge(value.replace(/[^0-9.]/g, ''))}
                            placeholder="0.50"
                            placeholderTextColor={colors.tertiaryText}
                            keyboardType="decimal-pad"
                            editable={!isFree}
                            maxLength={6}
                        />
                        <TouchableOpacity
                            style={[styles.freeChip, isFree && styles.freeChipSelected]}
                            onPress={() => setIsFree(!isFree)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.freeChipText, isFree && styles.freeChipTextSelected]}>
                                🆓 Free
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Sending…' : 'Send report'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.modalBackground,
        justifyContent: 'center',
        padding: space.lg,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: space.lg,
    },
    title: {
        fontSize: 18,
        fontFamily: fonts.displaySemi,
        color: colors.text,
        marginBottom: space.xxs,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: fonts.body,
        color: colors.secondaryText,
        marginBottom: space.md,
    },
    fieldLabel: {
        fontSize: 13,
        fontFamily: fonts.semibold,
        color: colors.secondaryText,
        marginBottom: space.xxs,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        fontSize: 15,
        fontFamily: fonts.medium,
        color: colors.text,
        marginBottom: space.sm,
    },
    inputDisabled: {
        opacity: 0.4,
    },
    upchargeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: space.xs,
    },
    upchargeInput: {
        flex: 1,
    },
    freeChip: {
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
    },
    freeChipSelected: {
        backgroundColor: colors.successSoft,
        borderColor: colors.success,
    },
    freeChipText: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
    },
    freeChipTextSelected: {
        color: colors.success,
        fontFamily: fonts.semibold,
    },
    errorText: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.danger,
        marginBottom: space.xs,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: space.sm,
        marginTop: space.xs,
    },
    cancelButton: {
        paddingVertical: space.xs,
        paddingHorizontal: space.md,
        borderRadius: radius.pill,
    },
    cancelButtonText: {
        fontSize: 14,
        fontFamily: fonts.semibold,
        color: colors.secondaryText,
    },
    submitButton: {
        paddingVertical: space.xs,
        paddingHorizontal: space.md,
        borderRadius: radius.pill,
        backgroundColor: colors.accent,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 14,
        fontFamily: fonts.semibold,
        color: colors.onAccent,
    },
});

export default ReportChangeModal;
