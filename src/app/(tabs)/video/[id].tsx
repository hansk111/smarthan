import {
  useDeleteVideoMutation,
  useGetVideoByIdQuery,
  useUpdateVideoThumbnailMutation,
} from "@/store/video/VideoApiSlice";
import { showConfirmAlert, showErrorAlert } from "@/utils/alertUtils";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// 타입 정의
interface FileDataType {
  uri: string;
  name: string;
  type: string;
  fileSize?: number;
  width?: number;
  height?: number;
  source?: string;
  timestamp?: number;
}

export default function VideoScreen() {
  const { id } = useLocalSearchParams();
  const stringId = id as string;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [thumbnailsurl, setThumbnailsurl] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Blob[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    null
  );

  const [nativethumbnails, setNativethumbnails] = useState([]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const fileInputRef = useRef(null);

  const videoId = Array.isArray(id) ? id[0] : id;
  const { data: video, error, isLoading } = useGetVideoByIdQuery(videoId);
  const [deleteVideo] = useDeleteVideoMutation();
  const [updateVideoThumbnail] = useUpdateVideoThumbnailMutation();

  const videoSource = video?.video_file.replace("http://", "https://");
  const thumbnailSource = video?.thumbnail.replace("http://", "https://");
  const [loading, setLoading] = useState(false);

  const [frameNumber, setFrameNumber] = useState<string>("6");

  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setImageUri(thumbnailSource);
  }, [thumbnailSource]);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.currentTime = 1;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // 로딩 화면
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-200 p-5">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-500 text-center font-medium">
          비디오를 불러오는 중...
        </Text>
      </View>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-200 p-5">
        <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
        <Text className="mt-4 text-red-500 text-center font-medium">
          비디오를 불러올 수 없습니다: {error.message || "알 수 없는 오류"}
        </Text>
        <TouchableOpacity
          className="mt-5 bg-blue-500 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white text-16 font-bold">뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 비디오 없음
  if (!video) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-200 p-5">
        <MaterialIcons name="video-library" size={64} color="#8E8E93" />
        <Text className="mt-3 text-gray-500 font-medium">
          비디오를 찾을 수 없습니다.
        </Text>
        <TouchableOpacity
          className="mt-5 bg-blue-500 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white text-16 font-bold">뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const generateThumbnailWeb = (
    videoFile: any,
    timeInSeconds = 1
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.currentTime = timeInSeconds;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(resolve, "image/jpeg", 0.8);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = reject;
      // video.src = videoSource;
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const generateThumbnailNative = async (
    videoSource: string,
    setImageUri: any,
    setThumbnailFile: any,
    time = 5
  ) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        videoSource,
        // "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        // "https://smarthan.site/media/videos/20250813_200735_724.mp4",
        {
          time: 1500,
          quality: 0.1,
          headers: {
            "User-Agent": "Mozilla/5.0 (Mobile)",
            Accept: "video/*",
            Range: "bytes=0-1024000",
          },
        }
      );

      console.log("uri===========", uri);

      setImageUri(uri);
      const filename = `thumbnail-${Date.now()}.jpg`;
      const file: FileDataType = {
        uri: uri,
        name: filename,
        type: "image/jpeg",
        source: "video-thumbnail",
        timestamp: Date.now(),
      };

      setThumbnailFile(file);
      return { success: true, uri };
    } catch (error) {
      console.error("Native - Thumbnail generation failed:", error);
      throw error;
    }
  };

  // 비디오 URL에서 파일 객체로 변환
  const fetchVideoFromUrl = async (url: string): Promise<void> => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `네트워크 요청이 실패했습니다. Status: ${response.status}`
        );
      }

      const blob = await response.blob();
      console.log("Downloaded blob:", blob);

      const blobUrl = URL.createObjectURL(blob);
      console.log("Blob URL:", blobUrl);

      const videoFile: any = new File([blob], "my_video.mp4", {
        type: "video/mp4",
      });
      setSelectedVideo(videoFile);
    } catch (error) {
      console.error("파일 다운로드 중 오류 발생:", error);
      throw error;
    }
  };

  // 웹 환경에서 썸네일 생성
  const generateWebThumbnail = async (): Promise<void> => {
    if (!selectedVideo) {
      throw new Error("선택된 비디오가 없습니다.");
    }

    console.log("selectedVideo", selectedVideo);
    const timevalue: number = parseInt(frameNumber);
    const thumbnailBlob: Blob = await generateThumbnailWeb(
      selectedVideo,
      timevalue
    );
    console.log("thumbnailBlob type", thumbnailBlob.type);

    const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
    setImageUri(thumbnailUrl);

    const filename = `thumbnail-${Date.now()}.jpg`;
    const file = new File([thumbnailBlob], filename, {
      type: thumbnailBlob.type || "image/jpeg",
    });

    setThumbnailFile(file);
  };

  // 네이티브 환경에서 썸네일 생성
  // const generateNativeThumbnail = async (): Promise<void> => {
  //   // videoSource(URL)를 직접 사용 - fetch 불필요
  //   const source = videoSource || (selectedVideo as File)?.name;
  //   console.log("videoSource", videoSource);
  //   if (!source) {
  //     throw new Error("비디오 소스가 없습니다.");
  //   }

  //   await generateThumbnailNative(source, setImageUri, setThumbnailFile, 1.5);
  // };
  const generateNativeThumbnail = async () => {
    player.play();
    await new Promise((resolve) => setTimeout(resolve, 4000));
    player.pause();
    const times = [3, 4, 5]; // 썸네일 생성 시간 (초)

    const threenativethumbnails = await player.generateThumbnailsAsync(
      times, // 썸네일을 생성할 시간(초 단위)
      {
        maxWidth: 320, // 썸네일 너비
        maxHeight: 180, // 썸네일 높이
      }
    );
    setNativethumbnails(threenativethumbnails);
    console.log("thumbnails[]====", threenativethumbnails);
  };

  // 에러 처리
  const handleThumbnailError = (error: unknown): void => {
    console.error("썸네일 생성 중 오류 발생:", error);

    let errorMessage = "썸네일 생성에 실패했습니다.";

    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }

    Alert.alert("오류", errorMessage);
  };

  const generateThumbnail = async () => {
    console.log("videoSource", videoSource);
    console.log("selectedVideo", selectedVideo);

    // 초기 검증
    if (!videoSource) {
      console.log("비디오 소스가 없습니다.");
      return;
    }

    setIsGenerating(true);

    try {
      if (Platform.OS === "web") {
        // 웹에서는 File 객체가 필요하므로 URL인 경우 fetch 필요
        if (videoSource && typeof videoSource === "string") {
          await fetchVideoFromUrl(videoSource);
          console.log("selectedVideo=======", selectedVideo);
        }
        await generateWebThumbnail();
      } else {
        // 네이티브에서는 URL을 직접 사용
        await generateNativeThumbnail();
      }
    } catch (error) {
      handleThumbnailError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 비디오 파일 선택 해서 2초후의 영상을 썸네일로 만든다다
  const selectVideoFile = () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      console.log(fileInputRef.current);
    } else {
      Alert.alert("알림", "이 기능은 웹 환경에서만 지원됩니다.");
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedVideo(file);
      setImageUri(null);
    } else {
      Alert.alert("오류", "비디오 파일을 선택해주세요.");
    }
  };

  const createThumbnailfromVideoFile2secWeb = (
    videoFile: any,
    timeInSeconds = 1
  ) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.currentTime = timeInSeconds;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(resolve, "image/jpeg", 0.8);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const createThumbnailsFromVideoFileWeb = (
    videoFile: File,
    timesInSeconds: number[] = [3, 6, 9]
  ): Promise<Blob[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const thumbnails: Blob[] = [];

      video.preload = "metadata";
      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const captureThumbnail = (time: number): Promise<Blob> => {
          return new Promise((res, rej) => {
            video.currentTime = time;

            video.onseeked = () => {
              try {
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                  (blob) => {
                    if (blob) res(blob);
                    else rej(new Error("Failed to create thumbnail"));
                  },
                  "image/jpeg",
                  0.8
                );
              } catch (err) {
                rej(err);
              }
            };
          });
        };

        try {
          for (const time of timesInSeconds) {
            const thumb = await captureThumbnail(time);
            console.log("thumb_time", time);
            thumbnails.push(thumb);
          }
          resolve(thumbnails);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = reject;
    });
  };

  const handleFileChange = async () => {
    const timevalue: number = parseInt(frameNumber);
    const blobs = await createThumbnailsFromVideoFileWeb(selectedVideo, [
      timevalue,
      timevalue * 2,
      timevalue * 3,
    ]);
    setThumbnails(blobs);
    setSelectedThumbnail(null);
    const urls = blobs.map((blob) => URL.createObjectURL(blob));
    setThumbnailsurl(urls);
  };

  const handleThumbnailClick = (blob: Blob) => {
    console.log("blob", blob);
    setSelectedThumbnail(URL.createObjectURL(blob));

    const filename = `thumbnail-${Date.now()}.jpg`;
    const file = new File([blob], filename, {
      type: blob.type || "image/jpeg",
    });

    setImageUri(selectedThumbnail);
    setThumbnailFile(file);
  };

  const createThumbnailfromVideoFile2secNative = async () => {
    console.log("manualGenerateThumbnailNative function constructing...");
  };

  const createThumbnailfromVideoFile2sec = async () => {
    console.log("selectedVideo", selectedVideo);
    if (!selectedVideo) {
      Alert.alert("알림", "먼저 비디오 파일을 선택해주세요.");
      return;
    }

    setLoading(true);

    if (Platform.OS === "web") {
      try {
        const timevalue: number = parseInt(frameNumber);
        const thumbnailBlob = await createThumbnailfromVideoFile2secWeb(
          selectedVideo,
          timevalue
        ); // 2초 지점에서 썸네일 생성
        const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
        setImageUri(thumbnailUrl);
        const filename = `thumbnail-${Date.now()}.jpg`;
        const file = new File([thumbnailBlob], filename, {
          type: "image/jpeg",
        });
        setThumbnailFile(file);
      } catch (error) {
        console.error("썸네일 생성 실패:", error);
        Alert.alert("오류", "썸네일 생성에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    } else {
      await createThumbnailfromVideoFile2secNative();
    }
  };

  const loadThumbnailWeb = async () => {
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
          const filename = asset.fileName || `thumbnail_${Date.now()}.jpg`;
          const file = new File([blob], filename, {
            type: asset.type || "image/jpeg",
          });
          setThumbnailFile(file);
        } catch (error) {
          Alert.alert("오류", "파일을 준비하는 데 실패했습니다.");
        }
      }
    } catch (error) {
      Alert.alert("오류", "이미지를 선택하는 데 실패했습니다.");
    }
  };

  const loadThumbnailNative = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "썸네일을 선택하려면 미디어 라이브러리 접근 권한이 필요합니다."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        // 네이티브에서도 업로드 가능한 형태로 변환
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `thumbnail_${Date.now()}.jpg`,
          type: asset.type?.startsWith("image/") ? asset.type : "image/jpeg",
        };

        setThumbnailFile(fileData);
      }
    } catch (error) {
      console.error("Thumbnail loading error:", error);
      Alert.alert("오류", "이미지를 선택하는 데 실패했습니다.");
    }
  };

  const loadThumbnail = () => {
    if (Platform.OS === "web") {
      return loadThumbnailWeb();
    } else {
      return loadThumbnailNative();
    }
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile || !stringId) return;

    setIsUploading(true);

    console.log("Uploading thumbnail:", thumbnailFile);
    console.log("Video ID:", stringId);

    try {
      // 플랫폼별로 다른 형태의 데이터 전달
      const thumbnailData =
        Platform.OS === "web"
          ? thumbnailFile // 웹: File 객체
          : {
              // 네이티브: 메타데이터 객체
              uri: thumbnailFile.uri,
              name: thumbnailFile.name,
              type: thumbnailFile.type,
            };

      await updateVideoThumbnail({
        id: stringId,
        thumbnail: thumbnailData,
      }).unwrap();

      Alert.alert("성공", "썸네일이 성공적으로 업데이트되었습니다!");
      setThumbnailFile(null);
      setImageUri(null);
    } catch (err) {
      Alert.alert("오류", `썸네일 업로드에 실패했습니다.\n\n에러: ${err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = () => {
    showConfirmAlert({
      title: "비디오를 삭제하시겠습니까?",
      message: "이 작업은 되돌릴 수 없습니다.",
      onConfirm: () => {
        deleteVideo(stringId)
          .unwrap()
          .then(() => {
            router.push("/video");
          })
          .catch((response) => {
            showErrorAlert("비디오 삭제에 실패했습니다.");
          });
      },
    });
  };

  const onPlayMediaPressed = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View className="flex-1 bg-gray-200">
      <LinearGradient colors={["#667eea", "#764ba2"]} className="pt-2 pb-2">
        <View className="flex-row items-center justify-center">
          <Text className="text-2xl font-bold text-white">
            영상 보기(썸네일수정, 삭제등)
          </Text>
        </View>
      </LinearGradient>
      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-gray-300">
        <View className="flex-1">
          {video?.type && (
            <View className="bg-blue-500 px-3 py-1.5 rounded-full self-start">
              <Text className="text-white text-sm font-bold uppercase">
                {video.type}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          className="p-1"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <AntDesign name="closecircle" size={28} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 비디오 플레이어 */}
        <View className="relative bg-black mb-0">
          {videoSource ? (
            <VideoView
              // className={`w-full h-${(screenWidth * 9) / 16}`}
              style={styles.videoView}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls={true}
              crossOrigin="anonymous"
            />
          ) : (
            <View className="w-full h-${(screenWidth * 9) / 16} justify-center items-center bg-gray-400">
              <MaterialIcons name="video-library" size={48} color="#8E8E93" />
              <Text className="mt-3 text-gray-500 font-medium">
                비디오 파일이 없습니다.
              </Text>
            </View>
          )}

          {/* 플레이 컨트롤 오버레이 */}
          <View className="absolute inset-0 flex justify-center items-center">
            <TouchableOpacity
              className="bg-opacity-60 bg-black rounded-full w-15 h-15 justify-center items-center"
              onPress={onPlayMediaPressed}
              activeOpacity={0.8}
            >
              <FontAwesome
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 비디오 정보 */}
        <View className="bg-white p-5 border-b border-gray-300">
          {video?.title && (
            <Text className="text-3xl font-bold text-gray-800 mb-4 leading-8">
              {video.title}
            </Text>
          )}

          <TouchableOpacity
            className={`flex-row items-center justify-center py-4 px-5 rounded-lg gap-2 bg-blue-600 text-white font-medium ${
              isPlaying ? "bg-orange-400" : "bg-green-500"
            }`}
            onPress={onPlayMediaPressed}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#FFFFFF"
            />
            <Text className="text-white text-16 font-bold">
              {isPlaying ? "일시정지" : "재생"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 설명 */}
        {video?.description && (
          <View className="bg-white p-5 mb-3">
            <Text className="text-2xl font-bold text-gray-700 mb-2">설명</Text>
            <Text className="text-base text-gray-800 leading-6">
              {video.description}
            </Text>
          </View>
        )}

        {/* 썸네일 섹션 */}
        <View className="bg-white p-5 mb-3">
          <Text className="text-2xl font-bold text-gray-700 mb-4">
            썸네일 관리
          </Text>

          {/* 썸네일 미리보기 */}
          {imageUri && (
            <View className="items-center mb-5">
              <Image
                className="rounded-lg bg-gray-200"
                style={{
                  width: screenWidth - 80,
                  height: ((screenWidth - 80) * 9) / 16,
                }}
                source={{ uri: imageUri }}
              />
            </View>
          )}

          {/* 썸네일 버튼들 */}
          <View className="flex-row gap-x-3 mb-4">
            {/* 자동 생성 버튼 */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 px-4 bg-gray-200 rounded-lg gap-2 ${
                isGenerating && "opacity-50"
              }`}
              onPress={generateThumbnail}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <MaterialIcons name="auto-awesome" size={20} color="#007AFF" />
              )}
              <Text className="text-blue-500 text-xs font-bold">
                {isGenerating ? "생성 중..." : "자동"}
              </Text>
            </TouchableOpacity>
            {/* 수동 생성 버튼 */}
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 px-4 bg-gray-200 rounded-lg gap-2"
              onPress={() => router.push("/video/thumbnailtest")}
              activeOpacity={0.8}
            >
              <MaterialIcons name="video-library" size={20} color="#007AFF" />
              <Text className="text-blue-500 text-xs font-bold">수동</Text>
            </TouchableOpacity>
            {/* 갤러리에서 선택 버튼 */}
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 px-4 bg-gray-200 rounded-lg gap-2"
              onPress={loadThumbnail}
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-library" size={20} color="#007AFF" />
              <Text className="text-blue-500 text-xs font-bold">PHOTO</Text>
            </TouchableOpacity>
            {/* 비디오파일에서 2초 생성 버튼 */}
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 px-4 bg-gray-200 rounded-lg gap-2"
              onPress={selectVideoFile}
              activeOpacity={0.8}
            >
              <MaterialIcons name="movie-creation" size={20} color="#007AFF" />
              <Text className="text-blue-500 text-xs font-bold">MP4</Text>
            </TouchableOpacity>
            {Platform.OS === "web" && (
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            )}
          </View>
          <View className="mt-8 p-6 bg-blue-100 rounded-lg border border-blue-200">
            <TextInput
              className="text-sm text-gray-500 text-center mt-2"
              onChangeText={setFrameNumber}
              value={frameNumber}
              keyboardType="numeric"
              placeholder="초입력"
            />
          </View>
          {thumbnails && (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              className="flex gap- mt-4"
            >
              {thumbnails.map((blob, index) => {
                const url = URL.createObjectURL(blob);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleThumbnailClick(blob)}
                  >
                    <Image
                      className="rounded-lg bg-gray-200 mr-2"
                      source={{ uri: url }}
                      style={{
                        width: (screenWidth - 80) / 3,
                        height: ((screenWidth - 80) * 9) / (16 * 3),
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {/* {nativethumbnails && (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              className="flex gap- mt-4"
            >
            {nativethumbnails.map((thumb, index) => (
              <Image
                className="rounded-lg bg-gray-200 mr-2"
                source={thumb}
                style={{
                  width: (screenWidth - 80) / 3,
                  height: ((screenWidth - 80) * 9) / (16 * 3),
                }}
              />            
            </ScrollView>
          )} */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            className="flex gap- mt-4"
          >
            <View className="flex-row gap-4">
              {nativethumbnails.map((thumb, index) => (
                <View key={index} className="">
                  <Image
                    className="rounded-lg bg-gray-200 mr-2"
                    source={thumb}
                    style={{
                      width: (screenWidth - 80) / 3,
                      height: ((screenWidth - 80) * 9) / (16 * 3),
                    }}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {selectedVideo && (
            <>
              <View className="bg-white p-4 rounded-lg my-4 w-full max-w-[400px]">
                <Text className="text-sm text-gray-600 mb-1.5">
                  선택된 파일: {selectedVideo.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-1.5">
                  크기: {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center py-3 px-4 bg-gray-200 rounded-lg gap-2"
                onPress={handleFileChange}
                activeOpacity={0.8}
              >
                <MaterialIcons name="photo-library" size={20} color="#007AFF" />
                <Text className="text-blue-500 text-xs font-bold">
                  썸네일 3개 생성
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* 업로드 버튼 */}
          {thumbnailFile && (
            <TouchableOpacity
              className={`flex-row items-center justify-center py-4 px-5 bg-blue-600 rounded-lg gap-2 ${
                isUploading && "opacity-50"
              }`}
              onPress={uploadThumbnail}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="cloud-upload" size={20} color="#FFFFFF" />
              )}
              <Text className="text-white text-base font-medium">
                {isUploading ? "업로드 중..." : "썸네일 업데이트"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 삭제 버튼 */}
        <View className="bg-white p-5 mb-5">
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 px-5 bg-red-500 rounded-lg gap-2"
            onPress={handleDeleteVideo}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete-forever" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-medium">
              비디오 삭제
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  videoView: {
    width: screenWidth,
    height: (screenWidth * 9) / 16, // 16:9 비율
  },
});
