import React, { useState } from 'react';
import {
    Platform,
    TouchableOpacity,
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import {InfoRow} from "./InfoRow";

type PickerMode = 'date' | 'time' | 'datetime';

interface DatePickerInputProps {
    label: string;
    value: Date;
    onChange: (date: Date) => void;
    maximumDate?: Date;
    minimumDate?: Date;
    iconColor?: string;
    mode?: PickerMode; // Nouvelle prop pour le mode du picker
}

const formatDate = (date: Date, mode: PickerMode) => {
    if (mode === 'date') {
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } else if (mode === 'time') {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
    label,
    value,
    onChange,
    maximumDate,
    minimumDate,
    iconColor,
    mode = 'datetime', // Valeur par défaut 'datetime'
}) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [tempDate, setTempDate] = useState(value);
    const [androidPickerStep, setAndroidPickerStep] = useState<'date' | 'time'>('date'); // For Android datetime flow

    const showPicker = () => {
        setTempDate(value);
        if (Platform.OS === 'android' && mode === 'datetime') {
            setAndroidPickerStep('date'); // Start with date picker for datetime mode on Android
        } else if (Platform.OS === 'android' && mode === 'time') {
            setAndroidPickerStep('time'); // Start with time picker for time mode on Android
        }
        setIsPickerVisible(true);
    };

    const onAndroidChange = (event: DateTimePickerEvent, selectedValue?: Date) => {
        // If picker was dismissed or no value selected, just close the picker
        if (event.type === 'dismissed' || !selectedValue) {
            setIsPickerVisible(false);
            return;
        }

        // Handle 'date' or 'time' modes directly
        if (mode === 'date' || mode === 'time') {
            onChange(selectedValue);
            setIsPickerVisible(false);
            return;
        }

        // Handle 'datetime' mode sequentially
        if (mode === 'datetime') {
            if (androidPickerStep === 'date') {
                setTempDate(selectedValue); // Store the selected date
                setAndroidPickerStep('time'); // Move to time selection
                // Keep picker visible to show time picker
            } else { // androidPickerStep === 'time'
                const finalDate = new Date(tempDate);
                finalDate.setHours(selectedValue.getHours());
                finalDate.setMinutes(selectedValue.getMinutes());
                onChange(finalDate);
                setIsPickerVisible(false);
            }
        }
    };

    const onIosChange = (event: DateTimePickerEvent, selectedValue?: Date) => {
        if (selectedValue) {
            setTempDate(selectedValue); // Update tempDate for iOS spinner
        }
    };

    const handleIosConfirm = () => {
        onChange(tempDate);
        setIsPickerVisible(false);
    };

    const renderDateTimePicker = () => {
        if (!isPickerVisible) return null;

        if (Platform.OS === 'ios') {
            return (
                <Modal
                    transparent={true}
                    visible={isPickerVisible}
                    onRequestClose={() => setIsPickerVisible(false)}
                >
                    <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsPickerVisible(false)}>
                        <TouchableWithoutFeedback>
                            <View style={styles.pickerContent}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode={mode} // Use the component's mode prop directly for iOS
                                    display="spinner"
                                    onChange={onIosChange}
                                    locale="fr-FR"
                                    textColor={theme.colors.text.primary}
                                    maximumDate={maximumDate}
                                    minimumDate={minimumDate}
                                />
                                <TouchableOpacity style={styles.confirmButton} onPress={handleIosConfirm}>
                                    <Text style={styles.buttonText}>Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>
            );
        }

        // Android
        const androidMode = mode === 'datetime' ? androidPickerStep : mode;
        return (
            <DateTimePicker
                value={tempDate}
                mode={androidMode}
                display="default" // Use 'default' for Android for standard date/time pickers
                is24Hour={true}
                onChange={onAndroidChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
            />
        );
    };

    return (
        <>
            <InfoRow
                iconName="calendar-outline"
                label={label}
                value={formatDate(value, mode)}
                onPress={showPicker}
                iconColor={iconColor}
            />
            {renderDateTimePicker()}
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerContent: {
        backgroundColor: theme.colors.background.paper,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
    },
    confirmButton: {
        backgroundColor: theme.colors.primary[500],
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: theme.spacing[4],
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeight.bold,
    },
});
