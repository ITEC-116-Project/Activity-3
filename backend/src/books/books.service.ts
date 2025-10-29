// src/books/books.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
  ) {}

  findAll() {
    return this.bookRepo.find();
  }

  findOne(id: number) {
    return this.bookRepo.findOne({ where: { id } });
  }

  create(data: Partial<Book>) {
    const book = this.bookRepo.create(data);
    return this.bookRepo.save(book);
  }

  async update(id: number, data: Partial<Book>) {
    await this.bookRepo.update(id, data);
    return this.findOne(id);
  }

  delete(id: number) {
    return this.bookRepo.delete(id);
  }
}
