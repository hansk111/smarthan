import { Alert, Platform } from 'react-native';

export const showConfirmAlert = async (options: any) => {
    const { title, message, onConfirm, onCancel } = options;

    if (Platform.OS === 'web') {
        try {
            const Swal = (await import('sweetalert2')).default;

            const result = await Swal.fire({
                title,
                text: message,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#FF3B30",
                cancelButtonColor: "#8E8E93",
                confirmButtonText: "확인",
                cancelButtonText: "취소",
            });

            if (result.isConfirmed) {
                onConfirm?.();
            } else {
                onCancel?.();
            }
        } catch (error) {
            console.error('SweetAlert2 로드 실패:', error);
            // 폴백으로 기본 confirm 사용
            if (window.confirm(`${title}\n${message}`)) {
                onConfirm?.();
            } else {
                onCancel?.();
            }
        }
    } else {
        Alert.alert(
            title,
            message,
            [
                {
                    text: "취소",
                    style: "cancel",
                    onPress: onCancel
                },
                {
                    text: "확인",
                    style: "destructive",
                    onPress: onConfirm
                }
            ]
        );
    }
};

export const showErrorAlert = (message: any) => {
    if (Platform.OS === 'web') {
        // 웹에서는 SweetAlert2 또는 기본 alert
        alert(`오류: ${message}`);
    } else {
        Alert.alert("오류", message);
    }
};

export const showSuccessAlert = (message: any) => {
    if (Platform.OS === 'web') {
        alert(`성공: ${message}`);
    } else {
        Alert.alert("성공", message);
    }
};