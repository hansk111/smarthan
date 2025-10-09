import { useSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

const Tab_layout = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const shouldRenderScreen = false;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  } else {
    return (
      <Tabs screenOptions={{ headerShown: true }}>
        <Tabs.Screen
          name="mp3player"
          options={{
            title: "MP3 Player",
            popToTopOnBlur: true,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "musical-notes" : "musical-notes-outline"}
                size={24}
                color={color}
              />
            ),
            headerTintColor: "black",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 26,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity className="ml-4" onPress={() => router.back()}>
                <Ionicons name="musical-notes" size={40} color="blue" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.navigate("/profile")}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="bushome"
          options={{
            title: "경기도 버스 정보",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "bus" : "bus-outline"}
                size={24}
                color={color}
              />
            ),
            headerTintColor: "black",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 26,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity className="ml-4" onPress={() => router.back()}>
                <Ionicons name="bus" size={40} color="blue" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.navigate("/profile")}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="video"
          options={{
            title: "영상 보기",
            tabBarIcon: ({ focused, color }) => (
              <MaterialCommunityIcons
                name={focused ? "movie" : "movie-outline"}
                size={24}
                color={color}
              />
            ),
            headerTintColor: "black",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 26,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity className="ml-4" onPress={() => router.back()}>
                <MaterialCommunityIcons name="movie" size={40} color="purple" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.navigate("/profile")}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="weather"
          options={{
            title: "날씨",
            tabBarIcon: ({ focused, color }) => (
              <MaterialCommunityIcons
                name={focused ? "weather-sunny" : "weather-sunny-alert"}
                size={24}
                color={color}
              />
            ),
            headerTintColor: "black",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 26,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity className="ml-4" onPress={() => router.back()}>
                <MaterialCommunityIcons
                  name="weather-sunny"
                  size={40}
                  color="purple"
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.navigate("/profile")}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "나의 정보",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person-sharp" : "person-outline"}
                size={24}
                color={color}
              />
            ),
            headerTintColor: "black",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 26,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity className="ml-4" onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.navigate("/profile")}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
      </Tabs>
    );
  }
};

export default Tab_layout;
