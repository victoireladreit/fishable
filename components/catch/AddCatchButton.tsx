import {Text, TouchableOpacity, StyleSheet} from "react-native";
import React from "react";
import {theme} from "../../theme";

export interface  AddCatchButtonProps {
    onAddCatch: () => void;
}

export function AddCatchButton ({ onAddCatch }: AddCatchButtonProps) {
    return (
    <TouchableOpacity style={[styles.button, styles.addCatchButton]} onPress={onAddCatch}>
        <Text style={styles.buttonText}>Ajouter une prise</Text>
    </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        justifyContent: 'center',
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing[3],
        ...theme.shadows.base,
    },
    addCatchButton: {
        backgroundColor: theme.colors.success.main,
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeight.bold,
    },
})
