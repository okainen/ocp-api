import {EventEmitter} from 'events';
import {
  QUESTION_CREATED,
  QUESTION_DELETED,
  QUESTION_UPDATED
} from '@/constants/events';
import {Question, Quiz} from '@/entities';
import {IQuizGateway} from '../interfaces/gateways';

export default (quizGateway: IQuizGateway, emitter: EventEmitter) => {
  const insertQuestion = async (
    quiz: Quiz,
    question: Question,
    seqNum?: number
  ) => {
    const newQuestionArr = [
      ...quiz.questions.filter(item => !item.isEqual(question))
    ];
    newQuestionArr.splice(
      seqNum === undefined ? newQuestionArr.length : seqNum,
      0,
      question
    );
    await quizGateway.update(
      quiz.update({
        questions: newQuestionArr
      })
    );
  };

  emitter.on(
    QUESTION_CREATED,
    async ({
      quiz,
      question,
      seqNum
    }: {
      quiz: Quiz;
      question: Question;
      seqNum?: number;
    }) => {
      await insertQuestion(quiz, question, seqNum);
    }
  );

  emitter.on(
    QUESTION_UPDATED,
    async ({
      quiz,
      question,
      seqNum
    }: {
      quiz: Quiz;
      question: Question;
      seqNum?: number;
    }) => {
      await insertQuestion(quiz, question, seqNum);
    }
  );

  emitter.on(
    QUESTION_DELETED,
    async ({quiz, question}: {quiz: Quiz; question: Question}) => {
      await quizGateway.update(
        quiz.update({
          questions: quiz.questions.filter(item => !item.isEqual(question))
        })
      );
    }
  );
};
