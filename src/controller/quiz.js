import { Quiz, QuestionType } from '../model/Quiz';
import { RollupStateHandler } from '../shared/rollup-state-handler';
import { quizStorage } from '../storage/quiz';

export class QuizController {
    async createQuiz(data) {
        if (!data.title) {
            return await RollupStateHandler.handleReport({
                error: 'Quiz title must be provided.',
            });
        }

        return await RollupStateHandler.advanceWrapper(() => {
            const newQuiz = new Quiz({
                title: data.title,
                description: data.description,
            });
            quizStorage.addOne(newQuiz);

            return {
                ok: true,
                message: 'Quiz created successfully!',
                data: newQuiz.getData(),
            };
        });
    }

    async getAllQuizzes() {
        return await RollupStateHandler.inspectWrapper(() =>
            quizStorage.getAll()
        );
    }

    async getQuizById(data) {
        const quizId = data[0];
        const quiz = quizStorage.getOneById(quizId);

        if (!quiz) {
            return await RollupStateHandler.handleReport({
                error: `Quiz not found for id '${quizId}'.`,
            });
        }

        return await RollupStateHandler.inspectWrapper(() => ({
            data: quiz.getData(),
            questions: quiz.getQuestions(),
        }));
    }

    async addQuestion(data) {
        if (!data.quizId || !data.text || !data.type) {
            return await RollupStateHandler.handleReport({
                error: 'Quiz id, question text, and question type must be provided.',
            });
        }

        if (!QuestionType[data.type]) {
            return await RollupStateHandler.handleReport({
                error: 'Invalid question type.',
            });
        }

        return await RollupStateHandler.advanceWrapper(() => {
            const newQuestion = quizStorage.addQuestionToQuiz(data.quizId, {
                text: data.text,
                type: data.type,
                options: data.options,
                correctAnswer: data.correctAnswer,
            });

            if (!newQuestion) {
                return {
                    ok: false,
                    message: `Failed to add question. Quiz with id '${data.quizId}' not found.`,
                };
            }

            return {
                ok: true,
                message: `Question added successfully to quiz '${data.quizId}'!`,
                data: newQuestion.getData(),
            };
        });
    }

    async deleteQuiz(data) {
        const quizId = data.id;

        return await RollupStateHandler.advanceWrapper(() => {
            const deleted = quizStorage.deleteOne(quizId);

            if (deleted) {
                return {
                    ok: true,
                    message: `Quiz '${quizId}' deleted successfully!`,
                };
            } else {
                return {
                    ok: false,
                    message: `Quiz '${quizId}' not found or could not be deleted.`,
                };
            }
        });
    }
}