// components/SubCategoryPanel.js
import React, { memo } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

const iconMapping = {
    electronics: 'laptop',
    fashion: 'shirt',
    furniture: 'couch',
    services: 'screwdriver-wrench',
    properties: 'house',
    vehicles: 'car',
};

const SubCategoryPanel = memo(({ subcategories, onSelectSubcategory, parentCategoryName }) => {
    const renderItem = ({ item }) => (
        <TouchableHighlight
            underlayColor="#F0F0F0"
            style={styles.itemContainer}
            onPress={() => onSelectSubcategory(item)}
        >
            <View style={styles.itemContent}>
                <Icon
                    name={iconMapping[item.guard_name] || 'circle-chevron-right'}
                    size={20}
                    color="#FF6B6B"
                    style={styles.icon}
                />
                <Text style={styles.itemText}>{item.name}</Text>
                <Icon
                    name="chevron-right"
                    size={18}
                    color="#888888"
                    style={styles.arrow}
                />
            </View>
        </TouchableHighlight>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{parentCategoryName}</Text>
                <Text style={styles.subHeaderText}>Select Subcategory</Text>
            </View>
            <FlatList
                data={subcategories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="folder-open" size={32} color="#CCCCCC" />
                        <Text style={styles.emptyText}>No subcategories available</Text>
                    </View>
                }
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    subHeaderText: {
        fontSize: 14,
        color: '#888888',
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        marginRight: 16,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    arrow: {
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        color: '#CCCCCC',
        fontSize: 16,
    },
});

export default SubCategoryPanel;