import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coordinador } from '../../coordinadores/entities/coordinador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('apoyos_administrativos')
export class ApoyoAdministrativo {
  @PrimaryGeneratedColumn()
  id_apoyo: number;

  @ManyToOne(() => Coordinador, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'id_coordinador' })
  coordinador: Coordinador;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
