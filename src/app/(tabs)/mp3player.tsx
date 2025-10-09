import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { addMp3File, setMp3Files } from "@/store/mp3player/mp3Slice";
import type { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";

interface MP3File {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function App() {
  const dispatch = useDispatch();
  const { mp3Files } = useSelector((state: RootState) => state.mp3);

  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<number>(-1);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1.0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // useRef를 사용하여 상태 참조 관리
  const currentTrackRef = useRef(currentTrack);
  const isPlayerReadyRef = useRef(isPlayerReady);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleEnabledRef = useRef(isShuffleEnabled);
  const shuffleQueueRef = useRef(shuffleQueue);
  const shuffleIndexRef = useRef(shuffleIndex);
  const mp3FilesRef = useRef(mp3Files);

  // Expo Audio 플레이어 초기화
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  // ref 업데이트
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayerReadyRef.current = isPlayerReady;
  }, [isPlayerReady]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    isShuffleEnabledRef.current = isShuffleEnabled;
  }, [isShuffleEnabled]);

  useEffect(() => {
    shuffleQueueRef.current = shuffleQueue;
  }, [shuffleQueue]);

  useEffect(() => {
    shuffleIndexRef.current = shuffleIndex;
  }, [shuffleIndex]);

  useEffect(() => {
    mp3FilesRef.current = mp3Files;
  }, [mp3Files]);

  // 볼륨 변경 핸들러
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      try {
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
          setIsMuted(false);
        }
      } catch (error) {
        console.error("Error changing volume:", error);
      }
    },
    [isMuted]
  );

  // 음소거 토글
  const toggleMute = useCallback(() => {
    try {
      if (isMuted) {
        setIsMuted(false);
        setVolume(previousVolume);
      } else {
        setPreviousVolume(volume);
        setIsMuted(true);
        setVolume(0);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  }, [isMuted, volume, previousVolume]);

  // 앱 상태 변경 감지
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // 백그라운드로 갈 때 플레이어 상태 저장
        console.log("App going to background");
      } else if (nextAppState === "active") {
        // 포그라운드로 돌아올 때 플레이어 상태 확인
        console.log("App coming to foreground");
        setIsPlayerReady(true);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Expo Audio 플레이어 모드 설정
    const initializeAudio = async () => {
      try {
        await setAudioModeAsync({
          shouldPlayInBackground: true,
          interruptionModeAndroid: "doNotMix",
        });
        setIsPlayerReady(true);
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    };

    initializeAudio();
  }, []);

  // 셔플 큐 생성 함수
  const generateShuffleQueue = useCallback(
    (files: MP3File[], currentIndex: number = -1) => {
      if (files.length === 0) return [];

      const indices = Array.from({ length: files.length }, (_, i) => i);

      if (currentIndex !== -1) {
        const filteredIndices = indices.filter((i) => i !== currentIndex);
        for (let i = filteredIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [filteredIndices[i], filteredIndices[j]] = [
            filteredIndices[j],
            filteredIndices[i],
          ];
        }
        return [currentIndex, ...filteredIndices];
      } else {
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
      }
    },
    []
  );

  // 셔플 토글 함수
  const toggleShuffle = useCallback(() => {
    const newShuffleState = !isShuffleEnabled;
    setIsShuffleEnabled(newShuffleState);

    if (newShuffleState && mp3Files.length > 0) {
      const newQueue = generateShuffleQueue(mp3Files, currentTrack);
      setShuffleQueue(newQueue);

      if (currentTrack !== -1) {
        const currentShuffleIndex = newQueue.findIndex(
          (index) => index === currentTrack
        );
        setShuffleIndex(currentShuffleIndex);
      }
    } else {
      setShuffleQueue([]);
      setShuffleIndex(-1);
    }
  }, [isShuffleEnabled, mp3Files, currentTrack, generateShuffleQueue]);

  // 반복 모드 토글 함수
  const toggleRepeatMode = useCallback(() => {
    const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  }, [repeatMode]);

  // 반복 모드에 따른 아이콘과 색상 결정
  const getRepeatButtonProps = useCallback(() => {
    switch (repeatMode) {
      case "one":
        return {
          icon: "repeat" as const,
          color: "#3B82F6",
          backgroundColor: "#EBF4FF",
          showBadge: true,
        };
      case "all":
        return {
          icon: "repeat" as const,
          color: "#3B82F6",
          backgroundColor: "#EBF4FF",
          showBadge: false,
        };
      default:
        return {
          icon: "repeat" as const,
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          showBadge: false,
        };
    }
  }, [repeatMode]);

  // 다음 트랙 인덱스 계산
  const getNextTrackIndex = useCallback(() => {
    if (isShuffleEnabledRef.current && shuffleQueueRef.current.length > 0) {
      const nextShuffleIndex = shuffleIndexRef.current + 1;
      if (nextShuffleIndex < shuffleQueueRef.current.length) {
        return shuffleQueueRef.current[nextShuffleIndex];
      }
      return -1;
    } else {
      if (currentTrackRef.current < mp3FilesRef.current.length - 1) {
        return currentTrackRef.current + 1;
      }
      return -1;
    }
  }, []);

  // 이전 트랙 인덱스 계산
  const getPreviousTrackIndex = useCallback(() => {
    if (isShuffleEnabledRef.current && shuffleQueueRef.current.length > 0) {
      const prevShuffleIndex = shuffleIndexRef.current - 1;
      if (prevShuffleIndex >= 0) {
        return shuffleQueueRef.current[prevShuffleIndex];
      }
      return -1;
    } else {
      if (currentTrackRef.current > 0) {
        return currentTrackRef.current - 1;
      }
      return -1;
    }
  }, []);

  // 곡 종료 처리
  useEffect(() => {
    if (status.didJustFinish && isPlayerReady) {
      const handleTrackEnd = async () => {
        try {
          if (repeatModeRef.current === "one") {
            await player.seekTo(0);
            await player.play();
          } else {
            const nextIndex = getNextTrackIndex();
            if (nextIndex !== -1) {
              await loadAndPlaySound(
                mp3FilesRef.current[nextIndex].uri,
                nextIndex
              );
            } else if (repeatModeRef.current === "all") {
              if (
                isShuffleEnabledRef.current &&
                shuffleQueueRef.current.length > 0
              ) {
                const newQueue = generateShuffleQueue(mp3FilesRef.current);
                setShuffleQueue(newQueue);
                setShuffleIndex(0);
                await loadAndPlaySound(
                  mp3FilesRef.current[newQueue[0]].uri,
                  newQueue[0]
                );
              } else {
                await loadAndPlaySound(mp3FilesRef.current[0].uri, 0);
              }
            }
          }
        } catch (error) {
          console.error("Error handling track end:", error);
        }
      };

      handleTrackEnd();
    }
  }, [status.didJustFinish, isPlayerReady]);

  // mp3Files가 변경될 때 셔플 큐 업데이트
  useEffect(() => {
    if (isShuffleEnabled && mp3Files.length > 0) {
      const newQueue = generateShuffleQueue(mp3Files, currentTrack);
      setShuffleQueue(newQueue);

      if (currentTrack !== -1) {
        const currentShuffleIndex = newQueue.findIndex(
          (index) => index === currentTrack
        );
        setShuffleIndex(currentShuffleIndex);
      }
    }
  }, [mp3Files.length, isShuffleEnabled, currentTrack, generateShuffleQueue]);

  const selectMP3Files = async () => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg",
        multiple: true,
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets) {
        const selectedFiles: MP3File[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || "audio/mpeg",
        }));

        dispatch(addMp3File(selectedFiles));
      }
    } catch (error) {
      Alert.alert("파일선택오류", error.message || "파일선택오류");
      console.error("Error selecting MP3 files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAndPlaySound = async (uri: string, index: number) => {
    try {
      if (!isPlayerReady) {
        console.log("Player not ready");
        return;
      }

      console.log("Loading track:", index, uri);

      // 현재 재생 중인 트랙이 있으면 정지
      if (status.playing) {
        await player.pause();
      }

      // 새로운 트랙 로드
      await player.replace({ uri });

      // 재생 시작
      await player.play();

      setCurrentTrack(index);
      setIsPlayerVisible(true);

      // 셔플이 활성화되어 있고 직접 트랙을 선택한 경우
      if (isShuffleEnabled && shuffleQueue.length > 0) {
        const shuffleIdx = shuffleQueue.findIndex((idx) => idx === index);
        if (shuffleIdx !== -1) {
          setShuffleIndex(shuffleIdx);
        } else {
          const newQueue = generateShuffleQueue(mp3Files, index);
          setShuffleQueue(newQueue);
          setShuffleIndex(0);
        }
      }
    } catch (error) {
      Alert.alert("재생오류", error.message || "재생오류");
      console.error("Error loading sound:", error);
    }
  };

  const togglePlayPause = useCallback(async () => {
    try {
      if (!isPlayerReady) return;

      if (status.playing) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  }, [status.playing, isPlayerReady, player]);

  const playNextTrack = useCallback(async () => {
    try {
      const nextIndex = getNextTrackIndex();
      if (nextIndex !== -1) {
        await loadAndPlaySound(mp3Files[nextIndex].uri, nextIndex);

        if (isShuffleEnabled) {
          setShuffleIndex(shuffleIndex + 1);
        }
      } else if (repeatMode === "all") {
        if (isShuffleEnabled && shuffleQueue.length > 0) {
          const newQueue = generateShuffleQueue(mp3Files);
          setShuffleQueue(newQueue);
          setShuffleIndex(0);
          await loadAndPlaySound(mp3Files[newQueue[0]].uri, newQueue[0]);
        } else {
          await loadAndPlaySound(mp3Files[0].uri, 0);
        }
      }
    } catch (error) {
      console.error("Error playing next track:", error);
    }
  }, [
    getNextTrackIndex,
    mp3Files,
    isShuffleEnabled,
    shuffleIndex,
    repeatMode,
    shuffleQueue,
    generateShuffleQueue,
  ]);

  const playPreviousTrack = useCallback(async () => {
    try {
      const prevIndex = getPreviousTrackIndex();
      if (prevIndex !== -1) {
        await loadAndPlaySound(mp3Files[prevIndex].uri, prevIndex);

        if (isShuffleEnabled) {
          setShuffleIndex(shuffleIndex - 1);
        }
      } else if (repeatMode === "all") {
        if (isShuffleEnabled && shuffleQueue.length > 0) {
          const lastIndex = shuffleQueue.length - 1;
          setShuffleIndex(lastIndex);
          await loadAndPlaySound(
            mp3Files[shuffleQueue[lastIndex]].uri,
            shuffleQueue[lastIndex]
          );
        } else {
          const lastTrack = mp3Files.length - 1;
          await loadAndPlaySound(mp3Files[lastTrack].uri, lastTrack);
        }
      }
    } catch (error) {
      console.error("Error playing previous track:", error);
    }
  }, [
    getPreviousTrackIndex,
    mp3Files,
    isShuffleEnabled,
    shuffleIndex,
    repeatMode,
    shuffleQueue,
  ]);

  const seekTo = useCallback(
    async (value: number) => {
      try {
        if (status.isLoaded && status.duration > 0) {
          const position = value * status.duration;
          await player.seekTo(position);
        }
      } catch (error) {
        console.error("Error seeking:", error);
      }
    },
    [status.isLoaded, status.duration, player]
  );

  const stopPlayer = useCallback(() => {
    try {
      player.pause();
      setCurrentTrack(-1);
      setIsPlayerVisible(false);
      setShuffleIndex(-1);
    } catch (error) {
      console.error("Error stopping player:", error);
    }
  }, [player]);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const removeFile = useCallback(
    (uri: string) => {
      const fileIndex = mp3Files.findIndex((file) => file.uri === uri);

      if (fileIndex === currentTrack) {
        stopPlayer();
      }

      dispatch(setMp3Files(mp3Files.filter((file) => file.uri !== uri)));

      if (fileIndex < currentTrack) {
        setCurrentTrack(currentTrack - 1);
      }
    },
    [mp3Files, currentTrack, stopPlayer, dispatch]
  );

  const clearAllFiles = useCallback(() => {
    Alert.alert("확인", "모든 파일을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: () => {
          stopPlayer();
          dispatch(setMp3Files([]));
          setShuffleQueue([]);
          setShuffleIndex(-1);
          setRepeatMode("none");
        },
      },
    ]);
  }, [stopPlayer, dispatch]);

  const changePlaybackRate = useCallback(
    async (rate: number) => {
      try {
        await player.setPlaybackRate(rate);
        setPlaybackRate(rate);
      } catch (error) {
        console.error("Error changing playback rate:", error);
      }
    },
    [player]
  );

  // 다음/이전 트랙 버튼 활성화 상태 확인
  const isNextDisabled = useCallback(() => {
    if (repeatMode === "one" || repeatMode === "all") {
      return false;
    }

    if (isShuffleEnabled) {
      return shuffleIndex >= shuffleQueue.length - 1;
    }
    return currentTrack >= mp3Files.length - 1;
  }, [
    repeatMode,
    isShuffleEnabled,
    shuffleIndex,
    shuffleQueue.length,
    currentTrack,
    mp3Files.length,
  ]);

  const isPreviousDisabled = useCallback(() => {
    if (repeatMode === "one" || repeatMode === "all") {
      return false;
    }

    if (isShuffleEnabled) {
      return shuffleIndex <= 0;
    }
    return currentTrack <= 0;
  }, [repeatMode, isShuffleEnabled, shuffleIndex, currentTrack]);

  const renderMP3Item = useCallback(
    ({ item, index }: { item: MP3File; index: number }) => (
      <TouchableOpacity
        onPress={() => loadAndPlaySound(item.uri, index)}
        className={`mx-4 mb-3 p-4 rounded-lg shadow-sm border ${currentTrack === index
            ? "bg-blue-50 border-blue-300"
            : "bg-white border-gray-200"
          }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <View
                className={`p-2 rounded-full ${currentTrack === index ? "bg-blue-500" : "bg-gray-200"
                  }`}
              >
                <Ionicons
                  name={
                    currentTrack === index && status.playing ? "pause" : "play"
                  }
                  size={16}
                  color={currentTrack === index ? "white" : "#6B7280"}
                />
              </View>
              <Text
                className={`font-medium text-base ml-3 flex-1 ${currentTrack === index ? "text-blue-800" : "text-gray-800"
                  }`}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </View>
            <View className="flex-row items-center ml-10">
              <Ionicons name="document" size={14} color="#6B7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {formatFileSize(item.size)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => removeFile(item.uri)}
            className="bg-red-100 p-2 rounded-full"
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [currentTrack, status.playing, formatFileSize, removeFile]
  );

  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 justify-center items-center px-8">
        <Ionicons name="musical-notes-outline" size={80} color="#D1D5DB" />
        <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">
          선택된 MP3 파일이 없습니다
        </Text>
        <Text className="text-gray-400 text-center">
          아래 버튼을 눌러 MP3 파일을 선택해보세요
        </Text>
      </View>
    ),
    []
  );

  const renderMusicPlayer = useCallback(() => {
    if (!isPlayerVisible || currentTrack === -1) return null;

    const currentFile = mp3Files[currentTrack];
    const progress =
      status.duration > 0 ? status.currentTime / status.duration : 0;

    // 플레이리스트 정보 표시
    const getPlaylistInfo = () => {
      let info = "";
      if (isShuffleEnabled && shuffleQueue.length > 0) {
        info = `${shuffleIndex + 1} / ${shuffleQueue.length} (셔플)`;
      } else {
        info = `${currentTrack + 1} / ${mp3Files.length}`;
      }

      // 반복 모드 정보 추가
      if (repeatMode === "one") {
        info += " • 단일 반복";
      } else if (repeatMode === "all") {
        info += " • 전체 반복";
      }

      return info;
    };

    return (
      <View className="bg-primary-50 border-t border-gray-200 px-4 py-4">
        {/* 현재 재생 중인 곡 정보 */}
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-blue-500 rounded-lg items-center justify-center">
            <Ionicons name="musical-notes" size={24} color="white" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-gray-900 font-medium" numberOfLines={1}>
              {currentFile?.name}
            </Text>
            <Text className="text-gray-500 text-sm">{getPlaylistInfo()}</Text>
          </View>
          <TouchableOpacity onPress={stopPlayer} className="p-2">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 프로그레스 바 */}
        <View className="mb-4">
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onSlidingComplete={seekTo}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#3B82F6"
          />
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">
              {formatTime(status.currentTime)}
            </Text>
            <Text className="text-gray-500 text-sm">
              {formatTime(status.duration)}
            </Text>
          </View>
        </View>

        {/* 볼륨 컨트롤 */}
        <View className="mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleMute} className="p-2 mr-2">
              <Ionicons
                name={
                  isMuted
                    ? "volume-mute"
                    : volume > 0.6
                      ? "volume-high"
                      : volume > 0.3
                        ? "volume-medium"
                        : "volume-low"
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Slider
                style={{ width: "100%", height: 30 }}
                minimumValue={0}
                maximumValue={1}
                value={isMuted ? 0 : volume}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#3B82F6"
              />
            </View>
            <Text className="text-gray-500 text-xs ml-2 w-8">
              {Math.round((isMuted ? 0 : volume) * 100)}
            </Text>
          </View>
        </View>

        {/* 재생 상태 표시 */}
        {status.isBuffering && (
          <View className="flex-row items-center justify-center mb-2">
            <Ionicons name="hourglass" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-2">버퍼링 중...</Text>
          </View>
        )}

        {/* 셔플 버튼과 컨트롤 버튼 */}
        <View className="flex-row items-center justify-center space-x-6 mb-4">
          {/* 셔플 버튼 */}
          <TouchableOpacity
            onPress={toggleShuffle}
            className={`p-3 rounded-full ${isShuffleEnabled ? "bg-blue-100" : "bg-gray-100"
              }`}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={isShuffleEnabled ? "#3B82F6" : "#6B7280"}
            />
          </TouchableOpacity>

          {/* 이전 곡 */}
          <TouchableOpacity
            onPress={playPreviousTrack}
            disabled={isPreviousDisabled()}
            className={`p-3 ${isPreviousDisabled() ? "opacity-50" : ""}`}
          >
            <Ionicons name="play-skip-back" size={28} color="#3B82F6" />
          </TouchableOpacity>

          {/* 재생/일시정지 */}
          <TouchableOpacity
            onPress={togglePlayPause}
            disabled={!status.isLoaded}
            className={`bg-blue-500 p-4 rounded-full ${!status.isLoaded ? "opacity-50" : ""
              }`}
          >
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          {/* 다음 곡 */}
          <TouchableOpacity
            onPress={playNextTrack}
            disabled={isNextDisabled()}
            className={`p-3 ${isNextDisabled() ? "opacity-50" : ""}`}
          >
            <Ionicons name="play-skip-forward" size={28} color="#3B82F6" />
          </TouchableOpacity>

          {/* 반복 재생 버튼 */}
          <View className="relative">
            <TouchableOpacity
              onPress={toggleRepeatMode}
              className={`p-3 rounded-full`}
              style={{
                backgroundColor: getRepeatButtonProps().backgroundColor,
              }}
            >
              <Ionicons
                name={getRepeatButtonProps().icon}
                size={24}
                color={getRepeatButtonProps().color}
              />
            </TouchableOpacity>
            {/* 단일 곡 반복 표시 */}
            {repeatMode === "one" && (
              <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
            )}
          </View>
        </View>

        {/* 재생 속도 컨트롤 */}
        <View className="flex-row items-center justify-center space-x-4">
          <TouchableOpacity
            onPress={() => player.setPlaybackRate(0.8)}
            className="bg-gray-100 px-3 py-1 rounded-full"
          >
            <Text className="text-gray-700 text-sm">0.8x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => player.setPlaybackRate(1.0)}
            className="bg-gray-100 px-3 py-1 rounded-full"
          >
            <Text className="text-gray-700 text-sm">1.0x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => player.setPlaybackRate(1.2)}
            className="bg-gray-100 px-3 py-1 rounded-full"
          >
            <Text className="text-gray-700 text-sm">1.2x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => player.setPlaybackRate(1.5)}
            className="bg-gray-100 px-3 py-1 rounded-full"
          >
            <Text className="text-gray-700 text-sm">1.5x</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [currentTrack, status, formatTime, stopPlayer]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-secondary-200 px-4 py-4 border-b border-secondary-500 ">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-xl font-bold">
              MP3 플레이어
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {mp3Files.length}개의 파일이 선택됨
              {isShuffleEnabled && mp3Files.length > 0 && " • 셔플 활성화"}
              {repeatMode === "one" && " • 단일 반복"}
              {repeatMode === "all" && " • 전체 반복"}
            </Text>
          </View>
          {mp3Files.length > 0 && (
            <TouchableOpacity
              onPress={clearAllFiles}
              className="bg-red-100 px-3 py-2 rounded-lg border border-red-500"
            >
              <Text className="text-red-600 font-medium">전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* File List */}
      <View className="flex-1">
        {isLoading ? (
          // Your loading screen component or indicator goes here
          // For example, a simple Text component or an ActivityIndicator
          <View className="flex-1 justify-center items-center">
            <Text>Loading MP3 files...</Text>
            {/* Or use an ActivityIndicator from 'react-native' */}
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : mp3Files.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={mp3Files}
            renderItem={renderMP3Item}
            keyExtractor={(item) => item.uri}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: isPlayerVisible ? 320 : 100,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Music Player */}
      {renderMusicPlayer()}

      {/* Select Button */}
      {!isPlayerVisible && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <TouchableOpacity
            onPress={selectMP3Files}
            disabled={isLoading}
            className={`flex-row items-center justify-center py-4 rounded-lg ${isLoading ? "bg-blue-300" : "bg-blue-500"
              }`}
          >
            <Ionicons
              name={isLoading ? "hourglass" : "add"}
              size={20}
              color="white"
            />
            <Text className="text-white font-semibold text-lg ml-2">
              {isLoading ? "파일 선택 중..." : "MP3 파일 선택"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}