import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('historial')
export class Historial {
    @PrimaryGeneratedColumn()
    id_historial: number;

    @Column()
    accion: string; // Ej: 'Aprobó informe', 'Mandó a corregir'

    @Column({ type: 'text' })
    detalles: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    // Quien realiza la acción (Coordinador)
    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_coordinador' })
    coordinador: Usuario;

    // Sobre quién recae la acción (Instructor - opcional)
    @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'id_instructor' })
    instructor_afectado: Usuario | null;
}
