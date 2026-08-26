import { Faq } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listFaqs = asyncHandler(async (req, res) => {
  const { category, isPublished } = req.query;
  const where = {};
  if (category) where.category = category;
  if (isPublished !== undefined) where.isPublished = isPublished === 'true';

  const faqs = await Faq.findAll({
    where,
    order: [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC'],
    ],
  });

  return res.json({ faqs });
});

export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category = 'general', sortOrder = 0, isPublished = true } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: 'Question and answer are required.' });
  }

  const faq = await Faq.create({
    question: question.trim(),
    answer: answer.trim(),
    category,
    sortOrder: Number(sortOrder) || 0,
    isPublished: Boolean(isPublished),
  });

  return res.status(201).json({ faq, message: 'FAQ created successfully.' });
});

export const updateFaq = asyncHandler(async (req, res) => {
  const { faqId } = req.params;
  const faq = await Faq.findByPk(faqId);
  if (!faq) {
    return res.status(404).json({ message: 'FAQ not found.' });
  }

  const { question, answer, category, sortOrder, isPublished } = req.body;
  if (question !== undefined) faq.question = question.trim();
  if (answer !== undefined) faq.answer = answer.trim();
  if (category !== undefined) faq.category = category;
  if (sortOrder !== undefined) faq.sortOrder = Number(sortOrder);
  if (isPublished !== undefined) faq.isPublished = Boolean(isPublished);

  await faq.save();
  return res.json({ faq, message: 'FAQ updated successfully.' });
});

export const deleteFaq = asyncHandler(async (req, res) => {
  const { faqId } = req.params;
  const faq = await Faq.findByPk(faqId);
  if (!faq) {
    return res.status(404).json({ message: 'FAQ not found.' });
  }
  await faq.destroy();
  return res.json({ message: 'FAQ deleted.' });
});
