import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { SocketDriver } from "./socketDriver.entity";
import { SocketCustomer } from "./socketCustomer.entity";

@Index("socket_driver_customer_FK", ["socketDriverId"], {})
@Index("socket_driver_customer_FK_1", ["socketCustomerId"], {})
@Entity("socket_driver_customer", { schema: "grab_lor" })
export class SocketDriverCustomer {
    @Column("int", { name: "socket_driver_id", nullable: true })
    socketDriverId: number | null;

    @Column("int", { name: "socket_customer_id", nullable: true })
    socketCustomerId: number | null;

    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @ManyToOne(
        () => SocketDriver,
        (socketDriver) => socketDriver.socketDriverCustomers,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
    )
    @JoinColumn([{ name: "socket_driver_id", referencedColumnName: "id" }])
    socketDriver: SocketDriver;

    @ManyToOne(
        () => SocketCustomer,
        (socketCustomer) => socketCustomer.socketDriverCustomers,
        { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
    )
    @JoinColumn([{ name: "socket_customer_id", referencedColumnName: "id" }])
    socketCustomer: SocketCustomer;
}
