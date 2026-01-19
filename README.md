# dubit-js

**dubit-js** is a JavaScript/TypeScript library for integrating real-time audio translation into your WebRTC applications. Built on top of [Daily](https://www.daily.co), this library simplifies creating meeting rooms, adding translator bots, and managing translation tracks and captions.

> **Note:** This package has a dependency on [`@daily-co/daily-js`](https://www.npmjs.com/package/@daily-co/daily-js) (version `>=0.83.1`).

## Features

- **Realtime Speech translation:**  
  Translate speech/audio in realtime from one language to another. Supports multiple translators for to and fro translation. All you need to do is to provide a [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack)

- **Realtime original and translated captions:**  
  Event handlers for original, interim(update as you speak) and translated captions.

- **Utility Functions:**
  - `getSupportedLanguages`: Retrieves a list of supported languages.
  - `getCompleteTranscript`: Fetches a complete transcript for a meeting instance.

## Installation

Install **dubit-js** via npm:

```bash
npm install dubit-js
```

```
npm install @daily-co/daily-js
```

## Usage

### Creating a Dubit Instance

Start by creating a Dubit instance using your session/API token:

```js
import dubit from '@taic/dubit-js'

const token = 'YOUR_API_KEY'
const dubitInstance = await dubit.createNewInstance({ token })
console.log('Room created:', dubitInstance.instanceId)
```

### Adding Translators

```js
// Translator A: from English to Spanish, using a female voice.
const translatorA = await dubitInstance.addTranslator({
  fromLang: "en",
  toLang: "es",
  voiceType: "female",
  inputAudioTrack: YOUR_AUDIO_TRACK_A: MediaStreamTrack,
  metadata: { translatorName: "Translator A" },
});

translatorA.onTranslatedTrackReady((track) => {
  console.log("Translator A translated track is ready:", track);
  // Example: attach the track to an audio element to play the translated audio.
});

translatorA.onCaptions((caption) => {
  console.log("Translator A caption:", caption);
});

// Translator B: from Spanish to English, using a male voice.
const translatorB = await dubitInstance.addTranslator({
  fromLang: "es",
  toLang: "en",
  voiceType: "male",
  inputAudioTrack: YOUR_AUDIO_TRACK_B: MediaStreamTrack,
  metadata: { translatorName: "Translator B" },
});

translatorB.onTranslatedTrackReady((track) => {
  console.log("Translator B translated track is ready:", track);
  // Process the track as needed.
});

translatorB.onCaptions((caption) => {
  console.log("Translator B caption:", caption);
});
```

### Event Listeners

To listen for room events, you need to enable event listeners when creating a Dubit instance:

```js
const dubitInstance = await dubit.createNewInstance({ 
  token: 'YOUR_API_KEY',
  enableEventListener: true // Enable event listening
})
```

#### Available Events

The library supports the following event types:

```js
// Listen for app messages (including captions and transcripts)
dubitInstance.on('app-message', (event) => {
  console.log('App message received:', event)
  // Handle transcript data, captions, etc.
})

// Listen for participants joining the room
dubitInstance.on('participant-joined', (event) => {
  console.log('Participant joined:', event.participant?.user_name)
})

// Listen for participants leaving the room
dubitInstance.on('participant-left', (event) => {
  console.log('Participant left:', event.participant?.user_name)
})

// Listen for audio level updates from remote participants
dubitInstance.on('remote-participants-audio-level', (event) => {
  console.log('Audio level update:', event)
})
```

#### Event Listener Cleanup

Remember to clean up event listeners when you're done:

```js
// Destroy the event listener when leaving the room
await dubitInstance.destroyEventListener()
```

### Utility Functions

```js
import dubit, { getSupportedLanguages, getCompleteTranscript } from '@taic/dubit-js'

// Get supported languages.
const languages = await getSupportedLanguages()
console.log('Supported languages:', languages)

// Fetch a complete transcript for a given meeting instance.
const transcript = await getCompleteTranscript({
  instanceId: 'YOUR_INSTANCE_ID',
  token: 'YOUR_API_KEY',
})
console.log('Complete transcript:', transcript)
```

## License

This project is licensed under the BSD-2-Clause License.

## Contributing

---

Happy translating! 🤗
