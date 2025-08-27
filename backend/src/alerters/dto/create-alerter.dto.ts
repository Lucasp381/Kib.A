import { IsString, IsBoolean, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateAlerterDto {
  @IsOptional() @IsString() "@timestamp"?: string;
  @IsOptional() @IsString() id?: string;
  @IsString() name: string;
  @IsString() type: string;
  @IsOptional() @IsString() description?: string;
  @IsBoolean() enabled: boolean;
  @IsObject() config: any;
  @IsOptional() all_rules?: boolean;
  @IsOptional() @IsArray() rules?: any[];
  @IsOptional() created_at?: string;
  @IsOptional() updated_at?: string;
}
