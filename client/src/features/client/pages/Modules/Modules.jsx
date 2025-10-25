import { useState } from 'react';
import Navbar from '../../../../components/Navbar';
import LessonModal from '../../../../components/LessonModal';

// Mock data for modules - replace with actual API data
const MOCK_MODULES = [
  {
    id: 1,
    title: 'Road Safety Basics',
    description: 'Learn the fundamental rules and regulations of road safety for motorcyclists.',
    status: 'completed',
    progress: 100,
    score: 95,
    hasQuiz: true,
  },
  {
    id: 2,
    title: 'Traffic Signs & Signals',
    description: 'Master the meaning of various traffic signs, signals, and road markings.',
    status: 'completed',
    progress: 100,
    score: 88,
    hasQuiz: true,
  },
  {
    id: 3,
    title: 'Defensive Riding Techniques',
    description: 'Develop skills to anticipate and avoid potential hazards on the road.',
    status: 'in-progress',
    progress: 65,
    score: null,
    hasQuiz: true,
  },
  {
    id: 4,
    title: 'Motorcycle Maintenance',
    description: 'Understand basic motorcycle maintenance to ensure your safety and vehicle reliability.',
    status: 'locked',
    progress: 0,
    score: null,
    hasQuiz: true,
  },
  {
    id: 5,
    title: 'Weather & Road Conditions',
    description: 'Learn how to adapt your riding to different weather and road conditions.',
    status: 'locked',
    progress: 0,
    score: null,
    hasQuiz: true,
  },
  {
    id: 6,
    title: 'Emergency Procedures',
    description: 'Know what to do in case of accidents and emergency situations.',
    status: 'locked',
    progress: 0,
    score: null,
    hasQuiz: true,
  },
  {
    id: 7,
    title: 'Legal Requirements',
    description: 'Understand licensing, registration, and insurance requirements for riders.',
    status: 'locked',
    progress: 0,
    score: null,
    hasQuiz: true,
  },
  {
    id: 8,
    title: 'Advanced Riding Skills',
    description: 'Master advanced techniques for experienced riders.',
    status: 'locked',
    progress: 0,
    score: null,
    hasQuiz: true,
  },
];

// Sample lesson data for demonstration
const SAMPLE_LESSONS = {
  1: {
    moduleId: 1,
    title: 'Road Safety Basics',
    description: 'Master the fundamental principles of road safety, including traffic rules, road signs, and safe riding practices.',
    objectives: [
      'Understand basic traffic rules and regulations',
      'Recognize common road signs and their meanings',
      'Learn defensive riding techniques',
      'Identify potential road hazards',
    ],
    slides: [
      {
        type: 'animation',
        title: 'Welcome to Road Safety Basics',
        content: 'This module will teach you the essential rules and practices for safe motorcycle riding.',
        icon: '🛵',
        description: 'Introduction to the module',
      },
      {
        type: 'text',
        title: 'Traffic Rules Overview',
        content: 'Traffic rules are designed to ensure the safety of all road users. As a motorcyclist, you must follow speed limits, traffic signals, and lane markings. Always ride on the right side of the road and use proper hand signals when turning.',
        description: 'Basic traffic rules for motorcyclists',
      },
      {
        type: 'image',
        title: 'Common Road Signs',
        content: 'https://images.unsplash.com/photo-1449057528837-7ca097b3520c?w=800',
        description: 'Visual guide to road signs',
      },
      {
        type: 'animation',
        title: 'Safe Following Distance',
        content: 'Maintain at least 2-3 seconds of following distance behind the vehicle in front of you. This gives you enough time to react to sudden stops or obstacles.',
        icon: '⚠️',
        description: 'Understanding safe distance',
      },
      {
        type: 'text',
        title: 'Right of Way Rules',
        content: 'At intersections, yield to vehicles already in the intersection. When turning left, yield to oncoming traffic. At roundabouts, give way to vehicles already circulating. Pedestrians always have the right of way at crosswalks.',
        description: 'Who goes first at intersections',
      },
      {
        type: 'animation',
        title: 'Module Complete!',
        content: 'Congratulations! You have completed the Road Safety Basics module. Take the quiz to test your knowledge.',
        icon: '🎉',
        description: 'Module completion',
      },
    ],
    resources: [
      {
        title: 'Philippine Traffic Rules Handbook',
        type: 'PDF Document',
        url: '#',
      },
      {
        title: 'Road Safety Video Guide',
        type: 'Video',
        url: '#',
      },
    ],
  },
  2: {
    moduleId: 2,
    title: 'Traffic Signs & Signals',
    description: 'Learn to identify and understand all types of traffic signs, signals, and road markings.',
    objectives: [
      'Recognize regulatory, warning, and informational signs',
      'Understand traffic light signals',
      'Interpret road markings and pavement symbols',
      'Know the meaning of hand signals from traffic enforcers',
    ],
    slides: [
      {
        type: 'animation',
        title: 'Traffic Signs & Signals',
        content: 'Master the language of the road by learning all about traffic signs, signals, and markings.',
        icon: '🚦',
        description: 'Introduction to traffic signs',
      },
      {
        type: 'text',
        title: 'Types of Traffic Signs',
        content: 'Traffic signs are categorized into three main types: Regulatory signs (tell you what you must or must not do), Warning signs (alert you to potential hazards), and Informational signs (provide helpful information about services and destinations).',
        description: 'Classification of signs',
      },
      {
        type: 'image',
        title: 'Regulatory Signs',
        content: 'https://images.unsplash.com/photo-1588539843065-7fe074476b28?w=800',
        description: 'Stop, yield, and speed limit signs',
      },
      {
        type: 'animation',
        title: 'Warning Signs',
        content: 'Warning signs are usually diamond-shaped with yellow backgrounds. They alert you to curves, intersections, school zones, and other potential hazards ahead.',
        icon: '⚠️',
        description: 'Hazard warning signs',
      },
    ],
    resources: [
      {
        title: 'Traffic Sign Recognition Quiz',
        type: 'Interactive',
        url: '#',
      },
    ],
  },
  3: {
    moduleId: 3,
    title: 'Defensive Riding Techniques',
    description: 'Develop advanced skills to anticipate and avoid potential hazards on the road.',
    objectives: [
      'Learn to scan the road environment effectively',
      'Understand the concept of space cushion',
      'Practice hazard perception and prediction',
      'Master emergency braking and evasive maneuvers',
    ],
    slides: [
      {
        type: 'animation',
        title: 'Defensive Riding',
        content: 'Learn techniques to protect yourself from accidents caused by other drivers\' mistakes.',
        icon: '🛡️',
        description: 'Introduction to defensive riding',
      },
      {
        type: 'text',
        title: 'The SEE System',
        content: 'Search, Evaluate, Execute. Continuously search for potential hazards, evaluate what might happen, and execute the appropriate response. This systematic approach helps you stay safe on the road.',
        description: 'Systematic hazard management',
      },
      {
        type: 'animation',
        title: 'Space Cushion',
        content: 'Always maintain a safety buffer around your motorcycle. Keep distance from vehicles in front, behind, and beside you. This space gives you room to maneuver in emergencies.',
        icon: '🎯',
        description: 'Creating safe space around you',
      },
    ],
    resources: [],
  },
};

export default function Modules() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  const handleModuleClick = (module) => {
    if (module.status !== 'locked') {
      setSelectedModule(module);
      // Load lesson data (in real app, this would be an API call)
      const lessonData = SAMPLE_LESSONS[module.id];
      if (lessonData) {
        setCurrentLesson(lessonData);
        setIsLessonOpen(true);
      }
    }
  };

  const handleClosLesson = () => {
    setIsLessonOpen(false);
    setTimeout(() => {
      setCurrentLesson(null);
      setSelectedModule(null);
    }, 300);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-brand-500';
      case 'locked':
        return 'bg-neutral-300 dark:bg-neutral-600';
      default:
        return 'bg-neutral-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        );
      case 'locked':
        return (
          <svg className="w-6 h-6 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Learning Journey</h1>
            <p className="text-brand-100 text-lg max-w-2xl mx-auto">
              Progress through each module to become a safer, more knowledgeable rider
            </p>
          </div>
        </div>

        {/* Learning Path */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Waving Road Map */}
          <div className="relative pb-32">
            {/* Vertical Road Line in the Middle */}
            <div className="absolute left-1/2 top-0 bottom-20 w-1 bg-gradient-to-b from-neutral-300 via-neutral-400 to-neutral-300 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 transform -translate-x-1/2 hidden md:block" />
            
            {/* Modules */}
            <div className="relative space-y-8 md:space-y-12">
              {MOCK_MODULES.map((module, index) => {
                const isLeftSide = index % 2 === 0;
                const isLast = index === MOCK_MODULES.length - 1;
                const isCurrent = module.status === 'in-progress';
                
                return (
                  <div key={module.id} className="relative">
                    {/* Horizontal connector from center to card */}
                    <div 
                      className={`absolute top-1/2 h-0.5 bg-neutral-300 dark:bg-neutral-700 hidden md:block -translate-y-1/2`}
                      style={{ 
                        width: 'calc(50% - 3rem)',
                        [isLeftSide ? 'right' : 'left']: '50%'
                      }} 
                    />
                    
                    <div className={`flex items-center justify-center gap-0`}>
                      {/* Left Side: Card for even modules */}
                      {isLeftSide && (
                        <div className="flex-1 flex justify-end pr-4 md:pr-8">
                          <div
                            className={`w-full max-w-sm bg-white dark:bg-neutral-800 rounded-xl shadow-lg border transition-all ${
                              module.status === 'locked'
                                ? 'border-neutral-200 dark:border-neutral-700 opacity-60'
                                : 'border-neutral-200 dark:border-neutral-700 hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                            }`}
                            onClick={() => handleModuleClick(module)}
                          >
                            <div className="p-4 md:p-5">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 flex-1">
                                  {module.title}
                                </h3>
                                {module.status !== 'locked' && module.score !== null && (
                                  <div className="text-lg md:text-xl font-bold text-brand-600 dark:text-brand-400 ml-3">
                                    {module.score}%
                                  </div>
                                )}
                              </div>
                              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                {module.description}
                              </p>

                              {/* Progress Bar */}
                              {module.status !== 'locked' && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{module.progress}%</span>
                                  </div>
                                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                                      style={{ width: `${module.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <div>
                                {module.status === 'locked' ? (
                                  <button
                                    disabled
                                    className="w-full px-3 py-2 bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400 rounded-lg cursor-not-allowed text-xs md:text-sm flex items-center justify-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Locked
                                  </button>
                                ) : module.status === 'completed' ? (
                                  <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs md:text-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Review
                                  </button>
                                ) : (
                                  <button className="w-full px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors text-xs md:text-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Continue
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Circular Road Node (Center) */}
                      <div className="relative flex-shrink-0 z-10">
                        {/* Stop Sign for Current Module */}
                        {isCurrent && (
                          <div className="absolute left-1/2 -translate-x-1/2 -top-20 hidden md:block">
                            <div className="relative flex flex-col items-center">
                              <svg className="w-12 h-12 text-red-600 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.05 2.05L2.05 7.05v9.9l5 5h9.9l5-5v-9.9l-5-5h-9.9zM12 6c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1zm0 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                              </svg>
                              <div className="text-xs font-bold text-red-600 mt-1">
                                STOP
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Car Icon for Current Module */}
                        {isCurrent && (
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-20 hidden md:block">
                            <svg className="w-14 h-14 text-brand-600 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                            </svg>
                          </div>
                        )}
                        
                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-neutral-900 ${getStatusColor(module.status)} shadow-xl flex items-center justify-center relative`}>
                          {/* Module Number */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-xl md:text-3xl drop-shadow-lg">
                              {module.id}
                            </span>
                          </div>
                          
                          {/* Status Icon Badge */}
                          <div className="absolute -top-1 -right-1 bg-white dark:bg-neutral-900 rounded-full p-1 shadow-md">
                            {getStatusIcon(module.status)}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Card for odd modules */}
                      {!isLeftSide && (
                        <div className="flex-1 flex justify-start pl-4 md:pl-8">
                          <div
                            className={`w-full max-w-sm bg-white dark:bg-neutral-800 rounded-xl shadow-lg border transition-all ${
                              module.status === 'locked'
                                ? 'border-neutral-200 dark:border-neutral-700 opacity-60'
                                : 'border-neutral-200 dark:border-neutral-700 hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                            }`}
                            onClick={() => handleModuleClick(module)}
                          >
                            <div className="p-4 md:p-5">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 flex-1">
                                  {module.title}
                                </h3>
                                {module.status !== 'locked' && module.score !== null && (
                                  <div className="text-lg md:text-xl font-bold text-brand-600 dark:text-brand-400 ml-3">
                                    {module.score}%
                                  </div>
                                )}
                              </div>
                              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                {module.description}
                              </p>

                              {/* Progress Bar */}
                              {module.status !== 'locked' && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{module.progress}%</span>
                                  </div>
                                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                                      style={{ width: `${module.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <div>
                                {module.status === 'locked' ? (
                                  <button
                                    disabled
                                    className="w-full px-3 py-2 bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400 rounded-lg cursor-not-allowed text-xs md:text-sm flex items-center justify-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Locked
                                  </button>
                                ) : module.status === 'completed' ? (
                                  <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs md:text-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Review
                                  </button>
                                ) : (
                                  <button className="w-full px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors text-xs md:text-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Continue
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Flag at the end */}
            <div className="mt-8 flex justify-center">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl shadow-xl p-6 text-white max-w-md">
                <div className="flex items-center gap-4">
                  <svg className="w-16 h-16 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                  </svg>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">🎓 Certification</h3>
                    <p className="text-yellow-100 text-sm">
                      Complete all modules to earn your certification!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {MOCK_MODULES.filter(m => m.status === 'completed').length}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {MOCK_MODULES.filter(m => m.status === 'in-progress').length}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">In Progress</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {MOCK_MODULES.filter(m => m.status === 'locked').length}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">Locked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      <LessonModal 
        isOpen={isLessonOpen} 
        onClose={handleClosLesson} 
        lesson={currentLesson} 
      />
    </>
  );
}
