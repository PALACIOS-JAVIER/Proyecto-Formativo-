import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ObservacionGF } from './observacion-gf.entity';

@Entity('informes_gf')
export class InformeGF {
    @PrimaryGeneratedColumn()
    id_informe_gf: number;

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

  @Column({ nullable: true })
  archivo_firmado_url: string;

    @Column({ type: 'text', nullable: true })
    analisis_ia: string;

    @Column({ type: 'varchar', nullable: true, default: 'pendiente' })
    veredicto_ia: string;

    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @OneToMany(() => ObservacionGF, obs => obs.informe_gf)
    observaciones: ObservacionGF[];
}
