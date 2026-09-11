import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { BottomNavigation } from '../components/bottom-navigation';

const COLORS = {
  dark: '#1B3A2B',
  darkGreen: '#1F4A32',
  accentGreen: '#2E6B4A',
  background: '#EFEBE4',
  textDark: '#1B1B1B',
  textLight: '#FFFFFF',
  subtitle: '#A9C2B3',
  border: '#E3DED5',
  cardBg: '#FFFFFF',
};

// donnees par defaut et format a suivre pour les requetes plus tard
const DEFAULT_SIGNAL_DATA = [
  { label: '4G', value: 56 },
  { label: '3G', value: 26 },
  { label: '2G', value: 15 },
  { label: '5G', value: 3 },
];

const DEFAULT_OPERATOR_DATA = [
  { label: 'Airtel', value: 42 },
  { label: 'Telma', value: 33 },
  { label: 'Orange', value: 21 },
  { label: 'Gulfsat', value: 4 },
];

const DEFAULT_ELECTRICITY_DATA = [
  { label: 'Secteur (JIRAMA)', value: 58 },
  { label: 'Solaire', value: 31 },
  { label: 'Groupe electrogene', value: 11 },
];

// zones et lieux par defaut
//format de donnees attendus
const DEFAULT_AREAS = ['Tout', 'Commune', 'Disctrict', 'Fokontany'];
const DEFAULT_PLACES = ['Analamanga', 'Anosy'];

const SIGNAL_COLORS = {
  '4G': '#1a3d27',
  '3G': '#2e6b46',
  '2G': '#7fa78c',
  '5G': '#d98a3d',
};

const OPERATOR_COLORS = {
  Airtel: COLORS.darkGreen,
  Telma: COLORS.accentGreen,
  Orange: COLORS.accentGreen,
  Gulfsat: COLORS.subtitle,
};

const ELECTRICITY_COLORS = {
  'Secteur (JIRAMA)': COLORS.darkGreen,
  Solaire: COLORS.accentGreen,
  'Groupe electrogene': COLORS.subtitle,
};

const FALLBACK_COLOR = COLORS.subtitle;

function colorFor(label, colorMap) {
  return colorMap[label] || FALLBACK_COLOR;
}

//affichage de la page de statistique de qualite de signal sous forme de chart en cercle
function SignalDonut({ data = DEFAULT_SIGNAL_DATA }) {
  const size = 140;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Qualite de signal</Text>
      <View style={styles.donutRow}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {data.map((slice) => {
            const segmentLength = (slice.value / 100) * circumference;
            const dashArray = `${segmentLength} ${circumference - segmentLength}`;
            const dashOffset = -((cumulative / 100) * circumference);
            cumulative += slice.value;
            const color = colorFor(slice.label, SIGNAL_COLORS);

            return (
              <Circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                fill="transparent"
              />
            );
          })}
        </Svg>

        <View style={styles.legend}>
          {data.map((slice) => (
            <View key={slice.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: colorFor(slice.label, SIGNAL_COLORS) }]} />
              <Text style={styles.legendLabel}>{slice.label}</Text>
              <Text style={styles.legendValue}>{slice.value}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

//affichage des stats d operateurs
function OperatorBarChart({ data = DEFAULT_OPERATOR_DATA }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Operateur</Text>
      {data.map((row) => (
        <View key={row.label} style={styles.barRow}>
          <View style={styles.barTop}>
            <Text style={styles.legendLabel}>{row.label}</Text>
            <Text style={styles.legendValue}>{row.value}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${row.value}%`, backgroundColor: colorFor(row.label, OPERATOR_COLORS) },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

//affichage de stats d electricite
function ElectricityStackedBar({ data = DEFAULT_ELECTRICITY_DATA }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Electricite</Text>
      <View style={styles.stackBar}>
        {data.map((seg) => (
          <View
            key={seg.label}
            style={{ width: `${seg.value}%`, backgroundColor: colorFor(seg.label, ELECTRICITY_COLORS), height: '100%' }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {data.map((seg) => (
          <View key={seg.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colorFor(seg.label, ELECTRICITY_COLORS) }]} />
            <Text style={styles.legendLabel}>{seg.label}</Text>
            <Text style={styles.legendValue}>{seg.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

//selection des zones a etudier
export function DropDown() {
  const [openArea, setOpenArea] = useState(false);
  const [selectedArea, setSelectedArea] = useState('Tout');

  const [openPlace, setOpenPlace] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('Tout');

  const [activeTab, setActiveTab] = useState('signal');
  const [showStats, setShowStats] = useState(false);

  const [area, setArea] = useState(DEFAULT_AREAS);
  const [placeNames, setPlaceNames] = useState(DEFAULT_PLACES);

  const [signalData, setSignalData] = useState(DEFAULT_SIGNAL_DATA);
  const [operatorData, setOperatorData] = useState(DEFAULT_OPERATOR_DATA);
  const [electricityData, setElectricityData] = useState(DEFAULT_ELECTRICITY_DATA);

  function openStats(tabId) {
    setActiveTab(tabId);
    setShowStats(true);
  }

  return (
    <>
      {(openArea || openPlace) && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setOpenArea(false);
            setOpenPlace(false);
          }}
        />
      )}

      <View style={styles.dropdownRow}>
        <View style={styles.dropdownWrapper}>
          <Pressable style={styles.button} onPress={() => setOpenArea(!openArea)}>
            <Text>{selectedArea}</Text>
            <FontAwesome name={openArea ? 'chevron-up' : 'chevron-down'} size={14} color="black" />
          </Pressable>

          {openArea && (
            <View style={styles.list}>
              {area.map((option) => (
                <Pressable
                  key={option}
                  style={({ hovered, pressed }) => [styles.option, (hovered || pressed) && styles.optionHovered]}
                  onPress={() => {
                    setSelectedArea(option);
                    setOpenArea(false);
                  }}
                >
                  <Text>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.dropdownWrapper}>
          <Pressable style={styles.button} onPress={() => setOpenPlace(!openPlace)}>
            <Text>{selectedPlace}</Text>
            <FontAwesome name={openPlace ? 'chevron-up' : 'chevron-down'} size={14} color="black" />
          </Pressable>

          {openPlace && (
            <View style={styles.list}>
              {placeNames.map((option) => (
                <Pressable
                  key={option}
                  style={({ hovered, pressed }) => [styles.option, (hovered || pressed) && styles.optionHovered]}
                  onPress={() => {
                    setSelectedPlace(option);
                    setOpenPlace(false);
                  }}
                >
                  <Text>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomStat}>
        <Text style={styles.bottomStatLabel}>Couverture reseau dde madagascar</Text>
        <Text style={styles.bottomStatValue}> 80 %</Text>
      </View>

      {showStats && (
        <ScrollView style={styles.statsPanel} contentContainerStyle={styles.statsPanelContent}>
          {activeTab === 'signal' && <SignalDonut data={signalData} />}
          {activeTab === 'electricity' && <ElectricityStackedBar data={electricityData} />}
          {activeTab === 'operator' && <OperatorBarChart data={operatorData} />}
        </ScrollView>
      )}

      <View style={styles.threeButtonRow}>
        <Pressable style={styles.threeButton} onPress={() => openStats('signal')}>
          <Ionicons name="cellular" size={40} />
        </Pressable>
        <Pressable style={styles.threeButton} onPress={() => openStats('electricity')}>
          <Ionicons name="flash" size={40} />
        </Pressable>
        <Pressable style={styles.threeButton} onPress={() => openStats('operator')}>
          <Ionicons name="business" size={40} />
        </Pressable>
      </View>
    </>
  );
}

export default function StatsScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <DropDown />
        <BottomNavigation activeTab="stats" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  container: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
  },

  dropdownRow: {
    flexDirection: 'row',
    zIndex: 10,
    height: 90,
  },

  dropdownWrapper: {
    flex: 1,
    position: 'relative',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },

  button: {
    flexDirection: 'row',
    position: 'absolute',
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 12,
    paddingLeft: 30,
    paddingRight: 20,
    top: 20,
    left: 10,
    right: 10,
    gap: 20,
    justifyContent: 'space-between',
  },

  list: {
    flexDirection: 'column',
    position: 'absolute',
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 12,
    paddingLeft: 30,
    paddingRight: 20,
    top: 20,
    left: 10,
    right: 10,
    gap: 20,
  },

  optionHovered: {
    backgroundColor: '#accab0',
    borderRadius: 10,
    paddingLeft: 10,
    padding: 5,
  },

  option: {
    backgroundColor: '#ffffff',
  },

  bottomStat: {
    position: 'absolute',
    backgroundColor: '#1B3A2B',
    bottom: 100,
    right: 40,
    left: 40,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 32,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },

  bottomStatLabel: {
    fontSize: 15,
    color: '#ffffff',
    flex: 1,
    paddingLeft: 10,
    textAlign: 'center',
  },

  bottomStatValue: {
    fontSize: 40,
    color: '#ffffff',
  },

  statsPanel: {
    paddingHorizontal: 20,
    marginTop: 16,
    maxHeight: '38%',
  },

  statsPanelContent: {
    paddingBottom: 20,
  },

  threeButtonRow: {
    flexDirection: 'row',
    position: 'absolute',
    gap: 10,
    bottom: 200,
    right: 20,
    left: 20,
    justifyContent: 'center',
  },

  threeButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 40,
  },

  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    gap: 35,
  },

  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  legend: {
    flex: 1,
    gap: 8,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
  },

  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  barRow: {
    gap: 6,
  },

  barTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  stackBar: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },

  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
});