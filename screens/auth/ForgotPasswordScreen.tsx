import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const INPUT_HEIGHT = 50;

export const ForgotPasswordScreen = () => {
    const { resetPassword } = useAuth();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Attention", "Veuillez saisir votre adresse e-mail.");
            return;
        }
        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);
        if (error) {
            Alert.alert("Erreur", error.message);
        } else {
            setEmailSent(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Mot de passe oublié</Text>
                {emailSent ? (
                    <Text style={styles.successText}>
                        Si un compte est associé à cette adresse, un e-mail de réinitialisation a été envoyé.
                    </Text>
                ) : (
                    <>
                        <Text style={styles.subtitle}>Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="votre@email.com"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor={theme.colors.text.disabled}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Envoyer</Text>}
                        </TouchableOpacity>
                    </>
                )}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    contentContainer: { flex: 1, justifyContent: 'center', padding: theme.layout.containerPadding },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['4xl'], color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing[4] },
    subtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing[8] },
    successText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: theme.typography.lineHeight.relaxed, marginVertical: theme.spacing[8] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing[6] },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary[500], borderRadius: theme.borderRadius.base, ...theme.shadows.base },
    buttonDisabled: { backgroundColor: theme.colors.primary[300], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
    backLink: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.primary[500], textAlign: 'center', marginTop: theme.spacing[8] },
});
