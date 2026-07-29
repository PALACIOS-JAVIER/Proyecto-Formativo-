import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Sede } from '../../sede/entities/sede.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('coordinadores')
export class Coordinador {
    @PrimaryGeneratedColumn()
    id_coordinador: number;

    @OneToOne(() => Sede, sede => sede.coordinador, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_sede' })
    sede: Sede;

    @ManyToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @Column({ type: 'int', nullable: true })
    anio_ejercicio: number;
}
