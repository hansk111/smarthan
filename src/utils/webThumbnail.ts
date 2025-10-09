// 웹용 비디오 썸네일 생성 라이브러리

// 썸네일 옵션 인터페이스
interface WebThumbnailOptions {
    time?: number; // 초 단위 (기본값: 5초)
    quality?: number; // 0.0 ~ 1.0 사이 값 (기본값: 0.8)
    width?: number; // 썸네일 너비 (기본값: 비디오 원본)
    height?: number; // 썸네일 높이 (기본값: 비디오 원본)
    format?: 'jpeg' | 'png' | 'webp'; // 이미지 포맷 (기본값: jpeg)
}

// 썸네일 결과 타입
interface WebThumbnailResult {
    success: boolean;
    uri?: string; // Data URL
    blob?: Blob; // Blob 객체
    file?: File; // File 객체
    error?: string;
    width?: number;
    height?: number;
}

// FileDataType 인터페이스
interface FileDataType {
    uri: string;
    name: string;
    type: string;
    source: string;
    timestamp: number;
    blob?: Blob;
    file?: File;
}


const generateThumbnailWeb = async (
    videoSource: string | File,
    setImageUri: (uri: string) => void,
    setThumbnailFile: (file: FileDataType) => void,
    options: WebThumbnailOptions = {}
): Promise<WebThumbnailResult> => {
    const {
        time = 5,
        quality = 0.8,
        width,
        height,
        format = 'jpeg'
    } = options;

    try {
        console.log(`Generating web thumbnail at ${time}s with quality ${quality}`);

        // 비디오 URL 생성
        let videoUrl: string;
        if (typeof videoSource === 'string') {
            videoUrl = videoSource;
        } else {
            videoUrl = URL.createObjectURL(videoSource);
        }

        // 비디오 요소 생성 및 로드
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';

        const result = await new Promise<WebThumbnailResult>((resolve, reject) => {
            const cleanup = () => {
                if (typeof videoSource !== 'string') {
                    URL.revokeObjectURL(videoUrl);
                }
            };

            let hasSeeked = false; // 중복 실행 방지
            let targetSeekTime = 0; // 실제 seek한 시간 저장

            video.onloadedmetadata = () => {
                try {
                    // 시간 설정 및 검증
                    const duration = video.duration;
                    console.log(`Video loaded - Duration: ${duration}s, Requested time: ${time}s`);

                    if (isNaN(duration) || duration <= 0) {
                        throw new Error('Invalid video duration');
                    }

                    // 유효한 seek 시간 계산
                    targetSeekTime = Math.max(0.1, Math.min(time, duration - 0.5));

                    console.log(`Calculated seek time: ${targetSeekTime}s`);

                    // 비디오를 muted로 설정 (일부 브라우저에서 필요)
                    video.muted = true;

                    // 현재 시간을 정확히 설정
                    video.currentTime = targetSeekTime;

                } catch (error) {
                    cleanup();
                    reject(new Error(`Failed to set video time: ${error}`));
                }
            };

            // loadeddata 이벤트도 추가 (더 확실한 메타데이터 로딩)
            video.onloadeddata = () => {
                console.log(`Video data loaded - current time: ${video.currentTime}s, duration: ${video.duration}s`);
            };

            video.onseeked = () => {
                if (hasSeeked) return; // 중복 실행 방지
                hasSeeked = true;

                try {
                    console.log(`Successfully seeked to: ${video.currentTime}s`);

                    // 약간의 지연을 두어 프레임이 완전히 로드되도록 함
                    setTimeout(() => {
                        try {
                            // Canvas에 비디오 프레임 그리기
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            if (!ctx) {
                                throw new Error('Canvas context not available');
                            }

                            // 캔버스 크기 설정
                            const videoWidth = video.videoWidth;
                            const videoHeight = video.videoHeight;

                            if (videoWidth === 0 || videoHeight === 0) {
                                throw new Error('Video dimensions not available');
                            }

                            canvas.width = width || videoWidth;
                            canvas.height = height || videoHeight;

                            // 비디오 프레임을 캔버스에 그리기
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                            // 이미지 데이터 추출
                            const mimeType = `image/${format}`;
                            const dataUrl = canvas.toDataURL(mimeType, quality);

                            // Blob 생성
                            canvas.toBlob((blob) => {
                                if (!blob) {
                                    cleanup();
                                    reject(new Error('Failed to create blob'));
                                    return;
                                }

                                // File 객체 생성
                                const timestamp = Date.now();
                                const actualSeekTime = video.currentTime; // 실제 seek된 시간 사용
                                const filename = `thumbnail-${timestamp}-${actualSeekTime.toFixed(1)}s.${format}`;
                                const file = new File([blob], filename, { type: mimeType });

                                console.log(`Thumbnail generated at actual time: ${actualSeekTime}s (requested: ${time}s)`);

                                // 썸네일 데이터 설정
                                setImageUri(dataUrl);

                                const fileData: FileDataType = {
                                    uri: dataUrl,
                                    name: filename,
                                    type: mimeType,
                                    source: "web-video-thumbnail",
                                    timestamp,
                                    blob,
                                    file
                                };

                                setThumbnailFile(fileData);

                                cleanup();
                                resolve({
                                    success: true,
                                    uri: dataUrl,
                                    blob,
                                    file,
                                    width: canvas.width,
                                    height: canvas.height
                                });
                            }, mimeType, quality);

                        } catch (error) {
                            cleanup();
                            reject(new Error(`Failed to generate thumbnail: ${error}`));
                        }
                    }, 100); // 100ms 지연

                } catch (error) {
                    cleanup();
                    reject(new Error(`Failed to process seeked event: ${error}`));
                }
            };

            video.onerror = (error) => {
                cleanup();
                reject(new Error(`Video loading failed: ${error}`));
            };

            video.ontimeupdate = () => {
                const currentTime = video.currentTime;
                console.log(`Time update event - current: ${currentTime}s, target: ${targetSeekTime}s`);

                // 목표 시간에 충분히 가까우면 일시정지
                if (Math.abs(currentTime - targetSeekTime) < 0.2) {
                    video.pause();
                    console.log(`Paused at ${currentTime}s (close to target ${targetSeekTime}s)`);
                }
            };

            // 비디오 로드 시작 - preload 설정을 더 강화
            video.preload = 'auto';
            video.src = videoUrl;
            video.load(); // 명시적으로 load 호출
        });

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Web thumbnail generation failed:", errorMessage);

        return {
            success: false,
            error: errorMessage
        };
    }
};


const generateMultipleWebThumbnails = async (
    videoSource: string | File,
    timePoints: number[] = [1, 5, 10],
    options: WebThumbnailOptions = {}
): Promise<WebThumbnailResult[]> => {
    const results: WebThumbnailResult[] = [];

    try {
        for (const time of timePoints) {
            console.log(`Generating web thumbnail at ${time}s...`);

            const result = await generateThumbnailWeb(
                videoSource,
                () => { }, // 빈 함수
                () => { }, // 빈 함수
                { ...options, time }
            );

            results.push(result);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Multiple web thumbnails generation failed:", errorMessage);

        results.push({
            success: false,
            error: errorMessage
        });
    }

    return results;
};


const generateThumbnailFromFile = async (
    file: File,
    options: WebThumbnailOptions = {}
): Promise<WebThumbnailResult> => {
    try {
        // 파일 타입 검증
        if (!file.type.startsWith('video/')) {
            throw new Error('Selected file is not a video');
        }

        console.log(`Processing video file: ${file.name} (${file.size} bytes)`);

        return await generateThumbnailWeb(
            file,
            () => { },
            () => { },
            options
        );

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Thumbnail generation from file failed:", errorMessage);

        return {
            success: false,
            error: errorMessage
        };
    }
};


const downloadThumbnail = (result: WebThumbnailResult, filename?: string) => {
    if (!result.success || !result.uri) {
        console.error('Cannot download invalid thumbnail');
        return;
    }

    const link = document.createElement('a');
    link.download = filename || `thumbnail-${Date.now()}.jpg`;
    link.href = result.uri;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const getVideoMetadata = async (videoSource: string | File): Promise<{
    duration: number;
    width: number;
    height: number;
}> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        let videoUrl: string;
        if (typeof videoSource === 'string') {
            videoUrl = videoSource;
        } else {
            videoUrl = URL.createObjectURL(videoSource);
        }

        video.onloadedmetadata = () => {
            const metadata = {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight
            };

            if (typeof videoSource !== 'string') {
                URL.revokeObjectURL(videoUrl);
            }

            resolve(metadata);
        };

        video.onerror = (error) => {
            if (typeof videoSource !== 'string') {
                URL.revokeObjectURL(videoUrl);
            }
            reject(new Error(`Failed to load video metadata: ${error}`));
        };

        video.src = videoUrl;
    });
};


const generateThumbnailAtExactTime = async (
    videoSource: string | File,
    time: number,
    options: WebThumbnailOptions = {}
): Promise<WebThumbnailResult> => {
    const {
        quality = 0.8,
        width,
        height,
        format = 'jpeg'
    } = options;

    try {
        console.log(`Generating thumbnail at exact time: ${time}s`);

        // 비디오 URL 생성
        let videoUrl: string;
        if (typeof videoSource === 'string') {
            videoUrl = videoSource;
        } else {
            videoUrl = URL.createObjectURL(videoSource);
        }

        // 비디오 요소 생성
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'auto'; // metadata -> auto로 변경
        video.muted = true;
        video.playsInline = true;

        const result = await new Promise<WebThumbnailResult>((resolve, reject) => {
            const cleanup = () => {
                if (typeof videoSource !== 'string') {
                    URL.revokeObjectURL(videoUrl);
                }
                video.remove();
            };

            let isProcessing = false;

            const processFrame = async () => {
                if (isProcessing) return;
                isProcessing = true;

                try {
                    console.log(`Current video time: ${video.currentTime}s, target: ${time}s`);

                    // Canvas 생성 및 설정
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { alpha: false });

                    if (!ctx) {
                        throw new Error('Canvas context not available');
                    }

                    // 비디오 크기 확인
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;

                    if (videoWidth === 0 || videoHeight === 0) {
                        throw new Error('Video dimensions not loaded');
                    }

                    canvas.width = width || videoWidth;
                    canvas.height = height || videoHeight;

                    // 배경을 검은색으로 채우기 (투명도 문제 방지)
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 비디오 프레임 그리기
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // 이미지 데이터 생성
                    const mimeType = `image/${format}`;

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            cleanup();
                            reject(new Error('Failed to create blob'));
                            return;
                        }

                        const dataUrl = canvas.toDataURL(mimeType, quality);
                        const timestamp = Date.now();
                        const filename = `thumbnail-${timestamp}-${time.toFixed(1)}s.${format}`;
                        const file = new File([blob], filename, { type: mimeType });

                        cleanup();
                        resolve({
                            success: true,
                            uri: dataUrl,
                            blob,
                            file,
                            width: canvas.width,
                            height: canvas.height
                        });
                    }, mimeType, quality);

                } catch (error) {
                    cleanup();
                    reject(new Error(`Frame processing failed: ${error}`));
                }
            };

            // 이벤트 핸들러들
            video.onloadeddata = () => {
                console.log('Video data loaded, duration:', video.duration);
                const seekTime = Math.max(0, Math.min(time, video.duration - 0.1));
                console.log(`Seeking to: ${seekTime}s`);
                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                console.log(`Seeked to: ${video.currentTime}s`);
                // 프레임이 완전히 렌더링될 때까지 대기
                requestAnimationFrame(() => {
                    setTimeout(processFrame, 50);
                });
            };

            video.onerror = (error) => {
                cleanup();
                reject(new Error(`Video loading failed: ${error}`));
            };

            video.ontimeupdate = () => {
                console.log(`Time updated to: ${video.currentTime}s`);
            };

            // 비디오 로드
            video.src = videoUrl;
        });

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Exact time thumbnail generation failed:", errorMessage);

        return {
            success: false,
            error: errorMessage
        };
    }
};


const generateThumbnailForced = async (
    videoSource: string | File,
    time: number,
    options: WebThumbnailOptions = {}
): Promise<WebThumbnailResult> => {
    const {
        quality = 0.8,
        width,
        height,
        format = 'jpeg'
    } = options;

    try {
        console.log(`=== Forced thumbnail generation at ${time}s ===`);

        let videoUrl: string;
        if (typeof videoSource === 'string') {
            videoUrl = videoSource;
        } else {
            videoUrl = URL.createObjectURL(videoSource);
        }

        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        // DOM에 추가 (일부 브라우저에서 필요)
        video.style.position = 'absolute';
        video.style.top = '-9999px';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        document.body.appendChild(video);

        const result = await new Promise<WebThumbnailResult>((resolve, reject) => {
            const cleanup = () => {
                if (typeof videoSource !== 'string') {
                    URL.revokeObjectURL(videoUrl);
                }
                if (document.body.contains(video)) {
                    document.body.removeChild(video);
                }
            };

            let attempts = 0;
            const maxAttempts = 3;

            const attemptSeek = async (seekTime: number) => {
                attempts++;
                console.log(`Attempt ${attempts}: Seeking to ${seekTime}s`);

                return new Promise<void>((resolveSeek, rejectSeek) => {
                    const timeout = setTimeout(() => {
                        rejectSeek(new Error(`Seek timeout for time ${seekTime}s`));
                    }, 5000);

                    const onSeeked = () => {
                        clearTimeout(timeout);
                        video.removeEventListener('seeked', onSeeked);

                        const actualTime = video.currentTime;
                        console.log(`Seeked to actual time: ${actualTime}s (requested: ${seekTime}s)`);

                        if (Math.abs(actualTime - seekTime) > 1.0 && attempts < maxAttempts) {
                            // 시간이 너무 다르면 다시 시도
                            console.log(`Time mismatch, retrying... (${actualTime}s vs ${seekTime}s)`);
                            setTimeout(() => {
                                video.currentTime = seekTime;
                            }, 100);
                        } else {
                            resolveSeek();
                        }
                    };

                    video.addEventListener('seeked', onSeeked);
                    video.currentTime = seekTime;
                });
            };

            const generateFromCurrentFrame = () => {
                try {
                    const actualTime = video.currentTime;
                    console.log(`Generating thumbnail from frame at ${actualTime}s`);

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        throw new Error('Canvas context not available');
                    }

                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;

                    if (videoWidth === 0 || videoHeight === 0) {
                        throw new Error(`Invalid video dimensions: ${videoWidth}x${videoHeight}`);
                    }

                    canvas.width = width || videoWidth;
                    canvas.height = height || videoHeight;

                    // 검은 배경
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 비디오 프레임 그리기
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const mimeType = `image/${format}`;

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            cleanup();
                            reject(new Error('Failed to create blob'));
                            return;
                        }

                        const dataUrl = canvas.toDataURL(mimeType, quality);
                        const timestamp = Date.now();
                        const filename = `forced-thumbnail-${timestamp}-${actualTime.toFixed(2)}s.${format}`;
                        const file = new File([blob], filename, { type: mimeType });

                        console.log(`✓ Successfully generated thumbnail at ${actualTime}s`);

                        cleanup();
                        resolve({
                            success: true,
                            uri: dataUrl,
                            blob,
                            file,
                            width: canvas.width,
                            height: canvas.height
                        });
                    }, mimeType, quality);

                } catch (error) {
                    cleanup();
                    reject(new Error(`Frame generation failed: ${error}`));
                }
            };

            // 비디오 로드 완료 후 seek 시작
            video.addEventListener('canplaythrough', async () => {
                try {
                    const duration = video.duration;
                    console.log(`Video ready - Duration: ${duration}s`);

                    if (isNaN(duration) || duration <= 0) {
                        throw new Error('Invalid video duration');
                    }

                    // 유효한 시간 계산 (최소 0.1초, 최대 duration-0.5초)
                    const validTime = Math.max(0.1, Math.min(time, duration - 0.5));
                    console.log(`Valid seek time: ${validTime}s (requested: ${time}s)`);

                    // Seek 시도
                    await attemptSeek(validTime);

                    // 프레임 렌더링을 위한 추가 대기
                    setTimeout(generateFromCurrentFrame, 200);

                } catch (error) {
                    cleanup();
                    reject(new Error(`Seek process failed: ${error}`));
                }
            });

            video.addEventListener('error', (e) => {
                cleanup();
                reject(new Error(`Video loading failed: ${e}`));
            });

            // 로드 시작
            video.src = videoUrl;
        });

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Forced thumbnail generation failed:", errorMessage);

        return {
            success: false,
            error: errorMessage
        };
    }
};

const generateThumbnailWithPlayback = async (
    videoSource: string | File,
    time: number,
    options: WebThumbnailOptions = {}
): Promise<WebThumbnailResult> => {
    const {
        quality = 0.8,
        width,
        height,
        format = 'jpeg'
    } = options;

    try {
        let videoUrl: string;
        if (typeof videoSource === 'string') {
            videoUrl = videoSource;
        } else {
            videoUrl = URL.createObjectURL(videoSource);
        }

        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        // 비디오를 DOM에 추가 (일부 브라우저에서 필요)
        video.style.position = 'absolute';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        document.body.appendChild(video);

        const result = await new Promise<WebThumbnailResult>((resolve, reject) => {
            const cleanup = () => {
                if (typeof videoSource !== 'string') {
                    URL.revokeObjectURL(videoUrl);
                }
                document.body.removeChild(video);
            };

            let hasGenerated = false;

            const generateThumbnail = () => {
                if (hasGenerated) return;
                hasGenerated = true;

                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        throw new Error('Canvas context not available');
                    }

                    canvas.width = width || video.videoWidth;
                    canvas.height = height || video.videoHeight;

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const mimeType = `image/${format}`;
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            cleanup();
                            reject(new Error('Failed to create blob'));
                            return;
                        }

                        const dataUrl = canvas.toDataURL(mimeType, quality);
                        const timestamp = Date.now();
                        const filename = `thumbnail-playback-${timestamp}-${time}s.${format}`;
                        const file = new File([blob], filename, { type: mimeType });

                        cleanup();
                        resolve({
                            success: true,
                            uri: dataUrl,
                            blob,
                            file,
                            width: canvas.width,
                            height: canvas.height
                        });
                    }, mimeType, quality);

                } catch (error) {
                    cleanup();
                    reject(error);
                }
            };

            video.oncanplaythrough = async () => {
                try {
                    const seekTime = Math.max(0, Math.min(time, video.duration - 0.1));

                    // 재생을 먼저 시작
                    await video.play();

                    // 원하는 시간으로 이동
                    video.currentTime = seekTime;

                } catch (error) {
                    console.warn('Playback failed, trying direct seek:', error);
                    video.currentTime = Math.max(0, Math.min(time, video.duration - 0.1));
                }
            };

            video.onseeked = () => {
                video.pause();
                setTimeout(generateThumbnail, 100);
            };

            video.onerror = (error) => {
                cleanup();
                reject(new Error(`Video error: ${error}`));
            };

            video.src = videoUrl;
        });

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Playback thumbnail generation failed:", errorMessage);

        return {
            success: false,
            error: errorMessage
        };
    }
};
export {
    downloadThumbnail, generateMultipleWebThumbnails,
    generateThumbnailFromFile, generateThumbnailWeb, getVideoMetadata, type FileDataType, type WebThumbnailOptions,
    type WebThumbnailResult
};
