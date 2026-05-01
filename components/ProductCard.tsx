import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Product } from '@/types/product';

type ProductCardProps = {
  product: Product;
  index: number;
  onDelete: (id: string) => void;
};

export function ProductCard({ product, index, onDelete }: ProductCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90).springify().damping(14)}
      exiting={FadeOutUp.duration(220)}
      style={styles.card}
    >
      <ImageBackground source={{ uri: product.imageUri }} style={styles.image}>
        <View style={styles.topShade} />
        <View style={styles.bottomShade} />

        <View style={styles.topRow}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>Yip Select</Text>
          </View>
          <Pressable onPress={() => onDelete(product.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>

        <View style={styles.bottomRow}>
          <Text numberOfLines={2} style={styles.name}>
            {product.name}
          </Text>
          <View style={styles.pricePill}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    height: 230,
    justifyContent: 'space-between',
  },
  topShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  bottomShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  heroTag: {
    backgroundColor: 'rgba(12,12,12,0.5)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroTagText: {
    color: '#D8CFBF',
    fontFamily: 'PlusJakartaSansSemiBold',
    fontSize: 11,
  },
  deleteButton: {
    backgroundColor: 'rgba(16, 16, 16, 0.72)',
    borderColor: 'rgba(214, 129, 129, 0.86)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  deleteButtonText: {
    color: '#F2C0C0',
    fontFamily: 'PlusJakartaSansSemiBold',
    fontSize: 11,
  },
  bottomRow: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  name: {
    color: '#F5F0E8',
    flex: 1,
    fontFamily: 'DmSerifDisplay',
    fontSize: 25,
    letterSpacing: 0.3,
    marginRight: 12,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  pricePill: {
    backgroundColor: '#C9A84C',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  price: {
    color: '#0D0D0D',
    fontFamily: 'PlusJakartaSansBold',
    fontSize: 14,
  },
});
