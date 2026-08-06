import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';
import { Coordinador } from '../../coordinador/entities/coordinador.entity';

@Entity('sedes')
export class Sede {
    @PrimaryGeneratedColumn()
    id_sede: number;

    @Column({ unique: true })
    nombre: string; // 'Yamboro', 'Otra'

    @OneToMany(() => Rol, (rol) => rol.sede)
    roles: Rol[];

    @OneToOne(() => Coordinador, coordinador => coordinador.sede)
    coordinador: Coordinador;
}
