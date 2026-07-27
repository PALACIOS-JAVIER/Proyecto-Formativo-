import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';

@Entity('objetos_contractuales')
export class ObjetoContractual {
    @PrimaryGeneratedColumn()
    id_objeto: number;

    @Column({ type: 'text' })
    descripcion: string;

    // Relación: Muchos objetos pertenecen a un área
    @ManyToOne(() => Area, (area) => area.objetos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_area' })
    area: Area;

    // Relación: Muchos objetos pueden pertenecer a una especialidad (opcional)
    @ManyToOne(() => Especialidad, (esp) => esp.objetos, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'id_especialidad' })
    especialidad: Especialidad | null;
}
