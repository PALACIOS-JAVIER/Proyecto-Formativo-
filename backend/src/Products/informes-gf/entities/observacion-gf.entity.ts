import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InformeGF } from './informe-gf.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('observaciones_gf')
export class ObservacionGF {
    @PrimaryGeneratedColumn()
    id_observacion_gf: number;

    @Column({ type: 'text' })
    comentario: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @ManyToOne(() => InformeGF, informe => informe.observaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_informe_gf' })
    informe_gf: InformeGF;

    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_coordinador' })
    coordinador: Usuario;
}
