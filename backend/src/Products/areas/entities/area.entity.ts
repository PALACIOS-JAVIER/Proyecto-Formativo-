import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';
import { ObjetoContractual } from '../../objeto-contractual/entities/objeto-contractual.entity';

@Entity('areas')
export class Area {
    @PrimaryGeneratedColumn()
    id_area: number;

    @Column()
    nombre: string; // 'Educación', 'Investigación', 'Extensión'

    @ManyToOne(() => Rol, (rol) => rol.areas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    // Relación Uno a Muchos: Una área contiene múltiples objetos contractuales
    @OneToMany(() => ObjetoContractual, (objeto) => objeto.area)
    objetos: ObjetoContractual[];
}
