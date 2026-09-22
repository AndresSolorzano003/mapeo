const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface SendWhatsappResponse {
  success: boolean;
  message: string;
  imageUrl?: string;
}

export async function sendMapImage(imageDataUrl: string, title: string): Promise<SendWhatsappResponse> {
  const res = await fetch(`${API_URL}/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl, title }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      success: false,
      message: data?.message ?? `Error del servidor (${res.status})`,
    };
  }

  return data as SendWhatsappResponse;
}
