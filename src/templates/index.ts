import classic from './classic';
import sharp from './sharp';
import executive from './executive';
import twocolumn from './twocolumn';
import photo from './photo';
import ember from './ember';

export interface Template {
  id: string;
  name: string;
  description: string;
  latex: string;
}

const templates: Template[] = [
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm red accents with clean sans-serif — engineer-style layout with extending section rules.',
    latex: ember,
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif layout — timeless and professional.',
    latex: classic,
  },
  {
    id: 'sharp',
    name: 'Sharp',
    description: 'Bold navy & teal, single-column portrait — modern engineering look.',
    latex: sharp,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Distinguished Times serif with charcoal & gold — built for C-suite and senior leadership.',
    latex: executive,
  },
  {
    id: 'twocolumn',
    name: 'Two Column',
    description: 'Side-by-side columns with a full-width header — great for dense, information-rich CVs.',
    latex: twocolumn,
  },
  {
    id: 'photo',
    name: 'Photo',
    description: 'European-style CV with a portrait photo in the header — polished and personal.',
    latex: photo,
  },
];

export default templates;
