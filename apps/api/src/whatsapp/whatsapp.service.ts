import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import twilio from 'twilio';

const DEFAULT_TO_NUMBER = '+573043383683';

export interface SendResult {
  success: boolean;
  message: string;
  imageUrl?: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly uploadsDir = join(__dirname, '..', '..', 'public', 'uploads');

  async sendMapImage(imageDataUrl: string, title?: string): Promise<SendResult> {
    const imageUrl = await this.saveImage(imageDataUrl);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
    const publicBaseUrl = process.env.PUBLIC_BASE_URL;
    const toNumber = process.env.WHATSAPP_TO_NUMBER || DEFAULT_TO_NUMBER;

    if (!accountSid || !authToken || !whatsappFrom || !publicBaseUrl) {
      this.logger.warn('Twilio no está configurado; la imagen se guardó pero no se envió.');
      return {
        success: false,
        message:
          'La imagen se generó pero falta configurar Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, PUBLIC_BASE_URL) en apps/api/.env. Revisa el README.',
        imageUrl,
      };
    }

    const client = twilio(accountSid, authToken);
    const fullImageUrl = `${publicBaseUrl.replace(/\/$/, '')}${imageUrl}`;

    try {
      await client.messages.create({
        from: whatsappFrom,
        to: `whatsapp:${toNumber}`,
        body: title ?? 'Mapa de planta',
        mediaUrl: [fullImageUrl],
      });
      return { success: true, message: `Imagen enviada por WhatsApp a ${toNumber}.`, imageUrl };
    } catch (error) {
      this.logger.error('Fallo al enviar el mensaje de WhatsApp', error as Error);
      const detail = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, message: `No se pudo enviar por WhatsApp: ${detail}`, imageUrl };
    }
  }

  private async saveImage(imageDataUrl: string): Promise<string> {
    const base64 = imageDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const filename = `${uuid()}.png`;

    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.writeFile(join(this.uploadsDir, filename), buffer);

    return `/public/uploads/${filename}`;
  }
}
