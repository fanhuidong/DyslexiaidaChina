import type { Schema, Struct } from '@strapi/strapi';

export interface QuizQuestionItem extends Struct.ComponentSchema {
  collectionName: 'components_quiz_question_items';
  info: {
    displayName: 'QuestionItem';
  };
  attributes: {
    QuestionText: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'quiz.question-item': QuizQuestionItem;
    }
  }
}
