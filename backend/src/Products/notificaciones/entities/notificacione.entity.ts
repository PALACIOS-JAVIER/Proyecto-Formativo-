import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('notificaciones')
export class Notificacion {
    @PrimaryGeneratedColumn()
    id_notificacion: number;

    @Column()
    titulo: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column()
    tipo: string; // 'pending', 'info', 'reminder', 'observation'

    @Column({ default: true })
    is_new: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;

    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario_destino' })
    usuario_destino: Usuario;

    @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_usuario_origen' })
    usuario_origen: Usuario; // Puede ser nulo si es automática del sistema
}
