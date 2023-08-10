import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Driver } from "./driver.entity";

@Index("socket_driver_FK", ["driverId"], {})
@Entity("socket_driver", { schema: "grab_lor" })
export class SocketDriver {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("varchar", { name: "socket_id", nullable: true, length: 50 })
    socketId: string | null;

    @Column("int", { name: "driver_id", nullable: true })
    driverId: number | null;

    @ManyToOne(() => Driver, (driver) => driver.socketDrivers, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "driver_id", referencedColumnName: "driverId" }])
    driver: Driver;
}
