import crypto from 'node:crypto';

export const QuestionType = {
    multipleChoice: 'multipleChoice',
    trueFalse: 'trueFalse',
    shortAnswer: 'shortAnswer',
};

export class Question {
    id;
    quizId;
    text;
    type;
    options;
    correctAnswer;

    constructor({ quizId, text, type, options, correctAnswer }) {
        this.id = crypto.randomUUID();
        this.quizId = quizId;
        this.text = text;
        
        if (type && QuestionType[type]) {
            this.type = QuestionType[type];
        } else {
            throw { error: 'Invalid question type.' };
        }

        this.options = options;
        this.correctAnswer = correctAnswer;
    }

    getData() {
        return {
            id: this.id,
            quizId: this.quizId,
            text: this.text,
            type: this.type,
            options: this.options,
        };
    }
}

export class Quiz {
    id;
    createdAt;
    title;
    description;
    questions;

    /**
     * ### Quiz model
     * @requires title: string {*}
     * @param {*} description string
     * @param {*} questions Array<Question>
     */
    constructor({ title, description, questions = [] }) {
        this.id = crypto.randomUUID();
        this.createdAt = Date.now();
        this.title = title;
        this.description = description;
        this.questions = questions;
    }

    addQuestion(question) {
        const newQuestion = new Question({ ...question, quizId: this.id });
        this.questions.push(newQuestion);
        return newQuestion;
    }

    /**
     * ### Quiz getData
     * @description return quiz basic data.
     * @returns {*}
     * quiz {
     *   id: UUID
     *   createdAt: number
     *   title: string
     *   description: string
     *   questionCount: number
     * }
     */
    getData() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            title: this.title,
            description: this.description,
            questionCount: this.questions.length,
        };
    }

    getQuestions() {
        return this.questions.map(q => q.getData());
    }
}