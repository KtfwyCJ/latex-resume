import classic from './classic';
import modern from './modern';
import minimal from './minimal';
import sharp from './sharp';
import executive from './executive';
import twocolumn from './twocolumn';
import photo from './photo';
import infographic from './infographic';
import ember from './ember';

export interface Template {
  id: string;
  name: string;
  description: string;
  latex: string;
}

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif layout — timeless and professional.',
    latex: classic,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean sans-serif with indigo accents — great for tech & product roles.',
    latex: modern,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Understated and spacious — lets your content breathe.',
    latex: minimal,
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
  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Sidebar with visual skill-bar graphs — modern, data-driven design for technical roles.',
    latex: infographic,
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm red accents with clean sans-serif — engineer-style layout with extending section rules.',
    latex: ember,
  },
];

export default templates;
