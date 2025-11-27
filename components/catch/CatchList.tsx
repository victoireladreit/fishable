import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../../theme';
import { CatchListItem } from './CatchListItem';
import { Database } from '../../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];

interface CatchListProps {
    catches: Catch[];
    onCatchDetail: (catchId: string) => void;
    onDeleteCatch: (catchId: string) => void;
    onAddCatch: () => void;
    isRefreshing: boolean;
    onRefresh: () => void;
    ListHeaderComponent?: React.ReactElement;
    ListFooterComponent?: React.ReactElement;
}

export const CatchList: React.FC<CatchListProps> = ({
    catches,
    onCatchDetail,
    onDeleteCatch,
    onAddCatch,
    isRefreshing,
    onRefresh,
    ListHeaderComponent,
    ListFooterComponent,
}) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const renderInternalHeader = () => (
        <>
            <Text style={styles.title}>Mes Prises</Text>
            <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.buttonPrimary} onPress={onAddCatch}>
                    <Text style={styles.buttonText}>🎣 Nouvelle prise</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Historique</Text>
        </>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune prise pour le moment.</Text>
        </View>
    );

    return (
        <>
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

            <FlatList
                data={catches}
                ListHeaderComponent={<>{ListHeaderComponent}{renderInternalHeader()}</>}
                ListFooterComponent={ListFooterComponent}
                renderItem={({ item }) => (
                    <View style={styles.listItemContainer}>
                        <CatchListItem
                            item={item}
                            onEdit={onCatchDetail}
                            onDelete={onDeleteCatch}
                            onPressImage={openImageModal}
                        />
                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: theme.spacing[8] }}
                ListEmptyComponent={renderEmptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary['500']]}
                        tintColor={colors.primary['500']}
                    />
                }
            />
        </>
    );
};

const styles = StyleSheet.create({
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[6],
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    headerButtons: {
        paddingHorizontal: theme.layout.screenPadding,
        marginTop: theme.spacing[4],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing[8],
    },
    emptyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
    buttonPrimary: {
        backgroundColor: colors.primary["500"],
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
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
    listItemContainer: {
        paddingHorizontal: theme.layout.screenPadding,
    }
});
