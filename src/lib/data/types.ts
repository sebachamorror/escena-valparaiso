/**
 * Tipos de las entidades de QUINTA ESCENA.
 * Espejo de data/schemas/*.schema.json. Los slugs referencian otras entidades.
 */

export type SourceType =
  | "oficial" | "institucional" | "prensa" | "academico" | "red-social"
  | "directorio" | "testimonio" | "documento-proyecto" | "otro";

export interface Source {
  url: string | null;
  title: string;
  publisher: string;
  type: SourceType;
  level: 1 | 2 | 3;
  role?: "primaria" | "secundaria";
  accessed_at: string;
  archived_url?: string | null;
  supports?: string[];
  notes?: string | null;
}

export type VerificationStatus = "pendiente" | "verificado" | "requiere_actualizacion" | "rechazado";

export interface Verification {
  status: VerificationStatus;
  confidence_score: number;
  verified_at?: string | null;
  verified_by?: string | null;
  next_review_at?: string | null;
  note?: string | null;
}

export interface Social {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
}

export interface MediaRef {
  kind: "image" | "video" | "audio" | "document";
  url?: string | null;
  storage_path?: string | null;
  title: string;
  alt_text?: string | null;
  author: string;
  credit: string;
  license: string;
  source_url?: string | null;
  taken_at?: string | null;
  consent_note?: string | null;
  role?: "cover" | "gallery" | "portrait" | "poster" | "still";
}

export interface Recognition { title: string; org: string; year: number | null; url?: string | null; source_index?: number | null }
export interface FundingAward { fund_name: string; org: string; year: number | null; folio?: string | null; amount_clp?: number | null; url?: string | null; note?: string | null; source_index?: number | null }
export interface FestivalParticipation { festival_name: string; year: number | null; place?: string | null; source_index?: number | null }

export interface Verifiable {
  slug: string;
  sources: Source[];
  verification: Verification;
  published: boolean;
}

export type EntityStatus = "activa" | "inactiva" | "desaparecida" | "desconocido";

export interface Company extends Verifiable {
  type: "company";
  name: string;
  legal_name: string | null;
  description_md: string | null;
  commune: string;
  other_communes: string[];
  disciplines: string[];
  audiences: string[];
  founded_year: number | null;
  status: EntityStatus;
  last_activity_at: string | null;
  members: { artist: string; role: string; from_year: number | null; to_year: number | null }[];
  members_text: string[];
  works: string[];
  venues: string[];
  place: unknown | null;
  email: string | null;
  contact_authorized: boolean;
  website: string | null;
  social: Social;
  trajectory_md: string | null;
  recognitions: Recognition[];
  funding_awards: FundingAward[];
  festivals: FestivalParticipation[];
  media: MediaRef[];
  media_candidates: unknown[];
  series: string[];
  tags: string[];
}

export interface Artist extends Verifiable {
  type: "artist";
  name: string;
  artistic_name: string | null;
  commune: string;
  commune_basis?: string;
  crafts: string[];
  disciplines: string[];
  specialties: string[];
  bio_md: string | null;
  trajectory_md: string | null;
  companies: { company: string; role: string; from_year: number | null; to_year: number | null }[];
  companies_text: string[];
  works: { work: string; role: string }[];
  works_text: string[];
  training: { title: string; institution: string; year: number | null; source_index?: number | null }[];
  recognitions: Recognition[];
  funding_awards: FundingAward[];
  festivals: FestivalParticipation[];
  website: string | null;
  social: Social;
  email_public: string | null;
  contact_authorized: boolean;
  media: MediaRef[];
  media_candidates: unknown[];
  series: string[];
  episodes: string[];
  tags: string[];
}

export interface Work extends Verifiable {
  type: "work";
  title: string;
  authorship: string | null;
  direction: string | null;
  companies: string[];
  credits: { artist: string | null; name: string; role: string }[];
  disciplines: string[];
  audience: string | null;
  duration_min: number | null;
  premiere_year: number | null;
  synopsis_md: string | null;
  communes: string[];
  video_url: string | null;
  dossier_url: string | null;
  venues: string[];
  history_text: string[];
  media: MediaRef[];
  tags: string[];
}

export interface Episode {
  slug: string;
  type: "episode";
  series: string;
  number: number;
  title: string;
  title_provisional?: boolean;
  tramo: string | null;
  commune: string;
  province: string;
  protagonist_artist: string | null;
  protagonist_company: string | null;
  discipline: string;
  narrative_axis: string | null;
  natural_location: string | null;
  natural_location_place: unknown | null;
  work_location_text: string | null;
  synopsis_md: string | null;
  status: string;
  video_url: string | null;
  audio_url: string | null;
  duration_min: number | null;
  has_subtitles: boolean | null;
  has_sign_language: boolean | null;
  transcript_md: string | null;
  capsules: unknown[];
  objects: unknown[];
  media: MediaRef[];
  related: { type: string; slug: string }[];
  published_at: string | null;
  sources: Source[];
}

export interface Series {
  slug: string;
  type: "series";
  title: string;
  subtitle: string;
  descriptor: string;
  region: string;
  season: number;
  status: string;
  description_md: string;
  route: string[];
  provinces: string[];
  disciplines: string[];
  series_tags: string[];
  episode_structure: string[];
  device: { vehicle: string; box: string; chairs: string };
  committed_outputs: Record<string, unknown>;
  campaign_questions: string[];
  trailer_url: string | null;
  channels: { youtube: string | null; instagram: string | null; tiktok: string | null; audio: string | null };
  identity: Record<string, string>;
  sources: Source[];
}

export interface PostaHandover {
  n: number;
  from_episode: string;
  to_episode: string | null;
  from_commune: string;
  to_commune: string | null;
  object: string | null;
  message_md: string | null;
  handed_at: string | null;
  received_at: string | null;
  media: MediaRef[];
  status: string;
  note?: string;
}

export interface Posta { series: string; handovers: PostaHandover[] }

export interface Region { slug: string; name: string; country_code: string; cut_code: string }
export interface Province { slug: string; name: string; region: string; cut_code: string; sort: number; capital: string | null; insular: boolean }
export interface Commune { slug: string; name: string; province: string; cut_code: string; insular: boolean; lat: number | null; lng: number | null; centroid_source: string | null }
export interface Territories { region: Region; provinces: Province[]; communes: Commune[]; sources: Source[] }

export interface VocabTerm { slug: string; name: string; parent?: string }
export interface Vocabularies {
  disciplines: VocabTerm[];
  venue_types: VocabTerm[];
  call_types: VocabTerm[];
  crafts: VocabTerm[];
  audiences: VocabTerm[];
  modalities: VocabTerm[];
}

export interface Place {
  name?: string | null;
  address: string | null;
  commune: string;
  lat: number | null;
  lng: number | null;
  precision: "exact" | "street" | "commune_centroid" | "unknown";
  geocode_source?: string | null;
  geocoded_at?: string | null;
}

export type VenueType = "teatro" | "centro-cultural" | "sala" | "espacio-independiente" | "escuela" | "museo" | "espacio-publico" | "no-convencional";
export type VenueStatus = "activo" | "cerrado-temporal" | "desaparecido" | "desconocido";

export interface Venue extends Verifiable {
  type: "venue";
  name: string;
  short_name: string | null;
  venue_type: VenueType;
  owner: string | null;
  place: Place;
  capacity: number | null;
  rooms: string[];
  website: string | null;
  contact_public: string | null;
  social: Social;
  disciplines: string[];
  accessibility: string[];
  program_url: string | null;
  status: VenueStatus;
  description_md: string | null;
  media: MediaRef[];
}

export type EventKind = "funcion" | "temporada" | "festival" | "taller" | "encuentro" | "otro";

export interface Occurrence {
  starts_at: string;
  ends_at?: string | null;
  time_unknown?: boolean;
  venue?: string | null;
  place?: Place | null;
  price?: string | null;
  note?: string | null;
}

export interface EventEntity extends Verifiable {
  type: "event";
  title: string;
  kind: EventKind;
  work: string | null;
  company: string | null;
  organizer_text: string | null;
  disciplines: string[];
  audience: string | null;
  description_md: string | null;
  price: string | null;
  is_free: boolean | null;
  booking_url: string | null;
  accessibility: string[];
  occurrences: Occurrence[];
  last_checked_at: string;
  media: MediaRef[];
}

export type Entity = Company | Artist | Work;
export type EntityType = Entity["type"];
