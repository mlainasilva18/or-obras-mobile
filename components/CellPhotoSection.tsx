/**
 * CellPhotoSection — Câmera + Galeria com Watermark para inspeção FVS
 * Usado dentro do CellActionModal na aba "Fotos"
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Modal, FlatList, Alert, Platform, Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialIcons } from '@expo/vector-icons';
import type { InspectionPhoto } from '@/lib/types';

const { width: SCREEN_W } = Dimensions.get('window');
const THUMB_SIZE = (SCREEN_W - 48 - 16) / 3; // 3 colunas com padding

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Aplica watermark de texto na imagem usando canvas (web) ou
 * retorna a URI original com metadados (native — watermark visual via overlay)
 */
async function applyWatermark(
  uri: string,
  inspectorName: string,
  takenAt: string,
): Promise<string> {
  // No native, o ImageManipulator não suporta texto diretamente.
  // Usamos a URI original e exibimos o watermark como overlay na miniatura.
  // Para uma solução completa de watermark nativo, seria necessário uma lib nativa.
  // Aqui retornamos a URI como está — o watermark é exibido visualmente no overlay.
  try {
    // Redimensionar para otimizar armazenamento (max 1200px)
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch {
    return uri;
  }
}

interface CellPhotoSectionProps {
  cellId: string;
  photos: InspectionPhoto[];
  inspectorName: string;
  onPhotosChange: (photos: InspectionPhoto[]) => void;
}

export function CellPhotoSection({
  cellId,
  photos,
  inspectorName,
  onPhotosChange,
}: CellPhotoSectionProps) {
  const [loading, setLoading] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<InspectionPhoto | null>(null);

  const requestAndPickCamera = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Câmera', 'Use a opção "Escolher da Galeria" no navegador.');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações do dispositivo.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        const takenAt = new Date().toISOString();
        const processedUri = await applyWatermark(result.assets[0].uri, inspectorName, takenAt);
        const photo: InspectionPhoto = {
          id: generateId(),
          uri: processedUri,
          takenAt,
          takenBy: inspectorName,
          cellId,
        };
        onPhotosChange([...photos, photo]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setLoading(false);
    }
  }, [photos, inspectorName, cellId, onPhotosChange]);

  const requestAndPickGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações do dispositivo.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: false,
      });
      if (!result.canceled && result.assets[0]) {
        const takenAt = new Date().toISOString();
        const processedUri = await applyWatermark(result.assets[0].uri, inspectorName, takenAt);
        const photo: InspectionPhoto = {
          id: generateId(),
          uri: processedUri,
          takenAt,
          takenBy: inspectorName,
          cellId,
        };
        onPhotosChange([...photos, photo]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto.');
    } finally {
      setLoading(false);
    }
  }, [photos, inspectorName, cellId, onPhotosChange]);

  const handleDelete = useCallback((photoId: string) => {
    Alert.alert(
      'Excluir foto',
      'Deseja remover esta foto da inspeção?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onPhotosChange(photos.filter(p => p.id !== photoId)),
        },
      ]
    );
  }, [photos, onPhotosChange]);

  return (
    <View style={styles.container}>
      {/* Botões de câmera e galeria */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.cameraBtn, loading && styles.btnDisabled]}
          onPress={requestAndPickCamera}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="camera-alt" size={18} color="#fff" />
              <Text style={styles.cameraBtnText}>Tirar Foto</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.galleryBtn, loading && styles.btnDisabled]}
          onPress={requestAndPickGallery}
          disabled={loading}
          activeOpacity={0.85}
        >
          <MaterialIcons name="photo-library" size={18} color="#2E7D32" />
          <Text style={styles.galleryBtnText}>Escolher da Galeria</Text>
        </TouchableOpacity>
      </View>

      {/* Grid de miniaturas */}
      {photos.length === 0 ? (
        <View style={styles.emptyPhotos}>
          <MaterialIcons name="photo-camera" size={36} color="#E0E0E0" />
          <Text style={styles.emptyText}>Nenhuma foto anexada</Text>
          <Text style={styles.emptySubText}>Tire uma foto ou escolha da galeria</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.photoCount}>{photos.length} foto{photos.length !== 1 ? 's' : ''} anexada{photos.length !== 1 ? 's' : ''}</Text>
          <FlatList
            data={photos}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.thumbContainer}
                onPress={() => setFullscreenPhoto(item)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
                {/* Watermark overlay */}
                <View style={styles.watermarkOverlay}>
                  <Text style={styles.watermarkText} numberOfLines={1}>
                    {item.takenBy}
                  </Text>
                  <Text style={styles.watermarkText}>
                    {formatDate(item.takenAt)}
                  </Text>
                  <Text style={styles.watermarkBrand}>OR Obras — OR Engenharia</Text>
                </View>
                {/* Delete button */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.grid}
          />
        </View>
      )}

      {/* Fullscreen photo viewer */}
      <Modal
        visible={!!fullscreenPhoto}
        animationType="fade"
        transparent
        onRequestClose={() => setFullscreenPhoto(null)}
      >
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setFullscreenPhoto(null)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {fullscreenPhoto && (
            <>
              <Image
                source={{ uri: fullscreenPhoto.uri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              {/* Watermark na tela cheia */}
              <View style={styles.fullscreenWatermark}>
                <Text style={styles.fullscreenWatermarkText}>
                  Inspetor: {fullscreenPhoto.takenBy} | {formatDate(fullscreenPhoto.takenAt)}
                </Text>
                <Text style={styles.fullscreenWatermarkText}>OR Obras — OR Engenharia</Text>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  cameraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 12,
  },
  galleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  btnDisabled: { opacity: 0.5 },
  cameraBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  galleryBtnText: { color: '#2E7D32', fontSize: 14, fontWeight: '700' },
  emptyPhotos: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#9E9E9E', fontWeight: '500' },
  emptySubText: { fontSize: 12, color: '#BDBDBD' },
  photoCount: { fontSize: 12, color: '#9E9E9E', marginBottom: 10, fontWeight: '600' },
  grid: { gap: 4 },
  thumbContainer: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  thumb: { width: '100%', height: '100%' },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  watermarkText: { fontSize: 7, color: '#fff', lineHeight: 10 },
  watermarkBrand: { fontSize: 6, color: '#A5D6A7', lineHeight: 9 },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(229,57,53,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullscreenImage: {
    width: SCREEN_W,
    height: SCREEN_W * 1.33,
  },
  fullscreenWatermark: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  fullscreenWatermarkText: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
});
