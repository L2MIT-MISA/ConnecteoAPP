import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  AREA_TABLE_MAP,
  FALLBACK_PLACES_BY_AREA,
  fetchPlaceNames,
  fetchStatsForZone,
  fetchStatsGlobal,
  resolveCodecomList,
} from '../api/stats-api';
import { BottomNavigation } from '../components/bottom-navigation';
import {
  useTheme,
  useThemedStyles,
  type ThemeColors,
} from '../theme/ThemeContext';

// --- Données par défaut ---
const DEFAULT_SIGNAL_DATA = [
  { label: '4G', value: 0.0 },
  { label: '3G', value: 0.0 },
  { label: '2G', value: 0.0 },
  { label: '5G', value: 0.0 },
];

const DEFAULT_OPERATOR_DATA = [
  { label: 'Airtel', value: 0.0 },
  { label: 'Telma', value: 0.0 },
  { label: 'Orange', value: 0.0 },
  { label: 'Gulfsat', value: 0.0 },
];

const DEFAULT_ELECTRICITY_DATA = [
  { label: 'Secteur (JIRAMA)', value: 0.0 },
  { label: 'Solaire', value: 0.0 },
  { label: 'Groupe electrogene', value: 0.0 },
];

const DEFAULT_AREAS = ['Tout', 'Province', 'Region', 'District', 'Commune', 'Fokontany'];

// --- Couleurs d'identité (fixes, ne dépendent pas du thème) ---
const SIGNAL_COLORS: Record<string, string> = {
  '4G': '#1a3d27',
  '3G': '#2e6b46',
  '2G': '#7fa78c',
  '5G': '#d98a3d',
};

const OPERATOR_COLORS: Record<string, string> = {
  Airtel: '#E4002B',
  Telma: '#F0D122',
  Orange: '#FF6600',
  Gulfsat: '#4A6FA5',
};

const OPERATOR_LABELS_ORDER = ['Airtel', 'Telma', 'Orange', 'Gulfsat'];

const ELECTRICITY_COLORS: Record<string, string> = {
  'Secteur (JIRAMA)': '#2E86AB',
  Solaire: '#F2B134',
  'Groupe electrogene': '#D7263D',
  Mixte: '#6A4C93',
  'Non renseigne / Autre': '#8D99AE',
};

const ELECTRICITY_LABELS_ORDER = [
  'Secteur (JIRAMA)',
  'Solaire',
  'Groupe electrogene',
  'Mixte',
  'Non renseigne / Autre',
];

function withAllOperatorLabels(data: { label: string; value: number }[]) {
  const valueByLabel = Object.fromEntries(data.map((d) => [d.label, d.value]));
  return OPERATOR_LABELS_ORDER.map((label) => ({
    label,
    value: valueByLabel[label] ?? 0,
  }));
}

function withAllElectricityLabels(data: { label: string; value: number }[]) {
  const valueByLabel = Object.fromEntries(data.map((d) => [d.label, d.value]));
  return ELECTRICITY_LABELS_ORDER.map((label) => ({
    label,
    value: valueByLabel[label] ?? 0,
  }));
}

function colorFor(
  label: string,
  colorMap: Record<string, string>,
  colors: ThemeColors,
) {
  return colorMap[label] || colors.subtitle;
}

// --- Composants d'animation ---

function AnimatedVerticalBar({ value, color }: { value: number; color: string }) {
  const styles = useThemedStyles(createStyles);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const height = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.verticalBarTrack}>
      <Animated.View style={[styles.verticalBarFill, { height, backgroundColor: color }]} />
    </View>
  );
}

function AnimatedProgressBar({ value, color }: { value: number; color: string }) {
  const styles = useThemedStyles(createStyles);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[styles.barFill, { width, backgroundColor: color }]}
      />
    </View>
  );
}

function ContainerAnimated({
  children,
  dataChanged,
}: {
  children: React.ReactNode;
  dataChanged: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [dataChanged]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

// --- Graphiques ---

function SignalBarChart({ data = DEFAULT_SIGNAL_DATA }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <ContainerAnimated dataChanged={JSON.stringify(data)}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Qualité de signal</Text>
        <View style={styles.verticalBarsRow}>
          {data.map((row) => (
            <View key={row.label} style={styles.verticalBarColumn}>
              <Text style={styles.legendValue}>
                {parseFloat(row.value.toFixed(2))}%
              </Text>
              <AnimatedVerticalBar
                value={row.value}
                color={colorFor(row.label, SIGNAL_COLORS, colors)}
              />
              <Text style={styles.legendLabel}>{row.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ContainerAnimated>
  );
}

function OperatorBarChart({ data = DEFAULT_OPERATOR_DATA }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const fullData = withAllOperatorLabels(data);

  return (
    <ContainerAnimated dataChanged={JSON.stringify(fullData)}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Opérateur</Text>
        {fullData.map((row) => (
          <View key={row.label} style={styles.barRow}>
            <View style={styles.barTop}>
              <Text style={styles.legendLabel}>{row.label}</Text>
              <Text style={styles.legendValue}>
                {parseFloat(row.value.toFixed(2))}%
              </Text>
            </View>
            <AnimatedProgressBar
              value={row.value}
              color={colorFor(row.label, OPERATOR_COLORS, colors)}
            />
          </View>
        ))}
      </View>
    </ContainerAnimated>
  );
}

function ElectricityDonut({ data = DEFAULT_ELECTRICITY_DATA }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const fullData = withAllElectricityLabels(data);

  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useRef(new Animated.Value(0)).current;
  const [drawProgress, setDrawProgress] = useState(0);

  useEffect(() => {
    progress.setValue(0);
    const listenerId = progress.addListener(({ value }) => setDrawProgress(value));
    Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(listenerId);
  }, [JSON.stringify(fullData)]);

  let cumulative = 0;

  return (
    <ContainerAnimated dataChanged={JSON.stringify(fullData)}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Électricité</Text>
        <View style={styles.donutRow}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {fullData.map((slice) => {
              const fullSegment = (slice.value / 100) * circumference;
              const animatedSegment = fullSegment * drawProgress;
              const dashArray = `${animatedSegment} ${circumference - animatedSegment}`;
              const dashOffset = -((cumulative / 100) * circumference);
              cumulative += slice.value;
              const color = colorFor(slice.label, ELECTRICITY_COLORS, colors);

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
            {fullData.map((slice) => (
              <View key={slice.label} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colorFor(slice.label, ELECTRICITY_COLORS, colors) },
                  ]}
                />
                <Text style={styles.legendLabel}>{slice.label}</Text>
                <Text style={styles.legendValue}>
                  {parseFloat(slice.value.toFixed(2))}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ContainerAnimated>
  );
}

// --- DropDown principal ---

export function DropDown() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const [openArea, setOpenArea] = useState(false);
  const [selectedArea, setSelectedArea] = useState('Tout');
  const [totalPylones, setTotalPylones] = useState<number | null>(null);

  const [openPlace, setOpenPlace] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('Tout');

  const [activeTab, setActiveTab] = useState('signal');
  const [showStats, setShowStats] = useState(false);

  const [area] = useState(DEFAULT_AREAS);
  const [placeNames, setPlaceNames] = useState<string[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placeSearch, setPlaceSearch] = useState('');

  const [signalData, setSignalData] = useState(DEFAULT_SIGNAL_DATA);
  const [operatorData, setOperatorData] = useState(DEFAULT_OPERATOR_DATA);
  const [electricityData, setElectricityData] = useState(DEFAULT_ELECTRICITY_DATA);
  const [placesError, setPlacesError] = useState<string | null>(null);

  const [nationalCoverage, setNationalCoverage] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        let signal, operator, electricity, total;

        if (!selectedPlace || selectedPlace === 'Tout') {
          ({ signal, operator, electricity, total } = await fetchStatsGlobal());
        } else {
          const codecomList = await resolveCodecomList(selectedArea, selectedPlace);
          ({ signal, operator, electricity, total } = await fetchStatsForZone(codecomList));
        }

        if (cancelled) return;

        setSignalData(signal.length > 0 ? signal : DEFAULT_SIGNAL_DATA);
        setOperatorData(operator.length > 0 ? operator : DEFAULT_OPERATOR_DATA);
        setElectricityData(electricity.length > 0 ? electricity : DEFAULT_ELECTRICITY_DATA);
        setTotalPylones(total ?? 0);
      } catch (err: any) {
        console.error('Erreur stats pylone:', err?.message);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [selectedArea, selectedPlace]);

  useEffect(() => {
    let cancelled = false;

    async function loadNationalCoverage() {
      try {
        const { signal } = await fetchStatsGlobal();
        if (cancelled || signal.length === 0) return;
        const moyenne = signal.reduce((sum, s) => sum + s.value, 0) / signal.length;
        setNationalCoverage(moyenne);
      } catch (err: any) {
        console.error('Erreur couverture nationale:', err?.message);
      }
    }

    loadNationalCoverage();
    return () => {
      cancelled = true;
    };
  }, []);

  function openStats(tabId: string) {
    setActiveTab(tabId);
    setShowStats(true);
  }

  async function handleAreaSelect(option: string) {
    setSelectedArea(option);
    setOpenArea(false);
    setPlacesError(null);
    setPlaceSearch('');

    if (!AREA_TABLE_MAP[option]) {
      setPlaceNames([]);
      setSelectedPlace('Tout');
      return;
    }

    setLoadingPlaces(true);
    try {
      const names = await fetchPlaceNames(option);
      setPlaceNames(names);
      setSelectedPlace(names[0] ?? 'Tout');
    } catch (err: any) {
      console.error('Erreur Supabase:', err?.message);
      const fallback = FALLBACK_PLACES_BY_AREA[option] ?? [];
      setPlaceNames(fallback);
      setSelectedPlace(fallback[0] ?? 'Tout');
      setPlacesError('Connexion au serveur échouée');
    } finally {
      setLoadingPlaces(false);
    }
  }

  const filteredPlaceNames = placeNames.filter((option) =>
    option.toLowerCase().includes(placeSearch.toLowerCase()),
  );

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
            <Text style={styles.buttonText}>{selectedArea}</Text>
            <FontAwesome
              name={openArea ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textDark}
            />
          </Pressable>

          {openArea && (
            <View style={styles.list}>
              {area.map((option) => (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionHovered,
                  ]}
                  onPress={() => handleAreaSelect(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.dropdownWrapper}>
          <Pressable style={styles.button} onPress={() => setOpenPlace(!openPlace)}>
            <Text style={styles.buttonText}>{selectedPlace}</Text>
            <FontAwesome
              name={openPlace ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textDark}
            />
          </Pressable>

          {openPlace && (
            <View style={styles.list}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor={colors.placeholder}
                value={placeSearch}
                onChangeText={setPlaceSearch}
                autoFocus
              />

              {loadingPlaces ? (
                <Text style={styles.optionText}>Chargement...</Text>
              ) : (
                <ScrollView
                  style={styles.suggestionsScroll}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredPlaceNames.length === 0 ? (
                    <Text style={styles.optionText}>Aucun résultat</Text>
                  ) : (
                    filteredPlaceNames.map((option) => (
                      <Pressable
                        key={option}
                        style={({ pressed }) => [
                          styles.option,
                          pressed && styles.optionHovered,
                        ]}
                        onPress={() => {
                          setSelectedPlace(option);
                          setOpenPlace(false);
                          setPlaceSearch('');
                        }}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>

      {placesError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{placesError}</Text>
        </View>
      )}

      <View style={styles.bottomStat}>
        <Text style={styles.bottomStatLabel}>Couverture réseau de Madagascar</Text>
        <Text style={styles.bottomStatValue}>
          {nationalCoverage !== null
            ? `${parseFloat(nationalCoverage.toFixed(1))} %`
            : ' ... '}
        </Text>
      </View>

      {showStats && (
        <ScrollView
          style={styles.statsPanel}
          contentContainerStyle={styles.statsPanelContent}
        >
          {activeTab === 'signal' && <SignalBarChart data={signalData} />}
          {activeTab === 'electricity' && <ElectricityDonut data={electricityData} />}
          {activeTab === 'operator' && <OperatorBarChart data={operatorData} />}
          {totalPylones !== null && (
            <Text style={styles.totalPylonesText}>
              {totalPylones} pylone{totalPylones > 1 ? 's' : ''} recensé
              {totalPylones > 1 ? 's' : ''}
              {selectedPlace && selectedPlace !== 'Tout'
                ? ` à ${selectedPlace}`
                : ' au total'}
            </Text>
          )}
        </ScrollView>
      )}

      <View style={styles.threeButtonRow}>
        <Pressable style={styles.threeButton} onPress={() => openStats('signal')}>
          <Ionicons name="cellular" size={40} color={colors.textDark} />
        </Pressable>
        <Pressable style={styles.threeButton} onPress={() => openStats('electricity')}>
          <Ionicons name="flash" size={40} color={colors.textDark} />
        </Pressable>
        <Pressable style={styles.threeButton} onPress={() => openStats('operator')}>
          <Ionicons name="business" size={40} color={colors.textDark} />
        </Pressable>
      </View>
    </>
  );
}

export default function StatsScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <DropDown />
        <BottomNavigation activeTab="stats" />
      </SafeAreaView>
    </View>
  );
}

// --- Styles dépendants du thème ---

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: c.background,
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
      backgroundColor: c.overlay,
    },

    button: {
      flexDirection: 'row',
      position: 'absolute',
      borderRadius: 32,
      backgroundColor: c.cardBg,
      padding: 12,
      paddingLeft: 30,
      paddingRight: 20,
      top: 20,
      left: 10,
      right: 10,
      gap: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    buttonText: { color: c.textDark },

    list: {
      flexDirection: 'column',
      position: 'absolute',
      borderRadius: 32,
      backgroundColor: c.cardBg,
      padding: 12,
      paddingLeft: 30,
      paddingRight: 20,
      top: 20,
      left: 10,
      right: 10,
      gap: 20,
      zIndex: 20,
      elevation: 6,
    },

    optionHovered: {
      backgroundColor: c.cardBgAlt,
      borderRadius: 10,
      paddingLeft: 10,
      padding: 5,
    },

    option: {
      backgroundColor: c.cardBg,
    },

    optionText: { color: c.textDark },

    bottomStat: {
      position: 'absolute',
      backgroundColor: c.primaryDark,
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
      color: c.textLight,
      flex: 1,
      paddingLeft: 10,
      textAlign: 'center',
    },

    bottomStatValue: {
      fontSize: 40,
      color: c.textLight,
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
      backgroundColor: c.cardBg,
      padding: 10,
      borderRadius: 40,
    },

    chartCard: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      padding: 16,
      gap: 35,
    },

    donutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },

    legend: { flex: 1, gap: 8 },

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
      color: c.textDark,
    },

    legendValue: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textDark,
    },

    barRow: { gap: 6 },

    barTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    barTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: c.cardBgAlt,
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
      color: c.textDark,
      marginBottom: 4,
      textAlign: 'center',
    },

    searchInput: {
      backgroundColor: c.cardBgAlt,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 13,
      marginBottom: 8,
      color: c.textDark,
    },

    suggestionsScroll: {
      maxHeight: 200,
    },

    errorBanner: {
      marginHorizontal: 20,
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: c.dangerBg,
    },

    errorBannerText: {
      fontSize: 12,
      color: c.dangerText,
      textAlign: 'center',
    },

    verticalBarsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 160,
    },

    verticalBarColumn: {
      alignItems: 'center',
      gap: 6,
      height: '100%',
      justifyContent: 'flex-end',
    },

    verticalBarTrack: {
      width: 28,
      height: 100,
      borderRadius: 6,
      backgroundColor: c.cardBgAlt,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },

    verticalBarFill: {
      width: '100%',
      borderRadius: 6,
    },

    totalPylonesText: {
      fontSize: 13,
      color: c.textDark,
      textAlign: 'center',
      marginTop: 12,
      fontWeight: '500',
    },
  });
}