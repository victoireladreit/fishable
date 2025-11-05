import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const INPUT_HEIGHT = 50;

export const RegisterScreen = () => {
    const { signUp } = useAuth();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !username) {
            Alert.alert("Attention", "Veuillez remplir tous les champs.");
            return;
        }
        setLoading(true);
        const { error } = await signUp(email, password, username);
        setLoading(false);
        if (error) {
            Alert.alert("Erreur d'inscription", error.message);
        } else {
            Alert.alert("Succès", "Votre compte a été créé. Veuillez vérifier vos e-mails pour confirmer votre inscription.");
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Créer un compte</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={theme.colors.text.disabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={theme.colors.text.disabled}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={theme.colors.text.disabled}
                    secureTextEntry
                />
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>S'inscrire</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    contentContainer: { flex: 1, justifyContent: 'center', padding: theme.layout.containerPadding },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['4xl'], color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing[10] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing[4] },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary[500], borderRadius: theme.borderRadius.base, ...theme.shadows.base, marginTop: theme.spacing[4] },
    buttonDisabled: { backgroundColor: theme.colors.primary[300], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
    loginLink: { marginTop: theme.spacing[8] },
    linkText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.primary[500], textAlign: 'center' },
});