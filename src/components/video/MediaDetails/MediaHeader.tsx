import { AntDesign } from '@expo/vector-icons';
import { router } from "expo-router";
import { VideoPlayer, VideoView } from "expo-video";
import { Button, StyleSheet, View } from "react-native";

type MediaHeaderProps = {
  thumbnail: string;
  mediaPlayer: VideoPlayer;
  videoViewRef: React.RefObject<VideoView | null>;
};

export default function MediaHeader(props: MediaHeaderProps) {
  const { thumbnail, mediaPlayer, videoViewRef } = props;
  return (
    <View >
      <AntDesign
        name="closecircle"
        size={24}
        color="gray"
        style={styles.closeIcon}
        onPress={() => router.back()}
      />

      <VideoView style={styles.video} player={mediaPlayer} />
      <Button
        title="Play"
        onPress={() => mediaPlayer.play()}
      >

      </Button>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    height: 226,
    width: '100%'
  },
  imageBackground: {
    justifyContent: 'center',
    opacity: 0.6
  },
  closeIcon: {
    zIndex: 1,
    alignSelf: 'flex-end',
    padding: 10
  },
  video: {
    height: 226,
    width: '100%'
  },
})