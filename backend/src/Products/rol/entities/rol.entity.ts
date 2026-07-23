import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Sede } from '../../sede/entities/sede.entity';
import { Area } from '../../areas/entities/area.entity';

@Entity('roles')
export class Rol {
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Column()
    nombre: string; // 'Campesina', 'Regular Fic', 'Apoyo Administrativo'

    @ManyToOne(() => Sede, (sede) => sede.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_sede' })
    sede: Sede;

    @OneToMany(() => Area, (area) => area.rol)
    areas: Area[];
}
