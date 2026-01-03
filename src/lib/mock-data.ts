
import type { TestWithQuestions, Question, Material } from '@/lib/types';

const MOCK_QUESTIONS: Question[] = [
  // Science Questions (5)
  {
    id: 'sci-q1',
    questionText: 'What is the chemical symbol for water?',
    options: ['H2O', 'O2', 'CO2', 'NaCl'],
    correctAnswerIndex: 0,
    explanation: 'Water is a chemical compound consisting of two hydrogen atoms and one oxygen atom.',
    category: 'Science',
    examName: 'General Science Mock',
    subject: 'Chemistry',
    topic: 'Basic Chemistry',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'sci-q2',
    questionText: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    correctAnswerIndex: 1,
    explanation: 'Mars is often referred to as the "Red Planet" due to its reddish appearance, caused by iron oxide on its surface.',
    category: 'Science',
    examName: 'General Science Mock',
    subject: 'Astronomy',
    topic: 'Solar System',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'sci-q3',
    questionText: 'What is the speed of light in a vacuum?',
    options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'],
    correctAnswerIndex: 0,
    explanation: 'The speed of light in a vacuum is a universal constant, approximately 299,792 kilometers per second.',
    category: 'Science',
    examName: 'General Science Mock',
    subject: 'Physics',
    topic: 'Relativity',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
    {
    id: 'sci-q4',
    questionText: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Chloroplast'],
    correctAnswerIndex: 2,
    explanation: 'The mitochondrion is responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP).',
    category: 'Science',
    examName: 'General Science Mock',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'sci-q5',
    questionText: 'What is the hardest natural substance on Earth?',
    options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
    correctAnswerIndex: 2,
    explanation: 'Diamond is the hardest known natural material, scoring a 10 on the Mohs scale of hardness.',
    category: 'Science',
    examName: 'General Science Mock',
    subject: 'Geology',
    topic: 'Minerals',
    difficulty: 'medium',
    questionType: 'single_choice',
  },

  // History Questions (5)
  {
    id: 'hist-q1',
    questionText: 'Who was the first President of the United States?',
    options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'],
    correctAnswerIndex: 1,
    explanation: 'George Washington served as the first president of the United States from 1789 to 1797.',
    category: 'History',
    examName: 'History Special',
    subject: 'US History',
    topic: 'Founding Fathers',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'hist-q2',
    questionText: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswerIndex: 2,
    explanation: 'World War II ended in 1945 with the surrender of the Axis powers.',
    category: 'History',
    examName: 'History Special',
    subject: 'World History',
    topic: '20th Century',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
   {
    id: 'hist-q3',
    questionText: 'The Renaissance began in which country?',
    options: ['France', 'Spain', 'Italy', 'England'],
    correctAnswerIndex: 2,
    explanation: 'The Renaissance is a period in European history that began in 14th-century Italy.',
    category: 'History',
    examName: 'History Special',
    subject: 'European History',
    topic: 'Renaissance',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
   {
    id: 'hist-q4',
    questionText: 'Who discovered America in 1492?',
    options: ['Ferdinand Magellan', 'Vasco da Gama', 'Christopher Columbus', 'Marco Polo'],
    correctAnswerIndex: 2,
    explanation: 'Christopher Columbus, an Italian explorer, completed four voyages across the Atlantic Ocean, opening the way for European exploration and colonization of the Americas.',
    category: 'History',
    examName: 'History Special',
    subject: 'World History',
    topic: 'Age of Discovery',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'hist-q5',
    questionText: 'The ancient city of Rome was built on how many hills?',
    options: ['Five', 'Six', 'Seven', 'Eight'],
    correctAnswerIndex: 2,
    explanation: 'Ancient Rome was founded on a group of seven hills on the east bank of the Tiber river.',
    category: 'History',
    examName: 'History Special',
    subject: 'Ancient History',
    topic: 'Roman Empire',
    difficulty: 'hard',
    questionType: 'single_choice',
  },

  // Math Questions (5)
  {
    id: 'math-q1',
    questionText: 'What is the value of Pi to two decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correctAnswerIndex: 1,
    explanation: 'Pi (π) is a mathematical constant, approximately equal to 3.14159. Rounded to two decimal places, it is 3.14.',
    category: 'Math',
    examName: 'Math Basics',
    subject: 'Arithmetic',
    topic: 'Constants',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'math-q2',
    questionText: 'What is the square root of 64?',
    options: ['6', '7', '8', '9'],
    correctAnswerIndex: 2,
    explanation: 'The square root of 64 is 8, because 8 multiplied by 8 equals 64.',
    category: 'Math',
    examName: 'Math Basics',
    subject: 'Arithmetic',
    topic: 'Exponents',
    difficulty: 'easy',
    questionType: 'single_choice',
  },
  {
    id: 'math-q3',
    questionText: 'Solve for x: 2x + 5 = 15',
    options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'],
    correctAnswerIndex: 1,
    explanation: 'To solve for x, subtract 5 from both sides (2x = 10), then divide by 2 (x = 5).',
    category: 'Math',
    examName: 'Math Basics',
    subject: 'Algebra',
    topic: 'Equations',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
    {
    id: 'math-q4',
    questionText: 'What is the area of a circle with a radius of 5?',
    options: ['10π', '20π', '25π', '50π'],
    correctAnswerIndex: 2,
    explanation: 'The formula for the area of a circle is πr². With a radius (r) of 5, the area is π * 5² = 25π.',
    category: 'Math',
    examName: 'Math Basics',
    subject: 'Geometry',
    topic: 'Circles',
    difficulty: 'medium',
    questionType: 'single_choice',
  },
  {
    id: 'math-q5',
    questionText: 'What comes next in the sequence: 1, 1, 2, 3, 5, 8, ...?',
    options: ['11', '12', '13', '14'],
    correctAnswerIndex: 2,
    explanation: 'This is the Fibonacci sequence, where each number is the sum of the two preceding ones. 5 + 8 = 13.',
    category: 'Math',
    examName: 'Math Basics',
    subject: 'Sequences',
    topic: 'Fibonacci',
    difficulty: 'hard',
    questionType: 'single_choice',
  },
];

export const MOCK_TESTS: TestWithQuestions[] = [
  {
    id: 'test-sci',
    title: 'General Science Mock',
    subject: 'Science',
    category: 'General',
    examName: 'General Science Mock',
    isFree: true,
    price: 0,
    durationMinutes: 10,
    totalMarks: 5,
    questionIds: ['sci-q1', 'sci-q2', 'sci-q3', 'sci-q4', 'sci-q5'],
    questions: MOCK_QUESTIONS.slice(0, 5),
  },
  {
    id: 'test-hist',
    title: 'History Special',
    subject: 'History',
    category: 'Topic-wise',
    examName: 'History Special',
    isFree: false,
    price: 5,
    examPrice: 20,
    durationMinutes: 10,
    totalMarks: 5,
    questionIds: ['hist-q1', 'hist-q2', 'hist-q3', 'hist-q4', 'hist-q5'],
    questions: MOCK_QUESTIONS.slice(5, 10),
  },
  {
    id: 'test-math',
    title: 'Math Basics',
    subject: 'Math',
    category: 'General',
    examName: 'Math Basics',
    isFree: true,
    price: 0,
    durationMinutes: 10,
    totalMarks: 5,
    questionIds: ['math-q1', 'math-q2', 'math-q3', 'math-q4', 'math-q5'],
    questions: MOCK_QUESTIONS.slice(10, 15),
  },
];

export const MOCK_MATERIALS: Omit<Material, 'createdAt'>[] = [
    {
        id: 'mat-1',
        title: 'Physics Formula Sheet',
        subject: 'Physics',
        type: 'PDF',
        content: 'https://firebasestorage.googleapis.com/v0/b/flutter-codelabs-app.appspot.com/o/pdfs%2Fphysics_formulas.pdf?alt=media'
    },
    {
        id: 'mat-2',
        title: 'Organic Chemistry Reactions',
        subject: 'Chemistry',
        type: 'PDF',
        content: 'https://firebasestorage.googleapis.com/v0/b/flutter-codelabs-app.appspot.com/o/pdfs%2Forganic_reactions.pdf?alt=media'
    },
    {
        id: 'mat-3',
        title: 'Cell Biology Notes',
        subject: 'Biology',
        type: 'Note',
        content: 'The cell is the basic structural and functional unit of all known living organisms. It is the smallest unit of life. Cells are often called the "building blocks of life".'
    }
];

export const MOCK_ONE_LINERS: Question[] = [
    {
        id: 'ol-1',
        questionText: 'What is the main function of the ribosome?',
        options: ['Protein synthesis'],
        correctAnswerIndex: 0,
        explanation: 'Ribosomes are macromolecular machines, found within all living cells, that perform biological protein synthesis.',
        category: 'Science',
        examName: 'NEET',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficulty: 'medium',
        questionType: 'one_liner'
    },
    {
        id: 'ol-2',
        questionText: 'What is Avogadro\'s number?',
        options: ['6.022 x 10^23'],
        correctAnswerIndex: 0,
        explanation: 'Avogadro\'s number is the number of constituent particles, usually atoms or molecules, that are contained in the amount of substance given by one mole.',
        category: 'Science',
        examName: 'JEE Main',
        subject: 'Chemistry',
        topic: 'Mole Concept',
        difficulty: 'medium',
        questionType: 'one_liner'
    },
    {
        id: 'ol-3',
        questionText: 'What is the term for a word that is spelled the same forwards and backwards?',
        options: ['Palindrome'],
        correctAnswerIndex: 0,
        explanation: 'A palindrome is a word, phrase, number, or other sequence of characters that reads the same backward as forward, such as "madam" or "racecar".',
        category: 'General',
        examName: 'SAT',
        subject: 'English',
        topic: 'Vocabulary',
        difficulty: 'easy',
        questionType: 'one_liner'
    },
];

const ARTIFICIAL_DELAY = 500;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getMockTests(): Promise<TestWithQuestions[]> {
  await delay(ARTIFICIAL_DELAY);
  return MOCK_TESTS;
}

export async function getMockTestById(id: string): Promise<TestWithQuestions | undefined> {
  await delay(ARTIFICIAL_DELAY);
  return MOCK_TESTS.find(test => test.id === id);
}

export async function getMockMaterials(): Promise<Omit<Material, 'createdAt'>[]> {
    await delay(ARTIFICIAL_DELAY);
    return MOCK_MATERIALS;
}

export async function getMockOneLiners(): Promise<Question[]> {
    await delay(ARTIFICIAL_DELAY);
    return MOCK_ONE_LINERS;
}
