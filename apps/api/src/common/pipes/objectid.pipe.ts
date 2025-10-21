import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException('Parâmetro inválido: ObjectId esperado');
    }
    return value;
  }
}
