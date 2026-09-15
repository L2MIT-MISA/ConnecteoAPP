import { Pressable, StyleSheet, Text, View } from "react-native";

type NodeInformation = {
    setNodePressed: (bool: boolean) => void;
}


export default function Information(props: NodeInformation) {
    return (
        <View style={styles.informations}>
            <Pressable
                style={styles.closeButton}
                onPress={() => props.setNodePressed(false)}>
                <Text>x</Text>
            </Pressable>
            <Text style={styles.site}>
                SITE · idSite
            </Text>
            <Text style={styles.nom}
            >
                Nom
            </Text>

            <Text style={
                {
                    paddingBottom: 5
                }
            }>
                LOCALISATION
            </Text>
            <View style={styles.commContainer}>
                <Text style={styles.comm}>OPERATEUR</Text>
                <Text style={styles.comm}>SIGNAL</Text>
            </View>
            <View style={styles.keyValueContainer}>
                <Text>Type de site</Text>
                <Text>Value</Text>
            </View>
            <View style={styles.keyValueContainer}>
                <Text>Type de site</Text>
                <Text>Value</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        informations: {
            flex: 1,
            position: 'absolute',
            width: '60%',
            bottom: 60,
            left: 15,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 10,
            borderWidth: 0.5
        },
        closeButton: {
            position: 'absolute',
            right: 3,
            top: 2,
            width: 20,
            height: 20,
            flex: 1,
            alignItems: 'center'
        },
        site: {
            fontSize: 10,
            paddingBottom: 5
        },
        nom: {
            fontSize: 18,
            fontWeight: 700,
            paddingBottom: 5
        },
        commContainer: {
            flex: 1,
            flexDirection: 'row',
            gap: 5,
            paddingBottom: 5
        },
        comm: {
            borderWidth: 1,
            paddingVertical: 2,
            paddingHorizontal: 4,
            borderRadius: 3
        },
        keyValueContainer: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 2,
            borderBottomWidth: 0.5
        }
    }
)
