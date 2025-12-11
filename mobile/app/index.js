import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Keyboard, Platform, Image, KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

export default function App() {
  // --- STATE ---
  const [currentScreen, setCurrentScreen] = useState('search');

  // Config Database
  const [config, setConfig] = useState({
    apiIp: '',
    dbHost: 'localhost',
    dbName: '',
    dbUser: '',
    dbPass: ''
  });

  // Toggles
  const [showStoreCode, setShowStoreCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Search
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- EFFECT ---
  useEffect(() => {
    loadSettings();
  }, []);

  // --- FUNCTIONS ---
  const resetSearch = () => {
    setKeyword('');
    setResults([]);
    Keyboard.dismiss();
  };

  const loadSettings = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('dbConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat setting');
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('dbConfig', JSON.stringify(config));
      Alert.alert('Sukses', 'Konfigurasi disimpan!');
      setCurrentScreen('search');
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan setting');
    }
  };

  const testConnection = async () => {
    if (!config.apiIp) {
      Alert.alert('Error', 'IP Server API harus diisi!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${config.apiIp}:3000/api/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: config.dbHost,
          user: config.dbUser,
          password: config.dbPass,
          database: config.dbName
        })
      });
      const json = await response.json();

      if (json.status === 'success') {
        console.log(json.data)
        Alert.alert('Berhasil', json.message);
      } else {
        Alert.alert('Gagal', json.message);
      }
    } catch (error) {
      Alert.alert('Error Jaringan', 'Tidak bisa menghubungi Server API. Pastikan IP benar.');
    } finally {
      setLoading(false);
    }
  };

  const searchProduct = async () => {
    if (!config.apiIp) {
      Alert.alert('Setting Kosong', 'Harap isi konfigurasi di menu Setting dulu.');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(`http://${config.apiIp}:3000/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbConfig: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPass,
            database: config.dbName
          },
          keyword: keyword
        })
      });
      const json = await response.json();

      if (json.status === 'success') {
        setResults(json.data);
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mencari data. Cek koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanPress = () => {
    Alert.alert("Fitur Scan", "Fitur ini akan segera hadir!");
  };

  // --- UI COMPONENTS ---

  const renderSettings = () => (
    <View style={styles.searchPageContainer}>
      {/* Header Container dengan Background Hijau Toska */}
      <View style={styles.headerBackground}>
        <Image
          source={require('../assets/images/elzatta-logo.png')}
          style={styles.headerLogo}
        />
      </View>

      {/* Konten Utama Setting */}
      <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        

        <Text style={styles.label}>IP Address Komputer (Server API):</Text>
        <TextInput
          style={styles.input}
          placeholder="Cth: 192.168.1.5"
          value={config.apiIp}
          onChangeText={(t) => setConfig({ ...config, apiIp: t })}
          keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
        />

        <Text style={styles.label}>Nama Database:</Text>
        <TextInput
          style={styles.input}
          value={config.dbName}
          onChangeText={(t) => setConfig({ ...config, dbName: t })}
        />

        {/* STORE CODE (User DB) */}
        <Text style={styles.label}>Store Code (User DB):</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            value={config.dbUser}
            onChangeText={(t) => setConfig({ ...config, dbUser: t })}
            secureTextEntry={!showStoreCode}
            placeholder="Masukkan Kode Toko"
          />
          <TouchableOpacity onPress={() => setShowStoreCode(!showStoreCode)} style={styles.iconArea}>
            <Ionicons name={showStoreCode ? "eye" : "eye-off"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* PASSWORD */}
        <Text style={styles.label}>Password:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            value={config.dbPass}
            onChangeText={(t) => setConfig({ ...config, dbPass: t })}
            secureTextEntry={!showPassword}
            placeholder="Masukkan Password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconArea}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.btnTest]} onPress={testConnection}>
            <Text style={styles.btnText}>Test Koneksi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnSave]} onPress={saveSettings}>
            <Text style={styles.btnText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderSearch = () => (
    <View style={[styles.searchPageContainer, { flex: 1 }]}>

      {/* Header Container dengan Background Hijau Toska */}
      <View style={styles.headerBackground}>
        <Image
          source={require('../assets/images/elzatta-logo.png')}
          style={styles.headerLogo}
        />
      </View>


      {/* Konten Utama Pencarian */}
      <View style={[styles.contentPadding, { flex: 1 }]}>

        {/* BARIS CONTROLLER (Input & Search Button) */}
        <View style={[styles.inputGroup, { marginTop: 20 }]}>

          {/* INPUT CONTAINER (Termasuk Tombol Clear di dalamnya) */}
          <View style={styles.searchContainer}>
            
            <TextInput
              style={styles.inputField}
              placeholder="Cari Nama / SKU..."
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={searchProduct}
            />

            {/* TOMBOL CLEAR/RESET BARU */}
            {keyword.length > 0 && (
              <TouchableOpacity onPress={resetSearch} style={styles.clearIconArea}>
                <Ionicons name="close-circle" size={24} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>

          {/* BUTTON SEARCH */}
          <TouchableOpacity style={styles.btnSearch} onPress={searchProduct}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>

          {/* OLD BUTTON RESET TELAH DIHAPUS DARI SINI */}

        </View>

        {/* LOADING */}
        {loading && <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />}

        {/* HASIL */}
        <ScrollView style={styles.resultList} contentContainerStyle={{ paddingBottom: 140 }}>
          {results.map((item, index) => {
            console.log('Render item:', item);
            return (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardQty}>Stok: {item.quantity}</Text>
                </View>
                <Text style={styles.cardSubtitle}>SKU: {item.sku}</Text>
              </View>
            );
          })}

          {results.length === 0 && !loading && keyword.length > 0 && (
            <Text style={styles.emptyText}>Data tidak ditemukan.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );

  // --- BOTTOM NAVIGATION ---
  const renderBottomNav = () => (
    <View style={styles.bottomNavWrapper} pointerEvents="box-none">
      {/* Background Bar dengan efek blur */}
      <View style={styles.bottomNavBar}>
        <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
        {/* Kanan: Cek Stok (Search) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('search')}
        >
          <Ionicons
            name="search"
            size={28}
            color={currentScreen === 'search' ? '#511f3f' : '#888'}
          />
          <Text style={[styles.navLabel, currentScreen === 'search' && styles.navLabelActive]}>
            Cari Stok
          </Text>
        </TouchableOpacity>

        {/* Spacer untuk tombol tengah */}
        <View style={{ width: 100 }} />

        {/* Kiri: Pengaturan (Settings) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('settings')}
        >
          <Ionicons
            name="settings"
            size={28}
            color={currentScreen === 'settings' ? '#511f3f' : '#888'}
          />
          <Text style={[styles.navLabel, currentScreen === 'settings' && styles.navLabelActive]}>
            Pengaturan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tombol Tengah (Floating) */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={handleScanPress}
        activeOpacity={0.8}
      >
        <Ionicons name="scan-sharp" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* StatusBar untuk Android: teks hitam, background putih */}
      {Platform.OS === 'android' && (
        <StatusBar style="dark" backgroundColor="#fff" />
      )}
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {currentScreen === 'settings' ? renderSettings() : renderSearch()}
        </KeyboardAvoidingView>
      </View>
      {/* Render Navigasi Bawah */}
      {renderBottomNav()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  contentPadding: {
    paddingHorizontal: 20
  },

  // -- BOTTOM NAV STYLES --
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 70,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginHorizontal: 25,
  },
  navLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#511f3f',
    fontWeight: 'bold',
  },
  centerButton: {
    position: 'absolute',
    bottom: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#511f3f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#f8f9fa'
  },

  // -- HEADER STYLES --
  headerBackground: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    height: 80,
  },

  headerLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },

  // -- FORM/INPUT STYLES --
  formContainer: { flex: 1 },
  searchPageContainer: { flex: 1 },

  label: { fontSize: 14, marginBottom: 5, color: '#555' },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 12, padding: 12, marginBottom: 15, fontSize: 16
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff',
    paddingHorizontal: 12, marginBottom: 15, height: 50,
  },

  // INPUT FIELD di dalam SearchContainer (perlu flex:1 agar mengisi ruang)
  inputField: {
    flex: 1, height: '100%', fontSize: 16, color: '#333'
  },

  // Style baru untuk tombol clear (X)
  clearIconArea: {
    paddingLeft: 8,
    paddingVertical: 5,
    justifyContent: 'center',
  },

  iconArea: { padding: 5 },

  // -- BUTTONS STYLES (Adjusted for Consistency) --
  inputGroup: { flexDirection: 'row', marginBottom: 15 },

  // Search Container (sekarang menampung input dan clear button)
  searchContainer: {
    flex: 1,
    flexDirection: 'row', // Biarkan input & clear icon menyamping
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 50,
  },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },

  // PRIMARY ACTION: Save (Warna Hijau Toska #511f3f)
  btnSave: { backgroundColor: '#511f3f' },

  // SECONDARY ACTION: Test Connection (Warna Abu-abu Sekunder)
  btnTest: { backgroundColor: '#888' },

  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // PRIMARY ACTION: Search (Warna Hijau Toska #511f3f)
  btnSearch: {
    backgroundColor: '#511f3f',
    width: 50, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    // Menghapus marginRight: 10 karena Reset button dipindahkan
  },


  // -- CARD STYLES --
  resultList: { flex: 1, marginTop: 10 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: 'white' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  cardSubtitle: { color: '#666', marginBottom: 5, fontSize: 14 },
  cardDesc: { fontStyle: 'italic', marginBottom: 5, color: '#888' },
  cardQty: { fontWeight: 'bold', color: '#007BFF', fontSize: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});