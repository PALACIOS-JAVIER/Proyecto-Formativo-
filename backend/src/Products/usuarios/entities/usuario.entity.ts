import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sede } from '../../sede/entities/sede.entity';
import { Rol } from '../../rol/entities/rol.entity';
import { Area } from '../../areas/entities/area.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';


@Entity('usuarios')
export class Usuario {

    @PrimaryGeneratedColumn()
    id_Usuario: number;

    @Column({ type: 'varchar', length: 200 })
    nombre: string;

    @Column({ type: 'varchar', length: 200 })
    apellido: string;

    @Column({ type: 'bigint', unique: true })
    cedula: number;

    @Column({ type: 'bigint', unique: true })
    telefono: number;

    @Column({ type: 'varchar', unique: true })
    correo: string;

    @ManyToOne(() => Sede, { eager: false })
    @JoinColumn({ name: 'id_sede' })
    sede: Sede;

    @ManyToOne(() => Rol, { eager: false })
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    @ManyToOne(() => Area, { eager: false })
    @JoinColumn({ name: 'id_area' })
    area: Area;

    // Nueva relación con especialidad
    @ManyToOne(() => Especialidad, { eager: false, nullable: true })
    @JoinColumn({ name: 'id_especialidad' })
    especialidad: Especialidad | null;

    @Column({ type: 'varchar', nullable: true })
    codigoContrato?: string;

    @Column({ type: 'int', nullable: true })
    codigoSiif?: number;

    @Column({ type: 'date', nullable: true })
    fechaInicioContrato?: Date;

    @Column({ type: 'date', nullable: true })
    fechaFinContrato?: Date;

    @Column({ type: 'varchar', default: 'pendiente', nullable: true })
    estado_cuenta: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'varchar', nullable: true })
    fotoPerfil?: string;

    @Column({ type: 'varchar', nullable: true })
    firma?: string;
}
