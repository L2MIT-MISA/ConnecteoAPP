import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { BottomNavigation } from '../components/bottom-navigation';

const supabaseUrl = 'http://100.103.0.49:8000';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg5MjA5NzE4LCJleHAiOjIxMDQ1Njk3MTh9.8TqQreyifHorvHUkk6qdWM_GixbdXcmnvjcSt4UBkeI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

//format de donnees attendus
const DEFAULT_AREAS = ['Tout', 'Commune', 'District', 'Fokontany'];

// valeurs de secours si Supabase est injoignable ou si la table n'existe pas
const FALLBACK_PLACES_BY_AREA = {
  Commune: ['Antananarivo I', 'Antananarivo II'],
  District: ['Atsimondrano', 'Avaradrano'],
  Fokontany: ['Ambohijatovo', 'Analakely'],
};

const AREA_TABLE_MAP = {
  Commune: 'referentiel_commune',
  District: 'referentiel_district',
  Fokontany: 'referentiel_fokontany',
};

const SIGNAL_COLORS = {
  '4G': '#1a3d27',
  '3G': '#2e6b46',
  '2G': '#7fa78c',
  '5G': '#d98a3d',
};

const OPERATOR_COLORS = {
  Airtel: '#E4002B',   // rouge (identité Airtel)
  Telma: '#F0D122',    // jaune/orange (identité Telma)
  Orange: '#FF6600',   // orange (identité Orange)
  Gulfsat: '#4A6FA5',  // bleu
};

const OPERATOR_LABELS_ORDER = ['Airtel', 'Telma', 'Orange', 'Gulfsat'];

function withAllOperatorLabels(data) {
  const valueByLabel = Object.fromEntries(data.map((d) => [d.label, d.value]));
  return OPERATOR_LABELS_ORDER.map((label) => ({
    label,
    value: valueByLabel[label] ?? 0,
  }));
}

const ELECTRICITY_COLORS = {
  'Secteur (JIRAMA)': '#2E86AB',      // bleu
  Solaire: '#F2B134',                 // jaune/orange
  'Groupe electrogene': '#D7263D',    // rouge
  Mixte: '#6A4C93',                   // violet
  'Non renseigne / Autre': '#8D99AE', // gris
};

const ELECTRICITY_LABELS_ORDER = [
  'Secteur (JIRAMA)',
  'Solaire',
  'Groupe electrogene',
  'Mixte',
  'Non renseigne / Autre',
];

function withAllElectricityLabels(data) {
  const valueByLabel = Object.fromEntries(data.map((d) => [d.label, d.value]));
  return ELECTRICITY_LABELS_ORDER.map((label) => ({
    label,
    value: valueByLabel[label] ?? 0,
  }));
}

const FALLBACK_COLOR = COLORS.subtitle;

function colorFor(label, colorMap) {
  return colorMap[label] || FALLBACK_COLOR;
}

function AnimatedVerticalBar({ value, color }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // on anime "height", pas transform/opacity
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

//affichage de la page de statistique de qualite de signal sous forme de chart en cercle
function SignalBarChart({ data = DEFAULT_SIGNAL_DATA }) {
  return (
    <ContainerAnimated dataChanged={JSON.stringify(data)}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Qualite de signal</Text>
        <View style={styles.verticalBarsRow}>
          {data.map((row) => (
            <View key={row.label} style={styles.verticalBarColumn}>
              <Text style={styles.legendValue}>{parseFloat(row.value.toFixed(2))}%</Text>
              <AnimatedVerticalBar value={row.value} color={colorFor(row.label, SIGNAL_COLORS)} />
              <Text style={styles.legendLabel}>{row.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ContainerAnimated>
  );
}

//affichage des stats d operateurs
function OperatorBarChart({ data = DEFAULT_OPERATOR_DATA }) {
  const fullData = withAllOperatorLabels(data);

  return (
    <ContainerAnimated dataChanged={JSON.stringify(fullData)}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Operateur</Text>
        {fullData.map((row) => (
          <View key={row.label} style={styles.barRow}>
            <View style={styles.barTop}>
              <Text style={styles.legendLabel}>{row.label}</Text>
              <Text style={styles.legendValue}>{parseFloat(row.value.toFixed(2))}%</Text>
            </View>
            <AnimatedProgressBar
              value={row.value}
              color={colorFor(row.label, OPERATOR_COLORS)}
            />
          </View>
        ))}
      </View>
    </ContainerAnimated>
  );
}

//affichage de stats d electricite
function ElectricityDonut({ data = DEFAULT_ELECTRICITY_DATA }) {
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
        <Text style={styles.chartTitle}>Electricite</Text>
        <View style={styles.donutRow}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {fullData.map((slice) => {
              const fullSegment = (slice.value / 100) * circumference;
              const animatedSegment = fullSegment * drawProgress;
              const dashArray = `${animatedSegment} ${circumference - animatedSegment}`;
              const dashOffset = -((cumulative / 100) * circumference);
              cumulative += slice.value;
              const color = colorFor(slice.label, ELECTRICITY_COLORS);

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
                <View style={[styles.legendDot, { backgroundColor: colorFor(slice.label, ELECTRICITY_COLORS) }]} />
                <Text style={styles.legendLabel}>{slice.label}</Text>
                <Text style={styles.legendValue}>{parseFloat(slice.value.toFixed(2))}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ContainerAnimated>
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
  const [placeNames, setPlaceNames] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placeSearch, setPlaceSearch] = useState('');

  const [signalData, setSignalData] = useState(DEFAULT_SIGNAL_DATA);
  const [operatorData, setOperatorData] = useState(DEFAULT_OPERATOR_DATA);
  const [electricityData, setElectricityData] = useState(DEFAULT_ELECTRICITY_DATA);

  // message affiche quand la connexion a Supabase echoue (null = pas d'erreur)
  const [placesError, setPlacesError] = useState(null);

  useEffect(() => {
  if (!selectedPlace || selectedPlace === 'Tout') return;

  let cancelled = false;

  async function loadStats() {
    try {
      const codecomList = await resolveCodecomList(selectedArea, selectedPlace);
      const { signal, operator, electricity } = await fetchStatsForZone(codecomList);
      if (cancelled) return;

      setSignalData(signal.length > 0 ? signal : DEFAULT_SIGNAL_DATA);
      setOperatorData(operator.length > 0 ? operator : DEFAULT_OPERATOR_DATA);
      setElectricityData(electricity.length > 0 ? electricity : DEFAULT_ELECTRICITY_DATA);
    } catch (err) {
      console.error('Erreur stats pylone:', err.message);
    }
  }

  loadStats();
  return () => { cancelled = true; };
}, [selectedArea, selectedPlace]);

  function openStats(tabId) {
    setActiveTab(tabId);
    setShowStats(true);
  }

  // appelee au clic sur une option du premier dropdown (Commune / District / Fokontany)
  // va chercher id + nom dans la table Supabase correspondante
  // si la requete echoue, on retombe sur des valeurs statiques par defaut
  async function handleAreaSelect(option) {
    setSelectedArea(option);
    setOpenArea(false);
    setPlacesError(null);
    setPlaceSearch('');

    const table = AREA_TABLE_MAP[option];
    if (!table) {
      // cas "Tout" : pas de table associee
      setPlaceNames([]);
      setSelectedPlace('Tout');
      return;
    }

    setLoadingPlaces(true);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('nom')
        .order('nom', { ascending: true });

      if (error) {
        throw error;
      }
      console.log('Nombre de resultats:', data.length);
      // dedoublonnage des noms (plusieurs lignes peuvent partager le meme nom)
      const names = [...new Set(data.map((row) => row.nom))];
      setPlaceNames(names);
      setSelectedPlace(names[0] ?? 'Tout');
    } catch (err) {
      console.error('Erreur Supabase:', err.message);
      const fallback = FALLBACK_PLACES_BY_AREA[option] ?? [];
      setPlaceNames(fallback);
      setSelectedPlace(fallback[0] ?? 'Tout');
      setPlacesError('Connexion au serveur echouee');
    } finally {
      setLoadingPlaces(false);
    }
  }

  const filteredPlaceNames = placeNames.filter((option) =>
    option.toLowerCase().includes(placeSearch.toLowerCase())
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
            <Text>{selectedArea}</Text>
            <FontAwesome name={openArea ? 'chevron-up' : 'chevron-down'} size={14} color="black" />
          </Pressable>

          {openArea && (
            <View style={styles.list}>
              {area.map((option) => (
                <Pressable
                  key={option}
                  style={({ hovered, pressed }) => [styles.option, (hovered || pressed) && styles.optionHovered]}
                  onPress={() => handleAreaSelect(option)
                    
                  }
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
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={placeSearch}
                onChangeText={setPlaceSearch}
                autoFocus
              />

              {loadingPlaces ? (
                <Text style={styles.option}>Chargement...</Text>
              ) : (
                <ScrollView
                  style={styles.suggestionsScroll}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredPlaceNames.length === 0 ? (
                    <Text style={styles.option}>Aucun resultat</Text>
                  ) : (
                    filteredPlaceNames.map((option) => (
                      <Pressable
                        key={option}
                        style={({ hovered, pressed }) => [
                          styles.option,
                          (hovered || pressed) && styles.optionHovered,
                        ]}
                        onPress={() => {
                          setSelectedPlace(option);
                          setOpenPlace(false);
                          setPlaceSearch('');
                        }}
                      >
                        <Text>{option}</Text>
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
        <Text style={styles.bottomStatValue}> 80 %</Text>
      </View>

      {showStats && (
        <ScrollView style={styles.statsPanel} contentContainerStyle={styles.statsPanelContent}>
          {activeTab === 'signal' && <SignalBarChart data={signalData} />}
          {activeTab === 'electricity' && <ElectricityDonut data={electricityData} />}
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

async function resolveCodecomList(area, placeNom) {
  if (area === 'Commune') {
    const { data, error } = await supabase
      .from('referentiel_commune')
      .select('codecom')
      .eq('nom', placeNom);
    if (error) throw error;
    return data.map((row) => row.codecom);
  }

  if (area === 'District') {
    const { data: districts, error: errDist } = await supabase
      .from('referentiel_district')
      .select('codedist')
      .eq('nom', placeNom);
    if (errDist) throw errDist;
    const codedistList = districts.map((row) => row.codedist);

    const { data: communes, error: errCom } = await supabase
      .from('referentiel_commune')
      .select('codecom')
      .in('codedist', codedistList);
    if (errCom) throw errCom;
    return communes.map((row) => row.codecom);
  }

  if (area === 'Fokontany') {
    const { data, error } = await supabase
      .from('referentiel_fokontany')
      .select('codecom')
      .eq('nom', placeNom);
    if (error) throw error;
    return data.map((row) => row.codecom);
  }

  // area === 'Tout' : cherche dans les 3 tables, combine et deduplique
  const [communeRes, districtRes, fokontanyRes] = await Promise.all([
    supabase.from('referentiel_commune').select('codecom').eq('nom', placeNom),
    supabase.from('referentiel_district').select('codedist').eq('nom', placeNom),
    supabase.from('referentiel_fokontany').select('codecom').eq('nom', placeNom),
  ]);

  if (communeRes.error) throw communeRes.error;
  if (districtRes.error) throw districtRes.error;
  if (fokontanyRes.error) throw fokontanyRes.error;

  const codecomFromCommune = communeRes.data.map((row) => row.codecom);
  const codecomFromFokontany = fokontanyRes.data.map((row) => row.codecom);

  let codecomFromDistrict = [];
  if (districtRes.data.length > 0) {
    const codedistList = districtRes.data.map((row) => row.codedist);
    const { data: communesOfDistrict, error } = await supabase
      .from('referentiel_commune')
      .select('codecom')
      .in('codedist', codedistList);
    if (error) throw error;
    codecomFromDistrict = communesOfDistrict.map((row) => row.codecom);
  }

  return [...new Set([...codecomFromCommune, ...codecomFromDistrict, ...codecomFromFokontany])];
}

function classifyEnergie(sourceEnergie) {
  if (!sourceEnergie) return 'Non renseigne / Autre';
  if (sourceEnergie === 'ENERGIE SOLAIRE' || sourceEnergie === 'ENERGIE SOLAIRE + EOLIENE') return 'Solaire';
  if (sourceEnergie === 'JIRAMA') return 'Secteur (JIRAMA)';
  if (['GE', 'GE PROVISOIRE', 'SOLDIÈSE', 'SOLDIES'].includes(sourceEnergie)) return 'Groupe electrogene';
  if (sourceEnergie === 'MIXTE' || sourceEnergie.includes('+')) return 'Mixte';
  return 'Non renseigne / Autre';
}

const OPERATOR_LABELS = {
  TELMA: 'Telma',
  ORANGE: 'Orange',
  AIRTEL: 'Airtel',
  GULFSAT: 'Gulfsat',
};

async function fetchStatsForZone(codecomList) {
  if (codecomList.length === 0) {
    return { signal: [], operator: [], electricity: [] };
  }

  const { data: rows, error } = await supabase
    .from('infrastructure_pylone')
    .select('code_operateur, tech_2g, tech_3g, tech_4g, tech_5g, source_energie')
    .in('codecom', codecomList);

  if (error) throw error;

  const total = rows.length;
  if (total === 0) {
    return { signal: [], operator: [], electricity: [] };
  }

  // signal : taux de couverture par techno (independants, ne somment pas a 100)
  const nb2g = rows.filter((r) => r.tech_2g === 't').length;
  const nb3g = rows.filter((r) => r.tech_3g === 't').length;
  const nb4g = rows.filter((r) => r.tech_4g === 't').length;
  const nb5g = rows.filter((r) => r.tech_5g === 't').length;
  const signal = [
    { label: '2G', value: (nb2g / total) * 100 },
    { label: '3G', value: (nb3g / total) * 100 },
    { label: '4G', value: (nb4g / total) * 100 },
    { label: '5G', value: (nb5g / total) * 100 },
  ];

  // operateur : repartition exclusive (somme a 100)
  const operatorCounts = {};
  rows.forEach((r) => {
    const key = r.code_operateur;
    operatorCounts[key] = (operatorCounts[key] ?? 0) + 1;
  });
  const operator = Object.entries(operatorCounts).map(([code, count]) => ({
    label: OPERATOR_LABELS[code] ?? code,
    value: (count / total) * 100,
  }));

  // electricite : 5 categories (somme a 100)
  const electricityCounts = {};
  rows.forEach((r) => {
    const categorie = classifyEnergie(r.source_energie);
    electricityCounts[categorie] = (electricityCounts[categorie] ?? 0) + 1;
  });
  const electricity = Object.entries(electricityCounts).map(([label, count]) => ({
    label,
    value: (count / total) * 100,
  }));

  return { signal, operator, electricity };
}

function ContainerAnimated({ children, dataChanged }) 
{
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  }, [dataChanged]);

  return (
    <Animated.View style={{opacity}}>
      {children}
    </Animated.View>
  );
}

function AnimatedProgressBar({ value, color }) 
{
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
        style={[styles.barFill,
          {
            width,
            backgroundColor: color,
          },
        ]}
      />
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

  searchInput: {
    backgroundColor: '#F2F0EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
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
    backgroundColor: '#F4D9CE',
  },

  errorBannerText: {
    fontSize: 12,
    color: '#8A3B1E',
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
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  verticalBarFill: {
    width: '100%',
    borderRadius: 6,
  },
});