
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const Apps_layout = () => {
    const router = useRouter();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{
                    title: "Applications",
                    headerTintColor: "black",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    headerTitleAlign: "center",
                    headerLeft: () => (
                        <TouchableOpacity
                            className="ml-4"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back-circle" size={40} color="pink" />
                        </TouchableOpacity>
                    ),
                }}
            />

        </Stack>
    )


};

export default Apps_layout;