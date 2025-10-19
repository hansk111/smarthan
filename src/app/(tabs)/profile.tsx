import {
  useGetUserAvatarQuery,
  useLogoutMutation,
  usePutUserAvatarMutation,
  useRetrieveUserQuery,
} from "@/store/auth/authApiSlice";
import { logoutAuth } from "@/store/auth/authSlice";
import {
  deleteAccessToken,
  deleteRefreshToken,
} from "@/store/auth/tokenManager";
import { useDispatch } from "@/store/hooks";
import { RootState } from "@/store/store";
import * as ImagePicker from "expo-image-picker"; // expo install expo-image-picker 필요
import { LinearGradient } from "expo-linear-gradient"; // expo install expo-linear-gradient 필요
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState<null | any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [putUserAvatar] = usePutUserAvatarMutation();

  const result = useSelector((state: RootState) => state.mbti.result);
  console.log("result:", result);

  // 이미지 선택 함수
  const selectAvarter = async () => {
    if (Platform.OS == "web") {
      console.log("avatar click");
      return loadImageWeb();
    } else {
      try {
        // 권한 요청
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
          Alert.alert(
            "권한 필요",
            "사진을 선택하려면 갤러리 접근 권한이 필요합니다."
          );
          return;
        }

        // 이미지 선택 옵션 표시
        Alert.alert(
          "프로필 사진 변경",
          "어떤 방법으로 사진을 선택하시겠습니까?",
          [
            {
              text: "취소",
              style: "cancel",
            },
            {
              text: "갤러리에서 선택",
              onPress: pickImageFromGallery,
            },
            {
              text: "카메라로 촬영",
              onPress: pickImageFromCamera,
            },
          ]
        );
      } catch (error) {
        console.error("이미지 선택 오류:", error);
        Alert.alert("오류", "이미지 선택 중 오류가 발생했습니다.");
      }
    }
  };

  // 갤러리에서 이미지 선택
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1], // 정사각형 비율
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        // 네이티브에서도 업로드 가능한 형태로 변환
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `avartar_${Date.now()}.jpg`,
          type: asset.type?.startsWith("image/") ? asset.type : "image/jpeg",
        };
        setSelectedImage(fileData);
      }
    } catch (error) {
      console.error("갤러리 이미지 선택 오류:", error);
      Alert.alert("오류", "갤러리에서 이미지 선택 중 오류가 발생했습니다.");
    }
  };

  // 카메라로 이미지 촬영
  const pickImageFromCamera = async () => {
    try {
      // 카메라 권한 요청
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.granted === false) {
        Alert.alert(
          "권한 필요",
          "사진을 촬영하려면 카메라 접근 권한이 필요합니다."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1], // 정사각형 비율
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        // 네이티브에서도 업로드 가능한 형태로 변환
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `avartar_${Date.now()}.jpg`,
          type: asset.type?.startsWith("image/") ? asset.type : "image/jpeg",
        };
        setSelectedImage(fileData);
      }
    } catch (error) {
      console.error("카메라 촬영 오류:", error);
      Alert.alert("오류", "카메라 촬영 중 오류가 발생했습니다.");
    }
  };

  // 웹에서 이미지 선택
  const loadImageWeb = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const filename = asset.fileName || `avatar_${Date.now()}.jpg`;
          const file = new File([blob], filename, {
            type: asset.type || "image/jpeg",
          });

          setSelectedImage(file);
        } catch (error) {
          Alert.alert("오류", "파일을 준비하는 데 실패했습니다.");
        }
      }
    } catch (error) {
      Alert.alert("오류", "이미지를 선택하는 데 실패했습니다.");
    }
  };

  // 서버에 이미지 업로드 (실제 API 엔드포인트에 맞게 수정 필요)
  const uploadImage = async () => {
    if (selectedImage === null) return;

    setIsUploadingImage(true);

    try {
      const avatarImage =
        Platform.OS === "web"
          ? selectedImage // 웹: File 객체
          : {
            // 네이티브: 메타데이터 객체
            uri: selectedImage.uri,
            name: selectedImage.name,
            type: selectedImage.type,
          };
      console.log("이미지 업로드 시작:", avatarImage);
      await putUserAvatar(avatarImage).unwrap();
      console.log("이미지 업로드 성공");

      Alert.alert("성공", "프로필 사진이 업데이트되었습니다.");
      setSelectedImage(null); // 업로드 성공 시 선택된 이미지 초기화
      setImageUri(null);
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      Alert.alert("오류", "이미지 업로드에 실패했습니다.");
      setSelectedImage(null); // 업로드 실패 시 선택된 이미지 초기화
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLogoutButton = () => {
    console.log("로그아웃 버튼 클릭됨"); // 디버깅용

    try {
      if (Platform.OS === "android") {
        Alert.alert(
          "로그아웃",
          "정말 로그아웃하시겠습니까?",
          [
            {
              text: "취소",
              style: "cancel",
              onPress: () => console.log("로그아웃 취소"),
            },
            {
              text: "로그아웃",
              style: "destructive",
              onPress: performLogout,
            },
          ],
          { cancelable: false }
        );
      } else {
        performLogout();
      }
    } catch (error) {
      console.error("Alert 오류:", error);
      // Alert가 작동하지 않을 경우 바로 로그아웃 실행
      performLogout();
    }
  };

  const performLogout = async () => {
    try {
      console.log("로그아웃 실행 중...");
      const res = await logout({}).unwrap();
      dispatch(logoutAuth());

      if (Platform.OS === "android") {
        await deleteAccessToken();
        await deleteRefreshToken();
      }

      console.log("로그아웃 성공:", res);
      router.push("/(auth)/signin");
    } catch (error: any) {
      console.error("로그아웃 실패:", error);
      // 간단한 콘솔 로그로 대체하거나 토스트 메시지 사용
      console.log(
        "로그아웃 실패:",
        error.message || "로그아웃에 실패했습니다."
      );
    }
  };

  const { data: user, isLoading: isUserLoading } = useRetrieveUserQuery();
  const { data: avatar, isLoading: isAvatarLoading } = useGetUserAvatarQuery();

  if (isUserLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 표시할 이미지 URI 결정 (선택된 이미지 > 서버 아바타 > 기본 이미지)
  const getImageUri = () => {
    if (imageUri) return imageUri;
    if (avatar?.image) return avatar.image.replace("http://", "https://");
    return "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User";
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        className="pt-16 pb-8 px-6"
      >
        <View className="items-center">
          {/* Profile Avatar - 클릭 가능하도록 수정 */}
          <TouchableOpacity
            onPress={selectAvarter}
            disabled={isUploadingImage}
            className="relative mb-4"
          >
            <View
              className="w-32 h-32 rounded-full bg-white p-1"
              style={{
                boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.15)",
                elevation: 10, // Android용
              }}
            >
              {isAvatarLoading || isUploadingImage ? (
                <View className="w-full h-full rounded-full bg-gray-200 justify-center items-center">
                  <ActivityIndicator color="#3B82F6" />
                  {isUploadingImage && (
                    <Text className="text-xs text-gray-600 mt-1">
                      업로드 중...
                    </Text>
                  )}
                </View>
              ) : (
                <Image
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                  source={{ uri: getImageUri() }}
                />
              )}
            </View>

            {/* 편집 아이콘 오버레이 */}
            <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full border-4 border-white justify-center items-center">
              <Text className="text-white text-xs font-bold">✎</Text>
            </View>

            {/* Online Status Indicator - 편집 아이콘과 겹치지 않도록 위치 조정 */}
            <View className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
          </TouchableOpacity>

          {/* User Name */}
          <Text className="text-2xl font-bold text-white mb-2">
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : "사용자"}
          </Text>

          {/* User Email */}
          <Text className="text-white/90 text-base">
            {user?.email || "이메일 없음"}
          </Text>

          {/* 이미지 변경 안내 텍스트 */}
          <Text className="text-white/70 text-sm mt-2">
            프로필 사진을 탭하여 변경하세요
            {imageUri ? (
              <TouchableOpacity onPress={uploadImage}>
                <Text className="text-warning-500 ml-4">저장</Text>
              </TouchableOpacity>
            ) : null}
          </Text>
        </View>
      </LinearGradient>

      {/* Profile Information Cards */}
      <View className="flex-1 px-6 py-8 space-y-4">
        {/* Personal Information Card */}
        <View
          className="bg-white rounded-2xl p-6"
          style={{
            boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.15)",
            elevation: 10, // Android용
          }}
        >
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            개인 정보
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600">이름</Text>
              <Text className="font-medium text-gray-800">
                {user?.first_name || "미설정"}
              </Text>
            </View>

            <View className="h-px bg-gray-200" />

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600">성</Text>
              <Text className="font-medium text-gray-800">
                {user?.last_name || "미설정"}
              </Text>
            </View>

            <View className="h-px bg-gray-200" />

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600">이메일</Text>
              <Text className="font-medium text-gray-800">
                {user?.email || "미설정"}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings Card */}
        <View
          className="bg-white rounded-2xl p-6 mt-5"
          style={{
            boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.15)",
            elevation: 10, // Android용
          }}
        >
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            계정 설정
          </Text>

          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <Text className="text-gray-600">프로필 수정</Text>
            <Text className="text-blue-500">→</Text>
          </TouchableOpacity>

          <View className="h-px bg-gray-200 my-2" />

          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <Text className="text-gray-600">비밀번호 변경</Text>
            <Text className="text-blue-500">→</Text>
          </TouchableOpacity>

          <View className="h-px bg-gray-200 my-2" />

          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <Text className="text-gray-600">알림 설정</Text>
            <Text className="text-blue-500">→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogoutButton}
          disabled={isLoggingOut}
          className="bg-slate-500 rounded-2xl py-4 px-6 active:scale-95 transition-transform mt-5"
          style={{
            boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.15)",
            elevation: 10, // Android용
          }}
        >
          <View className="flex-row items-center justify-center">
            {isLoggingOut ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-base">
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      {/* <View className="h-2" /> */}
    </ScrollView>
  );
};

export default Profile;
