import { Author, Institution, Journal } from '../types';

/**
 * Mock author data
 */
export const mockAuthors: Author[] = [
  {
    id: 'auth_001',
    name: 'Dr. Sarah Chen',
    affiliation: 'MIT',
    metrics: {
      publications: 156,
      citations: 4823,
      hIndex: 42,
      fieldWeightedCitationImpact: 2.34,
      outputsInTopCitationPercentiles: {
        top1: 12,
        top5: 28,
        top10: 45
      }
    }
  },
  {
    id: 'auth_002',
    name: 'Prof. James Anderson',
    affiliation: 'Stanford University',
    metrics: {
      publications: 203,
      citations: 8912,
      hIndex: 58,
      fieldWeightedCitationImpact: 3.12,
      outputsInTopCitationPercentiles: {
        top1: 18,
        top5: 42,
        top10: 67
      }
    }
  },
  {
    id: 'auth_003',
    name: 'Dr. Maria Rodriguez',
    affiliation: 'Cambridge University',
    metrics: {
      publications: 89,
      citations: 2134,
      hIndex: 31,
      fieldWeightedCitationImpact: 1.87,
      outputsInTopCitationPercentiles: {
        top1: 5,
        top5: 15,
        top10: 23
      }
    }
  }
];

/**
 * Mock institution data
 */
export const mockInstitutions: Institution[] = [
  {
    id: 'inst_001',
    name: 'Massachusetts Institute of Technology',
    country: 'United States',
    metrics: {
      publications: 12456,
      citations: 342891,
      collaborationRate: 0.68,
      fieldWeightedCitationImpact: 2.89,
      academicCorporateCollaboration: 0.23
    }
  },
  {
    id: 'inst_002',
    name: 'University of Oxford',
    country: 'United Kingdom',
    metrics: {
      publications: 15234,
      citations: 412567,
      collaborationRate: 0.72,
      fieldWeightedCitationImpact: 3.12,
      academicCorporateCollaboration: 0.18
    }
  },
  {
    id: 'inst_003',
    name: 'ETH Zurich',
    country: 'Switzerland',
    metrics: {
      publications: 8923,
      citations: 198234,
      collaborationRate: 0.65,
      fieldWeightedCitationImpact: 2.56,
      academicCorporateCollaboration: 0.31
    }
  }
];

/**
 * Mock journal data
 */
export const mockJournals: Journal[] = [
  {
    id: 'jour_001',
    name: 'Nature',
    publisher: 'Springer Nature',
    metrics: {
      citesPerDoc: 42.3,
      sjr: 14.23,
      snip: 8.92,
      percentCited: 94.2
    }
  },
  {
    id: 'jour_002',
    name: 'Science',
    publisher: 'AAAS',
    metrics: {
      citesPerDoc: 38.7,
      sjr: 13.45,
      snip: 7.81,
      percentCited: 92.8
    }
  },
  {
    id: 'jour_003',
    name: 'Cell',
    publisher: 'Elsevier',
    metrics: {
      citesPerDoc: 35.2,
      sjr: 12.89,
      snip: 7.23,
      percentCited: 91.5
    }
  }
];

/**
 * Mock trend data (publications over time)
 */
export const mockTrends: Record<string, { year: number; value: number }[]> = {
  'auth_001': [
    { year: 2019, value: 12 },
    { year: 2020, value: 15 },
    { year: 2021, value: 18 },
    { year: 2022, value: 22 },
    { year: 2023, value: 19 }
  ],
  'inst_001': [
    { year: 2019, value: 11234 },
    { year: 2020, value: 11892 },
    { year: 2021, value: 12156 },
    { year: 2022, value: 12389 },
    { year: 2023, value: 12456 }
  ],
  'jour_001': [
    { year: 2019, value: 892 },
    { year: 2020, value: 923 },
    { year: 2021, value: 945 },
    { year: 2022, value: 978 },
    { year: 2023, value: 1012 }
  ]
};
