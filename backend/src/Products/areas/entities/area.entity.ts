import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';
import { ObjetoContractual } from '../../objeto-contractual/entities/objeto-contractual.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';

@Entity('areas')
export class Area {
    @PrimaryGeneratedColumn()
    id_area: number;

    @Column()
    nombre: string; // 'AGRÍCOLA', 'COMUNICACIÓN', 'OPERACIONES FORESTALES', etc.

    @ManyToOne(() => Rol, (rol) => rol.areas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    // Relación: Un área tiene muchas especialidades
    @OneToMany(() => Especialidad, (esp) => esp.area)
    especialidades: Especialidad[];

    // Relación: Un área tiene muchos objetos contractuales
    @OneToMany(() => ObjetoContractual, (objeto) => objeto.area)
    objetos: ObjetoContractual[];
}
