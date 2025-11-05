import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const INPUT_HEIGHT = 50;

export const LoginScreen = () => {
    const { signIn } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!emailOrUsername || !password) {
            Alert.alert("Attention", "Veuillez remplir tous les champs.");
            return;
        }
        setLoading(true);
        const { error } = await signIn(emailOrUsername, password);
        setLoading(false);
        if (error) {
            Alert.alert("Erreur de connexion", error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>🎣 Fishable</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email ou nom d'utilisateur"
                    value={emailOrUsername}
                    onChangeText={setEmailOrUsername}
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
                <TouchableOpacity style={styles.forgotPasswordLink} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.linkText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Se connecter</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    contentContainer: { flex: 1, justifyContent: 'center', padding: theme.layout.containerPadding },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['5xl'], color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing[10] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing[4] },
    forgotPasswordLink: { alignSelf: 'flex-end', marginBottom: theme.spacing[6] },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary[500], borderRadius: theme.borderRadius.base, ...theme.shadows.base },
    buttonDisabled: { backgroundColor: theme.colors.primary[300], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
    registerLink: { marginTop: theme.spacing[8] },
    linkText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.primary[500], textAlign: 'center' },
});
