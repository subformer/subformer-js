/**
 * Subformer API client
 */

import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  SubformerError,
  ValidationError,
} from "./errors";
import type {
  CloneVoiceOptions,
  CreateVoiceOptions,
  DailyUsage,
  DubOptions,
  GenerateVoiceUploadUrlOptions,
  Job,
  Language,
  ListJobsOptions,
  PaginatedJobs,
  RateLimit,
  SynthesizeVoiceOptions,
  UpdateUserOptions,
  UpdateVoiceOptions,
  UploadUrl,
  Usage,
  User,
  Voice,
  WaitForJobOptions,
} from "./types";

const DEFAULT_BASE_URL = "https://api.subformer.com/v1";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

export interface SubformerOptions {
  /** Your Subformer API key */
  apiKey: string;
  /** Base URL for the API (default: https://api.subformer.com/v1) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Subformer API client for video dubbing, voice cloning, and text-to-speech.
 *
 * @example
 * ```typescript
 * import { Subformer } from 'subformer';
 *
 * const client = new Subformer({ apiKey: 'sk_subformer_...' });
 *
 * // Create a dubbing job
 * const job = await client.dub({
 *   source: 'youtube',
 *   url: 'https://youtube.com/watch?v=VIDEO_ID',
 *   language: 'es-ES'
 * });
 *
 * // Wait for completion
 * const result = await client.waitForJob(job.id);
 * console.log('Done!', result.output);
 * ```
 */
export class Subformer {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: SubformerOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
    }
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return this.transformDates(data) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof SubformerError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new SubformerError("Request timeout");
      }
      throw new SubformerError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    let message: string;
    let code: string | undefined;
    let data: unknown;

    try {
      const json = (await response.json()) as Record<string, unknown>;
      message = (json.message as string) ?? response.statusText;
      code = json.code as string | undefined;
      data = json.data;
    } catch {
      message = response.statusText;
    }

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message);
      case 404:
        throw new NotFoundError(message);
      case 429:
        throw new RateLimitError(message);
      case 400:
        throw new ValidationError(message, data);
      default:
        throw new SubformerError(message, {
          statusCode: response.status,
          code,
          data,
        });
    }
  }

  private transformDates(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDates(item));
    }

    if (typeof obj === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (
          typeof value === "string" &&
          (key.endsWith("At") || key.endsWith("On")) &&
          /^\d{4}-\d{2}-\d{2}T/.test(value)
        ) {
          result[key] = new Date(value);
        } else {
          result[key] = this.transformDates(value);
        }
      }
      return result;
    }

    return obj;
  }

  // ==================== Dubbing ====================

  /**
   * Create a video dubbing job.
   *
   * @param options - Dubbing options
   * @returns The created job
   *
   * @example
   * ```typescript
   * const job = await client.dub({
   *   source: 'youtube',
   *   url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
   *   language: 'es-ES'
   * });
   * ```
   */
  async dub(options: DubOptions): Promise<Job> {
    const response = await this.request<{ job: Job }>("POST", "/dub", {
      body: {
        type: options.source,
        url: options.url,
        toLanguage: options.language,
        disableWatermark: options.disableWatermark,
      },
    });
    return response.job;
  }

  /**
   * Get list of supported languages for dubbing.
   *
   * @returns List of language codes
   */
  async getLanguages(): Promise<Language[]> {
    return this.request<Language[]>("GET", "/metadata/dub/languages");
  }

  // ==================== Jobs ====================

  /**
   * Get a job by ID.
   *
   * @param jobId - The job ID
   * @returns The job
   */
  async getJob(jobId: string): Promise<Job> {
    return this.request<Job>("GET", `/jobs/${jobId}`);
  }

  /**
   * List jobs for the authenticated user.
   *
   * @param options - List options
   * @returns Paginated list of jobs
   */
  async listJobs(options: ListJobsOptions = {}): Promise<PaginatedJobs> {
    return this.request<PaginatedJobs>("GET", "/jobs", {
      params: {
        offset: options.offset,
        limit: options.limit,
        type: options.type,
      },
    });
  }

  /**
   * Delete jobs by IDs.
   *
   * @param jobIds - List of job IDs to delete (max 50)
   * @returns True if successful
   */
  async deleteJobs(jobIds: string[]): Promise<boolean> {
    const response = await this.request<{ success: boolean }>(
      "DELETE",
      "/jobs",
      {
        body: { jobIds },
      }
    );
    return response.success;
  }

  /**
   * Wait for a job to complete.
   *
   * @param jobId - The job ID
   * @param options - Wait options
   * @returns The completed job
   * @throws {Error} If the job doesn't complete within the timeout
   */
  async waitForJob(jobId: string, options: WaitForJobOptions = {}): Promise<Job> {
    const pollInterval = (options.pollInterval ?? 2) * 1000;
    const timeout = options.timeout ? options.timeout * 1000 : undefined;
    const startTime = Date.now();

    while (true) {
      const job = await this.getJob(jobId);

      if (
        job.state === "completed" ||
        job.state === "failed" ||
        job.state === "cancelled"
      ) {
        return job;
      }

      if (timeout && Date.now() - startTime > timeout) {
        throw new Error(
          `Job ${jobId} did not complete within ${options.timeout} seconds`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  // ==================== Voice Cloning ====================

  /**
   * Create a voice cloning job.
   *
   * @param options - Voice cloning options
   * @returns The created job
   */
  async cloneVoice(options: CloneVoiceOptions): Promise<Job> {
    const response = await this.request<{ job: Job }>("POST", "/voice/clone", {
      body: {
        sourceAudioUrl: options.sourceAudioUrl,
        targetVoice:
          options.targetVoice.mode === "preset"
            ? { mode: "preset", presetVoiceId: options.targetVoice.presetVoiceId }
            : { mode: "upload", targetAudioUrl: options.targetVoice.targetAudioUrl },
      },
    });
    return response.job;
  }

  /**
   * Create a voice synthesis (text-to-speech) job.
   *
   * @param options - Voice synthesis options
   * @returns The created job
   */
  async synthesizeVoice(options: SynthesizeVoiceOptions): Promise<Job> {
    const response = await this.request<{ job: Job }>(
      "POST",
      "/voice/synthesize",
      {
        body: {
          text: options.text,
          targetVoice:
            options.targetVoice.mode === "preset"
              ? { mode: "preset", presetVoiceId: options.targetVoice.presetVoiceId }
              : { mode: "upload", targetAudioUrl: options.targetVoice.targetAudioUrl },
        },
      }
    );
    return response.job;
  }

  // ==================== Voice Library ====================

  /**
   * List all voices in the user's voice library.
   *
   * @returns List of voices
   */
  async listVoices(): Promise<Voice[]> {
    return this.request<Voice[]>("GET", "/voices");
  }

  /**
   * Get a voice by ID.
   *
   * @param voiceId - The voice ID
   * @returns The voice
   */
  async getVoice(voiceId: string): Promise<Voice> {
    return this.request<Voice>("GET", `/voices/${voiceId}`);
  }

  /**
   * Create a new voice in the voice library.
   *
   * @param options - Create voice options
   * @returns The created voice
   */
  async createVoice(options: CreateVoiceOptions): Promise<Voice> {
    return this.request<Voice>("POST", "/voices", {
      body: {
        name: options.name,
        audioUrl: options.audioUrl,
        gender: options.gender,
        duration: options.duration,
      },
    });
  }

  /**
   * Update a voice in the voice library.
   *
   * @param options - Update voice options
   * @returns The updated voice
   */
  async updateVoice(options: UpdateVoiceOptions): Promise<Voice> {
    return this.request<Voice>("PUT", `/voices/${options.voiceId}`, {
      body: {
        voiceId: options.voiceId,
        name: options.name,
        gender: options.gender,
      },
    });
  }

  /**
   * Delete a voice from the voice library.
   *
   * @param voiceId - The voice ID
   * @returns True if successful
   */
  async deleteVoice(voiceId: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>(
      "DELETE",
      `/voices/${voiceId}`,
      {
        body: { voiceId },
      }
    );
    return response.success;
  }

  /**
   * Generate a presigned URL for uploading voice audio.
   *
   * @param options - Upload URL options
   * @returns Upload URL details
   */
  async generateVoiceUploadUrl(options: GenerateVoiceUploadUrlOptions): Promise<UploadUrl> {
    return this.request<UploadUrl>("POST", "/voices/upload-url", {
      body: {
        fileName: options.fileName,
        contentType: options.contentType,
      },
    });
  }

  // ==================== Billing ====================

  /**
   * Get current billing period usage statistics.
   *
   * @returns Current usage including credits, plan limits, and subscription details
   */
  async getUsage(): Promise<Usage> {
    return this.request<Usage>("GET", "/billing/usage");
  }

  /**
   * Get daily usage statistics for the past 30 days.
   *
   * @returns List of daily usage records grouped by task type
   */
  async getUsageHistory(): Promise<DailyUsage[]> {
    return this.request<DailyUsage[]>("GET", "/billing/usage-history");
  }

  // ==================== Users ====================

  /**
   * Get the currently authenticated user's profile.
   *
   * @returns User profile information
   */
  async getMe(): Promise<User> {
    return this.request<User>("GET", "/users/me");
  }

  /**
   * Update the currently authenticated user's profile.
   *
   * @param options - Update user options
   * @returns Updated user profile
   */
  async updateMe(options: UpdateUserOptions): Promise<User> {
    const response = await this.request<{ user: User }>("PUT", "/users/me", {
      body: {
        name: options.name,
        email: options.email,
      },
    });
    return response.user;
  }

  /**
   * Get the current rate limit status for creating dubbing jobs.
   *
   * @returns Rate limit status including remaining count and limit
   */
  async getRateLimit(): Promise<RateLimit> {
    return this.request<RateLimit>("GET", "/users/me/rate-limit");
  }
}
