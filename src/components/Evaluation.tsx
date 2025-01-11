import React, { useState, useRef, useContext, useEffect } from 'react';
    import { Activity } from '../types/activity';
    import { LIFE_DOMAINS } from '../types/domains';
    import { useWeekSelection } from '../hooks/useWeekSelection';
    import { DAYS } from '../constants/days';
    import { CheckCircle, XCircle, Brain, TrendingUp, Award, Calendar, Download, Upload, Check, X, AlertTriangle, FileDown, FileUp, Eye, EyeOff, Plus, BookOpen, MessageSquare, Lightbulb } from 'lucide-react';
    import { PositiveNotesTable } from './PositiveNotesTable';
    import { ProgressView } from './ProgressView';
    import { WeekSelector } from './WeekSelector';
    import { ActivityContext } from '../context/ActivityContext';
    import { formatDate, getCurrentWeekDates, getDateOfWeek } from '../utils/dateUtils';
    import { makeLinksClickable } from '../utils/linkUtils';

    interface EvaluationProps {
      activities: Activity[];
    }

    export function Evaluation({ activities }: EvaluationProps) {
      const weekSelection = useWeekSelection();
      const { selectedDate, weekNumber, year, changeWeek } = weekSelection;
      const fileInputRef = useRef<HTMLInputElement>(null);
      const { addActivity, updateActivity, deleteActivity } = useContext(ActivityContext);
      const currentWeekActivities = activities.filter(activity => activity.weekNumber === weekNumber && activity.year === year);
      const [showDomains, setShowDomains] = useState(true);
      const [achievements, setAchievements] = useState<string[]>(() => {
        const savedAchievements = localStorage.getItem(`achievements-${weekNumber}-${year}`);
        return savedAchievements ? JSON.parse(savedAchievements) : [];
      });

      useEffect(() => {
        const savedAchievements = localStorage.getItem(`achievements-${weekNumber}-${year}`);
        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements));
        } else {
          setAchievements([]);
        }
      }, [weekNumber, year]);

      const calculateDomainProgress = (domainId: string) => {
        const domainActivities = currentWeekActivities.filter(a => a.domainId === domainId);
        if (domainActivities.length === 0) return { completed: 0, total: 0, percentage: 0 };

        let totalCount = 0;
        let completedCount = 0;

        domainActivities.forEach(activity => {
          totalCount += activity.selectedDays.length;
          completedCount += activity.selectedDays.filter(dayIndex => activity.completedDays && activity.completedDays[dayIndex]).length;
        });

        return {
          completed: completedCount,
          total: totalCount,
          percentage: Math.round((completedCount / totalCount) * 100),
        };
      };

      const overallCompletionRate = () => {
        let totalCount = 0;
        const totalActivities = currentWeekActivities.reduce((acc, activity) => acc + activity.selectedDays.length, 0);
        if (totalActivities === 0) return {completed: 0, total: 0, percentage: 0};

        let completedCount = 0;
        currentWeekActivities.forEach(activity => {
          completedCount += activity.selectedDays.filter(dayIndex => activity.completedDays && activity.completedDays[dayIndex]).length;
        });
        return {
          completed: completedCount,
          total: totalActivities,
          percentage: Math.round((completedCount / totalActivities) * 100),
        };
      };

      const overallRate = overallCompletionRate();

      const handleExport = () => {
        const exportData = activities.map(activity => {
          const weekKey = `${activity.weekNumber}-${activity.year}`;
          const notes = {};
          DAYS.forEach((_, dayIndex) => {
            const date = weekDates[dayIndex].toISOString().split('T')[0];
            const positiveNotes = localStorage.getItem(`positiveNotes-${date}`)
            const freeWriting = localStorage.getItem(`freeWriting-${date}`)
            const decisions = localStorage.getItem(`decisions-${date}`)
            if (positiveNotes) {
              notes[`positiveNotes-${dayIndex}`] = JSON.parse(positiveNotes);
            }
            if (freeWriting) {
              notes[`freeWriting-${dayIndex}`] = freeWriting;
            }
            if (decisions) {
              notes[`decisions-${dayIndex}`] = decisions;
            }
          });
          return { ...activity, ...notes };
        });
        const dataStr = JSON.stringify({
          activities: exportData,
          achievements: achievements,
        }, null, 2);
        const blob = new Blob([dataStr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'activities.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      const handleImport = () => {
        fileInputRef.current?.click();
      };

      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const fileContent = event.target?.result as string;
            const importedData = JSON.parse(fileContent);
            if (importedData && Array.isArray(importedData.activities)) {
              // Clear existing activities
              activities.forEach(activity => deleteActivity(activity.id));
              // Import new activities
              importedData.activities.forEach(activity => {
                const {
                  "positiveNotes-0": positiveNotes0,
                  "positiveNotes-1": positiveNotes1,
                  "positiveNotes-2": positiveNotes2,
                  "positiveNotes-3": positiveNotes3,
                  "positiveNotes-4": positiveNotes4,
                  "positiveNotes-5": positiveNotes5,
                  "positiveNotes-6": positiveNotes6,
                  "freeWriting-0": freeWriting0,
                  "freeWriting-1": freeWriting1,
                  "freeWriting-2": freeWriting2,
                  "freeWriting-3": freeWriting3,
                  "freeWriting-4": freeWriting4,
                  "freeWriting-5": freeWriting5,
                  "freeWriting-6": freeWriting6,
                  "decisions-0": decisions0,
                  "decisions-1": decisions1,
                  "decisions-2": decisions2,
                  "decisions-3": decisions3,
                  "decisions-4": decisions4,
                  "decisions-5": decisions5,
                  "decisions-6": decisions6,
                  ...rest
                } = activity;
                addActivity(rest);
                const weekKey = `${rest.weekNumber}-${rest.year}`;
                if (positiveNotes0) localStorage.setItem(`positiveNotes-${weekKey}-0`, JSON.stringify(positiveNotes0));
                if (positiveNotes1) localStorage.setItem(`positiveNotes-${weekKey}-1`, JSON.stringify(positiveNotes1));
                if (positiveNotes2) localStorage.setItem(`positiveNotes-${weekKey}-2`, JSON.stringify(positiveNotes2));
                if (positiveNotes3) localStorage.setItem(`positiveNotes-${weekKey}-3`, JSON.stringify(positiveNotes3));
                if (positiveNotes4) localStorage.setItem(`positiveNotes-${weekKey}-4`, JSON.stringify(positiveNotes4));
                if (positiveNotes5) localStorage.setItem(`positiveNotes-${weekKey}-5`, JSON.stringify(positiveNotes5));
                if (positiveNotes6) localStorage.setItem(`positiveNotes-${weekKey}-6`, JSON.stringify(positiveNotes6));
                if (freeWriting0) localStorage.setItem(`freeWriting-${weekKey}-0`, freeWriting0);
                if (freeWriting1) localStorage.setItem(`freeWriting-${weekKey}-1`, freeWriting1);
                if (freeWriting2) localStorage.setItem(`freeWriting-${weekKey}-2`, freeWriting2);
                if (freeWriting3) localStorage.setItem(`freeWriting-${weekKey}-3`, freeWriting3);
                if (freeWriting4) localStorage.setItem(`freeWriting-${weekKey}-4`, freeWriting4);
                if (freeWriting5) localStorage.setItem(`freeWriting-${weekKey}-5`, freeWriting5);
                if (freeWriting6) localStorage.setItem(`freeWriting-${weekKey}-6`, freeWriting6);
                if (decisions0) localStorage.setItem(`decisions-${weekKey}-0`, decisions0);
                if (decisions1) localStorage.setItem(`decisions-${weekKey}-1`, decisions1);
                if (decisions2) localStorage.setItem(`decisions-${weekKey}-2`, decisions2);
                if (decisions3) localStorage.setItem(`decisions-${weekKey}-3`, decisions3);
                if (decisions4) localStorage.setItem(`decisions-${weekKey}-4`, decisions4);
                if (decisions5) localStorage.setItem(`decisions-${weekKey}-5`, decisions5);
                if (decisions6) localStorage.setItem(`decisions-${weekKey}-6`, decisions6);
              });
              if (importedData.achievements) {
                setAchievements(importedData.achievements);
                localStorage.setItem(`achievements-${weekNumber}-${year}`, JSON.stringify(importedData.achievements));
              }
              alert('Data imported successfully!');
            } else {
              alert('Invalid data format. Please ensure the file contains an array of activities.');
            }
          } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error parsing file. Please ensure it is a valid text file.');
          }
        };
        reader.readAsText(file);
      };

      const toggleDomains = () => {
        setShowDomains(!showDomains);
      };

      const handleAddAchievement = () => {
        setAchievements([...achievements, '']);
      };

      const handleRemoveAchievement = (index: number) => {
        const newAchievements = [...achievements];
        newAchievements.splice(index, 1);
        setAchievements(newAchievements);
        localStorage.setItem(`achievements-${weekNumber}-${year}`, JSON.stringify(newAchievements));
      };

      const handleAchievementChange = (index: number, value: string) => {
        const newAchievements = [...achievements];
        newAchievements[index] = value;
        setAchievements(newAchievements);
        localStorage.setItem(`achievements-${weekNumber}-${year}`, JSON.stringify(newAchievements));
      };

      const weekStartDate = getDateOfWeek(weekNumber, year);
      const weekDates = getCurrentWeekDates(weekStartDate);

      const domainColors = {
        'professional': 'text-amber-100',
        'educational': 'text-amber-300',
        'health': 'text-green-400',
        'family': 'text-red-400',
        'social': 'text-orange-400',
        'financial': 'text-green-700',
        'personal': 'text-sky-400',
        'spiritual': 'text-teal-400',
      };

      return (
        <div className="p-6 bg-gradient-to-br from-teal-700/90 to-blue-800/90 rounded-lg shadow-lg" dir="rtl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white text-center">تقييم الأداء</h2>
            <button onClick={toggleDomains} className="p-2 rounded-full bg-amber-400/20 text-amber-400 hover:bg-amber-400/30">
              {showDomains ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <WeekSelector currentDate={selectedDate} onWeekChange={changeWeek} />
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md flex items-center gap-2"
            >
              <FileDown size={16} />
              تصدير
            </button>
            <button
              onClick={handleImport}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md flex items-center gap-2"
            >
              <FileUp size={16} />
              استيراد
            </button>
            <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} accept="text/plain" />
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Lightbulb size={24} className="text-orange-400" />
              أبرز الإنجازات في الأسبوع
            </h2>
            {achievements.map((achievement, index) => (
              <div key={index} className="relative mb-2 bg-black/30 p-4 rounded-lg border border-orange-400/20">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
                  className="w-full p-1 rounded bg-black/20 border border-white/10 text-white text-sm"
                  dir="rtl"
                  placeholder={`إنجاز ${index + 1}`}
                />
                <button
                  onClick={() => handleRemoveAchievement(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-400/20 text-red-400 hover:bg-red-400/30"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddAchievement}
              className="bg-orange-400 hover:bg-orange-500 text-white p-2 rounded-md flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              إضافة إنجاز
            </button>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-purple-400" size={24} />
                <h2 className="text-xl font-medium text-purple-400">تحليلات الأداء</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-purple-400" size={20} />
                    <h3 className="text-purple-400">معدل الإنجاز</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {overallRate.percentage}%
                  </p>
                  <p className="text-sm text-white">
                    {overallRate.completed} من {overallRate.total} أنشطة مكتملة
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {LIFE_DOMAINS.map(domain => {
                  const progress = calculateDomainProgress(domain.id);
                  const DomainIcon = domain.icon;
                  return (
                    <div key={domain.id} className="bg-black/20 p-4 rounded-lg flex flex-col items-center w-fit transition-all duration-300 hover:scale-105 hover:bg-black/40">
                      <div className="flex items-center gap-1 mb-2">
                        <DomainIcon size={16} className={`text-${domainColors[domain.id] || 'text-white'}`} />
                        <h3 className={`text-sm font-medium ${domainColors[domain.id] || 'text-white'}`}>{domain.name}</h3>
                      </div>
                      <p className={`text-base ${domainColors[domain.id] || 'text-white'}`}>
                        {progress.completed} / {progress.total}
                      </p>
                      <p className={`text-base ${domainColors[domain.id] || 'text-white'}`}>
                        ({progress.percentage}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 ${showDomains ? '' : 'hidden'}`}>
              {LIFE_DOMAINS.map(domain => {
                const progress = calculateDomainProgress(domain.id);
                const DomainIcon = domain.icon;
                const Icon = progress.percentage >= 100 ? CheckCircle : progress.percentage >= 50 ? AlertTriangle : XCircle;
                const plannedCount = currentWeekActivities.filter(activity => activity.domainId === domain.id).reduce((acc, activity) => acc + activity.selectedDays.length, 0);
                const completedCount = currentWeekActivities.filter(activity => activity.domainId === domain.id).reduce((acc, activity) => acc + activity.selectedDays.filter(dayIndex => activity.completedDays && activity.completedDays[dayIndex]).length, 0);
                return (
                  <div key={domain.id} className={`bg-black/20 p-4 rounded-lg flex flex-col animate-fade-in`}>
                    <div className="flex items-center gap-2 mb-4">
                      <DomainIcon size={24} className={`text-${domainColors[domain.id] || 'text-white'}`} />
                      <h3 className={`text-xl font-bold ${domainColors[domain.id] || 'text-white'}`}>{domain.name}</h3>
                      {progress.percentage >= 100 && <CheckCircle size={24} className="text-green-500" />}
                      {progress.percentage < 100 && progress.percentage >= 50 && <AlertTriangle size={24} className="text-amber-500" />}
                      {progress.percentage < 50 && <XCircle size={24} className="text-red-500" />}
                      <span className="text-white text-sm ml-2">({progress.percentage}%)</span>
                      <span className="text-white text-sm ml-2">({plannedCount}/{completedCount})</span>
                    </div>
                    <table className="w-full border-collapse animate-table-in">
                      <thead>
                        <tr>
                          <th className="p-2 text-white border border-white/20 text-left">النشاط</th>
                          <th className="p-2 text-white border border-white/20 text-center">المخطط</th>
                          <th className="p-2 text-white border border-white/20 text-center">المنفذ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentWeekActivities
                          .filter(activity => activity.domainId === domain.id)
                          .map(activity => {
                            const completedDaysCount = activity.selectedDays.filter(dayIndex => activity.completedDays && activity.completedDays[dayIndex]).length;
                            const totalDays = activity.selectedDays.length;
                            let statusIcon = null;
                            if (completedDaysCount === totalDays) {
                              statusIcon = <Check size={16} className="text-green-500" />;
                            } else if (completedDaysCount > 0) {
                              statusIcon = <AlertTriangle size={16} className="text-amber-500" />;
                            } else {
                              statusIcon = <X size={16} className="text-red-500" />;
                            }
                            return (
                              <tr key={activity.id} className="animate-row-in">
                                <td className="p-2 text-white border border-white/20 text-right flex items-center gap-1">
                                  {activity.title}
                                  {statusIcon}
                                </td>
                                <td className="p-2 text-white border border-white/20 text-center">{totalDays}</td>
                                <td className="p-2 text-white border border-white/20 text-center">
                                  {completedDaysCount}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            <div className="bg-gradient-to-br from-teal-500/20 to-teal-700/20 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-teal-400" size={24} />
                <h2 className="text-xl font-medium text-teal-400">ملخص النقاط الإيجابية</h2>
              </div>
              <PositiveNotesTable activities={currentWeekActivities} weekSelection={weekSelection} />
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <BookOpen size={20} className="text-white" />
                  الكتابة الحرة
                </h3>
                <div className="space-y-4">
                {DAYS.map((_, dayIndex) => {
                  const currentDate = weekDates[dayIndex];
                  const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
                  const freeWriting = localStorage.getItem(`freeWriting-${dateKey}`);
                  return freeWriting && (
                    <div key={dayIndex} className="mb-2">
                      <h4 className="text-white/70 text-base">{DAYS[dayIndex]} - {formatDate(currentDate)}</h4>
                      <p className="text-white text-sm" dangerouslySetInnerHTML={{ __html: makeLinksClickable(freeWriting) }} />
                    </div>
                  );
                })}
                </div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <MessageSquare size={20} className="text-white" />
                  القرارات
                </h3>
                <div className="space-y-4">
                {DAYS.map((_, dayIndex) => {
                  const currentDate = weekDates[dayIndex];
                  const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
                  const decisions = localStorage.getItem(`decisions-${dateKey}`);
                  return decisions && (
                    <div key={dayIndex} className="mb-2">
                      <h4 className="text-white/70 text-base">{DAYS[dayIndex]} - {formatDate(currentDate)}</h4>
                      <p className="text-white text-sm" dangerouslySetInnerHTML={{ __html: makeLinksClickable(decisions) }} />
                    </div>
                  );
                })}
                </div>
              </div>
          </div>
        </div>
      );
    }
