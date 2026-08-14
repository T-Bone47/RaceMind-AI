import { apiClient } from './client';

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  const response = await apiClient.post<{ text: string }>('/api/v1/voice/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.text;
}

export async function synthesizeSpeech(text: string): Promise<Blob> {
  const response = await apiClient.post<Blob>('/api/v1/voice/synthesize', null, {
    params: { text },
    responseType: 'blob',
  });
  
  return response.data;
}
