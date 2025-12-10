import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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

  // --- RENDERING ---

  const renderSettings = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.headerTitle}>Konfigurasi Server</Text>

      <Text style={styles.label}>IP Address Komputer (Server API):</Text>
      <TextInput
        style={styles.input}
        placeholder="Cth: 192.168.1.5"
        value={config.apiIp}
        onChangeText={(t) => setConfig({ ...config, apiIp: t })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Nama Database:</Text>
      <TextInput 
        style={styles.input} 
        value={config.dbName} 
        onChangeText={(t) => setConfig({ ...config, dbName: t })} 
      />

      {/* STORE CODE (User DB) */}
      <Text style={styles.label}>Store Code (DB User):</Text>
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
  );

  const renderSearch = () => (
    <View style={styles.searchPageContainer}>
      <Text style={styles.headerTitle}>Cari Barang</Text>
      
      {/* BARIS CONTROLLER */}
      <View style={styles.inputGroup}>
        {/* INPUT */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Nama / SKU"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={searchProduct}
          />
        </View>

        {/* BUTTON SEARCH */}
        <TouchableOpacity style={styles.btnSearch} onPress={searchProduct}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>

        {/* BUTTON RESET */}
        <TouchableOpacity style={styles.btnReset} onPress={resetSearch}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading && <ActivityIndicator size="large" color="#007BFF" style={{marginTop: 20}} />}

      {/* HASIL */}
      <ScrollView style={styles.resultList}>
        {results.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>SKU: {item.sku}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.cardQty}>Stok: {item.quantity}</Text>
          </View>
        ))}
        
        {results.length === 0 && !loading && keyword.length > 0 && (
          <Text style={styles.emptyText}>Data tidak ditemukan.</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setCurrentScreen('search')} style={{ padding: 10 }}>
          <Text style={[styles.navText, currentScreen === 'search' && styles.navActive]}>CARI</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={{ padding: 10 }}>
          <Text style={[styles.navText, currentScreen === 'settings' && styles.navActive]}>SETTING</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {currentScreen === 'settings' ? renderSettings() : renderSearch()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  navbar: { 
    flexDirection: 'row', justifyContent: 'center', backgroundColor: '#fff', 
    borderBottomWidth: 1, borderColor: '#ddd' 
  },
  navText: { fontSize: 16, fontWeight: 'bold', color: '#888' },
  navActive: { color: '#007BFF', borderBottomWidth: 2, borderColor: '#007BFF' },
  
  content: { flex: 1, padding: 20 },
  
  // Style untuk Halaman
  formContainer: { flex: 1 },
  searchPageContainer: { flex: 1 }, // Tambahan agar halaman cari full screen
  
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, marginBottom: 5, color: '#555' },
  
  // Input Biasa (IP, DB Name)
  input: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', 
    borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 
  },

  // Input dengan Icon (Password/User)
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff',
    paddingHorizontal: 10, marginBottom: 15, height: 50,
  },
  
  // Input Field di dalam Container (Search atau Password)
  inputField: {
    flex: 1, height: '100%', fontSize: 16, color: '#333'
  },
  iconArea: { padding: 5 },

  // Group Pencarian
  inputGroup: { flexDirection: 'row', marginBottom: 15 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 10, marginRight: 8, height: 50,
  },

  // Tombol
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  btnTest: { backgroundColor: '#6c757d' },
  btnSave: { backgroundColor: '#28a745' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  btnSearch: { 
    backgroundColor: '#007BFF', width: 50, height: 50, borderRadius: 8, 
    justifyContent: 'center', alignItems: 'center', marginRight: 8 
  },
  btnReset: { 
    backgroundColor: '#FF3B30', width: 50, height: 50, borderRadius: 8, 
    justifyContent: 'center', alignItems: 'center' 
  },

  // Hasil
  resultList: { flex: 1, marginTop: 10 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { color: '#666', marginBottom: 5 },
  cardDesc: { fontStyle: 'italic', marginBottom: 5 },
  cardQty: { fontWeight: 'bold', color: '#007BFF', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});