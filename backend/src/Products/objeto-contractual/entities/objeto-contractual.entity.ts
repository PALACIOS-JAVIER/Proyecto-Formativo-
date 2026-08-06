import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';


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

}
