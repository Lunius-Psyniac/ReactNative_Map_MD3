import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Alert, useWindowDimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const API_KEY = "7b8c25a46d8f15fa29fe8ee42bee0d6b";

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to use this app.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchWeather(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

const fetchWeather = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log("Fetching weather from:", url);
    
    let response = await fetch(url);
    let data = await response.json();
    
    if (response.ok) {
      setWeather({
        name: data.name,
        lat: lat.toFixed(2),
        lon: lon.toFixed(2),
        temp: data.main.temp,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        description: data.weather[0].description,
      });
    } else {
      console.log("Error from API:", data);
      Alert.alert("Error", data.message || "Failed to fetch weather data.");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    Alert.alert("Error", "Failed to fetch weather data.");
  }
};

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={{ width: width, height: height }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="You are here" />
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="blue" />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Weather" onPress={() => setModalVisible(true)} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {weather ? (
              <>
                <Text style={styles.modalTitle}>{weather.name}</Text>
                <Text>Latitude: {weather.lat}</Text>
                <Text>Longitude: {weather.lon}</Text>
                <Text>Temperature: {weather.temp}°C</Text>
                <Text>Pressure: {weather.pressure} hPa</Text>
                <Text>Humidity: {weather.humidity}%</Text>
                <Text>Description: {weather.description}</Text>
              </>
            ) : (
              <ActivityIndicator size="large" color="blue" />
            )}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
