import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Item } from '../entities/item.entity';
import { ItemStatus } from '../items/item-status.enum';
import { CreateItemDto } from '../items/dto/create-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>,
  ) {}
  private items: Item[] = [];

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  async findById(id: string): Promise<Item> {
    const found = await this.itemRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException();
    }
    return found;
  }

  async create(createItemDto: CreateItemDto, user: User): Promise<Item> {
    const { name, price, description } = createItemDto;
    const item = this.itemRepository.create({
      name,
      price,
      description,
      status: ItemStatus.ON_SALE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user,
    });

    await this.itemRepository.save(item);
    return item;
  }

  async updateStatus(id: string, user: User): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id });
    if (item.userId === user.id) {
      throw new BadRequestException('自身の商品を購入することはできません');
    }
    item.status = ItemStatus.SOLD_OUT;
    item.updatedAt = new Date().toISOString();
    await this.itemRepository.update(id, {
      status: item.status,
      updatedAt: item.updatedAt,
    });
    return item;
  }

  async delete(id: string, user: User): Promise<void> {
    const item = await this.itemRepository.findOneBy({ id });
    if (item.userId !== user.id) {
      throw new BadRequestException('他人の商品を削除することはできません。');
    } else {
      console.log('Delete Successfully');
    }
    await this.itemRepository.delete({ id });
  }
}
