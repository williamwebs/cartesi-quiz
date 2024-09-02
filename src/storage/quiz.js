class QuizStorage {
    quizzes;
    
    constructor() {
        this.quizzes = new Map();
    }

    addOne(quiz) {
        this.quizzes.set(quiz.id, quiz);
    }

    getAll() {
        return Array.from(this.quizzes.values()).map(quiz => quiz.getData());
    }

    getOneById(id) {
        return this.quizzes.get(id);
    }

    updateOne(quiz) {
        if (this.quizzes.has(quiz.id)) {
            this.quizzes.set(quiz.id, quiz);
            return true;
        }
        return false;
    }

    deleteOne(id) {
        return this.quizzes.delete(id);
    }

    addQuestionToQuiz(quizId, questionData) {
        const quiz = this.quizzes.get(quizId);
        if (quiz) {
            const newQuestion = quiz.addQuestion(questionData);
            this.updateOne(quiz);
            return newQuestion;
        }
        return null;
    }
}

export const quizStorage = new QuizStorage();