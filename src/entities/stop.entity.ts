import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './location.entity';

@Index('stop_fk0', ['location'], {})
@Entity('stop', { schema: 'grab_lor' })
export class Stop {
  @PrimaryGeneratedColumn({ type: 'int', name: 'stop_id' })
  stopId: number;

  @Column('int', { name: 'location' })
  location: number;

  @ManyToOne(() => Location, (location) => location.stops, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'location', referencedColumnName: 'locationId' }])
  location2: Location;
}
