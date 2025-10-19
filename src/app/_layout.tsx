import { useColorScheme } from "@/hooks/useColorScheme";
import { store } from "@/store/store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import "../../global.css";

// Add this at the very top of your main App file or index.js
// import ReactDOM from "react-dom";

// Type definitions for the polyfill
// interface ReactInternalFiber {
//   stateNode?: HTMLElement | null;
// }

// interface ReactInternalInstance {
//   _renderedComponent?: {
//     _hostNode?: HTMLElement | null;
//   };
// }

// interface ComponentWithInternals extends Element {
//   _reactInternalFiber?: ReactInternalFiber;
//   _reactInternalInstance?: ReactInternalInstance;
// }

// Extend ReactDOM type to include findDOMNode
// declare module "react-dom" {
//   namespace ReactDOM {
//     function findDOMNode(
//       componentOrElement: ComponentWithInternals | null
//     ): HTMLElement | null;
//   }
// }

// // Polyfill for libraries still using findDOMNode
// if (!(ReactDOM as any).findDOMNode) {
//   (ReactDOM as any).findDOMNode = (
//     componentOrElement: ComponentWithInternals | HTMLElement | null
//   ): HTMLElement | null => {
//     if (componentOrElement == null) return null;

//     // If it's already a DOM node, return it
//     if (componentOrElement.nodeType === 1) {
//       return componentOrElement as HTMLElement;
//     }

//     // For React components, try to get the DOM node
//     if (componentOrElement._reactInternalFiber) {
//       return componentOrElement._reactInternalFiber.stateNode || null;
//     }

//     if (componentOrElement._reactInternalInstance) {
//       return (
//         componentOrElement._reactInternalInstance._renderedComponent
//           ?._hostNode || null
//       );
//     }

//     return null;
//   };
// }

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="MBTI" options={{ headerShown: false }} />
          {/* <Stack.Screen name="mediaDetails" options={{ headerShown: false }} /> */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
