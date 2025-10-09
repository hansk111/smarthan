import { useSelector } from "@/store/hooks";
import { Redirect, Stack } from "expo-router";

const Auth_layout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    console.log("Auth_layout===logged in");
    return <Redirect href="/profile" />;
  } else {
    console.log("Auth_layout===logged out");
    return <Stack screenOptions={{ headerShown: false }}></Stack>;
  }
};

export default Auth_layout;
