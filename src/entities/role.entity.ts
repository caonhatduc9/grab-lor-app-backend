import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("role", { schema: "grab_lor" })
export class Role {
  @PrimaryGeneratedColumn({ type: "int", name: "role_id" })
  roleId: number;

  @Column("varchar", { name: "role_name", length: 20 })
  roleName: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
