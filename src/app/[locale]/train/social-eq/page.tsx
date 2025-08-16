'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';

import { Users, MessageCircle, Heart, Brain, Star, CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialScenario {
  id: string;
  title: string;
  category: 'workplace' | 'friendship' | 'family' | 'romantic' | 'public';
  difficulty: number; // 1-5
  situation: string;
  context: string;
  characters: {
    name: string;
    role: string;
    emotion: string;
    motivation: string;
  }[];
  challenge: string;
  responses: {
    id: string;
    text: string;
    tone: 'aggressive' | 'passive' | 'assertive' | 'empathetic' | 'diplomatic';
    eqScore: number; // 1-5
    consequences: string;
  }[];
  bestResponse: string;
  explanation: string;
  eqSkills: string[];
  culturalNote?: string;
}

const socialScenarios: SocialScenario[] = [
  {
    id: 'workplace-feedback',
    title: '工作场所反馈',
    category: 'workplace',
    difficulty: 3,
    situation: '您的同事小李最近工作表现不佳，影响了团队进度。作为项目负责人，您需要与他谈话。',
    context: '小李平时工作认真，但最近似乎心不在焉，经常出错。您注意到他看起来很疲惫，可能有个人问题。',
    characters: [
      {
        name: '小李',
        role: '团队成员',
        emotion: '焦虑、防御',
        motivation: '担心被批评，希望得到理解'
      }
    ],
    challenge: '如何既指出问题又保持良好关系，帮助他改善表现？',
    responses: [
      {
        id: 'direct-criticism',
        text: '小李，你最近的工作质量真的不行，这样下去会影响整个项目。',
        tone: 'aggressive',
        eqScore: 1,
        consequences: '小李感到被攻击，可能变得更加防御或沮丧，问题得不到根本解决。'
      },
      {
        id: 'avoid-issue',
        text: '没关系，大家都有状态不好的时候，慢慢来吧。',
        tone: 'passive',
        eqScore: 2,
        consequences: '问题没有得到解决，可能继续影响团队，小李也得不到需要的帮助。'
      },
      {
        id: 'empathetic-approach',
        text: '小李，我注意到你最近似乎有些疲惫。工作上有什么困难吗？我们一起想想解决办法。',
        tone: 'empathetic',
        eqScore: 5,
        consequences: '小李感到被关心和理解，更愿意开放地讨论问题，找到解决方案。'
      },
      {
        id: 'formal-warning',
        text: '根据公司规定，我需要对你的工作表现给出正式警告。',
        tone: 'assertive',
        eqScore: 2,
        consequences: '过于正式和冷漠，可能破坏关系，错失了解决根本问题的机会。'
      }
    ],
    bestResponse: 'empathetic-approach',
    explanation: '同理心是高情商的核心。通过表达关心和理解，您创造了一个安全的环境，让对方愿意分享真实情况，这是解决问题的第一步。',
    eqSkills: ['同理心', '积极倾听', '情绪感知', '关系管理'],
    culturalNote: '中国文化中"以人为本"的管理理念强调关心员工的整体福祉。'
  },
  {
    id: 'friend-conflict',
    title: '朋友间的误解',
    category: 'friendship',
    difficulty: 4,
    situation: '您的好朋友误解了您的一个行为，现在对您很冷淡，甚至在朋友圈发了一些暗示性的负面内容。',
    context: '上周聚会时，您因为临时有事提前离开，朋友认为您不重视这次聚会。实际上您有紧急家庭事务需要处理。',
    characters: [
      {
        name: '好朋友',
        role: '密友',
        emotion: '受伤、愤怒',
        motivation: '感觉被忽视，希望得到重视和道歉'
      }
    ],
    challenge: '如何化解误解，修复友谊，同时维护自己的尊严？',
    responses: [
      {
        id: 'ignore-conflict',
        text: '不理会朋友的冷淡，等时间自然化解这个问题。',
        tone: 'passive',
        eqScore: 2,
        consequences: '误解可能加深，友谊受到长期损害，问题得不到解决。'
      },
      {
        id: 'defensive-response',
        text: '我那天确实有急事，你这样误解我太不公平了！',
        tone: 'aggressive',
        eqScore: 2,
        consequences: '朋友感到被指责，冲突可能升级，关系进一步恶化。'
      },
      {
        id: 'sincere-communication',
        text: '我意识到上次提前离开可能让你感到被忽视，我很抱歉。能告诉我你的感受吗？我想解释一下当时的情况。',
        tone: 'empathetic',
        eqScore: 5,
        consequences: '朋友感到被理解和尊重，愿意听取解释，关系得到修复和加强。'
      },
      {
        id: 'formal-apology',
        text: '对不起，我错了，以后不会再这样了。',
        tone: 'passive',
        eqScore: 3,
        consequences: '虽然表达了歉意，但没有真正沟通，误解可能仍然存在。'
      }
    ],
    bestResponse: 'sincere-communication',
    explanation: '真诚的沟通包括承认对方的感受、表达歉意（针对影响而非意图）、邀请对话。这种方式既维护了关系，又澄清了误解。',
    eqSkills: ['情绪识别', '有效沟通', '冲突解决', '关系修复'],
    culturalNote: '"有话好好说"体现了中华文化中通过沟通解决问题的智慧。'
  },
  {
    id: 'family-generation-gap',
    title: '代际沟通挑战',
    category: 'family',
    difficulty: 4,
    situation: '您的父母对您的职业选择很不满意，认为您应该选择更"稳定"的工作，双方经常因此争吵。',
    context: '您选择了创意行业，收入不稳定但很有激情。父母出于关心，希望您选择公务员或国企工作。',
    characters: [
      {
        name: '父母',
        role: '家长',
        emotion: '担心、焦虑',
        motivation: '希望子女有稳定的未来，表达关爱'
      }
    ],
    challenge: '如何在坚持自己选择的同时，理解并缓解父母的担忧？',
    responses: [
      {
        id: 'rebellious-stance',
        text: '这是我的人生，我有权利做自己的选择，你们不要干涉！',
        tone: 'aggressive',
        eqScore: 1,
        consequences: '父母感到被拒绝和伤害，家庭关系紧张，沟通渠道关闭。'
      },
      {
        id: 'complete-compromise',
        text: '好吧，我听你们的，去考公务员。',
        tone: 'passive',
        eqScore: 2,
        consequences: '虽然暂时平息争议，但内心不满可能积累，长期不利于个人发展和家庭关系。'
      },
      {
        id: 'understanding-dialogue',
        text: '我理解你们的担心，这说明你们爱我。让我分享一下我的规划，也想听听你们具体担心什么。',
        tone: 'empathetic',
        eqScore: 5,
        consequences: '父母感到被理解和尊重，更愿意倾听您的想法，可能找到双方都能接受的解决方案。'
      },
      {
        id: 'logical-argument',
        text: '现在时代不同了，创意行业也有很好的发展前景，你们的观念需要更新。',
        tone: 'assertive',
        eqScore: 3,
        consequences: '虽然有道理，但可能让父母感到被批评，不利于建立理解。'
      }
    ],
    bestResponse: 'understanding-dialogue',
    explanation: '代际沟通的关键是先理解对方的出发点。父母的担心源于爱，承认这一点能够软化对立情绪，为建设性对话创造条件。',
    eqSkills: ['代际理解', '情绪调节', '有效表达', '寻求共识'],
    culturalNote: '"孝顺"不仅是服从，更是理解和沟通，在尊重中寻求平衡。'
  },
  {
    id: 'public-embarrassment',
    title: '公共场合的尴尬',
    category: 'public',
    difficulty: 3,
    situation: '在一个重要的社交场合，您不小心打翻了饮料，溅到了旁边一位重要客人的衣服上。',
    context: '这是一个商务酒会，周围有很多重要的商业伙伴和潜在客户。被溅到的是一位知名企业家。',
    characters: [
      {
        name: '企业家',
        role: '重要客人',
        emotion: '惊讶、轻微不悦',
        motivation: '希望得到适当的道歉和处理'
      }
    ],
    challenge: '如何在众目睽睽下优雅地处理这个尴尬局面？',
    responses: [
      {
        id: 'panic-flee',
        text: '匆忙道歉后立即离开现场，避免进一步尴尬。',
        tone: 'passive',
        eqScore: 2,
        consequences: '虽然避免了当下的尴尬，但给人留下不负责任的印象，错失了展示品格的机会。'
      },
      {
        id: 'over-apologize',
        text: '不停地道歉，显得非常紧张和慌乱。',
        tone: 'passive',
        eqScore: 2,
        consequences: '过度的道歉可能让场面更加尴尬，也显得不够自信和专业。'
      },
      {
        id: 'graceful-handling',
        text: '真诚地道歉，主动提供帮助清理，并适当地用幽默化解尴尬，展现风度。',
        tone: 'diplomatic',
        eqScore: 5,
        consequences: '展现了良好的品格和社交技巧，可能反而给人留下深刻的正面印象。'
      },
      {
        id: 'blame-others',
        text: '解释是因为服务员没有及时收拾桌子才导致的意外。',
        tone: 'aggressive',
        eqScore: 1,
        consequences: '推卸责任会让人质疑您的品格，在商务场合尤其不合适。'
      }
    ],
    bestResponse: 'graceful-handling',
    explanation: '在公共场合的应对能力体现了一个人的情商和修养。优雅地处理尴尬局面，既展现了责任感，也显示了社交成熟度。',
    eqSkills: ['压力管理', '社交技巧', '情绪控制', '危机应对'],
    culturalNote: '"君子坦荡荡"体现了在困难面前保持风度的重要性。'
  },
  {
    id: 'romantic-disagreement',
    title: '恋爱关系中的分歧',
    category: 'romantic',
    difficulty: 5,
    situation: '您和伴侣对未来规划有重大分歧：您想在大城市发展，而伴侣希望回到家乡生活。',
    context: '你们交往两年，感情很好，但这个分歧让双方都很困扰。这不仅关系到职业发展，也涉及生活方式的选择。',
    characters: [
      {
        name: '伴侣',
        role: '恋人',
        emotion: '纠结、担心',
        motivation: '希望找到两全其美的解决方案，维护关系'
      }
    ],
    challenge: '如何在不牺牲关系的前提下，诚实地讨论这个重大分歧？',
    responses: [
      {
        id: 'ultimatum',
        text: '如果你真的爱我，就应该支持我的选择，跟我一起留在大城市。',
        tone: 'aggressive',
        eqScore: 1,
        consequences: '给伴侣施加压力，可能导致怨恨或被迫的妥协，长期不利于关系健康。'
      },
      {
        id: 'avoid-discussion',
        text: '这个问题太复杂了，我们以后再说吧。',
        tone: 'passive',
        eqScore: 2,
        consequences: '回避问题不会让它消失，反而可能让分歧加深，影响关系的发展。'
      },
      {
        id: 'collaborative-exploration',
        text: '这个决定对我们都很重要。让我们坦诚地分享各自的想法和担忧，一起探索可能的解决方案。',
        tone: 'empathetic',
        eqScore: 5,
        consequences: '创造了开放和安全的对话环境，增加了找到创新解决方案的可能性。'
      },
      {
        id: 'immediate-compromise',
        text: '好吧，我可以考虑回家乡，只要你开心就好。',
        tone: 'passive',
        eqScore: 3,
        consequences: '虽然表现了爱意，但没有真正解决分歧，可能导致未来的不满。'
      }
    ],
    bestResponse: 'collaborative-exploration',
    explanation: '在亲密关系中，重大分歧需要通过合作而非竞争来解决。创造安全的对话空间，共同探索创新解决方案，是维护关系的最佳方式。',
    eqSkills: ['亲密沟通', '冲突协商', '共情理解', '创新思维'],
    culturalNote: '"夫妻同心，其利断金"强调了伴侣间合作的重要性。'
  }
];

interface GameState {
  currentScenario: SocialScenario | null;
  selectedResponse: string | null;
  showResult: boolean;
  score: number;
  completedScenarios: string[];
  round: number;
  totalRounds: number;
  eqSkillsLearned: Set<string>;
}

export default function SocialEQPage() {
  const t = useTranslations('socialEQ');
  
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: null,
    selectedResponse: null,
    showResult: false,
    score: 0,
    completedScenarios: [],
    round: 0,
    totalRounds: socialScenarios.length,
    eqSkillsLearned: new Set()
  });

  const [showInstructions, setShowInstructions] = useState(true);

  // 开始训练
  const startTraining = () => {
    setShowInstructions(false);
    nextScenario();
  };

  // 下一个场景
  const nextScenario = () => {
    const availableScenarios = socialScenarios.filter(
      scenario => !gameState.completedScenarios.includes(scenario.id)
    );
    
    if (availableScenarios.length === 0) {
      setGameState(prev => ({ ...prev, currentScenario: null }));
      return;
    }
    
    const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    setGameState(prev => ({
      ...prev,
      currentScenario: randomScenario,
      selectedResponse: null,
      showResult: false,
      round: prev.round + 1
    }));
  };

  // 选择回应
  const selectResponse = (responseId: string) => {
    setGameState(prev => ({ ...prev, selectedResponse: responseId }));
  };

  // 提交答案
  const submitAnswer = () => {
    if (!gameState.currentScenario || !gameState.selectedResponse) return;
    
    const selectedResponse = gameState.currentScenario.responses.find(
      r => r.id === gameState.selectedResponse
    );
    
    const points = selectedResponse?.eqScore || 0;
    const newSkills = new Set(gameState.eqSkillsLearned);
    gameState.currentScenario.eqSkills.forEach(skill => newSkills.add(skill));
    
    setGameState(prev => ({
      ...prev,
      showResult: true,
      score: prev.score + points,
      completedScenarios: [...prev.completedScenarios, prev.currentScenario!.id],
      eqSkillsLearned: newSkills
    }));
  };

  // 重新开始
  const resetGame = () => {
    setGameState({
      currentScenario: null,
      selectedResponse: null,
      showResult: false,
      score: 0,
      completedScenarios: [],
      round: 0,
      totalRounds: socialScenarios.length,
      eqSkillsLearned: new Set()
    });
    setShowInstructions(true);
  };

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workplace': return 'from-blue-500 to-indigo-500';
      case 'friendship': return 'from-green-500 to-emerald-500';
      case 'family': return 'from-orange-500 to-red-500';
      case 'romantic': return 'from-pink-500 to-rose-500';
      case 'public': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // 获取类别名称
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'workplace': return t('categories.workplace');
      case 'friendship': return t('categories.friendship');
      case 'family': return t('categories.family');
      case 'romantic': return t('categories.romantic');
      case 'public': return t('categories.public');
      default: return t('categories.other');
    }
  };

  // 获取语调颜色
  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'aggressive': return 'text-red-400 border-red-500';
      case 'passive': return 'text-yellow-400 border-yellow-500';
      case 'assertive': return 'text-blue-400 border-blue-500';
      case 'empathetic': return 'text-green-400 border-green-500';
      case 'diplomatic': return 'text-purple-400 border-purple-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  // 获取语调名称
  const getToneName = (tone: string) => {
    switch (tone) {
      case 'aggressive': return t('tones.aggressive');
      case 'passive': return t('tones.passive');
      case 'assertive': return t('tones.assertive');
      case 'empathetic': return t('tones.empathetic');
      case 'diplomatic': return t('tones.diplomatic');
      default: return t('tones.other');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {showInstructions ? (
          // 训练说明
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {t('instructionsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-indigo-400 mb-4">{t('trainingScenarios')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('scenarios.workplace.title')}</div>
                          <div className="text-gray-400 text-sm">{t('scenarios.workplace.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('scenarios.friendship.title')}</div>
                          <div className="text-gray-400 text-sm">{t('scenarios.friendship.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('scenarios.family.title')}</div>
                          <div className="text-gray-400 text-sm">{t('scenarios.family.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('scenarios.romantic.title')}</div>
                          <div className="text-gray-400 text-sm">{t('scenarios.romantic.description')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-indigo-400 mb-4">{t('eqSkills')}</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('skills.emotionRecognition')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('skills.empathy')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('skills.communication')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('skills.conflictResolution')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('skills.relationshipBuilding')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('skills.socialAdaptability')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={startTraining}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3"
                  >
                    {t('startTraining')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : gameState.currentScenario ? (
          // 训练界面
          <div className="max-w-4xl mx-auto">
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">
                  {t('scenario')} {gameState.round} / {gameState.totalRounds}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-indigo-400 font-medium">
                    {t('eqScore')}: {gameState.score}
                  </span>
                  <Badge variant="outline" className="text-purple-400 border-purple-500">
                    {t('masteredSkills')}: {gameState.eqSkillsLearned.size}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(gameState.round / gameState.totalRounds) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>

            {/* 场景信息 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">
                    {gameState.currentScenario.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`bg-gradient-to-r ${getCategoryColor(gameState.currentScenario.category)} text-white border-0`}
                    >
                      {getCategoryName(gameState.currentScenario.category)}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-white border-2 ${
                        gameState.currentScenario.difficulty >= 4 ? 'border-red-500 text-red-400' :
                        gameState.currentScenario.difficulty >= 3 ? 'border-orange-500 text-orange-400' :
                        'border-yellow-500 text-yellow-400'
                      }`}
                    >
                      {t('difficulty')}: {gameState.currentScenario.difficulty}/5
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-indigo-400 font-semibold mb-2">{t('scenarioDescription')}:</h4>
                    <p className="text-gray-300 leading-relaxed">
                      {gameState.currentScenario.situation}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-indigo-400 font-semibold mb-2">{t('backgroundInfo')}:</h4>
                    <p className="text-gray-300 text-sm">
                      {gameState.currentScenario.context}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-indigo-400 font-semibold mb-2">{t('keyCharacters')}:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {gameState.currentScenario.characters.map((character, index) => (
                        <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
                          <div className="font-medium text-white">{character.name} ({character.role})</div>
                          <div className="text-sm text-gray-400">{t('emotion')}: {character.emotion}</div>
                          <div className="text-sm text-gray-400">{t('motivation')}: {character.motivation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 rounded-lg border border-blue-500/30">
                    <h4 className="text-blue-400 font-semibold mb-2">{t('challenge')}:</h4>
                    <p className="text-blue-200 text-sm">
                      {gameState.currentScenario.challenge}
                    </p>
                  </div>
                  
                  {gameState.currentScenario.culturalNote && (
                    <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4 rounded-lg border border-amber-500/30">
                      <h4 className="text-amber-400 font-semibold mb-2">{t('culturalWisdom')}:</h4>
                      <p className="text-amber-200 text-sm">
                        {gameState.currentScenario.culturalNote}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 回应选择 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {t('chooseResponse')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameState.currentScenario.responses.map((response) => (
                    <Card
                      key={response.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        gameState.selectedResponse === response.id
                          ? 'bg-indigo-900/50 border-indigo-500 scale-102'
                          : 'bg-black/20 border-gray-600 hover:border-indigo-500/50 hover:scale-101'
                      }`}
                      onClick={() => selectResponse(response.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-white flex-1 pr-4">
                            "{response.text}"
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getToneColor(response.tone)}`}
                            >
                              {getToneName(response.tone)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < response.eqScore ? 'text-yellow-400 fill-current' : 'text-gray-500'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button
                    onClick={submitAnswer}
                    disabled={!gameState.selectedResponse}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                  >
                    {t('confirmChoice')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 结果反馈 */}
            <AnimatePresence>
              {gameState.showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="mb-8 bg-black/40 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {gameState.selectedResponse === gameState.currentScenario.bestResponse ? (
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        ) : (
                          <Lightbulb className="w-8 h-8 text-yellow-400" />
                        )}
                        <CardTitle className="text-white text-xl">
                          {gameState.selectedResponse === gameState.currentScenario.bestResponse
                            ? t('excellentEQ')
                            : t('learningOpportunity')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* 选择结果 */}
                        <div>
                          <h4 className="text-indigo-400 font-semibold mb-2">{t('yourChoiceResult')}:</h4>
                          <p className="text-gray-300">
                            {gameState.currentScenario.responses.find(
                              r => r.id === gameState.selectedResponse
                            )?.consequences}
                          </p>
                        </div>
                        
                        {/* 最佳策略解析 */}
                        <div>
                          <h4 className="text-indigo-400 font-semibold mb-2">{t('eqAnalysis')}:</h4>
                          <p className="text-gray-300">
                            {gameState.currentScenario.explanation}
                          </p>
                        </div>
                        
                        {/* 技能提升 */}
                        <div>
                          <h4 className="text-indigo-400 font-semibold mb-2">{t('eqSkillsInvolved')}:</h4>
                          <div className="flex flex-wrap gap-2">
                            {gameState.currentScenario.eqSkills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-purple-400 border-purple-500">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Button
                            onClick={nextScenario}
                            size="lg"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            {t('nextScenario')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // 训练完成
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="pt-8">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">{t('trainingComplete')}</h2>
                  <p className="text-gray-300 text-lg">
                    {t('allScenariosCompleted')}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">{t('trainingSummary')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-indigo-400">{gameState.score}</div>
                      <div className="text-gray-300">{t('totalEQScore')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{gameState.eqSkillsLearned.size}</div>
                      <div className="text-gray-300">{t('masteredSkills')}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-indigo-400 font-semibold mb-2">{t('masteredEQSkills')}:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Array.from(gameState.eqSkillsLearned).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-purple-400 border-purple-500">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={resetGame}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t('restartTraining')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}