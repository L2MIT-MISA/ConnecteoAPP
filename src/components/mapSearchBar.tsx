import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

type MapSearchBarProps = {
    placeToSearch: string;
    setPlaceToSearch: (text: string) => void;
    searchPlace: () => void;
};

export default function MapSearchBar(props: MapSearchBarProps) {
    const { placeToSearch, setPlaceToSearch, searchPlace } = props;

    return (
        <View style={styles.searchBar}>
            <TextInput
                value={placeToSearch}
                onChangeText={setPlaceToSearch}
                placeholder="Search"
                placeholderTextColor="#1B1B1B"
                style={styles.searchInput}
            />
            <Pressable
                onPress={searchPlace}
                style={({ pressed }) => [
                    {
                        backgroundColor: pressed ? 'rgb(63, 65, 68)' : 'rgba(255, 255, 255, 0)',
                        padding: 5,
                        borderRadius: 20
                    }
                ]}>
                <Image source={require('../../assets/images/search.png')} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        position: 'absolute',
        top: 70,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        margin: 5,
        borderWidth: 1,
        borderRadius: 20,
        width: '70%',
        paddingLeft: 15,
        paddingRight: 10,
        gap: 1
    },
    searchInput: {
        flex: 1,
        color: "black"
    }
});