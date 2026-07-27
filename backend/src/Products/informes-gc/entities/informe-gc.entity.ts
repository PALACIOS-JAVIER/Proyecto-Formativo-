import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ObservacionGC } from './observacion-gc.entity';

@Entity('informes_gc')
export class InformeGC {
    @PrimaryGeneratedColumn()
    id_informe_gc: number;

    @Column()
    mes: string;

    @Column()
    anio: number;

    @Column({ default: 'warning' }) // 'success', 'warning', 'alert'
    estado: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha_registro: Date;

    @Column({ nullable: true })
    archivo_url: string;

    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @OneToMany(() => ObservacionGC, obs => obs.informe_gc)
    observaciones: ObservacionGC[];
}
