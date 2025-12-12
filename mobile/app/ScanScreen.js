import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScanScreen({ onScan, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.center}><Text>Meminta izin kamera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>Izin kamera ditolak.</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barCodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e', 'qr'],
        }}
        enableTorch={torch}
      />
      {/* Overlay visual, tidak menghalangi event kamera */}
      {/* Overlay hitam transparan di luar kotak fokus */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.maskContainer}>
          <View style={styles.maskRow} />
          <View style={styles.maskCenterRow}>
            <View style={styles.maskSide} />
            <View style={styles.focusBox} />
            <View style={styles.maskSide} />
          </View>
          <View style={styles.maskRow} />
        </View>
      </View>
      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.scanText}>Arahkan ke barcode SKU</Text>
      </View>
      {/* Tombol bawah */}
      <View style={styles.bottomButtons} pointerEvents="box-none">
        <TouchableOpacity style={styles.flashBtn} onPress={() => setTorch(!torch)}>
          <MaterialCommunityIcons name={torch ? 'flashlight' : 'flashlight-off'} size={32} color="#fff" />
          
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtnBottom} onPress={onClose}>
          <Ionicons name="close" size={36} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  bottomButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 30,
  },
  flashBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#511f3f',
    opacity: 0.85,
    borderRadius: 50,
    padding: 20,
  },
  closeBtnBottom: {
    backgroundColor: '#511f3f',
    borderRadius: 50,
    padding: 20,
    opacity: 0.85,
  },
  maskContainer: {
    flex: 1,
  },
  maskRow: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  maskCenterRow: {
    flexDirection: 'row',
    height: '30%',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  focusBox: {
    width: '70%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10
  },
  scanText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 180 },
  closeBtn: {
    display: 'none',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
