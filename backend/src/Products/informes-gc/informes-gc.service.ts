import { Injectable } from '@nestjs/common';
import { CreateInformesGcDto } from './dto/create-informes-gc.dto';
import { UpdateInformesGcDto } from './dto/update-informes-gc.dto';

@Injectable()
export class InformesGcService {
  create(createInformesGcDto: CreateInformesGcDto) {
    return 'This action adds a new informesGc';
  }

  findAll() {
    return `This action returns all informesGc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} informesGc`;
  }

  update(id: number, updateInformesGcDto: UpdateInformesGcDto) {
    return `This action updates a #${id} informesGc`;
  }

  remove(id: number) {
    return `This action removes a #${id} informesGc`;
  }
}
