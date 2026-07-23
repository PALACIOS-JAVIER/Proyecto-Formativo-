import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Area } from './area.entity';

@Entity('objetos_contractuales')
export class ObjetoContractual {
    @PrimaryGeneratedColumn()
    id_objeto: number;

    @Column({ type: 'text' }) // Usamos 'text' porque los objetos suelen ser textos largos
    descripcion: string;

    // Relación Muchos a Uno: Muchos objetos pertenecen a una sola área
    @ManyToOne(() => Area, (area) => area.objetos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_area' })
    area: Area;
}
