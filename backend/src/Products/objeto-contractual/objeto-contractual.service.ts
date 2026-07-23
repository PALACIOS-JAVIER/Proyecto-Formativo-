import { Injectable } from '@nestjs/common';
import { CreateObjetoContractualDto } from './dto/create-objeto-contractual.dto';
import { UpdateObjetoContractualDto } from './dto/update-objeto-contractual.dto';

@Injectable()
export class ObjetoContractualService {
  create(createObjetoContractualDto: CreateObjetoContractualDto) {
    return 'This action adds a new objetoContractual';
  }

  findAll() {
    return `This action returns all objetoContractual`;
  }

  findOne(id: number) {
    return `This action returns a #${id} objetoContractual`;
  }

  update(id: number, updateObjetoContractualDto: UpdateObjetoContractualDto) {
    return `This action updates a #${id} objetoContractual`;
  }

  remove(id: number) {
    return `This action removes a #${id} objetoContractual`;
  }
}
