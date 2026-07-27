import { Injectable } from '@nestjs/common';
import { CreateInformesGfDto } from './dto/create-informes-gf.dto';
import { UpdateInformesGfDto } from './dto/update-informes-gf.dto';

@Injectable()
export class InformesGfService {
  create(createInformesGfDto: CreateInformesGfDto) {
    return 'This action adds a new informesGf';
  }

  findAll() {
    return `This action returns all informesGf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} informesGf`;
  }

  update(id: number, updateInformesGfDto: UpdateInformesGfDto) {
    return `This action updates a #${id} informesGf`;
  }

  remove(id: number) {
    return `This action removes a #${id} informesGf`;
  }
}
