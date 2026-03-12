import { LayoutType, SlideElement } from '@/types/presentation';
import { v4 as uuidv4 } from 'uuid';

export interface LayoutDefinition {
  type: LayoutType;
  name: string;
  description: string;
  createElements: (themeFont?: string) => SlideElement[];
}

const createTextElement = (
  overrides: Partial<SlideElement> & { x: number; y: number; width: number; height: number }
): SlideElement => ({
  id: uuidv4(),
  type: 'text',
  rotation: 0,
  zIndex: 1,
  locked: false,
  opacity: 1,
  visible: true,
  content: { text: overrides.name === 'Title' ? 'Click to add title' : 'Click to add text' },
  style: {
    fontFamily: 'Arial',
    fontSize: overrides.name === 'Title' ? 36 : overrides.name === 'Subtitle' ? 20 : 18,
    fontWeight: overrides.name === 'Title' ? 'bold' : 'normal',
    color: '#3C4043',
    textAlign: overrides.name === 'Title' || overrides.name === 'Subtitle' ? 'center' : 'left',
    verticalAlign: 'top',
    padding: 8,
  },
  ...overrides,
});

export const layoutDefinitions: LayoutDefinition[] = [
  {
    type: 'blank',
    name: 'Blank',
    description: 'Empty slide',
    createElements: () => [],
  },
  {
    type: 'title',
    name: 'Title Slide',
    description: 'Centered title and subtitle',
    createElements: (font = 'Arial') => [
      createTextElement({
        x: 120, y: 160, width: 720, height: 80,
        name: 'Title',
        content: { text: 'Click to add title' },
        style: { fontFamily: font, fontSize: 40, fontWeight: 'bold', color: '#3C4043', textAlign: 'center', verticalAlign: 'middle', padding: 8 },
      }),
      createTextElement({
        x: 200, y: 260, width: 560, height: 50,
        name: 'Subtitle',
        content: { text: 'Click to add subtitle' },
        style: { fontFamily: font, fontSize: 20, color: '#5F6368', textAlign: 'center', verticalAlign: 'middle', padding: 8 },
      }),
    ],
  },
  {
    type: 'titleBody',
    name: 'Title and Body',
    description: 'Title at top with body text',
    createElements: (font = 'Arial') => [
      createTextElement({
        x: 40, y: 30, width: 880, height: 60,
        name: 'Title',
        content: { text: 'Click to add title' },
        style: { fontFamily: font, fontSize: 32, fontWeight: 'bold', color: '#3C4043', textAlign: 'left', verticalAlign: 'bottom', padding: 8 },
      }),
      createTextElement({
        x: 40, y: 110, width: 880, height: 380,
        name: 'Body',
        content: { text: 'Click to add text' },
        style: { fontFamily: font, fontSize: 18, color: '#3C4043', textAlign: 'left', verticalAlign: 'top', padding: 8 },
      }),
    ],
  },
  {
    type: 'titleTwoColumns',
    name: 'Title and Two Columns',
    description: 'Title with two body columns',
    createElements: (font = 'Arial') => [
      createTextElement({
        x: 40, y: 30, width: 880, height: 60,
        name: 'Title',
        content: { text: 'Click to add title' },
        style: { fontFamily: font, fontSize: 32, fontWeight: 'bold', color: '#3C4043', textAlign: 'left', verticalAlign: 'bottom', padding: 8 },
      }),
      createTextElement({
        x: 40, y: 110, width: 420, height: 380,
        name: 'Body',
        content: { text: 'Click to add text' },
        style: { fontFamily: font, fontSize: 18, color: '#3C4043', textAlign: 'left', verticalAlign: 'top', padding: 8 },
      }),
      createTextElement({
        x: 500, y: 110, width: 420, height: 380,
        name: 'Body',
        content: { text: 'Click to add text' },
        style: { fontFamily: font, fontSize: 18, color: '#3C4043', textAlign: 'left', verticalAlign: 'top', padding: 8 },
      }),
    ],
  },
  {
    type: 'sectionHeader',
    name: 'Section Header',
    description: 'Large centered title',
    createElements: (font = 'Arial') => [
      createTextElement({
        x: 80, y: 180, width: 800, height: 100,
        name: 'Title',
        content: { text: 'Click to add title' },
        style: { fontFamily: font, fontSize: 44, fontWeight: 'bold', color: '#3C4043', textAlign: 'center', verticalAlign: 'middle', padding: 8 },
      }),
    ],
  },
  {
    type: 'titleOnly',
    name: 'Title Only',
    description: 'Title at top only',
    createElements: (font = 'Arial') => [
      createTextElement({
        x: 40, y: 30, width: 880, height: 60,
        name: 'Title',
        content: { text: 'Click to add title' },
        style: { fontFamily: font, fontSize: 32, fontWeight: 'bold', color: '#3C4043', textAlign: 'left', verticalAlign: 'bottom', padding: 8 },
      }),
    ],
  },
];

export const getLayoutDefinition = (type: LayoutType): LayoutDefinition => {
  return layoutDefinitions.find(l => l.type === type) || layoutDefinitions[0];
};
