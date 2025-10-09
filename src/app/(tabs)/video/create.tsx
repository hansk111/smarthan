import { useCreateVideoMutation } from "@/store/video/VideoApiSlice";
import { Ionicons } from "@expo/vector-icons";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
interface Video {
  id?: string;
  title: string;
  description: string;
  type: string;
  thumbnail: any;
  video_file: any;
  created_at?: string;
}

interface CreateVideoFormData {
  title: string;
  description: string;
  type: string;
  thumbnail: any | null;
  video_file: any | null;
}

const VIDEO_TYPES = [
  { id: "gardening", label: "가드닝", icon: "flower-outline" },
  { id: "bicycle", label: "자전거", icon: "bicycle" },
  { id: "education", label: "교육", icon: "library-outline" },
  { id: "music", label: "음악", icon: "musical-notes-outline" },
  { id: "sports", label: "스포츠", icon: "fitness-outline" },
  { id: "travel", label: "여행", icon: "airplane-outline" },
];

export default function CreateVideoScreen() {
  const [formData, setFormData] = useState<CreateVideoFormData>({
    title: "",
    description: "",
    type: "",
    thumbnail: null,
    video_file: null,
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [createVideo] = useCreateVideoMutation();
  const isWeb = Platform.OS === "web";
  const isAndroid = Platform.OS === "android";
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    } else if (formData.title.length < 2) {
      newErrors.title = "제목은 최소 2자 이상이어야 합니다";
    }

    if (!formData.description.trim()) {
      newErrors.description = "설명을 입력해주세요";
    }

    if (!formData.type) {
      newErrors.type = "비디오 유형을 선택해주세요";
    }

    if (!formData.video_file) {
      newErrors.video_file = "비디오 파일을 선택해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Web용 파일 선택
  const pickThumbnailWeb = async () => {
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

        // Web에서는 URI를 blob으로 변환해서 File 객체 생성
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          const filename = asset.fileName || `thumbnail_${Date.now()}.jpg`;
          const file = new File([blob], filename, {
            type: asset.type || "image/jpeg",
          });
          setFormData((prev) => ({ ...prev, thumbnail: file }));
          console.log("Web - File created:", {
            name: file.name,
            type: file.type,
            size: file.size,
          });
        } catch (error) {
          console.error("Web - Error creating File:", error);
          Alert.alert("오류", "파일을 준비하는 데 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("Web - Image picker error:", error);
      Alert.alert("오류", "이미지를 선택하는 데 실패했습니다.");
    }
  };

  const pickVideoFileWeb = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // 비디오 파일인지 확인
        if (!asset.mimeType || !asset.mimeType.startsWith("video/")) {
          Alert.alert("오류", "비디오 파일만 선택할 수 있습니다.");
          return;
        }

        setVideoUri(asset.uri);

        // Web에서는 URI를 blob으로 변환해서 File 객체 생성
        try {
          const response = await fetch(asset.uri);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          // 비디오 파일의 적절한 확장자와 MIME 타입 설정
          const filename =
            asset.name || asset.fileName || `video_${Date.now()}.mp4`;
          const mimeType = asset.mimeType || blob.type || "video/mp4";

          const file = new File([blob], filename, {
            type: mimeType,
          });

          // thumbnail이 아닌 video로 설정하는 것이 맞는 것 같습니다
          setFormData((prev) => ({ ...prev, video_file: file }));

          console.log("Web - Video file created:", {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + "MB",
          });
        } catch (fetchError) {
          console.error("Web - Error creating File:", fetchError);
          Alert.alert("오류", "비디오 파일을 처리하는 데 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("Web - Video picker error:", error);
      Alert.alert("오류", "비디오를 선택하는 데 실패했습니다.");
    }
  };

  // Android용 파일 선택
  const pickThumbnailAndroid = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `thumbnail_${Date.now()}.jpg`,
          type: asset.type?.startsWith("image/") ? asset.type : "image/jpeg",
        };
        setFormData((prev) => ({
          ...prev,
          thumbnail: fileData,
        }));

        if (errors.thumbnail) {
          setErrors((prev) => ({ ...prev, thumbnail: "" }));
        }
      }
    } catch (error) {
      console.error("Thumbnail loading error:", error);
      Alert.alert("오류", "썸네일일 파일 선택 중 오류가 발생했습니다.");
    }
  };

  const pickVideoFileAndroid = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // 파일 크기 제한 체크 (예: 100MB)
        const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert("오류", "파일 크기가 너무 큽니다. (최대 500MB)");
          return;
        }
        // 업로드용 파일 객체 생성
        const uploadFile = {
          uri: file.uri,
          type: file.mimeType || "video/mp4", // MIME 타입
          name: file.name || `video_${Date.now()}.mp4`, // 파일명
          size: file.size, // 파일 크기
        };
        setFormData((prev) => ({
          ...prev,
          video_file: uploadFile,
        }));
        if (errors.video_file) {
          setErrors((prev) => ({ ...prev, video_file: "" }));
        }
      }
    } catch (error) {
      Alert.alert("오류", "비디오 파일 선택 중 오류가 발생했습니다.");
    }
  };

  // 플랫폼별 파일 선택 함수
  const pickThumbnail = () => {
    if (isWeb) {
      pickThumbnailWeb();
    } else if (isAndroid) {
      pickThumbnailAndroid();
    }
  };

  const pickVideoFile = () => {
    if (isWeb) {
      pickVideoFileWeb();
    } else if (isAndroid) {
      pickVideoFileAndroid();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    console.log("formData", formData);

    try {
      await createVideo(formData).unwrap();

      // 성공 시 처리
      if (isWeb) {
        window.alert("영상이 성공적으로 생성되었습니다!");
      } else {
        Alert.alert("성공", "영상이 성공적으로 생성되었습니다!", [
          {
            text: "확인",
            onPress: () => {
              // 네비게이션 처리
            },
          },
        ]);
      }

      // 폼 리셋
      setFormData({
        title: "",
        description: "",
        type: "",
        thumbnail: null,
        video_file: null,
      });
      setErrors({});
      setImageUri(null);
      setVideoUri(null);
      router.push("/video");
    } catch (error) {
      console.error("Video creation error:", error);

      if (isWeb) {
        window.alert("비디오 생성 중 오류가 발생했습니다.");
      } else {
        Alert.alert("오류", "비디오 생성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderVideoTypeButton = (type: (typeof VIDEO_TYPES)[0]) => (
    <TouchableOpacity
      key={type.id}
      className={`flex-row items-center p-4 rounded-xl border-2 mb-3 ${formData.type === type.id
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 bg-white"
        } ${isWeb ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
      onPress={() => {
        setFormData((prev) => ({ ...prev, type: type.id }));
        if (errors.type) {
          setErrors((prev) => ({ ...prev, type: "" }));
        }
      }}
    >
      <Ionicons
        name={type.icon as any}
        size={24}
        color={formData.type === type.id ? "#3B82F6" : "#6B7280"}
      />
      <Text
        className={`ml-3 text-base font-medium ${formData.type === type.id ? "text-blue-600" : "text-gray-700"
          }`}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  // Web용 컨테이너 스타일
  const webContainerStyle = isWeb
    ? {
      maxWidth: 600,
      marginHorizontal: "auto",
      minHeight: "100vh",
    }
    : {};

  return (
    <SafeAreaView
      className={`flex-1 bg-gray-50 ${isWeb ? "" : ""}`}
      style={{
        paddingTop: isAndroid ? StatusBar.currentHeight : 0,
        // ...webContainerStyle,
      }}
    >
      {/* Header Section - 높이 최소화 */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        className="pt-2 pb-2"
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-2xl font-bold text-white">새로 만들기</Text>
        </View>
      </LinearGradient>
      {!isWeb && (
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      )}

      {/* Header */}
      {/* <View className={`bg-white border-b border-gray-200 px-4 py-3 ${isWeb ? 'sticky top-0 z-10' : ''
                }`}>
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        className={`p-2 ${isWeb ? 'hover:bg-gray-100 rounded-lg' : ''}`}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">
                        새 비디오 만들기
                    </Text>
                    <View className="w-10" />
                </View>
            </View> */}

      <ScrollView
        className="flex-1 px-4 pt-5 pb-20"
        showsVerticalScrollIndicator={!isWeb}
        style={isWeb ? { scrollbarWidth: "thin" } : {}}
      >
        {/* 제목 입력 */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-700 mb-2">
            제목 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3 text-base ${errors.title ? "border-red-300" : "border-gray-200"
              } ${isWeb
                ? "outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                : ""
              }`}
            placeholder="비디오 제목을 입력하세요"
            value={formData.title}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, title: text }));
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: "" }));
              }
            }}
            maxLength={100}
            {...(isWeb && { autoComplete: "off" })}
          />
          {errors.title && (
            <Text className="text-red-500 text-sm mt-1">{errors.title}</Text>
          )}
          <Text className="text-gray-400 text-sm mt-1">
            {formData.title.length}/100
          </Text>
        </View>

        {/* 설명 입력 */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-700 mb-2">
            설명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3 text-base ${errors.description ? "border-red-300" : "border-gray-200"
              } ${isWeb
                ? "outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                : ""
              }`}
            placeholder="비디오에 대한 설명을 입력하세요"
            value={formData.description}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, description: text }));
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            multiline
            numberOfLines={isWeb ? 6 : 4}
            textAlignVertical="top"
            maxLength={500}
            {...(isWeb && {
              style: {
                minHeight: isWeb ? 120 : 80,
                fontFamily: "system-ui, -apple-system, sans-serif",
              },
            })}
          />
          {errors.description && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.description}
            </Text>
          )}
          <Text className="text-gray-400 text-sm mt-1">
            {formData.description.length}/500
          </Text>
        </View>

        {/* 비디오 유형 선택 */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-700 mb-3">
            비디오 유형 <Text className="text-red-500">*</Text>
          </Text>
          <View className={isWeb ? "grid grid-cols-2 gap-3" : ""}>
            {VIDEO_TYPES.map(renderVideoTypeButton)}
          </View>
          {errors.type && (
            <Text className="text-red-500 text-sm mt-1">{errors.type}</Text>
          )}
        </View>

        {/* 썸네일 선택 */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-700 mb-3">
            썸네일 (선택사항)
          </Text>
          <TouchableOpacity
            className={`bg-white border-2 border-dashed border-gray-300 rounded-xl p-0 items-center justify-center ${isWeb
              ? "hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              : ""
              }`}
            onPress={pickThumbnail}
          >
            {formData.thumbnail && imageUri ? (
              <View style={{ marginTop: 3 }}>
                <Image
                  source={{ uri: imageUri }}
                  // className="w-32 h-18 rounded-lg mb-2"
                  style={{
                    width: 200,
                    height: 150,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }} // 16:9 비율 예시
                  resizeMode="contain"
                />
                {/* <Text className="text-blue-600 text-sm font-medium">
                                    썸네일 변경
                                </Text> */}
              </View>
            ) : (
              <View className="items-center m-3">
                <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 text-base mt-2">
                  {isWeb ? "클릭하여 썸네일 이미지 선택" : "썸네일 이미지 선택"}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  16:9 비율 권장 {isWeb ? "• JPG, PNG, GIF" : ""}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 비디오 파일 선택 */}
        <View className="mb-10">
          <Text className="text-base font-medium text-gray-700 mb-3">
            비디오 파일 <Text className="text-red-500">*</Text>
          </Text>
          <TouchableOpacity
            className={`bg-white border-2 border-dashed rounded-xl p-6 items-center justify-center ${errors.video_file ? "border-red-300" : "border-gray-300"
              } ${isWeb
                ? "hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                : ""
              }`}
            onPress={pickVideoFile}
          >
            <View className="items-center">
              <Ionicons
                name="videocam-outline"
                size={32}
                color={formData.video_file ? "#3B82F6" : "#9CA3AF"}
              />
              <Text
                className={`text-base mt-2 ${formData.video_file ? "text-blue-600" : "text-gray-500"
                  }`}
              >
                {formData.video_file
                  ? "비디오 파일 선택됨"
                  : isWeb
                    ? "클릭하여 비디오 파일 선택"
                    : "비디오 파일 선택"}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                MP4, MOV, AVI 등 지원 {isWeb ? "• 최대 1000MB" : ""}
              </Text>
            </View>
          </TouchableOpacity>
          {errors.video_file && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.video_file}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* 생성 버튼 */}
      <View
        className={`bg-white border-t border-gray-200 px-4 py-4 ${isWeb ? "sticky bottom-0" : ""
          }`}
      >
        <TouchableOpacity
          className={`rounded-xl py-4 items-center justify-center ${isLoading ? "bg-gray-300" : "bg-blue-600"
            } ${isWeb && !isLoading
              ? "hover:bg-blue-700 transition-colors cursor-pointer"
              : ""
            }`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <View className="flex-row items-center">
            {isLoading && (
              <View
                className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 ${isWeb ? "animate-spin" : ""
                  }`}
              />
            )}
            <Text className="text-white text-base font-semibold">
              {isLoading ? "생성 중..." : "비디오 생성"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
