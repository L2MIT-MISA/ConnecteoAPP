import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useState } from 'react';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/bottom-navigation';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type NetworkStatus = 'Actif' | 'Inactif';

interface NetworkNode {
  id: string;
  name: string;
  image: string;
  distance: string;
  mode: 'Fixe' | 'Mobile';
  signalLabel?: string;
  signalStrength?: number;
  hasLora?: boolean;
  activityLevels?: number[];
  hasBattery?: boolean;
  batteryLevel?: number;
  batteryWarning?: string;
  status: NetworkStatus;
}

const NETWORK_NODES: NetworkNode[] = [
  {
    id: '1',
    name: 'Pylône Nord',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200',
    distance: '1.2 km',
    mode: 'Fixe',
    signalLabel: 'Fort',
    signalStrength: 5,
    status: 'Actif',
  },
  {
    id: '2',
    name: 'Relais R. Andria',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200',
    distance: '400 m',
    mode: 'Mobile',
    hasLora: true,
    activityLevels: [2, 4, 3, 5, 2, 4],
    status: 'Actif',
  },
  {
    id: '3',
    name: 'Pylône Est',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200',
    distance: '3.1 km',
    mode: 'Fixe',
    signalLabel: 'Moyen',
    signalStrength: 3,
    status: 'Actif',
  },
  {
    id: '4',
    name: 'Relais H. Rasoa',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200',
    distance: '860 m',
    mode: 'Mobile',
    hasLora: true,
    hasBattery: true,
    batteryLevel: 85,
    batteryWarning: 'Ajustement Lora',
    status: 'Actif',
  },
];

function SignalBars({ strength = 0 }: { strength?: number }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.signalBars}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <View
          key={bar}
          style={[
            styles.signalBar,
            { height: 4 + bar * 2 },
            bar <= strength
              ? styles.signalBarActive
              : styles.signalBarInactive,
          ]}
        />
      ))}
    </View>
  );
}

function ActivityBars({ levels = [] }: { levels?: number[] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.signalBars}>
      {levels.map((level, index) => (
        <View
          key={index}
          style={[
            styles.signalBar,
            { height: 4 + level * 2 },
            styles.signalBarActive,
          ]}
        />
      ))}
    </View>
  );
}

function CoverageDonut({
  active,
  total,
}: {
  active: number;
  total: number;
}) {
  const styles = useThemedStyles(createStyles);
  const percentage = total > 0 ? active / total : 0;

  return (
    <View style={styles.donutWrapper}>
      <View style={styles.donutOuter}>
        <View style={styles.donutInner}>
          <Text style={styles.donutValue}>{active}</Text>
          <Text style={styles.donutLabel}>COUVERTURE</Text>
          <Text style={styles.donutTotal}>Total {total}</Text>
        </View>
      </View>

      <Text style={styles.donutPercentage}>
        {Math.round(percentage * 100)}%
      </Text>
    </View>
  );
}

function NetworkCard({ node }: { node: NetworkNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <Image source={{ uri: node.image }} style={styles.cardImage} />

      <Text style={styles.cardTitle}>{node.name}</Text>

      <Text style={styles.cardDistance}>
        {node.distance} ({node.mode})
      </Text>

      {node.mode === 'Fixe' ? (
        <View style={styles.routeRow}>
          <Ionicons
            name="location-outline"
            size={16}
            style={styles.iconPrimaryDark}
          />

          <Ionicons
            name="arrow-forward"
            size={16}
            style={styles.iconPrimaryDark}
          />

          <MaterialCommunityIcons
            name="antenna"
            size={18}
            style={styles.iconPrimaryDark}
          />

          <Text style={styles.routeLabel}>FIXE</Text>
        </View>
      ) : (
        <View style={styles.loraRow}>
          <Ionicons name="wifi" size={16} style={styles.iconPrimaryDark} />

          <Text style={styles.loraLabel}>LORA</Text>

          <Ionicons
            name="sunny-outline"
            size={18}
            style={[styles.solarIcon, styles.iconPrimary]}
          />
        </View>
      )}

      {node.signalLabel && (
        <View style={styles.signalRow}>
          <SignalBars strength={node.signalStrength} />

          <Text style={styles.signalLabel}>
            {node.signalLabel} ({node.signalStrength}/5)
          </Text>
        </View>
      )}

      {node.activityLevels && (
        <View style={styles.signalRow}>
          <Text style={styles.activityLabel}>Activité:</Text>

          <ActivityBars levels={node.activityLevels} />
        </View>
      )}

      {node.hasBattery && (
        <View style={styles.batteryRow}>
          <Ionicons
            name="alert-circle"
            size={14}
            style={styles.iconDanger}
          />

          <Text style={styles.batteryLabel}>
            Batterie: {node.batteryLevel}%
          </Text>

          <Ionicons
            name="battery-half-outline"
            size={16}
            style={styles.iconTextDark}
          />
        </View>
      )}

      {node.batteryWarning && (
        <Text style={styles.warningLabel}>
          {node.batteryWarning}
        </Text>
      )}

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            node.status === 'Actif'
              ? styles.statusDotActive
              : styles.statusDotInactive,
          ]}
        />

        <Text style={styles.statusLabel}>{node.status}</Text>
      </View>
    </View>
  );
}

export default function NetworkScreen() {
  const styles = useThemedStyles(createStyles);
  const [sortBy, setSortBy] = useState<'Distance' | 'Type'>('Distance');
  const [maxRange, setMaxRange] = useState('3,1');

  const activeCount = NETWORK_NODES.filter(
    (n) => n.status === 'Actif'
  ).length;

  const totalCount = NETWORK_NODES.length;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Réseaux à proximité</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons
                name="chevron-down"
                size={16}
                style={styles.iconTextDark}
              />

              <Text style={styles.filterButtonText}>
                Actualiser la recherche
              </Text>

              <Ionicons
                name="refresh"
                size={16}
                style={styles.iconTextDark}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() =>
                setSortBy(
                  sortBy === 'Distance' ? 'Type' : 'Distance'
                )
              }
            >
              <Ionicons
                name="triangle"
                size={12}
                style={styles.iconTextDark}
              />

              <View>
                <Text style={styles.filterButtonText}>
                  Trier par
                </Text>

                <Text style={styles.filterButtonSubtext}>
                  {sortBy}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              SYNTHÈSE DU RÉSEAU
            </Text>

            <View style={styles.summaryContent}>
              <CoverageDonut
                active={activeCount}
                total={totalCount}
              />

              <View style={styles.summaryStats}>
                <View style={styles.summaryStatRow}>
                  <MaterialCommunityIcons
                    name="speedometer"
                    size={18}
                    style={styles.iconTextDark}
                  />

                  <Text style={styles.summaryStatLabel}>
                    Portée Moyenne:
                  </Text>

                  <Text style={styles.summaryStatValue}>
                    1,8 km
                  </Text>
                </View>

                <View style={styles.summaryStatRow}>
                  <MaterialCommunityIcons
                    name="speedometer-medium"
                    size={18}
                    style={styles.iconTextDark}
                  />

                  <Text style={styles.summaryStatLabel}>
                    Portée Max:
                  </Text>

                  <TextInput
                    style={styles.summaryStatInput}
                    value={maxRange}
                    onChangeText={setMaxRange}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />

                  <Text style={styles.summaryStatValue}>km</Text>

                  <Ionicons
                    name="pencil-outline"
                    size={12}
                    style={styles.iconPrimaryDark}
                  />
                </View>
              </View>
            </View>

            <View style={styles.summaryFooterRow}>
              <Text style={styles.summaryFooterLabel}>
                Activité LoRa
              </Text>

              <MaterialCommunityIcons
                name="chart-bar"
                size={18}
                style={styles.iconTextDark}
              />
            </View>

            <View style={styles.summaryFooterRow}>
              <Text style={styles.summaryFooterLabel}>
                Stabilité Fixe
              </Text>

              <MaterialCommunityIcons
                name="access-point"
                size={18}
                style={styles.iconTextDark}
              />
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    styles.legendDotActive,
                  ]}
                />

                <Text style={styles.legendLabel}>Active</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    styles.legendDotInactive,
                  ]}
                />

                <Text style={styles.legendLabel}>
                  Indisponible
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.grid}>
            {NETWORK_NODES.map((node) => (
              <NetworkCard
                key={node.id}
                node={node}
              />
            ))}
          </View>
        </ScrollView>

        <BottomNavigation activeTab="network" />
      </SafeAreaView>
    </View>
  );
}

const CARD_WIDTH = '48%';

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

  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: c.primary,
    letterSpacing: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: c.cardBg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: c.border,
  },

  filterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textDark,
  },

  filterButtonSubtext: {
    fontSize: 11,
    color: c.primaryDark,
  },

  summaryCard: {
    backgroundColor: c.cardBg,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textDark,
    marginBottom: 12,
  },

  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 8,
    borderColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutInner: {
    alignItems: 'center',
  },

  donutValue: {
    fontSize: 26,
    fontWeight: '700',
    color: c.textDark,
  },

  donutLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: c.textDark,
  },

  donutTotal: {
    fontSize: 10,
    color: c.primaryDark,
  },

  donutPercentage: {
    marginTop: 4,
    fontSize: 11,
    color: c.primaryDark,
  },

  summaryStats: {
    flex: 1,
    gap: 10,
  },

  summaryStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  summaryStatLabel: {
    fontSize: 12,
    color: c.textDark,
    flexShrink: 1,
  },

  summaryStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: c.textDark,
  },

  summaryStatInput: {
    fontSize: 14,
    fontWeight: '700',
    color: c.textDark,
    borderBottomWidth: 1,
    borderBottomColor: c.primary,
    paddingVertical: 0,
    paddingHorizontal: 2,
    minWidth: 32,
  },

  summaryFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  summaryFooterLabel: {
    fontSize: 12,
    color: c.textDark,
    flexShrink: 1,
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendDotActive: {
    backgroundColor: c.primary,
  },

  legendDotInactive: {
    backgroundColor: c.textMuted,
  },

  legendLabel: {
    fontSize: 12,
    color: c.textDark,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: c.cardBg,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },

  cardImage: {
    width: '100%',
    height: 70,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: c.border,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.textDark,
    marginBottom: 4,
  },

  cardDistance: {
    fontSize: 12,
    color: c.primaryDark,
    marginBottom: 8,
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },

  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textDark,
    marginLeft: 4,
  },

  loraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },

  loraLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textDark,
  },

  solarIcon: {
    marginLeft: 'auto',
  },

  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },

  signalBar: {
    width: 3,
    borderRadius: 1.5,
  },

  signalBarActive: {
    backgroundColor: c.primary,
  },

  signalBarInactive: {
    backgroundColor: c.border,
  },

  signalLabel: {
    fontSize: 11,
    color: c.textDark,
  },

  activityLabel: {
    fontSize: 11,
    color: c.textDark,
  },

  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },

  batteryLabel: {
    fontSize: 11,
    color: c.danger,
    fontWeight: '700',
  },

  warningLabel: {
    fontSize: 10,
    color: c.primaryDark,
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusDotActive: {
    backgroundColor: c.primary,
  },

  statusDotInactive: {
    backgroundColor: c.textMuted,
  },

  statusLabel: {
    fontSize: 12,
    color: c.textDark,
    fontWeight: '600',
  },

  // Couleurs d'icônes — ajoutées pour corriger "c is not defined"
  // (les composants n'ont jamais accès à c directement, seulement via ces styles)
  iconPrimary: {
    color: c.primary,
  },

  iconPrimaryDark: {
    color: c.primaryDark,
  },

  iconDanger: {
    color: c.danger,
  },

  iconTextDark: {
    color: c.textDark,
  },
  });
}