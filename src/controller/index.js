import { QuizController } from './quiz';

const quizController = new QuizController();

export const controller = {
    createQuiz: quizController.createQuiz,
    getAllQuizzes: quizController.getAllQuizzes,
    getQuizById: quizController.getQuizById,
    addQuestion: quizController.addQuestion,
    deleteQuiz: quizController.deleteQuiz,
};