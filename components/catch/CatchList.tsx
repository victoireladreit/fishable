import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { CatchListItem } from './CatchListItem';
import { Database } from '../../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];

interface CatchListProps {
    catches: Catch[];
    onEditCatch: (catchId: string) => void;
    onDeleteCatch: (catchId: string) => void;
}

export const CatchList: React.FC<CatchListProps> = ({ catches, onEditCatch, onDeleteCatch }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    return (
        <View style={{width: '100%', marginTop: theme.spacing[4]}}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={30} color={theme.colors.white} />
                    </TouchableOpacity>
                    <Image source={{ uri: selectedImage || '' }} style={styles.fullScreenImage} resizeMode="contain" />
                </View>
            </Modal>

            {catches.length > 0 ? (
                <>
                    <Text style={styles.catchesTitle}>Prises ({catches.length})</Text>
                    {catches.map(item => (
                        <CatchListItem
                            key={item.id}
                            item={item}
                            onEdit={onEditCatch}
                            onDelete={onDeleteCatch}
                            onPressImage={openImageModal}
                        />
                    ))}
                </>
            ) : (
                <Text style={styles.noCatchesText}>Aucune prise pour le moment.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    catchesTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text.primary,
        marginTop: theme.spacing[6],
        marginBottom: theme.spacing[3],
    },
    noCatchesText: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        marginVertical: theme.spacing[4],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
});
