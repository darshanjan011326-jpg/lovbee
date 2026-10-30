import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  HelpCircle,
  MessageCircleQuestion,
  Compass,
  CheckCircle2,
  Share2,
  Heart,
  Flame,
  ArrowRight,
  RotateCcw,
  Calendar,
  Layers,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Sparkle,
  Trash2,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import {
  Profile,
  QuizResult,
  DailyPromptAnswer,
  ThisOrThatQuestion,
  ThisOrThatAnswer,
  QuizSet,
} from '../types';
import { store, getTodayDateString } from '../services/store';

interface PlayViewProps {
  currentUser: Profile;
  onExploreChallenge?: () => void;
}

export const PlayView: React.FC<PlayViewProps> = ({ currentUser, onExploreChallenge }) => {
  const [activeGameTab, setActiveGameTab] = useState<'this_or_that' | 'daily_question' | 'hobby_quiz'>(
    'this_or_that'
  );

  // -------------------------------------------------------------
  // 1. THIS OR THAT STATE
  // -------------------------------------------------------------
  const allTotQuestions = store.getThisOrThatQuestions();
  const [totAnswers, setTotAnswers] = useState<Record<string, ThisOrThatAnswer>>(
    store.getThisOrThatAnswers(currentUser.id)
  );

  // Active question being displayed (next unused or specific question)
  const [activeTotQuestion, setActiveTotQuestion] = useState<ThisOrThatQuestion | null>(null);
  const [activeTotAnswer, setActiveTotAnswer] = useState<ThisOrThatAnswer | null>(null);
  const [totFeedbackReaction, setTotFeedbackReaction] = useState<string | null>(null);
  const [totPoolExhausted, setTotPoolExhausted] = useState(false);

  // Find next unserved question
  const loadNextUnusedTotQuestion = (skipIds: string[] = []) => {
    const nextQ = store.getNextUnusedThisOrThatQuestion(currentUser.id, skipIds);
    if (nextQ) {
      setActiveTotQuestion(nextQ);
      setActiveTotAnswer(null);
      setTotFeedbackReaction(null);
      setTotPoolExhausted(false);
    } else {
      // All questions have been answered or no unused question left
      const answersMap = store.getThisOrThatAnswers(currentUser.id);
      const answeredCount = Object.keys(answersMap).length;
      if (answeredCount >= allTotQuestions.length || answeredCount > 0) {
        setTotPoolExhausted(true);
        setActiveTotQuestion(null);
      } else if (allTotQuestions.length > 0) {
        setActiveTotQuestion(allTotQuestions[0]);
        setTotPoolExhausted(false);
      }
    }
  };

  useEffect(() => {
    loadNextUnusedTotQuestion();
  }, [currentUser.id]);

  const handleSelectTotChoice = (option: 'A' | 'B') => {
    if (!activeTotQuestion) return;
    const { answer, reaction } = store.submitThisOrThatAnswer(activeTotQuestion.id, option);
    setActiveTotAnswer(answer);
    setTotFeedbackReaction(reaction);
    setTotAnswers(store.getThisOrThatAnswers(currentUser.id));
  };

  const handleResetTotHistory = () => {
    if (window.confirm('Reset your This or That history to play through all choices again?')) {
      store.resetThisOrThatHistory(currentUser.id);
      setTotAnswers({});
      setTotPoolExhausted(false);
      loadNextUnusedTotQuestion();
    }
  };

  // -------------------------------------------------------------
  // 2. DAILY QUESTION STATE
  // -------------------------------------------------------------
  const todayDateStr = getTodayDateString();
  const todayPrompt = store.getTodayPrompt(todayDateStr);
  const [promptAnswers, setPromptAnswers] = useState<DailyPromptAnswer[]>(
    store.getDailyPromptAnswers(currentUser.id)
  );
  const todayExistingAnswer = promptAnswers.find((a) => a.calendarDate === todayDateStr);

  const [dailyAnswerInput, setDailyAnswerInput] = useState(todayExistingAnswer?.answerText || '');
  const [dailyShareOnProfile, setDailyShareOnProfile] = useState(
    todayExistingAnswer ? todayExistingAnswer.shareOnProfile : false
  );
  const [dailySaveSuccess, setDailySaveSuccess] = useState(false);
  const [isEditingTodayAnswer, setIsEditingTodayAnswer] = useState(false);

  // Sync state if existing answer changes
  useEffect(() => {
    if (todayExistingAnswer && !isEditingTodayAnswer) {
      setDailyAnswerInput(todayExistingAnswer.answerText);
      setDailyShareOnProfile(todayExistingAnswer.shareOnProfile);
    }
  }, [todayExistingAnswer, isEditingTodayAnswer]);

  const handleSubmitDailyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyAnswerInput.trim()) return;

    store.submitDailyPromptAnswer(
      todayPrompt.id,
      todayPrompt.prompt,
      dailyAnswerInput,
      dailyShareOnProfile,
      todayDateStr
    );

    setPromptAnswers(store.getDailyPromptAnswers(currentUser.id));
    setDailySaveSuccess(true);
    setIsEditingTodayAnswer(false);
    setTimeout(() => setDailySaveSuccess(false), 3500);
  };

  const handleDeletePromptAnswer = (answerId: string) => {
    store.deleteDailyPromptAnswer(answerId);
    setPromptAnswers(store.getDailyPromptAnswers(currentUser.id));
    if (todayExistingAnswer?.id === answerId) {
      setDailyAnswerInput('');
      setIsEditingTodayAnswer(false);
    }
  };

  // -------------------------------------------------------------
  // 3. MULTI-QUIZ STATE
  // -------------------------------------------------------------
  const availableQuizzes = store.getAvailableQuizzes();
  const [selectedQuizId, setSelectedQuizId] = useState<string>(availableQuizzes[0].id);
  const [userQuizResults, setUserQuizResults] = useState<QuizResult[]>(
    store.getUserQuizResults(currentUser.id)
  );

  // Active quiz in progress
  const activeQuiz = availableQuizzes.find((q) => q.id === selectedQuizId) || availableQuizzes[0];
  const activeQuizResult = store.getSavedQuizResult(currentUser.id, selectedQuizId);

  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [inProgressQuizAnswers, setInProgressQuizAnswers] = useState<Record<string, string>>({});
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentQuizStep(0);
    setInProgressQuizAnswers({});
    setIsTakingQuiz(true);
  };

  const handleSelectQuizOption = (questionId: string, optionId: string) => {
    const updated = { ...inProgressQuizAnswers, [questionId]: optionId };
    setInProgressQuizAnswers(updated);

    if (currentQuizStep < activeQuiz.questions.length - 1) {
      setCurrentQuizStep(currentQuizStep + 1);
    } else {
      // Completed all questions in this quiz!
      store.submitHobbyQuizAnswers(activeQuiz.id, updated);
      setUserQuizResults(store.getUserQuizResults(currentUser.id));
      setIsTakingQuiz(false);
    }
  };

  const handleRetakeQuiz = (quizId: string) => {
    store.retakeQuiz(quizId, currentUser.id);
    setUserQuizResults(store.getUserQuizResults(currentUser.id));
    handleStartQuiz(quizId);
  };

  const totalAnsweredTotCount = Object.keys(totAnswers).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#150D11] rounded-3xl border border-[#BE123C]/25 p-6 sm:p-8 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E11D48]/15 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
            <Sparkles className="w-3.5 h-3.5 text-[#FDA4AF]" />
            <span>Lovbee Play Lounge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Playful Prompts & Romantic Chemistry
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            Spark meaningful conversations, explore your romantic archetypes, and uncover delightful
            quirks through clever interactive games.
          </p>
        </div>

        {/* 3 Game Sub-Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#BE123C]/20 pt-5">
          <button
            onClick={() => setActiveGameTab('this_or_that')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeGameTab === 'this_or_that'
                ? 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white shadow-[0_0_20px_rgba(225,29,72,0.45)]'
                : 'bg-[#1C1216] text-stone-400 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>This or That</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {totalAnsweredTotCount}/{allTotQuestions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveGameTab('daily_question')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeGameTab === 'daily_question'
                ? 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white shadow-[0_0_20px_rgba(225,29,72,0.45)]'
                : 'bg-[#1C1216] text-stone-400 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            <span>Daily Question</span>
            {todayExistingAnswer && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                Done Today
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveGameTab('hobby_quiz')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeGameTab === 'hobby_quiz'
                ? 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white shadow-[0_0_20px_rgba(225,29,72,0.45)]'
                : 'bg-[#1C1216] text-stone-400 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Hobby Personality Quizzes</span>
            {userQuizResults.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#BE123C]/30 text-[#FDA4AF] font-mono">
                {userQuizResults.length}/{availableQuizzes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: THIS OR THAT                                          */}
      {/* ============================================================= */}
      {activeGameTab === 'this_or_that' && (
        <div className="space-y-6">
          {/* Main Question Card or Completed Vault Banner */}
          {totPoolExhausted || !activeTotQuestion ? (
            <div className="bg-[#151515] rounded-3xl border border-[#F5D061]/30 p-8 sm:p-10 text-center space-y-4 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5D061]/10 blur-[90px] pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-[#F5D061]/15 border border-[#F5D061]/40 flex items-center justify-center mx-auto text-[#F5D061] shadow-[0_0_20px_rgba(245,208,97,0.3)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                You've Explored All Choices!
              </h2>
              <p className="text-sm text-stone-300 max-w-lg mx-auto">
                You’ve shared your take on every dilemma in the Lovbee vault ({totalAnsweredTotCount} pairs).
                Your choices shape your romantic compass and show what truly makes you buzz.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleResetTotHistory}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset & Play Again</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#FB7185] uppercase bg-[#E11D48]/15 px-2.5 py-0.5 rounded-full border border-[#E11D48]/30">
                      {activeTotQuestion.situationContext || activeTotQuestion.category}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Answered: {totalAnsweredTotCount} / {allTotQuestions.length}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">
                    Which feels truer to you?
                  </h2>
                </div>

                {/* Skip to Next Button */}
                <button
                  onClick={() => loadNextUnusedTotQuestion([activeTotQuestion.id])}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 border border-white/5"
                >
                  <span>Skip to another</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E11D48] to-[#F5D061] transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalAnsweredTotCount / allTotQuestions.length) * 100)}%`,
                  }}
                />
              </div>

              {/* Two Interactive Option Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {/* Option A */}
                {(() => {
                  const isSelected = activeTotAnswer?.selectedOption === 'A';
                  const isAnswered = Boolean(activeTotAnswer);
                  const percentA = activeTotQuestion.communityPercentA;

                  return (
                    <button
                      onClick={() => handleSelectTotChoice('A')}
                      className={`text-left p-6 sm:p-7 rounded-2xl border transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#2B0813] to-[#1C1C1E] border-[#E11D48] ring-2 ring-[#E11D48]/40 shadow-[0_10px_30px_rgba(225,29,72,0.25)]'
                          : 'bg-[#1C1C1E] border-white/10 hover:border-white/25 hover:bg-[#222226]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono uppercase font-bold text-stone-300">
                            Choice A
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#FDA4AF] transition-colors leading-snug">
                            {activeTotQuestion.optionA.label}
                          </h3>
                          {activeTotQuestion.optionA.sublabel && (
                            <p className="text-xs text-stone-400">{activeTotQuestion.optionA.sublabel}</p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-[#E11D48] flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_#E11D48]">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Community Choice Bar */}
                      {isAnswered && (
                        <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-stone-400">Community Resonance</span>
                            <span className="font-mono font-bold text-white">{percentA}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E11D48] to-[#F5D061] rounded-full transition-all duration-700"
                              style={{ width: `${percentA}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })()}

                {/* Option B */}
                {(() => {
                  const isSelected = activeTotAnswer?.selectedOption === 'B';
                  const isAnswered = Boolean(activeTotAnswer);
                  const percentB = 100 - activeTotQuestion.communityPercentA;

                  return (
                    <button
                      onClick={() => handleSelectTotChoice('B')}
                      className={`text-left p-6 sm:p-7 rounded-2xl border transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#2B0813] to-[#1C1C1E] border-[#E11D48] ring-2 ring-[#E11D48]/40 shadow-[0_10px_30px_rgba(225,29,72,0.25)]'
                          : 'bg-[#1C1C1E] border-white/10 hover:border-white/25 hover:bg-[#222226]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono uppercase font-bold text-stone-300">
                            Choice B
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#FDA4AF] transition-colors leading-snug">
                            {activeTotQuestion.optionB.label}
                          </h3>
                          {activeTotQuestion.optionB.sublabel && (
                            <p className="text-xs text-stone-400">{activeTotQuestion.optionB.sublabel}</p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-[#E11D48] flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_#E11D48]">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Community Choice Bar */}
                      {isAnswered && (
                        <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-stone-400">Community Resonance</span>
                            <span className="font-mono font-bold text-white">{percentB}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E11D48] to-[#F5D061] rounded-full transition-all duration-700"
                              style={{ width: `${percentB}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })()}
              </div>

              {/* Reaction Banner & "Next Question" Action */}
              {activeTotAnswer && (
                <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2B0813] via-[#1C1C1E] to-[#1C1C1E] border border-[#E11D48]/40 flex items-start gap-3 shadow-[0_4px_20px_rgba(225,29,72,0.15)]">
                    <div className="w-8 h-8 rounded-full bg-[#E11D48]/20 border border-[#E11D48]/40 flex items-center justify-center text-[#F5D061] shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono uppercase font-bold text-[#FB7185]">
                        What this says about you
                      </span>
                      <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
                        {totFeedbackReaction || activeTotAnswer.reactionGiven}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-400">
                      Saved to your romantic profile insights
                    </span>
                    <button
                      onClick={() => loadNextUnusedTotQuestion()}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E11D48] to-[#9F1239] hover:from-[#BE123C] hover:to-[#881337] transition-all shadow-[0_4px_15px_rgba(225,29,72,0.3)] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next Choice</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Your Answers History */}
          <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#FB7185]" />
                <span>Your This or That Compass ({totalAnsweredTotCount} Answered)</span>
              </h3>
              {totalAnsweredTotCount > 0 && (
                <button
                  onClick={handleResetTotHistory}
                  className="text-xs text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {totalAnsweredTotCount === 0 ? (
              <p className="text-xs text-stone-400 italic">
                You haven't answered any choices yet. Choose an option above to build your compass!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(totAnswers).map((ans) => {
                  const q = allTotQuestions.find((item) => item.id === ans.questionId);
                  return (
                    <div
                      key={ans.id}
                      className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1.5 text-xs hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-stone-400 uppercase font-mono">
                        <span className="truncate">{q?.category || 'Preference'}</span>
                        <span className="text-[#F5D061] font-bold">Option {ans.selectedOption}</span>
                      </div>
                      <p className="font-semibold text-white truncate">“{ans.selectedLabel}”</p>
                      {ans.reactionGiven && (
                        <p className="text-[11px] text-stone-400 line-clamp-2 italic">
                          {ans.reactionGiven}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: DAILY QUESTION                                        */}
      {/* ============================================================= */}
      {activeGameTab === 'daily_question' && (
        <div className="space-y-6">
          {/* Today's Question Card */}
          <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E11D48]/10 blur-[100px] pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
                  <Calendar className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>Today’s Conversation Spark</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {todayDateStr} · {todayPrompt.category}
                </span>
                {todayExistingAnswer && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Answered</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-snug pt-1">
                “{todayPrompt.prompt}”
              </h2>

              {todayPrompt.exampleAnswer && (
                <p className="text-xs text-stone-400 italic">
                  Inspiration: “{todayPrompt.exampleAnswer}”
                </p>
              )}
            </div>

            {/* If already answered today and not currently editing, show completed answer card */}
            {todayExistingAnswer && !isEditingTodayAnswer ? (
              <div className="p-6 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-4 relative z-10 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-stone-400 border-b border-white/5 pb-2">
                  <span className="font-semibold text-[#FDA4AF]">Your Answer for Today:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingTodayAnswer(true)}
                      className="text-stone-400 hover:text-white flex items-center gap-1 text-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <p className="text-stone-100 text-sm leading-relaxed whitespace-pre-line font-serif italic">
                  “{todayExistingAnswer.answerText}”
                </p>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-stone-400">
                    {todayExistingAnswer.shareOnProfile ? (
                      <span className="inline-flex items-center gap-1 text-[#F5D061] font-mono text-[11px]">
                        <Share2 className="w-3 h-3" />
                        Showcased on your dating profile
                      </span>
                    ) : (
                      <span className="text-stone-400 italic text-[11px]">
                        🔒 Private to your personal journal
                      </span>
                    )}
                  </span>

                  <span className="text-[11px] text-stone-400 font-mono">
                    Locked in for {todayDateStr}
                  </span>
                </div>
              </div>
            ) : (
              /* Response Form */
              <form onSubmit={handleSubmitDailyAnswer} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Your Personal Reflection
                  </label>
                  <textarea
                    value={dailyAnswerInput}
                    onChange={(e) => setDailyAnswerInput(e.target.value)}
                    placeholder="Share a vivid memory, a funny quirk, or what this brings to mind..."
                    rows={4}
                    maxLength={500}
                    className="w-full bg-[#1C1C1E] border border-white/10 focus:border-[#E11D48] rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#E11D48] transition-all resize-none font-sans"
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                    <span>Keep it authentic and natural</span>
                    <span className="font-mono">{dailyAnswerInput.length} / 500</span>
                  </div>
                </div>

                {/* Privacy / Profile Sharing Toggle */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5">
                  <input
                    type="checkbox"
                    id="shareDailyOnProfile"
                    checked={dailyShareOnProfile}
                    onChange={(e) => setDailyShareOnProfile(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E11D48] focus:ring-[#E11D48] bg-black/40 border-white/20 accent-[#E11D48] cursor-pointer"
                  />
                  <label htmlFor="shareDailyOnProfile" className="text-xs text-stone-300 cursor-pointer select-none">
                    <span className="font-semibold text-white">Showcase this prompt on my dating profile</span>
                    <span className="block text-[11px] text-stone-400">
                      Matches will see your answer as a conversation starter. Leave unchecked to keep private.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={!dailyAnswerInput.trim()}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#E11D48] to-[#9F1239] hover:from-[#BE123C] hover:to-[#881337] disabled:opacity-40 transition-all shadow-[0_4px_15px_rgba(225,29,72,0.3)] flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F5D061]" />
                    <span>{todayExistingAnswer ? 'Update Reflection' : 'Save Today’s Answer'}</span>
                  </button>

                  {isEditingTodayAnswer && (
                    <button
                      type="button"
                      onClick={() => setIsEditingTodayAnswer(false)}
                      className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}

                  {dailySaveSuccess && (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved to your story!
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Reflection Journal History */}
          <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FB7185]" />
              <span>Your Reflection Journal ({promptAnswers.length})</span>
            </h3>

            {promptAnswers.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                You haven't recorded any prompt reflections yet. Share today's answer above!
              </p>
            ) : (
              <div className="space-y-3">
                {promptAnswers.map((ans) => (
                  <div
                    key={ans.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2 text-xs relative group hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-stone-400 border-b border-white/5 pb-2">
                      <span className="font-semibold text-[#FB7185] truncate max-w-[80%]">
                        “{ans.promptText}”
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 font-mono text-[10px]">
                          {ans.calendarDate || new Date(ans.answeredAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeletePromptAnswer(ans.id)}
                          className="text-stone-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Delete reflection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
                      “{ans.answerText}”
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      {ans.shareOnProfile ? (
                        <span className="inline-flex items-center gap-1 text-[#F5D061] font-mono">
                          <Share2 className="w-3 h-3" />
                          Visible on dating profile
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">🔒 Private reflection</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: HOBBY PERSONALITY QUIZZES                              */}
      {/* ============================================================= */}
      {activeGameTab === 'hobby_quiz' && (
        <div className="space-y-6">
          {/* Quiz Set Selector Catalog */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Choose a Personality Dimension
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {userQuizResults.length} of {availableQuizzes.length} completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableQuizzes.map((quiz) => {
                const result = store.getSavedQuizResult(currentUser.id, quiz.id);
                const isSelected = selectedQuizId === quiz.id;

                return (
                  <button
                    key={quiz.id}
                    onClick={() => {
                      setSelectedQuizId(quiz.id);
                      setIsTakingQuiz(false);
                      setCurrentQuizStep(0);
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#2B0813] to-[#1C1C1E] border-[#E11D48] ring-2 ring-[#E11D48]/30 shadow-[0_4px_20px_rgba(225,29,72,0.2)]'
                        : 'bg-[#151515] border-white/10 hover:border-white/20 hover:bg-[#1A1A1D]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                      <span className="text-[#FB7185] uppercase">{quiz.category}</span>
                      <span className="text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quiz.estimatedMinutes} min
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{quiz.title}</h4>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{quiz.tagline}</p>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      {result ? (
                        <span className="text-[#F5D061] font-mono font-medium truncate">
                          {result.badge || result.personaTitle}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Not started yet</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Quiz Area: Either Taking Quiz, or Viewing Result */}
          {isTakingQuiz ? (
            /* Active Step-by-Step Quiz Screen */
            <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
              {/* Step indicator */}
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#FB7185] uppercase">
                    {activeQuiz.title} · Question {currentQuizStep + 1} of {activeQuiz.questions.length}
                  </span>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                    {activeQuiz.questions[currentQuizStep].question}
                  </h2>
                  <p className="text-xs text-stone-400">
                    {activeQuiz.questions[currentQuizStep].subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {activeQuiz.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentQuizStep
                          ? 'w-6 bg-[#E11D48]'
                          : idx < currentQuizStep
                          ? 'w-2 bg-[#F5D061]'
                          : 'w-2 bg-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 3 to 4 Choices */}
              <div className="space-y-3 pt-2">
                {activeQuiz.questions[currentQuizStep].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      handleSelectQuizOption(activeQuiz.questions[currentQuizStep].id, opt.id)
                    }
                    className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[#1C1C1E] border border-white/10 hover:border-[#E11D48] hover:bg-[#252528] transition-all group flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-stone-200 group-hover:text-white leading-relaxed block">
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className="text-xs text-stone-400 block mt-0.5">{opt.sublabel}</span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#FB7185] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>

              {/* Navigation Back */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                {currentQuizStep > 0 ? (
                  <button
                    onClick={() => setCurrentQuizStep((s) => s - 1)}
                    className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to previous question
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTakingQuiz(false)}
                    className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel Quiz
                  </button>
                )}
                <span className="text-xs text-stone-400 font-mono">
                  {Math.round(((currentQuizStep + 1) / activeQuiz.questions.length) * 100)}% complete
                </span>
              </div>
            </div>
          ) : activeQuizResult ? (
            /* Result Screen for Current Selected Quiz */
            <div className="bg-[#151515] rounded-3xl border border-[#E11D48]/30 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_15px_40px_rgba(225,29,72,0.2)]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#E11D48]/15 blur-[100px] pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E11D48]/20 border border-[#E11D48]/40 text-xs font-bold text-[#FDA4AF]">
                    <Award className="w-4 h-4 text-[#F5D061]" />
                    <span>Your Result · {activeQuiz.title}</span>
                  </div>

                  <span className="text-xs text-stone-400 font-mono">
                    Completed {new Date(activeQuizResult.completedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                    {activeQuizResult.personaTitle}
                  </h2>
                  <p className="text-sm font-semibold text-[#F5D061] mt-1 font-mono">
                    {activeQuizResult.badge}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-300 italic mt-1 font-serif">
                    “{activeQuizResult.tagline}”
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-white/10 text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {activeQuizResult.description}
                </div>

                {/* Key Strengths & Suggested Hobbies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Key Strengths */}
                  <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
                    <span className="text-[11px] font-mono uppercase text-[#FB7185] font-bold">
                      Key Strengths & Vibe
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeQuizResult.keyTraits?.map((trait) => (
                        <span
                          key={trait}
                          className="px-2.5 py-1 rounded-xl bg-white/10 text-xs font-medium text-white"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Hobbies */}
                  <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
                    <span className="text-[11px] font-mono uppercase text-[#F5D061] font-bold">
                      Resonant Hobbies for You
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeQuizResult.suggestedHobbies?.map((h) => (
                        <span
                          key={h}
                          className="px-2.5 py-1 rounded-xl bg-[#F5D061]/10 text-[#F5D061] text-xs font-medium border border-[#F5D061]/20"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Try Idea & Ideal Date Idea */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1">
                    <span className="text-[11px] font-mono uppercase text-[#FB7185] font-bold">
                      Next Thing to Try
                    </span>
                    <p className="text-xs text-stone-300 leading-relaxed pt-1">
                      {activeQuizResult.nextTryIdea}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1">
                    <span className="text-[11px] font-mono uppercase text-[#F5D061] font-bold">
                      Ideal Date Ritual
                    </span>
                    <p className="text-xs text-stone-300 leading-relaxed pt-1">
                      {activeQuizResult.idealDateIdea}
                    </p>
                  </div>
                </div>

                {/* Harmonious Archetypes */}
                {activeQuizResult.compatiblePersonas && activeQuizResult.compatiblePersonas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
                    <span className="text-[11px] font-mono uppercase text-stone-300 font-bold">
                      Harmonious Partner Archetypes
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeQuizResult.compatiblePersonas.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleRetakeQuiz(activeQuiz.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake this Quiz</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Find an uncompleted quiz */}
                    {(() => {
                      const nextUncompleted = availableQuizzes.find(
                        (q) => !store.getSavedQuizResult(currentUser.id, q.id)
                      );
                      if (!nextUncompleted) return null;
                      return (
                        <button
                          onClick={() => handleStartQuiz(nextUncompleted.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E11D48] to-[#9F1239] hover:from-[#BE123C] hover:to-[#881337] transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(225,29,72,0.3)] cursor-pointer"
                        >
                          <span>Next: {nextUncompleted.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Quiz Not Started Card */
            <div className="bg-[#151515] rounded-3xl border border-white/10 p-8 sm:p-10 space-y-5 text-center shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
              <div className="w-16 h-16 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 flex items-center justify-center mx-auto text-[#FB7185] shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase text-[#FB7185]">
                  {activeQuiz.category}
                </span>
                <h3 className="text-2xl font-display font-bold text-white">{activeQuiz.title}</h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                  {activeQuiz.tagline}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-stone-400 font-mono">
                <span>{activeQuiz.questions.length} situational questions</span>
                <span>•</span>
                <span>Takes ~{activeQuiz.estimatedMinutes} minutes</span>
              </div>

              <button
                onClick={() => handleStartQuiz(activeQuiz.id)}
                className="px-8 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#E11D48] to-[#9F1239] hover:from-[#BE123C] hover:to-[#881337] transition-all shadow-[0_4px_15px_rgba(225,29,72,0.4)] inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F5D061]" />
                <span>Begin {activeQuiz.title}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
