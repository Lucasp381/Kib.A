import { PartialType } from '@nestjs/mapped-types';
import { CreateVariableDto } from './create-variable.dto';

export class UpdateVariableDto extends PartialType(CreateVariableDto) {
    id: string;
    data: string;
    "@timestamp"?: string;
}
