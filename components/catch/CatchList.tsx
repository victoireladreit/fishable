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
    isRefreshing: boolean;
    onRefresh: () => void;
    ListHeaderComponent?: React.ReactElement;
    ListFooterComponent?: React.ReactElement;
    onAddCatch?: () => void;
    showTitleHeader?: boolean;
    contentContainerStyle?: any;
}

export const CatchList: React.FC<CatchListProps> = ({
    catches,
    onCatchDetail,
    onDeleteCatch,
    isRefreshing,
    onRefresh,
    ListHeaderComponent,
    ListFooterComponent,
    onAddCatch,
    showTitleHeader,
    contentContainerStyle,
}) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="fish-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.emptyText}>Aucune prise pour le moment.</Text>
        </View>
    );

    const renderInternalListHeader = () => (
        <>
            {ListHeaderComponent}
            {showTitleHeader && (
                <View style={styles.catchListHeader}>
                    <Text style={styles.catchListTitle}>Prises</Text>
                    {onAddCatch && (
                        <TouchableOpacity onPress={onAddCatch} style={styles.addButton}>
                            <Ionicons name="add-circle-outline" size={28} color={theme.colors.primary[500]} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </>
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
                style={{ flex: 1 }}
                data={catches}
                ListHeaderComponent={renderInternalListHeader()}
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
                contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
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
    contentContainer: {
        paddingBottom: theme.spacing[8],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing[8],
        paddingHorizontal: theme.spacing[8],
    },
    emptyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[6],
        textAlign: 'center',
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
    },
    catchListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        paddingBottom: theme.spacing[4],
    },
    catchListTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.xl,
        color: theme.colors.text.primary,
    },
    addButton: {
        padding: theme.spacing[1],
    },
});