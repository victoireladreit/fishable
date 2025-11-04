
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Text } from '../../components/common';
import { theme } from '../../theme';

export const RegisterScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    // États d'erreur pour chaque champ
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { signUp } = useAuth();

    const validateForm = () => {
        const newErrors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        };

        let isValid = true;

        // Validation username
        if (!username) {
            newErrors.username = 'Le nom d\'utilisateur est requis';
            isValid = false;
        } else if (username.length < 3) {
            newErrors.username = 'Minimum 3 caractères';
            isValid = false;
        }

        // Validation email
        if (!email) {
            newErrors.email = 'L\'email est requis';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email invalide';
            isValid = false;
        }

        // Validation password
        if (!password) {
            newErrors.password = 'Le mot de passe est requis';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Minimum 6 caractères';
            isValid = false;
        }

        // Validation confirm password
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        // Reset errors
        setErrors({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        });

        // Validation
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const { error } = await signUp(email, password, username);
        setLoading(false);

        if (error) {
            Alert.alert('Erreur d\'inscription', error.message);
        } else {
            Alert.alert(
                'Inscription réussie ! 🎣',
                'Vérifiez votre email pour confirmer votre compte.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="h1" align="center">🎣</Text>
                <Text variant="h2" align="center" weight="bold">Créer un compte</Text>
                <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
                    Rejoignez la communauté Fishable
                </Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Nom d'utilisateur"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        if (errors.username) {
                            setErrors({ ...errors, username: '' });
                        }
                    }}
                    autoCapitalize="none"
                    placeholder="john_doe"
                    error={errors.username}
                    helperText="Minimum 3 caractères, sans espaces"
                />

                <Input
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                            setErrors({ ...errors, email: '' });
                        }
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="john@example.com"
                    error={errors.email}
                />

                <Input
                    label="Mot de passe"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) {
                            setErrors({ ...errors, password: '' });
                        }
                    }}
                    secureTextEntry
                    placeholder="••••••••"
                    error={errors.password}
                    helperText="Minimum 6 caractères"
                />

                <Input
                    label="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) {
                            setErrors({ ...errors, confirmPassword: '' });
                        }
                    }}
                    secureTextEntry
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                />

                <Button
                    title="S'inscrire"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    fullWidth
                    size="lg"
                    style={styles.registerButton}
                />

                <Button
                    title="Déjà un compte ? Se connecter"
                    onPress={() => navigation.goBack()}
                    variant="ghost"
                    fullWidth
                />
            </View>

            <View style={styles.footer}>
                <Text variant="caption" color="secondary" align="center">
                    En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
                </Text>
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
        marginBottom: theme.spacing[6],
    },
    subtitle: {
        marginTop: theme.spacing[2],
    },
    form: {
        width: '100%',
    },
    registerButton: {
        marginTop: theme.spacing[2],
        marginBottom: theme.spacing[4],
    },
    footer: {
        marginTop: theme.spacing[6],
        paddingHorizontal: theme.spacing[4],
    },
});