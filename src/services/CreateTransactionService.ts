import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    // 3 - verifica saldo caso outcome
    // 4 - cadastra transacao

    let transaction = await transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    transaction = await transactionRepository.save(transaction);

    // transaction = transactionRepository
    console.log(transaction);

    const transactionTest = await transactionRepository.findOne({
      where: {
        title: 'March Salary',
      },
    });

    console.log('transactionTest', transactionTest);

    return transaction;
  }
}

export default CreateTransactionService;
