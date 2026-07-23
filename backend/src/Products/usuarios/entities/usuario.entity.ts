import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sede } from '../../sede/entities/sede.entity';
import { Rol } from '../../rol/entities/rol.entity';
import { Area } from '../../areas/entities/area.entity';


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

    @Column({ type: 'varchar' })
    codigoContrato: string;

    @Column({ type: 'int' })
    codigoSiif: number;

    @Column({ type: 'date' })
    fechaInicioContrato: Date;

    @Column({ type: 'date' })
    fechaFinContrato: Date;

    @Column({ type: 'varchar' })
    password: string;
}
