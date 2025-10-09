import React, { useRef, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';



const VideoThumbnailGenerator = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);



    // 비디오 파일 선택
    const selectVideoFile = () => {
        if (Platform.OS === 'web') {
            fileInputRef.current?.click();
            console.log(fileInputRef.current)
        } else {
            Alert.alert('알림', '이 기능은 웹 환경에서만 지원됩니다.');
        }
    };

    // 파일 선택 핸들러
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setSelectedVideo(file);
            setThumbnailUrl(null);
        } else {
            Alert.alert('오류', '비디오 파일을 선택해주세요.');
        }
    };

    // 썸네일 생성 함수
    const generateThumbnail = (videoFile, timeInSeconds = 1) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            video.preload = 'metadata';
            video.currentTime = timeInSeconds;

            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            };

            video.onseeked = () => {
                try {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(resolve, 'image/jpeg', 0.8);
                } catch (error) {
                    reject(error);
                }
            };

            video.onerror = reject;
            video.src = URL.createObjectURL(videoFile);
        });
    };

    // 썸네일 생성 실행
    const handleGenerateThumbnail = async () => {
        console.log("selectedVideo", selectedVideo)
        if (!selectedVideo) {
            Alert.alert('알림', '먼저 비디오 파일을 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            const thumbnailBlob = await generateThumbnail(selectedVideo, 2); // 2초 지점에서 썸네일 생성
            const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
            setThumbnailUrl(thumbnailUrl);
        } catch (error) {
            console.error('썸네일 생성 실패:', error);
            Alert.alert('오류', '썸네일 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 썸네일 다운로드
    const downloadThumbnail = () => {
        if (!thumbnailUrl) return;

        const link = document.createElement('a');
        link.href = thumbnailUrl;
        link.download = `thumbnail_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 여러 썸네일 생성 (다른 시간대)
    const generateMultipleThumbnails = async (times = [1, 5, 10]) => {
        if (!selectedVideo) {
            Alert.alert('알림', '먼저 비디오 파일을 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            const thumbnails = [];
            for (const time of times) {
                const thumbnailBlob = await generateThumbnail(selectedVideo, time);
                const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
                thumbnails.push({ time, url: thumbnailUrl });
            }

            // 첫 번째 썸네일을 메인으로 설정
            setThumbnailUrl(thumbnails[0]?.url);

            // 모든 썸네일 다운로드
            thumbnails.forEach((thumbnail, index) => {
                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = thumbnail.url;
                    link.download = `thumbnail_${thumbnail.time}s_${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, index * 100);
            });

        } catch (error) {
            console.error('다중 썸네일 생성 실패:', error);
            Alert.alert('오류', '썸네일 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 커스텀 시간으로 썸네일 생성
    const generateThumbnailAtTime = async (seconds) => {
        if (!selectedVideo) return;

        setLoading(true);
        try {
            const thumbnailBlob = await generateThumbnail(selectedVideo, seconds);
            const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
            setThumbnailUrl(thumbnailUrl);
        } catch (error) {
            console.error('썸네일 생성 실패:', error);
            Alert.alert('오류', '썸네일 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>비디오 썸네일 생성기</Text>

            {/* 웹용 숨겨진 파일 입력 */}
            {Platform.OS === 'web' && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />
            )}

            {/* 파일 선택 버튼 */}
            <TouchableOpacity style={styles.button} onPress={selectVideoFile}>
                <Text style={styles.buttonText}>비디오 파일 선택</Text>
            </TouchableOpacity>

            {selectedVideo && (
                <View style={styles.videoInfo}>
                    <Text style={styles.infoText}>선택된 파일: {selectedVideo.name}</Text>
                    <Text style={styles.infoText}>크기: {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB</Text>
                </View>
            )}

            {/* 썸네일 생성 버튼들 */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handleGenerateThumbnail}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? '생성 중...' : '썸네일 생성 (2초)'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => generateThumbnailAtTime(1)}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>첫 프레임</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => generateMultipleThumbnails([1, 3, 5])}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>다중 썸네일</Text>
                </TouchableOpacity>
            </View>

            {/* 생성된 썸네일 표시 */}
            {thumbnailUrl && (
                <View style={styles.thumbnailContainer}>
                    <Text style={styles.sectionTitle}>생성된 썸네일:</Text>
                    <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />

                    <TouchableOpacity
                        style={[styles.button, styles.downloadButton]}
                        onPress={downloadThumbnail}
                    >
                        <Text style={styles.buttonText}>썸네일 다운로드</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 8,
        minWidth: 200,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: '#34C759',
    },
    downloadButton: {
        backgroundColor: '#FF9500',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 20,
    },
    videoInfo: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginVertical: 15,
        width: '100%',
        maxWidth: 400,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    thumbnailContainer: {
        alignItems: 'center',
        marginTop: 30,
        width: '100%',
        maxWidth: 400,
    },
    thumbnail: {
        width: 300,
        height: 200,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#ddd',
    },
});

export default VideoThumbnailGenerator;