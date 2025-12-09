import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  // State untuk Halaman (sederhana: 'search' atau 'settings')
  const [currentScreen, setCurrentScreen] = useState('search');

  // State untuk Form Settings
  // PENTING: apiIp adalah IP LAN komputer kamu (contoh: 192.168.1.5)
  // dbHost biasanya 'localhost' jika DB ada di komputer yang sama dengan Server API
  const [config, setConfig] = useState({
    apiIp: '',
    dbHost: 'localhost',
    dbName: '',
    dbUser: '',
    dbPass: ''
  });
  // ... state lainnya ...
  const [showStoreCode, setShowStoreCode] = useState(false)
  const [showPassword, setShowPassword] = useState(false); // Default false (tersembunyi)

  // State untuk Pencarian
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const resetSearch = () => {
    setKeyword('');       // 1. Kosongkan teks input
    setResults([]);       // 2. Kosongkan hasil pencarian
    Keyboard.dismiss();   // 3. Turunkan keyboard
  };

  // Load setting saat aplikasi dibuka
  useEffect(() => {
    loadSettings();
  }, []);

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
      setCurrentScreen('search'); // Kembali ke menu cari setelah simpan
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan setting');
    }
  };

  // Fungsi untuk memanggil Server API
  const testConnection = async () => {
    if (!config.apiIp) {
      Alert.alert('Error', 'IP Server API (Komputer) harus diisi!');
      return;
    }

    setLoading(true);
    try {
      // Kita kirim data config DB ke Server API kita
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
      Alert.alert('Error Jaringan', 'Tidak bisa menghubungi Server API. Pastikan IP Server benar dan satu jaringan WIFI.');
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
          // Kirim config DB + Keyword pencarian
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

  // --- TAMPILAN (UI) ---

  const renderSettings = () => (
    <View style={styles.formContainer}>
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
      <TextInput style={styles.input} value={config.dbName} onChangeText={(t) => setConfig({ ...config, dbName: t })} />

      {/* --- STORE CODE --- */}
      <Text style={styles.label}>Store Code:</Text>
      
      {/* ERROR 1: Harusnya 'style', bukan 'styles' */}
      <View style={styles.inputContainer}> 
        <TextInput 
          style={styles.inputField} // ERROR 2: Sesuaikan nama dengan di styles (inputField)
          value={config.dbUser} 
          onChangeText={(t) => setConfig({ ...config, dbUser: t })} 
          secureTextEntry={!showStoreCode} 
          placeholder="Masukkan Kode Toko"
        />
        <TouchableOpacity onPress={() => setShowStoreCode(!showStoreCode)} style={styles.iconArea}>
          <Ionicons
            name={showStoreCode ? "eye" : "eye-off"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>


      {/* --- PASSWORD --- */}
      {/* ERROR 3: Label harus DI LUAR View container agar posisinya di atas, bukan di samping kiri */}
      <Text style={styles.label}>Password:</Text> 

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField} // Sesuaikan nama style
          value={config.dbPass}
          onChangeText={(t) => setConfig({ ...config, dbPass: t })}
          secureTextEntry={!showPassword}
          placeholder="Masukkan Password"
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconArea}>
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="gray"
          />
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
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchPageContainer}> {/* Ganti style container utama jika perlu */}
      <Text style={styles.headerTitle}>Cari Barang</Text>
      
      {/* BARIS CONTROLLER: Input + Cari + Reset */}
      <View style={styles.inputGroup}>
        
        {/* 1. KOTAK INPUT (Paling Kiri, Flex Besar) */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Nama / SKU"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={searchProduct} // Enter di keyboard = Cari
          />
          
        </View>

        {/* 2. TOMBOL CARI (Biru) */}
        <TouchableOpacity style={styles.btnSearch} onPress={searchProduct}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>

        {/* 3. TOMBOL RESET */}
        <TouchableOpacity style={styles.btnReset} onPress={resetSearch}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>

      </View>

      {/* Indikator Loading */}
      {loading && <ActivityIndicator size="large" color="#007BFF" style={{marginTop: 20}} />}

      {/* HASIL PENCARIAN */}
      <ScrollView style={styles.resultList}>
        {results.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>SKU: {item.sku}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.cardQty}>Stok: {item.quantity}</Text>
          </View>
        ))}
        {/* Pesan jika hasil kosong tapi user sudah mencari */}
        {results.length === 0 && !loading && keyword.length > 0 && (
          <Text style={styles.emptyText}>Data tidak ditemukan.</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Navigasi Sederhana di Atas */}
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
  navbar: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
  navText: { fontSize: 16, fontWeight: 'bold', color: '#888' },
  navActive: { color: '#007BFF', borderBottomWidth: 2, borderColor: '#007BFF' },
  content: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, marginBottom: 5, color: '#555' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  btnTest: { backgroundColor: '#6c757d' },
  btnSave: { backgroundColor: '#28a745' },
  btnSearch: { backgroundColor: '#007BFF', padding: 10, height: 44, borderRadius: 8, marginLeft: 10, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 15 },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#007BFF' },
  inputGroup: { flexDirection: 'row' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { color: '#666', marginBottom: 5 },
  cardDesc: { fontStyle: 'italic', marginBottom: 5 },
  cardQty: { fontWeight: 'bold', color: '#007BFF', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',    // Susun Input & Icon menyamping
    alignItems: 'center',    // Agar icon pas di tengah vertikal
    borderWidth: 1,          // Border pindah ke sini
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,   // Jarak agar teks/icon tidak mepet pinggir
    marginBottom: 15,        // Jarak ke elemen bawah
    height: 50,              // Tinggi kotak
  },

  // 2. Ini INPUT TEKS (Dibuat transparan/tanpa border)
  inputField: {
    flex: 1,                 // Ambil sisa ruang selebar mungkin (dorong icon ke kanan)
    height: '100%',          // Tinggi mengikuti wadah
    fontSize: 16,
    color: '#333',
    // PENTING: Jangan kasih borderWidth di sini!
  },

  // 3. Area ICON (Agar mudah dipencet)
  iconArea: {
    padding: 5,              // Area sentuh lebih luas sedikit
  },

 

  inputGroup: {
    flexDirection: 'row', // Susun ke samping
    marginBottom: 15,
  },

  // WADAH INPUT
  searchContainer: {
    flex: 1,              // Ambil sisa ruang terbesar
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,       // Jarak ke tombol Cari
    height: 50,
  },

  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },

  // TOMBOL CARI (Biru)
  btnSearch: {
    backgroundColor: '#007BFF',
    width: 50,            // Dibuat kotak (width = height)
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,       // Jarak ke tombol Reset
  },

  // TOMBOL RESET (Merah/Oranye)
  btnReset: {
    backgroundColor: '#FF3B30', // Warna merah standard iOS/Android
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Style Card & Text
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { color: '#666', marginBottom: 5 },
  cardQty: { fontWeight: 'bold', color: '#007BFF', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});