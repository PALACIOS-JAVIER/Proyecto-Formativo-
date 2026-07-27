import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InformeGC } from './informe-gc.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('observaciones_gc')
export class ObservacionGC {
    @PrimaryGeneratedColumn()
    id_observacion_gc: number;

    @Column({ type: 'text' })
    comentario: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @ManyToOne(() => InformeGC, informe => informe.observaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_informe_gc' })
    informe_gc: InformeGC;

    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_coordinador' })
    coordinador: Usuario;
}
