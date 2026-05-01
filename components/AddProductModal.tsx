import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type AddProductModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; price: number; imageUri: string }) => Promise<boolean>;
};

export function AddProductModal({
  visible,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [name, setName] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const numericPrice = Number(priceInput);
  const isPriceValid = Number.isFinite(numericPrice) && numericPrice > 0;
  const isFormValid = useMemo(
    () => name.trim().length > 0 && isPriceValid && Boolean(imageUri),
    [name, isPriceValid, imageUri],
  );

  const resetForm = () => {
    setName('');
    setPriceInput('');
    setImageUri(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || !imageUri) {
      return;
    }

    const isSaved = await onSubmit({
      name: name.trim(),
      price: numericPrice,
      imageUri,
    });

    if (isSaved) {
      handleClose();
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>Add Product</Text>

          <TextInput
            placeholder="Product name"
            placeholderTextColor="#8D8578"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Price (e.g. 149.99)"
            placeholderTextColor="#8D8578"
            keyboardType="decimal-pad"
            style={styles.input}
            value={priceInput}
            onChangeText={setPriceInput}
          />

          {imageUri ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Pressable onPress={pickImage} style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={pickImage} style={styles.imagePicker}>
              <Text style={styles.imagePickerLabel}>Choose product photo</Text>
            </Pressable>
          )}

          <View style={styles.footer}>
            <Pressable onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!isFormValid}
              onPress={handleSubmit}
              style={[styles.submitButton, !isFormValid && styles.submitDisabled]}
            >
              <Text style={styles.submitText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.66)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    backgroundColor: '#171717',
    borderColor: '#252525',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  heading: {
    color: '#F5F0E8',
    fontFamily: 'DmSerifDisplay',
    fontSize: 28,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#111111',
    borderColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    color: '#F5F0E8',
    fontFamily: 'PlusJakartaSans',
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  imagePicker: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderColor: '#2A2A2A',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 160,
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  imagePreviewWrap: {
    backgroundColor: '#111111',
    borderColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    height: 160,
    marginBottom: 14,
    overflow: 'hidden',
  },
  imagePickerLabel: {
    color: '#C9A84C',
    fontFamily: 'PlusJakartaSansSemiBold',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  changePhotoButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    bottom: 0,
    paddingVertical: 8,
    position: 'absolute',
    width: '100%',
  },
  changePhotoText: {
    color: '#F5F0E8',
    fontFamily: 'PlusJakartaSansSemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderColor: '#3B3B3B',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#F5F0E8',
    fontFamily: 'PlusJakartaSans',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#C9A84C',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#0D0D0D',
    fontFamily: 'PlusJakartaSansBold',
    fontSize: 14,
  },
});
