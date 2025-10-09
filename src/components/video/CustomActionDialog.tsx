import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';

// 더미 함수: 갤러리 접근 로직
const handleSelectFromGallery = (): void => {
    Alert.alert('선택 완료', '갤러리에서 사진을 선택했습니다.');
    // 여기에 실제 갤러리 접근 로직을 추가하세요.
};

// 더미 함수: 비디오 파일 생성 로직
const handleGenerateFromVideo = (): void => {
    Alert.alert('생성 완료', '비디오 파일에서 새로운 파일을 생성합니다.');
    // 여기에 실제 비디오 처리 로직을 추가하세요.
};

const CustomActionDialog: React.FC = () => {
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    // 각 항목을 클릭했을 때 호출될 함수
    const handleItemPress = (value: string): void => {
        setDialogVisible(false);

        switch (value) {
            case 'gallery':
                handleSelectFromGallery();
                break;
            case 'video':
                handleGenerateFromVideo();
                break;
            case 'cancel':
                Alert.alert('취소', '작업이 취소되었습니다.');
                break;
            default:
                break;
        }
    };

    return (
        <View className='flex-1 justify-center items-center'>
            <Button
                title="작업 선택하기"
                onPress={() => setDialogVisible(true)}
            />

            <Dialog
                visible={dialogVisible}
                title="작업을 선택하세요"
                onTouchOutside={() => setDialogVisible(false)}
                onRequestClose={() => setDialogVisible(false)}
                contentInsetAdjustmentBehavior="automatic"
            >
                <View style={styles.dialogContent}>
                    {['갤러리에서 선택하기', '비디오 파일에서 생성하기', '취소'].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.dialogItem}
                            onPress={() => handleItemPress(item === '갤러리에서 선택하기' ? 'gallery' : item === '비디오 파일에서 생성하기' ? 'video' : 'cancel')}
                        >
                            <Text style={styles.dialogItemText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({

    dialogContent: {
        width: '100%',
    },
    dialogItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dialogItemText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default CustomActionDialog;