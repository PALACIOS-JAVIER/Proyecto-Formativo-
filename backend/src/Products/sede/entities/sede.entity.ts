import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';

@Entity('sedes')
export class Sede {
    @PrimaryGeneratedColumn()
    id_sede: number;

    @Column({ unique: true })
    nombre: string; // 'Yamboro', 'Otra'

    @OneToMany(() => Rol, (rol) => rol.sede)
    roles: Rol[];
}
