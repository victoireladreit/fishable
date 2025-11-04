import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Text } from '../../components/common';
import { theme } from '../../theme';

export const LoginScreen = ({ navigation }: any) => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!emailOrUsername || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        const { error } = await signIn(emailOrUsername, password);
        setLoading(false);

        if (error) {
            Alert.alert('Erreur de connexion', error.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="h1" align="center">🎣</Text>
                <Text variant="h2" align="center" weight="bold">Fishable</Text>
                <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
                    Connectez-vous à votre compte
                </Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Email ou nom d'utilisateur"
                    value={emailOrUsername}
                    onChangeText={setEmailOrUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="john@example.com ou john"
                />

                <Input
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="••••••••"
                />

                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    fullWidth
                    size="lg"
                />

                <Button
                    title="Pas encore de compte ? S'inscrire"
                    onPress={() => navigation.navigate('Register')}
                    variant="ghost"
                    fullWidth
                    style={styles.linkButton}
                />

                <Button
                    title="Mot de passe oublié ?"
                    onPress={() => navigation.navigate('ForgotPassword')}
                    variant="ghost"
                    fullWidth
                    size="sm"
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.layout.screenPadding,
    },
    header: {
        marginBottom: theme.spacing[8],
    },
    subtitle: {
        marginTop: theme.spacing[2],
    },
    form: {
        width: '100%',
    },
    linkButton: {
        marginTop: theme.spacing[2],
    },
});