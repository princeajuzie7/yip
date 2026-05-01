import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';import Animated, {
  SlideInDown,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AddProductModal } from '@/components/AddProductModal';
import { ProductCard } from '@/components/ProductCard';
import { useProductCatalog } from '@/context/ProductCatalogContext';
import { ensureNotificationPermission, notifyProductLimitReached } from '@/lib/notifications';
import { MAX_PRODUCTS } from '@/types/product';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CatalogScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const {
    products,
    isLimitReached,
    hasNewlyReachedLimit,
    addProduct,
    removeProduct,
    clearProducts,
    resetNewLimitFlag,
  } = useProductCatalog();

  const shake = useSharedValue(0);

  useEffect(() => {
    ensureNotificationPermission();
  }, []);

  useEffect(() => {
    if (!hasNewlyReachedLimit) {
      return;
    }

    notifyProductLimitReached();
    resetNewLimitFlag();
  }, [hasNewlyReachedLimit, resetNewLimitFlag]);

  useEffect(() => {
    if (isLimitReached) {
      shake.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 70 }),
          withTiming(5, { duration: 70 }),
          withTiming(0, { duration: 70 }),
        ),
        -1,
        false,
      );
      return;
    }

    shake.value = withSpring(0);
  }, [isLimitReached, shake]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const handleFabPress = () => {
    if (isLimitReached) {
      notifyProductLimitReached();
      return;
    }
    setModalVisible(true);
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert('Delete product', 'Remove this product from your catalog?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeProduct(id);
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all products',
      'This will remove every product in your catalog.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: () => {
            clearProducts();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>Yip</Text>
      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>Product Catalog</Text>
        {products.length > 0 && (
          <Pressable onPress={handleDeleteAll} style={styles.deleteAllButton}>
            <Text style={styles.deleteAllText}>Delete All</Text>
          </Pressable>
        )}
      </View>

      {isLimitReached && (
        <Animated.View entering={SlideInDown.springify()} style={styles.limitBanner}>
          <Text style={styles.limitText}>Catalog full: 5/5 slots used</Text>
        </Animated.View>
      )}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ProductCard
            product={item}
            index={index}
            onDelete={handleDeleteProduct}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products yet. Add your first piece.</Text>
          </View>
        }
      />

      <AnimatedPressable
        disabled={isLimitReached}
        entering={SlideInUp.springify()}
        onPress={handleFabPress}
        style={[styles.fab, isLimitReached && styles.fabDisabled, fabStyle]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </AnimatedPressable>

      <Text style={styles.counter}>
        {products.length}/{MAX_PRODUCTS} products
      </Text>

      <AddProductModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#0D0D0D',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 74,
  },
  brand: {
    color: '#F5F0E8',
    fontFamily: 'DmSerifDisplay',
    fontSize: 44,
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#B7AEA3',
    fontFamily: 'PlusJakartaSans',
    fontSize: 13,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deleteAllButton: {
    backgroundColor: 'rgba(59, 18, 18, 0.35)',
    borderColor: 'rgba(230, 137, 137, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteAllText: {
    color: '#E9BBBB',
    fontFamily: 'PlusJakartaSansSemiBold',
    fontSize: 11,
  },
  limitBanner: {
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderColor: '#C9A84C',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  limitText: {
    color: '#F5F0E8',
    fontFamily: 'PlusJakartaSansSemiBold',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '45%',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#8B847A',
    fontFamily: 'PlusJakartaSans',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: '#C9A84C',
    borderRadius: 28,
    bottom: 34,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    width: 56,
  },
  fabDisabled: {
    backgroundColor: '#8D7740',
  },
  fabPlus: {
    color: '#0D0D0D',
    fontFamily: 'PlusJakartaSansBold',
    fontSize: 30,
    lineHeight: 32,
  },
  counter: {
    bottom: 54,
    color: '#8D8578',
    fontFamily: 'PlusJakartaSans',
    fontSize: 12,
    position: 'absolute',
    right: 90,
  },
});
