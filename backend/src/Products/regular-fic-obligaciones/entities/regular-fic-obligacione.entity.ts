import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('regular_fic_obligaciones')
export class RegularFicObligacione {
    @PrimaryGeneratedColumn()
    id_obligacion: number;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ type: 'int', default: 0 })
    orden: number;

    @Column({ type: 'boolean', default: true })
    activa: boolean;
}
