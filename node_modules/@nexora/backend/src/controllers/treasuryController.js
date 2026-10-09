import { ClubTreasury } from '../models/ClubTreasury.js';
import { ExpenseRequest } from '../models/ExpenseRequest.js';

export const getTreasury = async (req, res, next) => {
  try {
    // Basic implementation: get all clubs for MVP
    const clubs = await ClubTreasury.find().populate('president', 'name').populate('facultyAdvisor', 'name');
    res.status(200).json({ success: true, data: clubs });
  } catch (error) {
    next(error);
  }
};

export const createClub = async (req, res, next) => {
  try {
    const { clubName, balance, facultyAdvisorId } = req.body;
    const club = await ClubTreasury.create({
      clubName,
      president: req.user.id,
      facultyAdvisor: facultyAdvisorId || req.user.id, // Fallback for dev
      balance: balance || 0
    });
    res.status(201).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

export const requestExpense = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const request = await ExpenseRequest.create({
      club: req.params.clubId,
      requestedBy: req.user.id,
      amount,
      description
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await ExpenseRequest.find({ club: req.params.clubId }).populate('requestedBy', 'name');
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

export const approveExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseRequest.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    // In a real app, verify req.user.id === club.facultyAdvisor
    expense.status = 'Approved';
    await expense.save();
    
    // Deduct from balance
    const club = await ClubTreasury.findById(expense.club);
    club.balance -= expense.amount;
    await club.save();

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};
