import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DriverLicense } from "./DriverLicense";
import { User } from "./User";
import { Vehicle } from "./Vehicle";

@Entity("asset", { schema: "grab_lor" })
export class Asset {
  @PrimaryGeneratedColumn({ type: "int", name: "asset_id" })
  assetId: number;

  @Column("enum", { name: "type", enum: ["IMAGE", "AUDIO"] })
  type: "IMAGE" | "AUDIO";

  @Column("text", { name: "url" })
  url: string;

  @OneToMany(() => DriverLicense, (driverLicense) => driverLicense.image2)
  driverLicenses: DriverLicense[];

  @OneToMany(() => User, (user) => user.avatar2)
  users: User[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.image2)
  vehicles: Vehicle[];
}
