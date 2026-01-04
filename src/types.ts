/**
 * Type definitions for Subformer SDK
 */

/** Job execution state */
export type JobState = "queued" | "active" | "completed" | "failed" | "cancelled";

/** Type of background job */
export type JobType =
  | "video-dubbing"
  | "voice-cloning"
  | "voice-synthesis"
  | "dub-studio-render-video";

/** Source type for dubbing jobs */
export type DubSource = "youtube" | "tiktok" | "instagram" | "facebook" | "x" | "url";

/** Supported languages for dubbing */
export type Language =
  | "af-ZA"
  | "ar-SA"
  | "az-AZ"
  | "be-BY"
  | "bg-BG"
  | "bn-IN"
  | "bs-BA"
  | "ca-ES"
  | "cs-CZ"
  | "cy-GB"
  | "da-DK"
  | "de-DE"
  | "el-GR"
  | "en-US"
  | "es-ES"
  | "et-EE"
  | "fa-IR"
  | "fi-FI"
  | "fil-PH"
  | "fr-FR"
  | "gl-ES"
  | "gu-IN"
  | "he-IL"
  | "hi-IN"
  | "hr-HR"
  | "hu-HU"
  | "hy-AM"
  | "id-ID"
  | "is-IS"
  | "it-IT"
  | "ja-JP"
  | "jv-ID"
  | "ka-GE"
  | "kk-KZ"
  | "km-KH"
  | "kn-IN"
  | "ko-KR"
  | "la-VA"
  | "lt-LT"
  | "lv-LV"
  | "mk-MK"
  | "ml-IN"
  | "mn-MN"
  | "mr-IN"
  | "ms-MY"
  | "mt-MT"
  | "my-MM"
  | "nl-NL"
  | "no-NO"
  | "pa-IN"
  | "pl-PL"
  | "pt-BR"
  | "ro-RO"
  | "ru-RU"
  | "sk-SK"
  | "sl-SI"
  | "sq-AL"
  | "sr-RS"
  | "sv-SE"
  | "sw-KE"
  | "ta-IN"
  | "te-IN"
  | "th-TH"
  | "tl-PH"
  | "tr-TR"
  | "uk-UA"
  | "ur-PK"
  | "uz-UZ"
  | "vi-VN"
  | "zh-CN"
  | "zh-TW";

/** Progress information for a job */
export interface JobProgress {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status message */
  message?: string;
  /** Current processing step */
  step?: string;
}

/** Metadata for a job */
export interface JobMetadata {
  title?: string;
  thumbnailUrl?: string;
  duration?: number;
  sourceUrl?: string;
  sourceType?: string;
  originalLanguage?: string;
}

/** A background job */
export interface Job {
  id: string;
  type: JobType;
  userId: string;
  state: JobState;
  input?: unknown;
  output?: unknown;
  metadata?: JobMetadata | null;
  createdAt: Date;
  progress?: JobProgress | null;
  processedOn?: Date | null;
  finishedOn?: Date | null;
  creditUsed?: number | null;
}

/** A saved voice in the voice library */
export interface Voice {
  id: string;
  name: string;
  audioUrl: string;
  gender: "male" | "female";
  duration: number;
  createdAt: Date;
}

/** Target voice using a preset */
export interface PresetVoice {
  mode: "preset";
  presetVoiceId: string;
}

/** Target voice using an uploaded audio file */
export interface UploadedVoice {
  mode: "upload";
  targetAudioUrl: string;
}

/** Target voice for cloning or synthesis */
export type TargetVoice = PresetVoice | UploadedVoice;

/** Paginated list of jobs */
export interface PaginatedJobs {
  data: Job[];
  total: number;
}

/** Options for creating a dubbing job */
export interface DubOptions {
  /** Source type */
  source: DubSource;
  /** URL of the video to dub */
  url: string;
  /** Target language for dubbing */
  language: Language | string;
  /** Disable watermark (requires paid plan) */
  disableWatermark?: boolean;
}

/** Options for listing jobs */
export interface ListJobsOptions {
  /** Number of items to skip */
  offset?: number;
  /** Maximum number of items to return */
  limit?: number;
  /** Filter by job type */
  type?: JobType;
}

/** Options for waiting on a job */
export interface WaitForJobOptions {
  /** Seconds between status checks */
  pollInterval?: number;
  /** Maximum seconds to wait (undefined for no timeout) */
  timeout?: number;
}

/** Options for voice cloning */
export interface CloneVoiceOptions {
  /** URL of the source audio to transform */
  sourceAudioUrl: string;
  /** Target voice (preset or uploaded) */
  targetVoice: TargetVoice;
}

/** Options for voice synthesis */
export interface SynthesizeVoiceOptions {
  /** Text to synthesize */
  text: string;
  /** Target voice (preset or uploaded) */
  targetVoice: TargetVoice;
}

/** Options for creating a voice */
export interface CreateVoiceOptions {
  /** Voice name */
  name: string;
  /** URL of the voice audio sample */
  audioUrl: string;
  /** Voice gender */
  gender: "male" | "female";
  /** Duration of audio sample in milliseconds */
  duration: number;
}

/** Options for updating a voice */
export interface UpdateVoiceOptions {
  /** Voice ID */
  voiceId: string;
  /** New voice name */
  name?: string;
  /** New voice gender */
  gender?: "male" | "female";
}

/** Options for generating a voice upload URL */
export interface GenerateVoiceUploadUrlOptions {
  /** Name of the file to upload */
  fileName: string;
  /** MIME type of the file */
  contentType: string;
}

/** Presigned upload URL response */
export interface UploadUrl {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

/** Usage data for active subscription */
export interface UsageData {
  usedCredits: number;
  planCredits: number;
  totalEvents: number;
  currentPlan: string;
  periodStart: Date;
  periodEnd: Date;
}

/** Current billing usage */
export interface Usage {
  type: string;
  data: UsageData;
}

/** Daily usage statistics */
export interface DailyUsage {
  date: string;
  "video-dubbing": number;
  "voice-cloning": number;
  "voice-synthesis": number;
  "dub-studio-render-video": number;
}

/** User profile information */
export interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  preferredTargetLanguage?: string | null;
}

/** Rate limit status */
export interface RateLimit {
  remaining: number;
  limit: number;
  reset: number;
  bucket: string;
}

/** Options for updating user profile */
export interface UpdateUserOptions {
  /** New name */
  name: string;
  /** New email */
  email: string;
}
