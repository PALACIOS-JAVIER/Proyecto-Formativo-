import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { ObjetoContractual } from '../../objeto-contractual/entities/objeto-contractual.entity';

@Entity('especialidades')
export class Especialidad {
    @PrimaryGeneratedColumn()
    id_especialidad: number;

    @Column({ type: 'varchar', length: 200 })
    nombre: string; // Ej: 'PRODUCCIÓN DE CAFES', 'CULTIVOS AGRÍCOLAS'

    // Relación: Una especialidad pertenece a un área
    @ManyToOne(() => Area, (area) => area.especialidades, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_area' })
    area: Area;

    // Relación: Una especialidad tiene muchos objetos contractuales
    @OneToMany(() => ObjetoContractual, (obj) => obj.especialidad)
    objetos: ObjetoContractual[];
}
