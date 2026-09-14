export const GATEWAY_URL = 'http://192.168.4.1/send';

export const LOCAL_USER_ID = 'alice';

export type SendMessagePayload = {
  dest: string;
  payload: string;
  ttl?: number;
};

export type SendMessageResult = { ok: true } | { ok: false; error: string };

export async function sendMessageToGateway({
  dest,
  payload,
  ttl = 3,
}: SendMessagePayload): Promise<SendMessageResult> {
  try {
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ src: LOCAL_USER_ID, dest, payload, ttl }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return { ok: false, error: `Erreur ${response.status}: ${text}` };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Impossible de joindre la passerelle — vérifie que tu es connecté au WiFi ESP_1.',
    };
  }
}