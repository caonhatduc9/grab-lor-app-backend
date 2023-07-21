import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Index("call_center_agent_fk0", ["userId"], {})
@Entity("call_center_agent", { schema: "grab_lor" })
export class CallCenterAgent {
  @PrimaryGeneratedColumn({ type: "int", name: "call_center_agent_id" })
  callCenterAgentId: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @ManyToOne(() => User, (user) => user.callCenterAgents, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
