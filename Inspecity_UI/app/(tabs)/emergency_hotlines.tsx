import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Linking } from "react-native";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOOGLE_API_KEY = "AlzaSysSIYHDroeAu3l1D7TZ2X3ZkJNiRQUsNBz"; // Replace with your API key

const EmergencyHotlines = () => {
  const [hotlines, setHotlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  const emergencyKeywords = [
    "emergency rescue",
    "hospital",
    "fire station",
    "police station",
    "Red Cross",
    "volunteer fire brigade",
    "Cebu City Command Center",
  ];

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,vicinity&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        return data.result;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
    return null;
  };

  const fetchHotlines = async (loc) => {
    const { latitude, longitude } = loc.coords;
    const cacheKey = `hotlines-${latitude}-${longitude}`;

    // Check if data is cached
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      setHotlines(JSON.parse(cachedData));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let allHotlines = [];

      for (const keyword of emergencyKeywords) {
        const response = await fetch(
          `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&keyword=${encodeURIComponent(
            keyword
          )}&key=${GOOGLE_API_KEY}&maxResults=3`
        );
        const data = await response.json();

        if (data.status === "OK") {
          const detailsPromises = data.results.map((place) => fetchPlaceDetails(place.place_id));
          const detailsResults = await Promise.all(detailsPromises);

          const hotlineList = detailsResults.map((details, index) => ({
            id: data.results[index].place_id,
            name: data.results[index].name,
            phone: details?.formatted_phone_number || "N/A",
            address: data.results[index].vicinity || "No address available",
            type: keyword,
            icon: getIcon(keyword),
          }));

          allHotlines = [...allHotlines, ...hotlineList];
        }
      }

      const uniqueHotlines = allHotlines.filter(
        (hotline, index, self) => index === self.findIndex((h) => h.id === hotline.id)
      );

      setHotlines(uniqueHotlines);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(uniqueHotlines)); // Cache the results
    } catch (error) {
      Alert.alert("Error", "Failed to fetch emergency hotlines.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "hospital":
        return <MaterialIcons name="local-hospital" size={24} color="red" />;
      case "fire station":
      case "volunteer fire brigade":
        return <MaterialIcons name="local-fire-department" size={24} color="orange" />;
      case "police station":
        return <MaterialIcons name="local-police" size={24} color="blue" />;
      case "Red Cross":
        return <MaterialIcons name="volunteer-activism" size={24} color="red" />;
      case "Cebu City Command Center":
        return <MaterialIcons name="support-agent" size={24} color="purple" />;
      default:
        return <MaterialIcons name="emergency" size={24} color="black" />;
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required to get nearby hotlines.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchHotlines(loc);
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f8f9fa" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
        Emergency Hotlines
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#071C34" />
      ) : hotlines.length > 0 ? (
        <FlatList
          data={hotlines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 15,
                backgroundColor: "#fff",
                marginBottom: 10,
                borderRadius: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() =>
                item.phone !== "N/A"
                  ? Linking.openURL(`tel:${item.phone}`)
                  : Alert.alert("No Phone Number Available", "Please visit the location for assistance.")
              }
            >
              {item.icon}
              <View style={{ marginLeft: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ fontSize: 14, color: "gray" }}>{item.address}</Text>
                <Text style={{ fontSize: 16, color: "blue" }}>📞 {item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={{ textAlign: "center", fontSize: 16, color: "gray" }}>
          No emergency hotlines found near you.
        </Text>
      )}
    </View>
  );
};

export default EmergencyHotlines;