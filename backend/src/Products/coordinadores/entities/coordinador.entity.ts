import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Sede } from '../../sede/entities/sede.entity';

@Entity('coordinadores')
export class Coordinador {
  @PrimaryGeneratedColumn()
  id_coordinador: number;

  @Column({ type: 'int', default: 2026 })
  anio_ejercicio: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Sede, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'id_sede' })
  sede: Sede;
}
