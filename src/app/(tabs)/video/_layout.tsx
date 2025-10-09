
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const Video_layout = () => {
    const router = useRouter();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{

                // title: "Video 보기기",

                // headerTintColor: "black",
                // headerTitleStyle: {
                //     fontWeight: "bold",
                // },
                // headerTitleAlign: "center",
                // headerLeft: () => (
                //     <TouchableOpacity
                //         className="ml-4"
                //         onPress={() => router.back()}
                //     >
                //         <Ionicons name="arrow-back-circle" size={40} color="pink" />
                //     </TouchableOpacity>
                // ),
            }}
            />
            <Stack.Screen name="[id]" options={{
                title: "Video 보기기",

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
            <Stack.Screen name="create" options={{
                title: "Video 생성",

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
            <Stack.Screen name="thumbnailtest" options={{
                title: "썸네일일 생성",

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

export default Video_layout;