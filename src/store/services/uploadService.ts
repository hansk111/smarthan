// services/uploadService.js
import { Platform } from 'react-native';



// Web용 업로드
const uploadThumbnailWeb = async (id, thumbnailFile, updateVideoThumbnail) => {
    try {
        // Web에서는 File 객체를 직접 FormData에 추가
        const result = await updateVideoThumbnail({
            id,
            thumbnail: thumbnailFile // File 객체
        }).unwrap();

        console.log('Web - Thumbnail uploaded successfully:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Web - Upload failed:', error);
        return { success: false, error: error.message };
    }
};

// Native용 업로드
const uploadThumbnailNative = async (id, thumbnailFile, updateVideoThumbnail) => {
    try {
        // Native에서는 URI 객체를 전달
        const result = await updateVideoThumbnail({
            id,
            thumbnail: thumbnailFile // {uri, name, type} 객체
        }).unwrap();

        console.log('Native - Thumbnail uploaded successfully:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Native - Upload failed:', error);
        return { success: false, error: error.message };
    }
};

// 플랫폼별 업로드 함수
export const uploadThumbnail = async (id, thumbnailFile, updateVideoThumbnail) => {
    if (!thumbnailFile || !id) {
        return { success: false, error: 'Missing required parameters' };
    }

    if (Platform.OS === 'web') {
        return uploadThumbnailWeb(id, thumbnailFile, updateVideoThumbnail);
    } else {
        return uploadThumbnailNative(id, thumbnailFile, updateVideoThumbnail);
    }
};

// Base64 업로드 (모든 플랫폼 지원)
export const uploadThumbnailBase64 = async (id, thumbnailFile, updateVideoThumbnailBase64) => {
    try {
        let base64Data;
        let filename;
        let contentType;

        if (Platform.OS === 'web') {
            // Web에서 File을 Base64로 변환
            base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(thumbnailFile);
            });
            filename = thumbnailFile.name;
            contentType = thumbnailFile.type;
        } else {
            // Native에서 URI를 Base64로 변환
            const RNFS = require('react-native-fs');
            const base64String = await RNFS.readFile(thumbnailFile.uri, 'base64');
            base64Data = `data:${thumbnailFile.type};base64,${base64String}`;
            filename = thumbnailFile.name;
            contentType = thumbnailFile.type;
        }

        const result = await updateVideoThumbnailBase64({
            id,
            thumbnail_base64: base64Data,
            filename,
            content_type: contentType,
        }).unwrap();

        console.log('Base64 upload successful:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Base64 upload failed:', error);
        return { success: false, error: error.message };
    }
};