import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Connexion Supabase
// ============================================================================
const supabaseUrl = 'http://192.168.11.65:8000';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg5MjA5NzE4LCJleHAiOjIxMDQ1Njk3MTh9.8TqQreyifHorvHUkk6qdWM_GixbdXcmnvjcSt4UBkeI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Types partages avec le front
// ============================================================================
export type StatDatum = { label: string; value: number };

export type ZoneStats = {
  signal: StatDatum[];
  operator: StatDatum[];
  electricity: StatDatum[];
  total: number;
};

// ============================================================================
// Referentiels de zones (tables Supabase + valeurs de secours)
// ============================================================================
export const AREA_TABLE_MAP: Record<string, string> = {
  Province: 'referentiel_province',
  Region: 'referentiel_region',
  Commune: 'referentiel_commune',
  District: 'referentiel_district',
  Fokontany: 'referentiel_fokontany',
};

// valeurs de secours si Supabase est injoignable ou si la table n'existe pas
export const FALLBACK_PLACES_BY_AREA: Record<string, string[]> = {
  Province: ['ANTANANARIVO', 'ANTSIRANANA', 'FIANARANTSOA', 'MAHAJANGA', 'TOAMASINA', 'TOLIARA'],
  Region: ['ANALAMANGA', 'BONGOLAVA', 'ITASY'],
  Commune: ['Antananarivo I', 'Antananarivo II'],
  District: ['Atsimondrano', 'Avaradrano'],
  Fokontany: ['Ambohijatovo', 'Analakely'],
};

/**
 * Renvoie la liste des noms de lieux (dedupliques, tries) pour un type de
 * zone donne (Province / Region / Commune / District / Fokontany).
 * Leve une erreur si Supabase est injoignable — c'est au front de decider
 * quoi afficher dans ce cas (ex: FALLBACK_PLACES_BY_AREA).
 */
export async function fetchPlaceNames(area: string): Promise<string[]> {
  const table = AREA_TABLE_MAP[area];
  if (!table) return [];

  const { data, error } = await supabase
    .from(table)
    .select('nom')
    .order('nom', { ascending: true });

  if (error) throw error;

  // dedoublonnage des noms (plusieurs lignes peuvent partager le meme nom)
  return [...new Set(data.map((row) => row.nom))];
}

// ============================================================================
// Resolution hierarchique zone -> liste de codecom
// (Province -> Region -> District -> Commune)
// ============================================================================
async function districtsToCodecom(codedistList: string[]): Promise<string[]> {
  if (codedistList.length === 0) return [];
  const { data, error } = await supabase
    .from('referentiel_commune')
    .select('codecom')
    .in('codedist', codedistList);
  if (error) throw error;
  return data.map((row) => row.codecom);
}

async function regionsToCodecom(coderegList: string[]): Promise<string[]> {
  if (coderegList.length === 0) return [];
  const { data, error } = await supabase
    .from('referentiel_district')
    .select('codedist')
    .in('codereg', coderegList);
  if (error) throw error;
  return districtsToCodecom(data.map((row) => row.codedist));
}

async function provincesToCodecom(codeProvinceList: string[]): Promise<string[]> {
  if (codeProvinceList.length === 0) return [];
  const { data, error } = await supabase
    .from('referentiel_region')
    .select('codereg')
    .in('code_province', codeProvinceList);
  if (error) throw error;
  return regionsToCodecom(data.map((row) => row.codereg));
}

/**
 * Convertit une zone selectionnee (ex: area="District", placeNom="Atsimondrano")
 * en liste de codecom, la seule cle que comprend la table infrastructure_pylone.
 */
export async function resolveCodecomList(area: string, placeNom: string): Promise<string[]> {
  if (area === 'Province') {
    const { data, error } = await supabase
      .from('referentiel_province')
      .select('code_province')
      .eq('nom', placeNom);
    if (error) throw error;
    return provincesToCodecom(data.map((row) => row.code_province));
  }

  if (area === 'Region') {
    const { data, error } = await supabase
      .from('referentiel_region')
      .select('codereg')
      .eq('nom', placeNom);
    if (error) throw error;
    return regionsToCodecom(data.map((row) => row.codereg));
  }

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

  // area === 'Tout' : cherche dans les 5 tables, combine et deduplique
  const [provinceRes, regionRes, communeRes, districtRes, fokontanyRes] = await Promise.all([
    supabase.from('referentiel_province').select('code_province').eq('nom', placeNom),
    supabase.from('referentiel_region').select('codereg').eq('nom', placeNom),
    supabase.from('referentiel_commune').select('codecom').eq('nom', placeNom),
    supabase.from('referentiel_district').select('codedist').eq('nom', placeNom),
    supabase.from('referentiel_fokontany').select('codecom').eq('nom', placeNom),
  ]);

  if (provinceRes.error) throw provinceRes.error;
  if (regionRes.error) throw regionRes.error;
  if (communeRes.error) throw communeRes.error;
  if (districtRes.error) throw districtRes.error;
  if (fokontanyRes.error) throw fokontanyRes.error;

  const [codecomFromProvince, codecomFromRegion] = await Promise.all([
    provincesToCodecom(provinceRes.data.map((row) => row.code_province)),
    regionsToCodecom(regionRes.data.map((row) => row.codereg)),
  ]);
  const codecomFromCommune = communeRes.data.map((row) => row.codecom);
  const codecomFromFokontany = fokontanyRes.data.map((row) => row.codecom);

  let codecomFromDistrict: string[] = [];
  if (districtRes.data.length > 0) {
    const codedistList = districtRes.data.map((row) => row.codedist);
    const { data: communesOfDistrict, error } = await supabase
      .from('referentiel_commune')
      .select('codecom')
      .in('codedist', codedistList);
    if (error) throw error;
    codecomFromDistrict = communesOfDistrict.map((row) => row.codecom);
  }

  return [
    ...new Set([
      ...codecomFromProvince,
      ...codecomFromRegion,
      ...codecomFromCommune,
      ...codecomFromDistrict,
      ...codecomFromFokontany,
    ]),
  ];
}

// ============================================================================
// Calcul des statistiques a partir des lignes brutes de infrastructure_pylone
// ============================================================================
function classifyEnergie(sourceEnergie: string | null): string {
  if (!sourceEnergie) return 'Non renseigne / Autre';
  if (sourceEnergie === 'ENERGIE SOLAIRE' || sourceEnergie === 'ENERGIE SOLAIRE + EOLIENE') return 'Solaire';
  if (sourceEnergie === 'JIRAMA') return 'Secteur (JIRAMA)';
  if (['GE', 'GE PROVISOIRE', 'SOLDIÈSE', 'SOLDIES'].includes(sourceEnergie)) return 'Groupe electrogene';
  if (sourceEnergie === 'MIXTE' || sourceEnergie.includes('+')) return 'Mixte';
  return 'Non renseigne / Autre';
}

const OPERATOR_LABELS: Record<string, string> = {
  TELMA: 'Telma',
  ORANGE: 'Orange',
  AIRTEL: 'Airtel',
  GULFSAT: 'Gulfsat',
};

// factorise le calcul des 3 series a partir des lignes brutes
function computeStats(rows: any[]): ZoneStats {
  const total = rows.length;
  if (total === 0) {
    return { signal: [], operator: [], electricity: [], total: 0 };
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
  const operatorCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const key = r.code_operateur;
    operatorCounts[key] = (operatorCounts[key] ?? 0) + 1;
  });
  const operator = Object.entries(operatorCounts).map(([code, count]) => ({
    label: OPERATOR_LABELS[code] ?? code,
    value: (count / total) * 100,
  }));

  // electricite : 5 categories (somme a 100)
  const electricityCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const categorie = classifyEnergie(r.source_energie);
    electricityCounts[categorie] = (electricityCounts[categorie] ?? 0) + 1;
  });
  const electricity = Object.entries(electricityCounts).map(([label, count]) => ({
    label,
    value: (count / total) * 100,
  }));

  const totalPercent = electricity.reduce((sum, e) => sum + e.value, 0);
  if (Math.abs(totalPercent - 100) > 0.5) {
    console.warn(
      `Electricite: total = ${totalPercent.toFixed(2)}% (attendu ~100%) — verifie les libelles de classifyEnergie`
    );
  }

  return { signal, operator, electricity, total };
}

/** Statistiques pour une liste de codecom (une zone precise). */
export async function fetchStatsForZone(codecomList: string[]): Promise<ZoneStats> {
  if (codecomList.length === 0) {
    return { signal: [], operator: [], electricity: [], total: 0 };
  }

  const { data: rows, error } = await supabase
    .from('infrastructure_pylone')
    .select('code_operateur, tech_2g, tech_3g, tech_4g, tech_5g, source_energie')
    .in('codecom', codecomList);

  if (error) throw error;
  return computeStats(rows);
}

/** Meme calcul mais sans filtre : tout Madagascar. */
export async function fetchStatsGlobal(): Promise<ZoneStats> {
  const { data: rows, error } = await supabase
    .from('infrastructure_pylone')
    .select('code_operateur, tech_2g, tech_3g, tech_4g, tech_5g, source_energie');

  if (error) throw error;
  return computeStats(rows);
}
