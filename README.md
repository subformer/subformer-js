# 🎬 Subformer JavaScript/TypeScript SDK

[![npm version](https://badge.fury.io/js/subformer.svg)](https://www.npmjs.com/package/subformer)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Official JavaScript/TypeScript SDK for [Subformer](https://subformer.com)** — AI-powered video dubbing, voice cloning, and text-to-speech API.

🌍 Dub videos into 50+ languages | 🎙️ Clone any voice | 🔊 Generate natural speech

---

## ✨ Features

- 🎥 **Video Dubbing** — Automatically translate and dub YouTube, TikTok, Instagram, Facebook, X (Twitter), and any video URL
- 🗣️ **Voice Cloning** — Transform audio to match any target voice
- 📝 **Text-to-Speech** — Generate natural-sounding speech from text
- 🎵 **Voice Library** — Save and manage custom voices
- 📘 **Full TypeScript Support** — Complete type definitions included
- 🌐 **Works Everywhere** — Node.js, Deno, Bun, and modern browsers

## 📦 Installation

```bash
# npm
npm install subformer

# yarn
yarn add subformer

# pnpm
pnpm add subformer

# bun
bun add subformer
```

## 🚀 Quick Start

### Video Dubbing

Dub any video into 50+ languages with one API call:

```typescript
import { Subformer } from 'subformer';

const client = new Subformer({ apiKey: 'sk_subformer_...' });

// Dub a YouTube video to Spanish
const job = await client.dub({
  source: 'youtube',
  url: 'https://youtube.com/watch?v=VIDEO_ID',
  language: 'es-ES'
});

// Wait for completion
const result = await client.waitForJob(job.id);

// Get the dubbed video URL
console.log('Dubbed video:', result.output?.videoUrl);
```

### Voice Cloning

Clone any voice and apply it to audio:

```typescript
import { Subformer, type PresetVoice } from 'subformer';

const client = new Subformer({ apiKey: 'sk_subformer_...' });

// Clone voice using a preset
const job = await client.cloneVoice({
  sourceAudioUrl: 'https://example.com/speech.mp3',
  targetVoice: {
    mode: 'preset',
    presetVoiceId: 'morgan-freeman'
  } as PresetVoice
});

const result = await client.waitForJob(job.id);
console.log('Cloned audio:', result.output?.audioUrl);
```

### Text-to-Speech

Generate natural speech from text:

```typescript
import { Subformer, type UploadedVoice } from 'subformer';

const client = new Subformer({ apiKey: 'sk_subformer_...' });

// Synthesize speech with a custom voice
const job = await client.synthesizeVoice({
  text: 'Hello, welcome to Subformer!',
  targetVoice: {
    mode: 'upload',
    targetAudioUrl: 'https://example.com/my-voice.mp3'
  } as UploadedVoice
});

const result = await client.waitForJob(job.id);
console.log('Generated audio:', result.output?.audioUrl);
```

## 📚 API Reference

### Client Initialization

```typescript
import { Subformer } from 'subformer';

const client = new Subformer({
  apiKey: 'sk_subformer_...',
  baseUrl: 'https://api.subformer.com/v1', // optional
  timeout: 30000 // optional, in milliseconds
});
```

### Dubbing

| Method | Description |
|--------|-------------|
| `dub(options)` | Create a video dubbing job |
| `getLanguages()` | Get list of supported languages |

**Supported Sources:** `youtube`, `tiktok`, `instagram`, `facebook`, `x`, `url`

```typescript
// Dub options
interface DubOptions {
  source: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'x' | 'url';
  url: string;
  language: string; // e.g., 'es-ES', 'fr-FR'
  disableWatermark?: boolean;
}
```

### Jobs

| Method | Description |
|--------|-------------|
| `getJob(jobId)` | Get job by ID |
| `listJobs(options?)` | List all jobs |
| `deleteJobs(jobIds)` | Delete jobs |
| `waitForJob(jobId, options?)` | Wait for job completion |

```typescript
// List jobs with pagination
const { data, total } = await client.listJobs({
  offset: 0,
  limit: 10,
  type: 'video-dubbing'
});

// Wait for job with timeout
const job = await client.waitForJob(jobId, {
  pollInterval: 2, // seconds
  timeout: 300 // seconds
});
```

### Voice Cloning & Synthesis

| Method | Description |
|--------|-------------|
| `cloneVoice(options)` | Clone a voice |
| `synthesizeVoice(options)` | Text-to-speech |

### Voice Library

| Method | Description |
|--------|-------------|
| `listVoices()` | List saved voices |
| `getVoice(voiceId)` | Get voice by ID |
| `createVoice(options)` | Create a voice |
| `updateVoice(options)` | Update a voice |
| `deleteVoice(voiceId)` | Delete a voice |

## 🌍 Supported Languages

Subformer supports 70+ languages for video dubbing:

| Language | Code | Language | Code |
|----------|------|----------|------|
| Afrikaans | `af-ZA` | Albanian | `sq-AL` |
| Arabic | `ar-SA` | Armenian | `hy-AM` |
| Azerbaijani | `az-AZ` | Belarusian | `be-BY` |
| Bengali | `bn-IN` | Bosnian | `bs-BA` |
| Bulgarian | `bg-BG` | Burmese | `my-MM` |
| Catalan | `ca-ES` | Chinese (Simplified) | `zh-CN` |
| Chinese (Traditional) | `zh-TW` | Croatian | `hr-HR` |
| Czech | `cs-CZ` | Danish | `da-DK` |
| Dutch | `nl-NL` | English | `en-US` |
| Estonian | `et-EE` | Filipino | `fil-PH` |
| Finnish | `fi-FI` | French | `fr-FR` |
| Galician | `gl-ES` | Georgian | `ka-GE` |
| German | `de-DE` | Greek | `el-GR` |
| Gujarati | `gu-IN` | Hebrew | `he-IL` |
| Hindi | `hi-IN` | Hungarian | `hu-HU` |
| Icelandic | `is-IS` | Indonesian | `id-ID` |
| Italian | `it-IT` | Japanese | `ja-JP` |
| Javanese | `jv-ID` | Kannada | `kn-IN` |
| Kazakh | `kk-KZ` | Khmer | `km-KH` |
| Korean | `ko-KR` | Latin | `la-VA` |
| Latvian | `lv-LV` | Lithuanian | `lt-LT` |
| Macedonian | `mk-MK` | Malay | `ms-MY` |
| Malayalam | `ml-IN` | Maltese | `mt-MT` |
| Marathi | `mr-IN` | Mongolian | `mn-MN` |
| Norwegian | `no-NO` | Persian | `fa-IR` |
| Polish | `pl-PL` | Portuguese (Brazil) | `pt-BR` |
| Punjabi | `pa-IN` | Romanian | `ro-RO` |
| Russian | `ru-RU` | Serbian | `sr-RS` |
| Slovak | `sk-SK` | Slovenian | `sl-SI` |
| Spanish | `es-ES` | Swahili | `sw-KE` |
| Swedish | `sv-SE` | Tagalog | `tl-PH` |
| Tamil | `ta-IN` | Telugu | `te-IN` |
| Thai | `th-TH` | Turkish | `tr-TR` |
| Ukrainian | `uk-UA` | Urdu | `ur-PK` |
| Uzbek | `uz-UZ` | Vietnamese | `vi-VN` |
| Welsh | `cy-GB` | | |

## ⚠️ Error Handling

```typescript
import {
  Subformer,
  SubformerError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError
} from 'subformer';

const client = new Subformer({ apiKey: 'sk_subformer_...' });

try {
  const job = await client.dub({
    source: 'youtube',
    url: 'https://youtube.com/watch?v=VIDEO_ID',
    language: 'es-ES'
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Too many requests, please slow down');
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof SubformerError) {
    console.error('API error:', error.message, error.code);
  }
}
```

## 🔑 Getting Your API Key

1. Sign up at [subformer.com](https://subformer.com)
2. Go to [API Keys](https://subformer.com/dashboard/api-keys)
3. Create a new API key

## 📘 TypeScript Support

This SDK is written in TypeScript and includes complete type definitions:

```typescript
import type {
  Job,
  JobState,
  JobType,
  Voice,
  Language,
  DubSource,
  TargetVoice,
  PresetVoice,
  UploadedVoice
} from 'subformer';
```

## 📖 Documentation

- [API Documentation](https://subformer.com/docs/api)
- [Interactive API Reference](https://api.subformer.com/v1/docs)
- [OpenAPI Spec](https://api.subformer.com/v1/openapi.json)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://subformer.com">Subformer</a>
</p>
