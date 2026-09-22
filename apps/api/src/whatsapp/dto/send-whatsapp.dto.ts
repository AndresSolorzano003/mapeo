import { IsOptional, IsString, Matches } from 'class-validator';

export class SendWhatsappDto {
  @IsString()
  @Matches(/^data:image\/png;base64,/, {
    message: 'image debe ser un data URL PNG (data:image/png;base64,...)',
  })
  image!: string;

  @IsOptional()
  @IsString()
  title?: string;
}
