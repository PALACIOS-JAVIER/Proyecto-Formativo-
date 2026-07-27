import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('campesena_obligaciones')
export class CampesenaObligacione {
    @PrimaryGeneratedColumn()
    id_obligacion: number;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ type: 'int', default: 0 })
    orden: number;

    @Column({ type: 'boolean', default: true })
    activa: boolean;
}
