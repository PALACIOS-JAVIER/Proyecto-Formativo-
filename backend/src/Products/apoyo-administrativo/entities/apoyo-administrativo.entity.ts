import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Coordinador } from '../../coordinador/entities/coordinador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('apoyos_administrativos')
export class ApoyoAdministrativo {
    @PrimaryGeneratedColumn()
    id_apoyo: number;

    @ManyToOne(() => Coordinador, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_coordinador' })
    coordinador: Coordinador;

    @OneToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;
}
