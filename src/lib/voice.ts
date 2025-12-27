export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

type ResultCallback = (result: VoiceRecognitionResult) => void;

let recognition: any | null = null;

function createRecognition(onResult: ResultCallback): any {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser.');
    return null;
  }

  const instance = new SpeechRecognition();
  instance.continuous = true;
  instance.interimResults = true;

  instance.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      onResult({
        transcript: result[0].transcript,
        isFinal: result.isFinal,
      });
    }
  };

  return instance;
}

export function startListening(onResult: ResultCallback): void {
  if (recognition) {
    recognition.stop();
  }
  recognition = createRecognition(onResult);
  if (recognition) {
    recognition.start();
    console.log('Voice recognition started.');
  }
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
    console.log('Voice recognition stopped.');
  }
}
