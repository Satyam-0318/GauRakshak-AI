// API Base URL - auto-detects dev server vs unified FastAPI port
export const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://127.0.0.1:8000'
  : 'https://gaurakshak-ai.onrender.com';

// Categorical options exactly matching trained ColumnTransformer
export const CATEGORICAL_OPTIONS = {
  Season: [
    { value: 'Winter', label: 'Winter (Cold / Dry)' },
    { value: 'Summer', label: 'Summer (Warm / Dry)' },
    { value: 'Rainy', label: 'Rainy / Monsoon (High Humidity)' }
  ],
  LactationStage: [
    { value: 'Early', label: 'Early Lactation (1 - 100 days in milk)' },
    { value: 'Mid', label: 'Mid Lactation (101 - 200 days in milk)' },
    { value: 'Late', label: 'Late Lactation (201+ days in milk)' }
  ],
  Parity: [
    { value: 'Primiparous', label: 'Primiparous (1st Calving / Heifer)' },
    { value: '2nd', label: '2nd Lactation' },
    { value: '3rd', label: '3rd Lactation' },
    { value: '4th and above', label: '4th and above (Older Cow)' }
  ],
  MilkYield: [
    { value: '0-4', label: 'Low (0 - 4 L/day)' },
    { value: '5-10', label: 'Medium (5 - 10 L/day)' },
    { value: '>10', label: 'High (> 10 L/day)' }
  ]
};

// Numerical fields with valid boundaries, steps, and physiological ranges
export const NUMERICAL_FIELDS = {
  pH: {
    label: 'Milk pH',
    unit: 'pH',
    min: 5.5,
    max: 8.0,
    step: 0.05,
    normalRange: '6.40 – 6.70',
    healthyBenchmark: 6.6,
    subclinicalBenchmark: 6.8,
    clinicalBenchmark: 7.2,
    tooltip: 'Healthy milk is slightly acidic to neutral (6.4 - 6.7). Inflammation allows blood bicarbonate to leak in, raising pH above 6.8.'
  },
  EC: {
    label: 'Electrical Conductivity (EC)',
    unit: 'mS/cm',
    min: 0.0,
    max: 20.0,
    step: 0.1,
    normalRange: '4.00 – 4.80 mS/cm',
    healthyBenchmark: 4.3,
    subclinicalBenchmark: 5.1,
    clinicalBenchmark: 6.8,
    tooltip: 'Damaged mammary epithelial cells leak sodium (Na⁺) and chloride (Cl⁻) into milk, sharply increasing electrical conductivity.'
  },
  SCC: {
    label: 'Somatic Cell Count (SCC)',
    unit: '×10⁵ cells/mL',
    min: 0.0,
    max: 200.0,
    step: 0.1,
    normalRange: '< 2.00 ×10⁵ cells/mL',
    healthyBenchmark: 1.2,
    subclinicalBenchmark: 3.5,
    clinicalBenchmark: 35.0,
    tooltip: 'White blood cells responding to infection. Normal < 2.0 (200k/mL). Subclinical 2.0 - 5.0. Clinical often exceeds 5.0 - 50+.'
  }
};

// Instant test presets
export const SAMPLE_PRESETS = [
  {
    name: 'Sample Healthy',
    badge: 'Healthy Cow',
    color: 'emerald',
    description: 'Low SCC (1.2), normal EC (4.25 mS/cm), normal pH (6.55)',
    data: {
      pH: 6.55,
      EC: 4.25,
      SCC: 1.20,
      Season: 'Winter',
      LactationStage: 'Mid',
      Parity: '2nd',
      MilkYield: '5-10'
    }
  },
  {
    name: 'Sample Subclinical',
    badge: 'Borderline / Early Mastitis',
    color: 'amber',
    description: 'Elevated SCC (3.60), conductivity 5.10 mS/cm, pH 6.80',
    data: {
      pH: 6.80,
      EC: 5.10,
      SCC: 3.60,
      Season: 'Rainy',
      LactationStage: 'Mid',
      Parity: '3rd',
      MilkYield: '5-10'
    }
  },
  {
    name: 'Sample Clinical',
    badge: 'Severe / Acute Clinical',
    color: 'rose',
    description: 'High SCC (38.5), high conductivity 6.80 mS/cm, alkaline pH (7.25)',
    data: {
      pH: 7.25,
      EC: 6.80,
      SCC: 38.5,
      Season: 'Summer',
      LactationStage: 'Early',
      Parity: '4th and above',
      MilkYield: '0-4'
    }
  }
];
