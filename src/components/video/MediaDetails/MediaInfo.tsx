import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from "react-native";

type MediaInfoProps = {
  title: string;

  description: string;
  type: string;
  isPlaying: boolean;
  onPlayMediaPressed: (video?: string, episodeId?: string) => Promise<void>;
}

export default function MediaInfo(props: MediaInfoProps) {
  const {
    title,

    description,
    type,

    onPlayMediaPressed,
    isPlaying,
  } = props;

  return (
    <View>
      <Text className='text-black text-2xl'>{title}</Text>

      <View className='flex-row gap-3'>
        {/* <Text className='text-black text-sm'>{releaseYear}</Text>
        <Text className='text-black text-sm bg-gray-500'>{ageRestriction}</Text>
        <Text className='text-black text-sm'>{type === "MOVIE" ? `${duration}min` : `${nrOfSeasons} seasons`}</Text> */}
      </View>

      <Pressable
        className="bg-secondary-300 rounded-md p-2.5 flex flex-row items-center justify-center space-x-2.5 my-2.5"
        onPress={() => onPlayMediaPressed()}
      >
        <FontAwesome name={isPlaying ? 'pause' : 'play'} size={20} color="blue" />
        <Text className='font-bold'>{isPlaying ? 'Pause' : 'Play'}</Text>
      </Pressable>
      <Text className='text-black'>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  headerContainer: {
    flexDirection: 'row',
    gap: 5
  },
  metaInfoText: {
    color: 'black',
    fontSize: 12
  },
  age: {
    color: 'black',
    fontSize: 9,
    padding: 2,
    backgroundColor: '#636363',
    borderRadius: 2
  },
  playButton: {
    backgroundColor: 'lightgrey',
    borderRadius: 3,
    padding: 7,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
    alignItems: 'center'
  }
});