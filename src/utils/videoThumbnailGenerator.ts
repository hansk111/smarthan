import * as VideoThumbnails from "expo-video-thumbnails";
import { Platform } from "react-native";

interface FileDataType {
  uri: string;
  name: string;
  type: string;
  source: string;
  timestamp: number;
}

interface ThumbnailOptions {
  time?: number;
  quality?: number;
  headers?: Record<string, string>;
}

interface ThumbnailResult {
  success: boolean;
  uri?: string;
  error?: string;
  suggestions?: string[];
}

interface VideoValidationResult {
  isValid: boolean;
  error?: string;
  details?: any;
}

interface MultipleThumbnailOptions {
  quality?: number;
  headers?: Record<string, string>;
}

// 비디오 유효성 검사 함수
export const validateVideoSource = async (
  videoUri: string
): Promise<VideoValidationResult> => {
  try {
    console.log("Validating video source:", videoUri);

    // 기본 URI 형태 검증
    if (!videoUri || typeof videoUri !== "string") {
      return { isValid: false, error: "Invalid URI format" };
    }

    // 빈 문자열 체크
    if (videoUri.trim().length === 0) {
      return { isValid: false, error: "Empty URI provided" };
    }

    // 로컬 파일인지 원격 URL인지 확인
    const isLocalFile = videoUri.startsWith("file://");
    const isRemoteUrl =
      videoUri.startsWith("http://") || videoUri.startsWith("https://");
    const isAssetUri =
      videoUri.startsWith("asset://") || videoUri.startsWith("content://");

    if (!isLocalFile && !isRemoteUrl && !isAssetUri) {
      return {
        isValid: false,
        error:
          "URI must start with file://, http(s)://, asset://, or content://",
        details: { videoUri, isLocalFile, isRemoteUrl, isAssetUri },
      };
    }

    // 지원되는 비디오 확장자 확인 (선택사항)
    const supportedExtensions = [
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".m4v",
      ".3gp",
    ];
    const hasValidExtension = supportedExtensions.some((ext) =>
      videoUri.toLowerCase().includes(ext.toLowerCase())
    );

    // 간단한 썸네일 생성 테스트 (0초 지점에서)
    try {
      const testResult = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0,
        quality: 0.1, // 가장 낮은 품질로 빠른 테스트
      });

      return {
        isValid: true,
        details: {
          videoUri,
          isLocalFile,
          isRemoteUrl,
          isAssetUri,
          hasValidExtension,
          testThumbnailUri: testResult.uri,
          platform: Platform.OS,
        },
      };
    } catch (testError) {
      return {
        isValid: false,
        error: `Video validation failed: ${
          testError instanceof Error ? testError.message : "Unknown error"
        }`,
        details: {
          videoUri,
          isLocalFile,
          isRemoteUrl,
          isAssetUri,
          hasValidExtension,
          testError,
          platform: Platform.OS,
        },
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      details: { error, platform: Platform.OS },
    };
  }
};

// 기본 썸네일 생성 함수
const generateThumbnailNative = async (
  videoSource: string,
  setImageUri: (uri: string | null) => void,
  setThumbnailFile: (file: FileDataType | null) => void,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> => {
  try {
    // 입력 검증
    if (!videoSource || typeof videoSource !== "string") {
      throw new Error("Invalid video source provided");
    }

    // 비디오 소스 URI 형태 확인 및 로깅
    console.log("Video source type:", typeof videoSource);
    console.log("Video source URI:", videoSource);
    console.log("Is local file:", videoSource.startsWith("file://"));
    console.log("Is remote URL:", videoSource.startsWith("http"));
    console.log("Platform:", Platform.OS);

    // 기본 옵션 설정
    const {
      time = 1000, // 1초로 줄여서 시도 (일부 짧은 비디오 대응)
      quality = 0.8, // 품질을 약간 낮춰서 처리 속도 향상
      headers,
    } = options;

    // 시간 값 검증 (음수 방지)
    const validTime = Math.max(0, time);

    console.log(`Generating thumbnail at ${validTime}ms for: ${videoSource}`);

    // 여러 시점에서 시도하는 로직 추가
    const timeAttempts = [validTime, 0, 500, 2000, 5000]; // 원하는 시간, 0초, 0.5초, 2초, 5초
    let lastError: Error | null = null;

    for (const attemptTime of timeAttempts) {
      try {
        console.log(`Attempting thumbnail generation at ${attemptTime}ms`);

        // 썸네일 생성 시도
        const result = await VideoThumbnails.getThumbnailAsync(videoSource, {
          time: attemptTime,
          quality,
          ...(headers && { headers }),
        });

        if (!result.uri) {
          throw new Error(`No URI returned for time ${attemptTime}ms`);
        }

        console.log(
          `Thumbnail generated successfully at ${attemptTime}ms: ${result.uri}`
        );

        // 상태 업데이트
        setImageUri(result.uri);
        console.log("Thumbnail URI set:", result.uri);
        // 파일 객체 생성
        const timestamp = Date.now();
        const filename = `thumbnail-${timestamp}.jpg`;
        const file: FileDataType = {
          uri: result.uri,
          name: filename,
          type: "image/jpeg",
          source: "video-thumbnail",
          timestamp,
        };

        setThumbnailFile(file);

        return { success: true, uri: result.uri };
      } catch (timeError) {
        console.log(`Failed at ${attemptTime}ms:`, timeError);
        lastError =
          timeError instanceof Error ? timeError : new Error(String(timeError));
        continue; // 다음 시간대로 시도
      }
    }

    // 모든 시도가 실패한 경우
    throw lastError || new Error("All thumbnail generation attempts failed");
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      videoSource,
      options,
      platform: Platform.OS,
    });

    // 에러 발생 시 상태 초기화
    setImageUri(null);
    setThumbnailFile(null);

    // 구체적인 에러 진단 및 해결책 제시
    let errorMessage = "Unknown error occurred";
    let suggestions: string[] = [];

    if (error instanceof Error) {
      errorMessage = error.message;

      // 에러 메시지에 따른 해결책 제시
      if (
        errorMessage.includes("Could not generate thumbnail") ||
        errorMessage.includes("Failed to generate thumbnail")
      ) {
        suggestions = [
          "Check if the video file exists and is accessible",
          "Verify the video format is supported (mp4, mov, avi, etc.)",
          "Try with a different time position (0ms)",
          "Check if the video duration is longer than the requested time",
          "Ensure proper permissions for file access",
          "Try with a lower quality setting (0.3-0.5)",
        ];
      } else if (
        errorMessage.includes("No such file") ||
        errorMessage.includes("File not found")
      ) {
        suggestions = [
          "Verify the video file path is correct",
          "Check if the file exists",
          "Ensure the file has not been moved or deleted",
        ];
      } else if (
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("Access denied")
      ) {
        suggestions = [
          "Check file permissions",
          "Request storage permissions if needed",
          "Verify app has access to the file location",
        ];
      } else if (
        errorMessage.includes("Network") ||
        errorMessage.includes("Connection")
      ) {
        suggestions = [
          "Check internet connection for remote videos",
          "Verify the remote URL is accessible",
          "Try downloading the video locally first",
        ];
      } else if (
        errorMessage.includes("format") ||
        errorMessage.includes("codec")
      ) {
        suggestions = [
          "Video format may not be supported",
          "Try converting to MP4 format",
          "Check if the video file is corrupted",
        ];
      } else {
        suggestions = [
          "Try with a different video file",
          "Check device storage space",
          "Restart the app and try again",
          "Check if the video duration is valid",
        ];
      }
    }

    console.log("Troubleshooting suggestions:", suggestions);

    return {
      success: false,
      error: errorMessage,
      suggestions,
    };
  }
};

// 안전한 썸네일 생성 함수 (유효성 검사 포함)
export const generateThumbnailSafe = async (
  videoSource: string,
  setImageUri: (uri: string | null) => void,
  setThumbnailFile: (file: FileDataType | null) => void,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> => {
  console.log("Starting safe thumbnail generation...");

  // 1단계: 비디오 유효성 검사
  const validation = await validateVideoSource(videoSource);
  if (!validation.isValid) {
    console.error("Video validation failed:", validation);
    setImageUri(null);
    setThumbnailFile(null);
    return {
      success: false,
      error: validation.error || "Video validation failed",
      suggestions: [
        "Check if the video file exists",
        "Verify the video URI format (file://, http(s)://, asset://, or content://)",
        "Ensure the video file is not corrupted",
        "Try with a different video file",
        "Check file permissions and app access rights",
      ],
    };
  }

  console.log("Video validation passed:", validation.details);

  // 2단계: 실제 썸네일 생성
  return await generateThumbnailNative(
    videoSource,
    setImageUri,
    setThumbnailFile,
    options
  );
};

// 여러 시점에서 썸네일 생성하는 함수
export const generateMultipleThumbnails = async (
  videoSource: string,
  times: number[], // 여러 시점에서 썸네일 생성 (초 단위)
  setThumbnails: (thumbnails: FileDataType[]) => void,
  options: MultipleThumbnailOptions = {}
): Promise<ThumbnailResult[]> => {
  console.log("Starting multiple thumbnail generation...");
  console.log("Times:", times);

  const { quality = 0.8, headers } = options;
  const results: ThumbnailResult[] = [];
  const thumbnails: FileDataType[] = [];

  // 입력 유효성 검사
  if (!Array.isArray(times) || times.length === 0) {
    const errorResult: ThumbnailResult = {
      success: false,
      error: "Invalid times array provided",
      suggestions: ["Provide an array of time values in seconds"],
    };
    return [errorResult];
  }

  // 비디오 유효성 검사
  const validation = await validateVideoSource(videoSource);
  if (!validation.isValid) {
    const errorResult: ThumbnailResult = {
      success: false,
      error: validation.error || "Video validation failed",
      suggestions: [
        "Check if the video file exists",
        "Verify the video URI format",
        "Ensure the video file is not corrupted",
      ],
    };
    return [errorResult];
  }

  // 각 시점에 대해 썸네일 생성
  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    const timeMs = Math.max(0, time * 1000); // 음수 방지 및 밀리초 변환

    try {
      console.log(
        `Generating thumbnail ${i + 1}/${
          times.length
        } at ${time}s (${timeMs}ms)`
      );

      const result = await VideoThumbnails.getThumbnailAsync(videoSource, {
        time: timeMs,
        quality,
        ...(headers && { headers }),
      });

      if (result.uri) {
        const timestamp = Date.now();
        const thumbnail: FileDataType = {
          uri: result.uri,
          name: `thumbnail-${time}s-${timestamp}-${i}.jpg`,
          type: "image/jpeg",
          source: "video-thumbnail",
          timestamp,
        };

        thumbnails.push(thumbnail);
        results.push({ success: true, uri: result.uri });
        console.log(`Thumbnail ${i + 1} generated successfully: ${result.uri}`);
      } else {
        throw new Error(`No URI returned for time ${time}s`);
      }
    } catch (error) {
      console.error(`Failed to generate thumbnail at ${time}s:`, error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        suggestions: [
          `Try a different time position (current: ${time}s)`,
          "Check if the video duration is longer than the requested time",
          "Reduce the quality setting",
          "Verify the video file is not corrupted",
        ],
      });
    }
  }

  console.log(
    `Generated ${thumbnails.length}/${times.length} thumbnails successfully`
  );
  setThumbnails(thumbnails);
  return results;
};

// 기본 내보내기
export { generateThumbnailNative };
export default generateThumbnailSafe;

// 유틸리티 함수들
export const getThumbnailPreview = (
  thumbnailFile: FileDataType | null
): string | null => {
  return thumbnailFile ? thumbnailFile.uri : null;
};

export const cleanupThumbnails = (thumbnails: FileDataType[]): void => {
  console.log(`Cleaning up ${thumbnails.length} thumbnails`);
  // 실제 파일 시스템에서 임시 썸네일 파일들을 삭제하는 로직은
  // react-native-fs 등의 라이브러리를 사용해야 합니다
  // 여기서는 로그만 남깁니다
  thumbnails.forEach((thumb) => {
    console.log(`Would cleanup: ${thumb.uri}`);
  });
};

// 비디오 정보 추출 함수 (추가 기능)
export const getVideoInfo = async (
  videoUri: string
): Promise<{
  isValid: boolean;
  duration?: number;
  width?: number;
  height?: number;
  error?: string;
}> => {
  try {
    const validation = await validateVideoSource(videoUri);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
      };
    }

    // expo-video-thumbnails는 비디오 메타데이터를 직접 제공하지 않으므로
    // 여기서는 기본적인 유효성 검사 결과만 반환합니다
    // 실제 구현에서는 expo-av나 react-native-video 등을 사용할 수 있습니다
    return {
      isValid: true,
      // duration, width, height는 다른 라이브러리를 통해 구현 가능
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
