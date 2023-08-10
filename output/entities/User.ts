import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CallCenterAgent } from "./CallCenterAgent";
import { Customer } from "./Customer";
import { Driver } from "./Driver";
import { Role } from "./Role";
import { Asset } from "./Asset";

@Index("user_FK", ["roleId"], {})
@Index("user_FK_2", ["avatar"], {})
@Entity("user", { schema: "grab_lor" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id" })
  userId: number;

  @Column("int", { name: "role_id" })
  roleId: number;

  @Column("varchar", { name: "username", nullable: true, length: 100 })
  username: string | null;

  @Column("varchar", { name: "email", length: 100 })
  email: string;

  @Column("varchar", { name: "password", length: 150 })
  password: string;

  @Column("varchar", { name: "phone_number", nullable: true, length: 12 })
  phoneNumber: string | null;

  @Column("int", { name: "avatar", nullable: true })
  avatar: number | null;

  @Column("tinyint", { name: "isActive", nullable: true })
  isActive: number | null;

  @Column("enum", {
    name: "auth_provider",
    enum: ["local", "google", "apple", "github"],
    default: () => "'local'",
  })
  authProvider: "local" | "google" | "apple" | "github";

  @OneToMany(() => CallCenterAgent, (callCenterAgent) => callCenterAgent.user)
  callCenterAgents: CallCenterAgent[];

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => Driver, (driver) => driver.user)
  drivers: Driver[];

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "roleId" }])
  role: Role;

  @ManyToOne(() => Asset, (asset) => asset.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "avatar", referencedColumnName: "assetId" }])
  avatar2: Asset;
}
