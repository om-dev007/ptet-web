const { UserAnswer, Question, TestAttempt } = require('../models');
const { transcribeAudioUrl } = require('../services/speechToTextService');
const { evaluateSpeakingAnswer } = require('../services/aiScoringService');

const submitAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { question_id, answer, time_taken_seconds } = req.body;

    if (!question_id) {
      return res.status(400).json({ success: false, message: 'question_id is required' });
    }

    const attempt = await TestAttempt.findByPk(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Test attempt not found' });
    }

    const question = await Question.findByPk(question_id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    let finalAnswer = typeof answer === 'object' && answer !== null ? { ...answer } : { text: answer };
    let userScore = null;
    let userFeedback = null;

    if (question.type === 'speaking' && finalAnswer.audioUrl) {
      try {
        const transcript = await transcribeAudioUrl(finalAnswer.audioUrl);
        finalAnswer.transcript = transcript;

        try {
          const scoringResult = await evaluateSpeakingAnswer(
            transcript,
            question.content,
            question.scoring_rubric
          );
          userScore = scoringResult.overallScore;
          userFeedback = scoringResult;
        } catch (scoringError) {
          console.error('Error during AI scoring:', scoringError);
          userFeedback = { error: 'Failed to generate AI feedback' };
        }

      } catch (error) {
        console.error('Error during transcription:', error);
        finalAnswer.transcriptError = error.message;
      }
    }

    let userAnswer = await UserAnswer.findOne({
      where: {
        attempt_id: attemptId,
        question_id: question_id
      }
    });

    if (userAnswer) {
      userAnswer.answer = finalAnswer;
      userAnswer.score = userScore !== null ? userScore : userAnswer.score;
      userAnswer.feedback = userFeedback !== null ? userFeedback : userAnswer.feedback;
      userAnswer.time_taken_seconds = time_taken_seconds || userAnswer.time_taken_seconds;
      await userAnswer.save();
    } else {
      userAnswer = await UserAnswer.create({
        attempt_id: attemptId,
        question_id: question_id,
        answer: finalAnswer,
        score: userScore,
        feedback: userFeedback,
        time_taken_seconds: time_taken_seconds || 0,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer submitted successfully',
      data: userAnswer,
    });
  } catch (error) {
    next(error);
  }
};

const getAnswerFeedback = async (req, res, next) => {
  try {
    const { attemptId, answerId } = req.params;

    const userAnswer = await UserAnswer.findOne({
      where: {
        id: answerId,
        attempt_id: attemptId
      }
    });

    if (!userAnswer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: userAnswer.id,
        score: userAnswer.score,
        feedback: userAnswer.feedback,
        answer: userAnswer.answer
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAnswer,
  getAnswerFeedback,
};
